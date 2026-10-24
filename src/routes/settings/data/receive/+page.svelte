<!--
	Settings → Data & backup → Receive by QR (US-058). Scans the looping QR codes from
	Send by QR, checks the result, and — after a confirm — writes it. A date-range
	backup replaces only this device's records in that range; Everything replaces all
	data like a file restore. Design: docs/roadmap/qr-backup.md.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import {
		BackupValidationError,
		countWindowOnDevice,
		importBackup,
		importWindowBackup,
		parseBackup,
	} from '$lib/db/backup';
	import type { BackupScope } from '$lib/db/backup';
	import { DATED_STORES, assertWindowRecords, datedCounts, scopeOf } from '$lib/db/backupPayload';
	import type { DatedStore } from '$lib/db/backupPayload';
	import { formatShortDate } from '$lib/date';
	import { feedback } from '$lib/feedback';
	import {
		cameraErrorMessage,
		cameraUnavailableReason,
		createQrReader,
		listCameras,
		openCamera,
		shouldMirror,
		stopCamera,
	} from '$lib/qrBackup/camera';
	import type { QrReader } from '$lib/qrBackup/camera';
	import { FrameCollector, inflate } from '$lib/qrBackup/frames';
	import { countLabel } from '$lib/qrBackup/summary';
	import { sessionStore } from '$lib/stores/session.svelte';
	import Button from '$lib/components/Button.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';

	/** Toast shown on Data & backup after the reload that follows a successful receive. */
	const FLASH_KEY = 'cwout:qrReceived';

	type Phase = 'idle' | 'starting' | 'scanning' | 'checking' | 'ready';

	interface Received {
		/** Raw JSON — parsed again at confirm time so the write never touches a reactive tree. */
		text: string;
		scope: BackupScope;
		exportedAt: string;
		counts: Record<DatedStore, number>;
		/** This device's records in the window that will be replaced (window scope only). */
		replacing: Record<DatedStore, number> | null;
	}

	let phase = $state<Phase>('idle');
	let error = $state<string | null>(null);

	let video = $state<HTMLVideoElement>();
	let stream: MediaStream | null = null;
	let reader: QrReader | null = null;
	let engine = $state<string | null>(null);
	let mirror = $state(true);
	let cameras = $state<MediaDeviceInfo[]>([]);
	let cameraId = $state('');

	const collector = new FrameCollector();
	let received = $state(0);
	let total = $state(0);
	let have = $state<boolean[]>([]);

	let pending = $state.raw<Received | null>(null);
	let applying = $state(false);
	let applyError = $state<string | null>(null);

	/** Bumped to end the current scan loop. */
	let loopToken = 0;

	function syncProgress() {
		received = collector.received;
		total = collector.total;
		have = Array.from({ length: collector.total }, (_, i) => collector.has(i));
	}

	async function startCamera(deviceId?: string) {
		error = cameraUnavailableReason();
		if (error || !video) return;
		phase = 'starting';
		stopScanning();
		try {
			stream = await openCamera(deviceId);
			video.srcObject = stream;
			await video.play();
			mirror = shouldMirror(stream);
			cameraId = stream.getVideoTracks()[0]?.getSettings().deviceId ?? '';
			cameras = await listCameras();
			reader ??= await createQrReader();
			engine = reader.engine;
		} catch (err) {
			console.error('[qr-receive] camera failed', err);
			stopScanning();
			error = cameraErrorMessage(err);
			phase = 'idle';
			return;
		}
		phase = 'scanning';
		void scanLoop(++loopToken);
	}

	function stopScanning() {
		loopToken++;
		stopCamera(stream);
		stream = null;
		if (video) video.srcObject = null;
	}

	function nextVideoFrame(el: HTMLVideoElement): Promise<void> {
		return new Promise((done) => {
			if ('requestVideoFrameCallback' in el) el.requestVideoFrameCallback(() => done());
			else requestAnimationFrame(() => done());
		});
	}

	async function scanLoop(token: number) {
		while (token === loopToken && video && reader) {
			if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
				let texts: string[] = [];
				try {
					texts = await reader.read(video);
				} catch (err) {
					console.warn('[qr-receive] read failed', err);
				}
				if (token !== loopToken) return;
				for (const text of texts) {
					const result = collector.add(text);
					if (result === 'added' || result === 'restarted') syncProgress();
				}
				if (collector.complete) {
					void finish();
					return;
				}
			}
			await nextVideoFrame(video);
		}
	}

	async function finish() {
		phase = 'checking';
		stopScanning();
		try {
			const text = await inflate(collector.assemble());
			const envelope = parseBackup(text);
			const scope = scopeOf(envelope);
			let replacing: Received['replacing'] = null;
			if (scope.kind === 'window') {
				assertWindowRecords(envelope, scope.from, scope.to);
				replacing = await countWindowOnDevice(scope.from, scope.to);
			}
			pending = {
				text,
				scope,
				exportedAt: envelope.exportedAt,
				counts: datedCounts(envelope),
				replacing,
			};
			phase = 'ready';
			feedback('success');
		} catch (err) {
			console.error('[qr-receive] verification failed', err);
			error =
				err instanceof BackupValidationError
					? err.message
					: 'Some codes were misread, so nothing was saved. Start the camera to scan again.';
			resetTransfer();
		}
	}

	function resetTransfer() {
		collector.reset();
		syncProgress();
		pending = null;
		applyError = null;
		phase = 'idle';
	}

	async function handleApply() {
		if (!pending || applying) return;
		applying = true;
		applyError = null;
		try {
			const envelope = parseBackup(pending.text);
			if (pending.scope.kind === 'window') await importWindowBackup(envelope);
			else await importBackup(envelope);
			sessionStorage.setItem(FLASH_KEY, '1');
			location.assign(resolve('/settings/data'));
		} catch (err) {
			console.error('[qr-receive] apply failed', err);
			applyError =
				err instanceof BackupValidationError
					? `${err.message} Your existing data is unchanged.`
					: pending.scope.kind === 'window'
						? 'Could not save the backup. Your existing data is unchanged.'
						: err instanceof Error
							? `${err.message} Some data may have been lost — send the backup again.`
							: 'Restore failed partway through. Some data may have been lost — send the backup again.';
			applying = false;
		}
	}

	function handleCameraChange(event: Event) {
		const id = (event.target as HTMLSelectElement).value;
		if (id && id !== cameraId) void startCamera(id);
	}

	onDestroy(stopScanning);

	let rangeTitle = $derived(
		pending?.scope.kind === 'window'
			? `${formatShortDate(pending.scope.from)} – ${formatShortDate(pending.scope.to)}`
			: 'everything',
	);
	let scanning = $derived(phase === 'starting' || phase === 'scanning');
