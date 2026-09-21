<script lang="ts">
	import {
		clearCustomExercises,
		clearCustomPrograms,
		clearWorkoutSessions,
		clearActivityLog,
		clearHabitsData,
		clearHealthData,
		clearGoalPlansData,
		clearBaselinesData,
		clearEverything,
		loadDebugSeedData,
	} from '$lib/db/database';
	import { downloadBackup, parseBackup, importBackup, BackupValidationError } from '$lib/db/backup';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsActionRow from '$lib/components/SettingsActionRow.svelte';

	type ClearAction =
		| 'exercises'
		| 'programs'
		| 'workoutSessions'
		| 'activityLog'
		| 'habits'
		| 'health'
		| 'goalPlans'
		| 'baselines'
		| 'everything';

	const clearFns: Record<ClearAction, () => Promise<void>> = {
		exercises: clearCustomExercises,
		programs: clearCustomPrograms,
		workoutSessions: clearWorkoutSessions,
		activityLog: clearActivityLog,
		habits: clearHabitsData,
		health: clearHealthData,
		goalPlans: clearGoalPlansData,
		baselines: clearBaselinesData,
		everything: clearEverything,
	};

	let activeDialog = $state<ClearAction | null>(null);
	let showSeedConfirm = $state(false);
	let clearError = $state<string | null>(null);
	let clearingData = $state(false);
	let seedingData = $state(false);

	let itemsInUse = $derived(programStore.customItemsInUse());

	let exporting = $state(false);
	let fileInput = $state<HTMLInputElement>();
	/** Raw file text — parse at confirm time so restore never touches a reactive tree. */
	let pendingBackupText = $state.raw<string | null>(null);
	let pendingExportedAt = $state.raw<string | null>(null);
	let restoring = $state(false);
	let restoreError = $state<string | null>(null);

	async function handleExport() {
		if (exporting) return;
		exporting = true;
		try {
			const { method } = await downloadBackup();
			if (method === 'share') toastStore.show('Backup shared.', 'info');
			else if (method === 'download') toastStore.show('Backup downloaded.', 'info');
			// cancelled: user closed the share sheet — no toast
		} catch (err) {
			console.error('[backup-export] failed', err);
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
			const parsed = parseBackup(text);
			pendingBackupText = text;
			pendingExportedAt = parsed.exportedAt;
		} catch (err) {
			pendingBackupText = null;
			pendingExportedAt = null;
			if (err instanceof BackupValidationError) {
				toastStore.error(err.message);
			} else {
				toastStore.error('Could not read that file.');
			}
		}
	}

	async function handleRestoreConfirm() {
		if (!pendingBackupText || restoring) return;
		restoring = true;
		restoreError = null;
		try {
			await importBackup(parseBackup(pendingBackupText));
			location.reload();
		} catch (err) {
			restoreError =
				err instanceof BackupValidationError
					? `${err.message} Your existing data is unchanged.`
					: err instanceof Error
						? `${err.message} Some data may have been lost — re-import a valid backup.`
						: 'Restore failed partway through. Some data may have been lost — re-import a valid backup.';
			restoring = false;
		}
	}

	function openClearDialog(action: ClearAction) {
		clearError = null;
		activeDialog = action;
	}

	async function handleClearConfirm() {
		if (!activeDialog) return;
		clearingData = true;
		clearError = null;
		try {
			await clearFns[activeDialog]();
		} catch (err) {
			clearError = err instanceof Error ? err.message : 'Could not clear data. Please try again.';
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
				Export all your workout data — sessions, programs, exercises, habits, activities, and health
				readings — as a JSON file. On a phone, Export opens the share sheet so you can
				<strong>Save to Files</strong>, Mail, or AirDrop. On desktop it downloads the file. Keep the
				file until you've confirmed the restore on the other device. A few months of history is
				typically around 1&nbsp;MB — fine as an email attachment.
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
				Restore from a backup file. This <strong>replaces</strong> all workout data on this device. The
				file is fully written and verified in a staging area first — if that fails, your existing data
				is left unchanged.
			</p>
			<button
				class="data-action__btn data-action__btn--secondary"
				onclick={openFilePicker}
			>
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

	<SettingsGroup title="Clear">
		{#if prefsStore.practiceEnabled}
			<SettingsActionRow
				label="Custom exercises"
				description="Built-in exercises are kept. Your workout log stays in place."
				onclick={() => openClearDialog('exercises')}
			/>
			<SettingsActionRow
				label="Custom programs"
				description="Built-in programs are kept. Your workout log and exercises stay in place."
				onclick={() => openClearDialog('programs')}
			/>
			<SettingsActionRow
				label="Workout sessions"
				description="Session history and weight memory. Activities, programs, and exercises stay in place."
				onclick={() => openClearDialog('workoutSessions')}
			/>
		{/if}
		{#if prefsStore.activityLogEnabled}
			<SettingsActionRow
				label="Activity log"
				description="Logged runs, walks, and other activities. Workout sessions stay in place."
				onclick={() => openClearDialog('activityLog')}
			/>
		{/if}
		{#if prefsStore.habitsEnabled}
			<SettingsActionRow
				label="Habits"
				description="Habits and habit logs. Built-in habits are restored afterward."
				onclick={() => openClearDialog('habits')}
			/>
		{/if}
		<SettingsActionRow
			label="Health data"
			description="Weight and blood pressure readings."
			onclick={() => openClearDialog('health')}
		/>
		{#if prefsStore.liftPlansEnabled}
			<SettingsActionRow
				label="Lift plans"
				description="Lift plan records. Their generated programs and sessions stay in place."
				onclick={() => openClearDialog('goalPlans')}
			/>
		{/if}
		{#if prefsStore.baselinesEnabled}
			<SettingsActionRow
				label="Baselines"
				description="Baseline definitions and every logged entry."
				onclick={() => openClearDialog('baselines')}
			/>
		{/if}
	</SettingsGroup>

	<section class="settings-section">
		<h2 class="settings-section__title">Danger zone</h2>
		<div class="data-action">
			<p class="data-action__desc">
				Remove everything above at once — exercises, programs, workout sessions, activities, habits,
				and health data. Built-in content is restored.
			</p>
			<button
				class="data-action__btn data-action__btn--danger"
				onclick={() => openClearDialog('everything')}
			>
				Clear everything
			</button>
		</div>
	</section>

	<section class="settings-section settings-section--advanced">
		<h2 class="settings-section__title">Advanced</h2>
		<div class="data-action">
			<p class="data-action__desc data-action__desc--small">
				Load ~6 months of realistic debug data — workout sessions, activities, habit logs, health
				readings, two sample lift plans (one completed, one mid-plan; visible when lift plans are
				on), and two sample baselines — for testing graphs and visualizations. Existing data is
				kept. Remove with "Workout sessions", "Activity log", and "Lift plans" above.
			</p>
			<button
				class="data-action__btn data-action__btn--ghost"
				onclick={() => (showSeedConfirm = true)}
			>
				Load debug data
			</button>
		</div>
	</section>
</div>

{#if pendingBackupText && pendingExportedAt}
	<ConfirmDialog
		title="Restore this backup?"
		confirmLabel="Replace & restore"
		confirmBusyLabel="Restoring…"
		danger
		busy={restoring}
		error={restoreError}
		onconfirm={handleRestoreConfirm}
		oncancel={() => {
			pendingBackupText = null;
			pendingExportedAt = null;
			restoreError = null;
		}}
	>
		This replaces <strong>all</strong> workout data on this device with the contents of the backup
		from
		{new Date(pendingExportedAt).toLocaleDateString()}. Existing data is not touched until the
		backup has been fully staged and verified. Keep your backup file until you confirm everything
		looks right after reload. This cannot be undone.
	</ConfirmDialog>
{/if}

{#if activeDialog === 'exercises'}
	<ConfirmDialog
		title="Clear custom exercises?"
		confirmLabel="Clear exercises"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes your custom exercises. Built-in exercises are kept. This cannot be undone.
		{#if itemsInUse.length > 0}
			<br /><br /><strong>Some of these exercises are used in a program:</strong>
			<ul class="confirm-list">
				{#each itemsInUse as entry (entry.item.id)}
					<li>
						{entry.item.name} — used in {entry.programs.map((p) => p.name).join(', ')}
					</li>
				{/each}
			</ul>
			Those programs will show the exercise as missing afterward.
		{/if}
	</ConfirmDialog>
{:else if activeDialog === 'programs'}
	<ConfirmDialog
		title="Clear custom programs?"
		confirmLabel="Clear programs"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes your custom programs. Built-in programs are kept, and your exercises and workout
		log are unaffected. This cannot be undone.
	</ConfirmDialog>
{:else if activeDialog === 'workoutSessions'}
	<ConfirmDialog
		title="Clear workout sessions?"
		confirmLabel="Clear sessions"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes session history and weight memory. Activities, programs, and exercises are
		unaffected. This cannot be undone.
		{#if sessionStore.isActive}
			<br /><br />You have a session in progress — it will be discarded.
		{/if}
	</ConfirmDialog>
{:else if activeDialog === 'activityLog'}
	<ConfirmDialog
		title="Clear activity log?"
		confirmLabel="Clear activity log"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes all logged activities (runs, walks, and other movement you've logged). Workout
		sessions are unaffected. This cannot be undone.
	</ConfirmDialog>
{:else if activeDialog === 'habits'}
	<ConfirmDialog
		title="Clear habits?"
		confirmLabel="Clear habits"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes all habits and habit logs. The default habit set will be restored. This cannot be
		undone.
	</ConfirmDialog>
{:else if activeDialog === 'goalPlans'}
	<ConfirmDialog
		title="Clear lift plans?"
		confirmLabel="Clear lift plans"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes all lift plan records — active, paused, and completed. The programs and sessions
		they generated stay and can be cleared with "Custom programs" and "Workout sessions". This
		cannot be undone.
	</ConfirmDialog>
{:else if activeDialog === 'baselines'}
	<ConfirmDialog
		title="Clear baselines?"
		confirmLabel="Clear baselines"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes every baseline and all of its logged entries, including past days. This cannot be
		undone.
	</ConfirmDialog>
{:else if activeDialog === 'health'}
	<ConfirmDialog
		title="Clear health data?"
		confirmLabel="Clear health data"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes all weight and blood pressure readings. This cannot be undone.
	</ConfirmDialog>
{:else if activeDialog === 'everything'}
	<ConfirmDialog
		title="Clear everything?"
		confirmLabel="Clear everything"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes session history, activities, custom programs and exercises, habits, health
		readings, and any in-progress session. Built-in content will be restored. This cannot be undone.
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
		Adds ~6 months of randomized workout sessions, activities, habit logs, and health readings. Your
		existing data is not removed. The page will reload when done.
	</ConfirmDialog>
{/if}

<style>
	.confirm-list {
		margin-block: var(--space-2);
		padding-inline-start: var(--space-4);
	}

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
