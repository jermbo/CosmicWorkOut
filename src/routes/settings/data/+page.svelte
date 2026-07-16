<script lang="ts">
	import {
		clearCustomExercises,
		clearCustomPrograms,
		clearWorkoutSessions,
		clearActivityLog,
		clearHabitsData,
		clearHealthData,
		clearGoalPlansData,
		clearEverything,
		loadDebugSeedData,
	} from '$lib/db/database';
	import {
		downloadBackup,
		parseBackup,
		importBackup,
		BackupValidationError,
		type BackupEnvelope,
	} from '$lib/db/backup';
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
		| 'everything';

	const clearFns: Record<ClearAction, () => Promise<void>> = {
		exercises: clearCustomExercises,
		programs: clearCustomPrograms,
		workoutSessions: clearWorkoutSessions,
		activityLog: clearActivityLog,
		habits: clearHabitsData,
		health: clearHealthData,
		goalPlans: clearGoalPlansData,
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
				Download all your workout data — sessions, programs, exercises, habits, activities, and
				health readings — as a single JSON file. Works fully offline.
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
				Restore from a backup file. This <strong>replaces</strong> all workout data currently on this
				device.
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
		<SettingsActionRow
			label="Activity log"
			description="Logged runs, walks, and other activities. Workout sessions stay in place."
			onclick={() => openClearDialog('activityLog')}
		/>
		<SettingsActionRow
			label="Habits"
			description="Habits and habit logs. Built-in habits are restored afterward."
			onclick={() => openClearDialog('habits')}
		/>
		<SettingsActionRow
			label="Health data"
			description="Weight and blood pressure readings."
			onclick={() => openClearDialog('health')}
		/>
		{#if prefsStore.goalProgressionPlansEnabled}
			<SettingsActionRow
				label="Goal plans"
				description="Goal progression plan records. Their generated programs and sessions stay in place."
				onclick={() => openClearDialog('goalPlans')}
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
				Load 45 days of realistic debug data — workout sessions, activities, habit logs, health
				readings, and two sample goal plans (one completed, one mid-plan; visible when goal
				progression plans are enabled) — for testing graphs and visualizations. Existing data is
				kept. Remove with "Workout sessions", "Activity log", and "Goal plans" above.
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
		This replaces <strong>all</strong> workout data on this device with the contents of the backup
		from
		{new Date(pendingBackup.exportedAt).toLocaleDateString()}. This cannot be undone. The app will
		reload when done.
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
		title="Clear goal plans?"
		confirmLabel="Clear goal plans"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearError}
		onconfirm={handleClearConfirm}
		oncancel={() => (activeDialog = null)}
	>
		This removes all goal progression plan records — active, paused, and completed. The programs and
		sessions they generated stay and can be cleared with "Custom programs" and "Workout sessions".
		This cannot be undone.
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
		Adds 45 days of randomized workout sessions, activities, habit logs, and health readings. Your
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
