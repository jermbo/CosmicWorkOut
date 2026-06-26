<script lang="ts">
	import { resetWorkoutData, loadDebugSeedData } from '$lib/db/database';
	import {
		downloadBackup,
		parseBackup,
		importBackup,
		BackupValidationError,
		type BackupEnvelope,
	} from '$lib/db/backup';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';

	let showClearDataConfirm = $state(false);
	let showSeedConfirm = $state(false);
	let clearDataError = $state<string | null>(null);
	let clearingData = $state(false);
	let seedingData = $state(false);

	let exporting = $state(false);
	let fileInput = $state<HTMLInputElement>();
	let pendingBackup = $state<BackupEnvelope | null>(null);
	let restoring = $state(false);
	let restoreError = $state<string | null>(null);

	async function handleExport() {
		if (exporting) return;
		exporting = true;
		try {
			await downloadBackup();
			toastStore.show('Backup downloaded.', 'info');
		} catch {
			toastStore.error('Could not create the backup. Please try again.');
		} finally {
			exporting = false;
		}
	}

	function openFilePicker() {
		restoreError = null;
		fileInput?.click();
	}

	async function handleFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		input.value = ''; // allow re-selecting the same file later
		if (!file) return;

		try {
			const text = await file.text();
			pendingBackup = parseBackup(text);
		} catch (err) {
			if (err instanceof BackupValidationError) {
				toastStore.error(err.message);
			} else {
				toastStore.error('Could not read that file.');
			}
		}
	}

	async function handleRestoreConfirm() {
		if (!pendingBackup || restoring) return;
		restoring = true;
		restoreError = null;
		try {
			await importBackup(pendingBackup);
			location.reload();
		} catch {
			restoreError = 'Restore failed. Your existing data is unchanged.';
			restoring = false;
		}
	}

	async function handleClearWorkoutData() {
		clearingData = true;
		clearDataError = null;
		try {
			await resetWorkoutData();
		} catch (err) {
			if (err instanceof Error) {
				clearDataError = err.message;
			} else {
				clearDataError = 'Could not clear data. Please try again.';
			}
			clearingData = false;
		}
	}

	async function handleLoadSeedData() {
		seedingData = true;
		await loadDebugSeedData();
	}
</script>

<svelte:head>
	<title>Data &amp; backup — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Data & backup" />

	<section class="settings-section">
		<h2 class="settings-section__title">Backup</h2>
		<div class="data-action">
			<p class="data-action__desc">
				Download all your workout data — sessions, programs, exercises, habits, activities, and health readings — as a
				single JSON file. Works fully offline.
			</p>
			<button
				class="data-action__btn data-action__btn--primary"
				onclick={handleExport}
				disabled={exporting}
				aria-busy={exporting}
			>
				{#if exporting}Exporting…{:else}Export backup{/if}
			</button>
		</div>

		<div class="data-action">
			<p class="data-action__desc">
				Restore from a backup file. This <strong>replaces</strong> all workout data currently on this device.
			</p>
			<button class="data-action__btn data-action__btn--secondary" onclick={openFilePicker}>
				Restore from backup
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".json,application/json"
				class="data-action__file-input"
				onchange={handleFileSelected}
				aria-hidden="true"
				tabindex="-1"
			/>
		</div>
	</section>

	<section class="settings-section">
		<h2 class="settings-section__title">Clear</h2>
		<div class="data-action">
			<p class="data-action__desc">
				Remove session history, custom programs and exercises, weight memory, health readings, and any in-progress
				session.
			</p>
			<button
				class="data-action__btn data-action__btn--danger"
				onclick={() => {
					clearDataError = null;
					showClearDataConfirm = true;
				}}
			>
				Clear workout data
			</button>
		</div>
	</section>

	<section class="settings-section settings-section--advanced">
		<h2 class="settings-section__title">Advanced</h2>
		<div class="data-action">
			<p class="data-action__desc data-action__desc--small">
				Load 45 days of realistic debug data — workout sessions, activities, habit logs, and health readings — for
				testing graphs and visualizations. Existing data is kept. Remove with "Clear workout data" above.
			</p>
			<button class="data-action__btn data-action__btn--ghost" onclick={() => (showSeedConfirm = true)}>
				Load debug data
			</button>
		</div>
	</section>
</div>

{#if pendingBackup}
	<ConfirmDialog
		title="Restore this backup?"
		confirmLabel="Replace & restore"
		confirmBusyLabel="Restoring…"
		danger
		busy={restoring}
		error={restoreError}
		onconfirm={handleRestoreConfirm}
		oncancel={() => {
			pendingBackup = null;
			restoreError = null;
		}}
	>
		This replaces <strong>all</strong> workout data on this device with the contents of the backup from
		{new Date(pendingBackup.exportedAt).toLocaleDateString()}. This cannot be undone. The app will reload when done.
	</ConfirmDialog>
{/if}

{#if showClearDataConfirm}
	<ConfirmDialog
		title="Clear workout data?"
		confirmLabel="Clear workout data"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearDataError}
		onconfirm={handleClearWorkoutData}
		oncancel={() => (showClearDataConfirm = false)}
	>
		This removes session history, custom programs and exercises, weight memory, and any in-progress session. Built-in
		content will be restored. This cannot be undone.
		{#if sessionStore.isActive}
			<br /><br />You have a session in progress — it will be discarded.
		{/if}
	</ConfirmDialog>
{/if}

{#if showSeedConfirm}
	<ConfirmDialog
		title="Load debug data?"
		confirmLabel="Load debug data"
		confirmBusyLabel="Loading…"
		busy={seedingData}
		onconfirm={handleLoadSeedData}
		oncancel={() => (showSeedConfirm = false)}
	>
		Adds 45 days of randomized workout sessions, activities, habit logs, and health readings. Your existing data is not
		removed. The page will reload when done.
	</ConfirmDialog>
{/if}

<style>
	.settings-section {
		margin-block-end: var(--space-6);
	}

	.settings-section__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.settings-section--advanced {
		margin-block-start: var(--space-8);
		opacity: 0.85;
	}

	.data-action {
		margin-block-end: var(--space-5);

		&:last-child {
			margin-block-end: 0;
		}
	}

	.data-action__desc {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-3);
	}

	.data-action__desc--small {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.data-action__btn {
		inline-size: 100%;
		block-size: 44px;
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;

		&:disabled {
			opacity: 0.6;
			cursor: default;
		}
	}

	.data-action__btn--primary {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.data-action__btn--danger {
		background: var(--color-red);
		color: #ffffff;
	}

	.data-action__btn--secondary {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.data-action__file-input {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.data-action__btn--ghost {
		block-size: 40px;
		background: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
	}
</style>
