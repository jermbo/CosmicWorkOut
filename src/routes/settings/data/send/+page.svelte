<!--
	Settings → Data & backup → Send by QR (US-057). Shows a backup as a looping
	sequence of QR codes for another device to scan. This device is the source of
	truth for whatever it sends. Design: docs/roadmap/qr-backup.md.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { exportQrBackup } from '$lib/db/backup';
	import type { BackupScope } from '$lib/db/backup';
	import { datedCounts } from '$lib/db/backupPayload';
	import { addDays, formatShortDate, todayIso } from '$lib/date';
	import {
		DENSITIES,
		SPEEDS,
		buildFrames,
		deflate,
		frameCount,
		loopSeconds,
	} from '$lib/qrBackup/frames';
	import type { Density, Speed } from '$lib/qrBackup/frames';
	import {
		lastQrBackupDate,
		loadSendOptions,
		saveLastQrBackupDate,
		saveSendOptions,
	} from '$lib/qrBackup/sendPrefs';
	import { describeCounts } from '$lib/qrBackup/summary';
	import { requestPersistentStorage } from '$lib/db/persistence';
	import { toastStore } from '$lib/stores/toast.svelte';
	import AnimatedQr from '$lib/components/AnimatedQr.svelte';
	import Button from '$lib/components/Button.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';

	type ScopeChoice = 'since' | 'days30' | 'days90' | 'all';

	const today = todayIso();
	const lastDate = lastQrBackupDate();
	const saved = loadSendOptions();

	// "Since last" stays short enough for four cells on a phone; the range line below gives the date.
	const SCOPES: { value: ScopeChoice; label: string }[] = [
		...(lastDate ? [{ value: 'since' as const, label: 'Since last' }] : []),
		{ value: 'days30', label: '30 days' },
		{ value: 'days90', label: '90 days' },
		{ value: 'all', label: 'Everything' },
	];

	const DENSITY_OPTIONS: { value: Density; label: string }[] = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' },
	];

	const SPEED_OPTIONS: { value: Speed; label: string }[] = [
		{ value: 'slow', label: 'Slow' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'fast', label: 'Fast' },
	];

	let choice = $state<ScopeChoice>(lastDate ? 'since' : 'all');
	let density = $state<Density>(saved.density);
	let speed = $state<Speed>(saved.speed);

	let scope = $derived.by((): BackupScope => {
		switch (choice) {
			case 'since':
				return { kind: 'window', from: lastDate ?? today, to: today };
			case 'days30':
				return { kind: 'window', from: addDays(today, -29), to: today };
			case 'days90':
				return { kind: 'window', from: addDays(today, -89), to: today };
			default:
				return { kind: 'full' };
		}
	});

	/** The compressed backup for the chosen scope, and what's in it. */
	let packed = $state.raw<{ bytes: Uint8Array; summary: string } | null>(null);
	let prepareError = $state<string | null>(null);

	$effect(() => {
		const target = scope;
		let stale = false;
		packed = null;
		prepareError = null;
		(async () => {
			try {
				const envelope = await exportQrBackup(target);
				const bytes = await deflate(JSON.stringify(envelope));
				if (!stale) packed = { bytes, summary: describeCounts(datedCounts(envelope)) };
			} catch (err) {
				console.error('[qr-send] could not build the backup', err);
				if (!stale) prepareError = 'Could not build the backup. Please try again.';
			}
		})();
		return () => {
			stale = true;
		};
	});

	let frames = $derived(packed ? buildFrames(packed.bytes, DENSITIES[density]) : []);
	let estimate = $derived.by(() => {
		if (!packed) return null;
		const codes = frameCount(packed.bytes.length, density);
		const seconds = Math.max(1, Math.round(loopSeconds(codes, speed)));
		return `${codes} ${codes === 1 ? 'code' : 'codes'} · about ${seconds} s per loop`;
	});

	let rangeLabel = $derived(
		scope.kind === 'window'
			? `${formatShortDate(scope.from)} – ${formatShortDate(scope.to)}`
			: 'Everything',
	);

	let sending = $state(false);
	let current = $state(0);

	function setDensity(value: Density) {
		density = value;
		saveSendOptions({ density, speed });
	}

	function setSpeed(value: Speed) {
		speed = value;
		saveSendOptions({ density, speed });
	}

	// Keep the screen on while codes show — a dimmed phone stops the transfer.
	let wakeLock: WakeLockSentinel | null = null;

	async function holdWakeLock() {
		if (!('wakeLock' in navigator) || wakeLock) return;
		try {
			wakeLock = await navigator.wakeLock.request('screen');
			wakeLock.addEventListener('release', () => (wakeLock = null));
		} catch (err) {
			console.info('[qr-send] wake lock unavailable', err);
		}
	}

	function releaseWakeLock() {
		void wakeLock?.release();
		wakeLock = null;
	}

	$effect(() => {
		if (!sending) return;
		void holdWakeLock();
		// The browser drops the lock whenever the page is hidden; take it back on return.
		const onVisible = () => {
			if (document.visibilityState === 'visible') void holdWakeLock();
		};
		document.addEventListener('visibilitychange', onVisible);
		return () => {
			document.removeEventListener('visibilitychange', onVisible);
			releaseWakeLock();
		};
	});

	function startSending() {
		sending = true;
		void requestPersistentStorage();
	}

	function handleDone() {
		saveLastQrBackupDate(today);
		toastStore.show(`Backup sent. Next time defaults to since ${formatShortDate(today)}.`);
		goto(resolve('/settings/data'));
	}