</script>

<svelte:head>
	<title>Receive by QR — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide qr-receive">
	<SettingsSubHeader
		title="Receive by QR"
		backHref="/settings/data"
		backLabel="Data & backup"
	/>

	{#if !scanning}
		<p class="qr-receive__intro">
			On the sending device, open <strong>Data &amp; backup → Send by QR</strong> and tap Start. Then
			start the camera here and point it at the code. Nothing is saved until every code is in and you
			confirm.
		</p>
	{/if}

	{#if error}
		<p
			class="qr-receive__error"
			role="alert"
		>
			{error}
		</p>
	{/if}

	<div
		class="qr-receive__viewer"
		hidden={!scanning}
	>
		<video
			bind:this={video}
			class="qr-receive__video"
			class:qr-receive__video--mirror={mirror}
			playsinline
			muted
		></video>
		<div
			class="qr-receive__guide"
			aria-hidden="true"
		></div>
	</div>

	{#if scanning}
		<div class="qr-receive__status">
			<p
				class="qr-receive__count"
				aria-live="polite"
			>
				{#if phase === 'starting'}
					Starting camera…
				{:else if total === 0}
					Looking for codes…
				{:else}
					Received {received} / {total}
				{/if}
			</p>

			{#if total > 0}
				<div
					class="qr-receive__frames"
					aria-hidden="true"
				>
					{#each have as got, i (i)}
						<span
							class="qr-receive__frame"
							class:qr-receive__frame--got={got}
						></span>
					{/each}
				</div>
			{/if}

			{#if cameras.length > 1}
				<label class="qr-receive__camera">
					<span>Camera</span>
					<select
						value={cameraId}
						onchange={handleCameraChange}
					>
						{#each cameras as camera, i (camera.deviceId)}
							<option value={camera.deviceId}>{camera.label || `Camera ${i + 1}`}</option>
						{/each}
					</select>
				</label>
			{/if}

			{#if engine}
				<p class="qr-receive__engine">
					Reader: {engine === 'built-in' ? "browser's built-in" : 'bundled'}
				</p>
			{/if}
		</div>

		<Button
			variant="ghost"
			onclick={() => {
				stopScanning();
				phase = 'idle';
			}}
		>
			Stop camera
		</Button>
	{:else if phase === 'checking'}
		<p class="qr-receive__count">Checking the backup…</p>
	{:else if phase === 'idle'}
		{#if received > 0}
			<p class="qr-receive__hint">{received} of {total} codes kept — start again to finish.</p>
		{/if}
		<Button onclick={() => startCamera()}>Start camera</Button>
	{/if}
</div>

{#if phase === 'ready' && pending}
	<ConfirmDialog
		title={pending.scope.kind === 'window' ? `Apply ${rangeTitle}?` : 'Replace all data?'}
		confirmLabel={pending.scope.kind === 'window' ? 'Apply backup' : 'Replace & restore'}
		confirmBusyLabel="Saving…"
		danger
		busy={applying}
		error={applyError}
		onconfirm={handleApply}
		oncancel={resetTransfer}
	>
		{#if pending.scope.kind === 'window' && pending.replacing}
			This device's records from <strong>{rangeTitle}</strong> are replaced with the ones received:
			<ul class="confirm-list">
				{#each DATED_STORES as store (store)}
					{#if pending.counts[store] > 0 || pending.replacing[store] > 0}
						<li>
							{countLabel(store, pending.counts[store])}
							<span class="confirm-list__was">(replacing {pending.replacing[store]} here)</span>
						</li>
					{/if}
				{/each}
			</ul>
			Exercises, programs, habits, goals and baselines are added or updated, never removed. Nothing outside
			those dates changes, and your personalization settings stay as they are.
		{:else}
			This replaces <strong>all</strong> workout data on this device with the backup sent
			{new Date(pending.exportedAt).toLocaleDateString()}, including personalization settings. It is
			fully staged and verified before anything is touched. This cannot be undone.
			{#if sessionStore.isActive}
				<br /><br />You have a session in progress — it will be discarded.
			{/if}
		{/if}
	</ConfirmDialog>
{/if}

<style>
	.qr-receive {
		display: grid;
		gap: var(--space-4);
		align-content: start;
	}

	.qr-receive__intro,
	.qr-receive__hint {
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	.qr-receive__error {
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-red);
	}

	.qr-receive__viewer {
		position: relative;
		inline-size: min(100%, 640px);
		justify-self: center;
		border: var(--rule) solid var(--color-paper);
		background: var(--color-ink);

		&[hidden] {
			display: none;
		}
	}

	.qr-receive__video {
		display: block;
		inline-size: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.qr-receive__video--mirror {
		transform: scaleX(-1);
	}

	/* Aiming square — fill most of it with the code. */
	.qr-receive__guide {
		position: absolute;
		inset-block: 10%;
		inset-inline-start: 50%;
		translate: -50% 0;
		aspect-ratio: 1;
		border: var(--rule) dashed var(--color-accent);
		pointer-events: none;
	}

	.qr-receive__status {
		display: grid;
		gap: var(--space-3);
	}

	.qr-receive__count {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		font-variant-numeric: tabular-nums;
	}

	/* One square per code; hollow until it has been read. */
	.qr-receive__frames {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12px, 1fr));
		gap: 3px;
	}

	.qr-receive__frame {
		aspect-ratio: 1;
		border: var(--rule-thin) solid var(--color-text-muted);
	}

	.qr-receive__frame--got {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.qr-receive__camera {
		display: grid;
		gap: var(--space-1);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);

		select {
			block-size: 44px;
			padding-inline: var(--space-3);
			background: var(--color-ink);
			color: var(--color-text-primary);
			border: var(--rule) solid var(--color-paper);
			font-family: var(--font-mono);
			font-size: 0.8125rem;
			text-transform: none;
			letter-spacing: 0;
		}
	}

	.qr-receive__engine {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.confirm-list {
		margin-block: var(--space-2);
		padding-inline-start: var(--space-4);
	}

	.confirm-list__was {
		color: var(--color-text-muted);
	}
</style>