</script>

<svelte:head>
	<title>Send by QR — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide qr-send">
	<SettingsSubHeader
		title="Send by QR"
		backHref="/settings/data"
		backLabel="Data & backup"
	/>

	{#if !sending}
		<p class="qr-send__intro">
			Show your data as a looping QR code. On the other device, open
			<strong>Data &amp; backup → Receive by QR</strong> and point its camera at this screen. Whatever
			you send replaces the same dates on the other device.
		</p>

		<section
			class="qr-section"
			aria-labelledby="qr-what"
		>
			<h2
				class="qr-section__title"
				id="qr-what"
			>
				What to send
			</h2>
			<SegmentedControl
				options={SCOPES}
				value={choice}
				label="What to send"
				onchange={(value) => (choice = value)}
			/>
			<p class="qr-section__hint">
				<strong>{rangeLabel}</strong>
				{#if packed}
					· {packed.summary}{scope.kind === 'window'
						? ', plus your exercises, programs, habits, goals and baselines'
						: ''}.
				{:else if !prepareError}
					· Preparing…
				{/if}
			</p>
		</section>

		<section
			class="qr-section"
			aria-labelledby="qr-density"
		>
			<h2
				class="qr-section__title"
				id="qr-density"
			>
				Code density
			</h2>
			<SegmentedControl
				options={DENSITY_OPTIONS}
				value={density}
				label="Code density"
				onchange={setDensity}
			/>
			<p class="qr-section__hint">
				Lower density draws bigger squares that webcams read more easily, but needs more codes.
			</p>
		</section>

		<section
			class="qr-section"
			aria-labelledby="qr-speed"
		>
			<h2
				class="qr-section__title"
				id="qr-speed"
			>
				Speed
			</h2>
			<SegmentedControl
				options={SPEED_OPTIONS}
				value={speed}
				label="Speed"
				onchange={setSpeed}
			/>
			<p class="qr-section__hint">Slow down if the other device keeps missing codes.</p>
		</section>

		{#if prepareError}
			<p
				class="qr-send__error"
				role="alert"
			>
				{prepareError}
			</p>
		{/if}

		<div class="qr-send__start">
			{#if estimate}
				<p class="qr-send__estimate">{estimate}</p>
			{/if}
			<Button
				onclick={startSending}
				disabled={!packed}
			>
				Start
			</Button>
		</div>
	{:else}
		<div class="qr-send__stage">
			<div class="qr-send__code">
				<AnimatedQr
					{frames}
					intervalMs={SPEEDS[speed]}
					bind:current
				/>
			</div>
			<p
				class="qr-send__counter"
				aria-live="off"
			>
				Code {current + 1} / {frames.length}
			</p>
			<p class="qr-send__tip">
				{rangeLabel} · Turn your screen brightness up and hold the phone steady, filling about half the
				camera's view. Tap <strong>Done</strong> once the other device says it has everything.
			</p>
			<div class="qr-send__actions">
				<Button
					variant="ghost"
					grow
					onclick={() => (sending = false)}
				>
					Stop
				</Button>
				<Button
					grow
					bold
					onclick={handleDone}
				>
					Done
				</Button>
			</div>
		</div>
	{/if}
</div>

<style>
	.qr-send__intro {
		margin-block-end: var(--space-6);
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	.qr-section {
		margin-block-end: var(--space-6);
	}

	.qr-section__title {
		margin-block-end: var(--space-3);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
	}

	.qr-section__hint {
		margin-block-start: var(--space-2);
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--color-text-muted);
	}

	.qr-send__error {
		margin-block-end: var(--space-4);
		font-size: 0.875rem;
		color: var(--color-red);
	}

	.qr-send__start {
		display: grid;
		gap: var(--space-3);
	}

	.qr-send__estimate {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-text-primary);
	}

	.qr-send__stage {
		display: grid;
		gap: var(--space-4);
		justify-items: center;
	}

	/* White plate with its own margin, so the code's quiet zone never touches the dark page. */
	.qr-send__code {
		inline-size: min(100%, 520px);
		padding: var(--space-3);
		background: #ffffff;
		border: var(--rule) solid var(--color-paper);
	}

	.qr-send__counter {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		font-variant-numeric: tabular-nums;
	}

	.qr-send__tip {
		max-inline-size: 520px;
		font-size: 0.8125rem;
		line-height: 1.5;
		text-align: center;
		color: var(--color-text-secondary);
	}

	.qr-send__actions {
		display: flex;
		gap: var(--space-3);
		inline-size: min(100%, 520px);
	}
</style>
