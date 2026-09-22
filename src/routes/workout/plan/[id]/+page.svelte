<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Routine } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { flattenItems } from '$lib/discipline';
	import { activatePlan, pausePlan } from '$lib/plans/actions';
	import { targetLabel, unitLabel } from '$lib/goalPlans/format';
	import WorkoutEditor from '$lib/components/WorkoutEditor.svelte';
	import GoalBlockTimeline from '$lib/components/goals/GoalBlockTimeline.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import { redirectWhenDisabled } from '$lib/featureGate.svelte';

	redirectWhenDisabled(() => prefsStore.practiceEnabled);

	let programId = $derived(page.params.id ?? '');
	let program = $derived(programStore.programById(programId));
	let goal = $derived(programId ? goalPlanStore.planForProgram(programId) : undefined);
	let isActive = $derived(programId ? programStore.isProgramActive(programId) : false);

	let editingWorkout = $state<Routine | null | undefined>(undefined);
	let selectedWeek = $state(1);
	let removeWorkoutName = $state<string | null>(null);
	let showDeleteConfirm = $state(false);
	let deleting = $state(false);
	let renaming = $state(false);
	let renameValue = $state('');
	let confirmAction = $state<'repeat' | 'complete' | 'pause' | 'removeGoal' | null>(null);

	const ACCENT_MAP: Record<string, string> = {
		lime: 'var(--color-lime)',
		lavender: 'var(--color-lavender)',
		red: 'var(--color-red)',
	};
	const SHADOW_MAP: Record<string, string> = {
		lime: 'var(--shadow-lime)',
		lavender: 'var(--shadow-lavender)',
		red: 'none',
	};

	let weekWorkouts = $derived.by(() => {
		if (!program) return [] as Routine[];
		return program.weeks[selectedWeek - 1]?.routines ?? [];
	});
	let totalWeeks = $derived(program?.durationWeeks ?? 1);

	$effect(() => {
		void programId;
		selectedWeek = 1;
	});
	$effect(() => {
		if (selectedWeek > totalWeeks) selectedWeek = 1;
	});

	function getWorkoutStatus(workout: Routine): 'today' | 'done' | 'scheduled' {
		if (!isActive || !program) return 'scheduled';
		const todaysId = programStore.todaysRoutineForProgram(program.id)?.id;
		if (workout.id === todaysId) return 'today';
		const allIds = programStore.allRoutinesForProgram(program.id).map((w) => w.id);
		const todayIdx = allIds.indexOf(todaysId ?? '');
		const thisIdx = allIds.indexOf(workout.id);
		if (thisIdx < todayIdx) return 'done';
		return 'scheduled';
	}

	async function handleActivate() {
		await activatePlan(programId);
	}

	async function handlePause() {
		await pausePlan(programId);
	}

	async function handleDeleteProgram() {
		if (!program || deleting || goal) return;
		deleting = true;
		try {
			await programStore.deleteProgram(program.id);
			await goto(resolve('/workout'));
		} finally {
			deleting = false;
			showDeleteConfirm = false;
		}
	}

	async function handleRemoveWorkout() {
		if (!removeWorkoutName || !program) return;
		await programStore.removeRoutine(program.id, removeWorkoutName);
		removeWorkoutName = null;
	}

	function startRename() {
		if (!goal) return;
		renameValue = goal.name;
		renaming = true;
	}

	async function saveRename() {
		if (!goal || !renameValue.trim()) return;
		await goalPlanStore.renamePlan(goal.id, renameValue);
		renaming = false;
	}

	async function handleConfirm() {
		if (!goal || !confirmAction) return;
		const action = confirmAction;
		confirmAction = null;
		if (action === 'repeat') {
			await goalPlanStore.repeatCurrentBlock(goal.id);
		} else if (action === 'pause') {
			await goalPlanStore.pausePlan(goal.id);
		} else if (action === 'complete') {
			await goalPlanStore.completePlan(goal.id);
		} else if (action === 'removeGoal') {
			await goalPlanStore.removeGoal(goal.id);
		}
	}
</script>

<svelte:head>
	<title>{program?.name ?? 'Plan'} — CosmicWorkOut</title>
</svelte:head>

{#if program}
	<div class="page page--wide plan-page">
		<PageHeader
			title={program.name}
			showBack
			backHref="/workout"
		/>

		{#if goal}
			<section
				class="goal-panel"
				aria-label="Goal"
			>
				<header class="goal-panel__header">
					{#if renaming}
						<form
							class="goal-panel__rename"
							onsubmit={(e) => {
								e.preventDefault();
								saveRename();
							}}
						>
							<!-- svelte-ignore a11y_autofocus -->
							<input
								class="goal-panel__rename-input"
								type="text"
								bind:value={renameValue}
								autofocus
								aria-label="Plan name"
							/>
							<button
								type="submit"
								class="goal-panel__rename-save"
								disabled={!renameValue.trim()}>Save</button
							>
							<button
								type="button"
								class="goal-panel__rename-cancel"
								onclick={() => (renaming = false)}>Cancel</button
							>
						</form>
					{:else}
						<button
							class="goal-panel__rename-btn"
							type="button"
							onclick={startRename}>Rename</button
						>
					{/if}
				</header>
				<p class="goal-panel__target">
					{programStore.getItemById(goal.focusItemId)?.name ?? 'Focus lift'} ·
					{targetLabel(goal.start, unitLabel(programStore.getItemById(goal.focusItemId)?.unit))} →
					<strong
						>{targetLabel(
							goal.goal,
							unitLabel(programStore.getItemById(goal.focusItemId)?.unit),
						)}</strong
					>
				</p>
				<GoalBlockTimeline
					plan={goal}
					currentWeek={goalPlanStore.currentWeek(goal)}
					currentBlockNumber={goalPlanStore.currentBlock(goal)?.blockNumber ?? null}
					finished={goalPlanStore.isFinished(goal)}
				/>
				<div class="goal-panel__actions">
					<button
						class="goal-panel__action"
						type="button"
						onclick={() => (confirmAction = 'repeat')}>Repeat block</button
					>
					{#if goal.status !== 'completed'}
						<button
							class="goal-panel__action"
							type="button"
							onclick={() => (confirmAction = 'complete')}>Complete</button
						>
					{/if}
					<button
						class="goal-panel__action goal-panel__action--danger"
						type="button"
						onclick={() => (confirmAction = 'removeGoal')}
					>
						Remove goal
					</button>
				</div>
			</section>
		{/if}

		<div class="plan-page__toolbar">
			<div class="plan-page__status">
				{#if isActive}
					<span class="plan-page__badge plan-page__badge--active">Active</span>
				{/if}
				{#if program.isBuiltIn}
					<span class="plan-page__badge">Built-in</span>
				{/if}
			</div>
			<div class="plan-page__toolbar-actions">
				{#if isActive}
					<button
						class="plan-page__pause-btn"
						onclick={handlePause}
					>
						Pause
					</button>
				{:else}
					<button
						class="plan-page__activate-btn"
						onclick={handleActivate}
					>
						Activate this plan
					</button>
				{/if}
				{#if !program.isBuiltIn && !goal}
					<button
						class="plan-page__delete-btn"
						onclick={() => (showDeleteConfirm = true)}
						aria-label="Delete {program.name}"
					>
						<Icon
							name="trash"
							size={15}
						/>
					</button>
				{/if}
			</div>
		</div>

		{#if isActive}
			<div class="plan-page__progress">
				<div class="plan-page__progress-labels">
					<FieldLabel>Progress</FieldLabel>
					<span class="plan-page__progress-wk">
						Week {programStore.currentWeekForProgram(program.id)} of {program.durationWeeks}
					</span>
				</div>
				<div
					class="plan-page__progress-bar"
					role="progressbar"
					aria-valuenow={programStore.currentWeekForProgram(program.id)}
					aria-valuemin={1}
					aria-valuemax={program.durationWeeks}
				>
					<div
						class="plan-page__progress-fill"
						style:inline-size="{((programStore.currentWeekForProgram(program.id) - 1) /
							program.durationWeeks) *
							100}%"
					></div>
				</div>
			</div>
		{/if}

		<div
			class="week-picker"
			aria-label="Browse weeks"
		>
			<button
				class="week-picker__btn"
				onclick={() => {
					if (selectedWeek > 1) selectedWeek--;
				}}
				disabled={selectedWeek <= 1}
				aria-label="Previous week"
			>
				<Icon
					name="chevron-left"
					size={16}
					stroke={2.5}
				/>
			</button>
			<span class="week-picker__label">
				Week {selectedWeek}
				{#if isActive && selectedWeek === programStore.currentWeekForProgram(program.id)}
					<span class="week-picker__now">current</span>
				{/if}
			</span>
			<button
				class="week-picker__btn"
				onclick={() => {
					if (selectedWeek < totalWeeks) selectedWeek++;
				}}
				disabled={selectedWeek >= totalWeeks}
				aria-label="Next week"
			>
				<Icon
					name="chevron-right"
					size={16}
					stroke={2.5}
				/>
			</button>
		</div>

		<div class="schedule__workouts">
			{#each weekWorkouts as workout (workout.id)}
				{@const accent = ACCENT_MAP[workout.color ?? 'lime'] ?? 'var(--color-accent)'}
				{@const shadow = SHADOW_MAP[workout.color ?? 'lime'] ?? 'none'}
				{@const status = getWorkoutStatus(workout)}
				<article
					class="workout-card"
					class:workout-card--today={status === 'today'}
					style:--waccent={accent}
					style:--wshadow={shadow}
				>
					<div class="workout-card__head">
						<span
							class="workout-card__letter"
							aria-hidden="true"
						>
							{workout.letter ?? '?'}
						</span>
						<div class="workout-card__info">
							<div class="workout-card__name-row">
								<h3 class="workout-card__name">{workout.name}</h3>
								{#if status === 'today'}
									<span class="workout-card__badge">Today</span>
								{/if}
							</div>
							{#if workout.focus}
								<p class="workout-card__focus">{workout.focus}</p>
							{/if}
						</div>
						<div class="workout-card__actions">
							<button
								class="workout-card__edit-btn"
								onclick={() => (editingWorkout = workout)}
								aria-label="Edit {workout.name}"
							>
								<Icon
									name="edit"
									size={13}
								/>
								Edit
							</button>
							{#if weekWorkouts.length > 1}
								<button
									class="workout-card__remove-btn"
									onclick={() => (removeWorkoutName = workout.name)}
									aria-label="Remove {workout.name}"
								>
									<Icon
										name="close"
										size={13}
									/>
								</button>
							{/if}
						</div>
					</div>

					{#if flattenItems(workout).length > 0}
						<div
							class="workout-card__chips"
							role="list"
							aria-label="Items in {workout.name}"
						>
							{#each flattenItems(workout) as we (we.itemId)}
								{@const ex = programStore.itemMap.get(we.itemId)}
								{#if ex}
									<span
										class="workout-card__chip"
										role="listitem">{ex.name}</span
									>
								{/if}
							{/each}
						</div>
					{/if}
				</article>
			{/each}

			<button
				class="schedule__add-workout-btn"
				onclick={() => (editingWorkout = null)}
			>
				<Icon
					name="plus"
					size={18}
					stroke={2.5}
				/>
				Add workout
			</button>
		</div>
	</div>
{:else}
	<div class="page">
		<PageHeader
			title="Plan"
			showBack
			backHref="/workout"
		/>
		<p class="plan-missing">This plan doesn't exist any more.</p>
	</div>
{/if}

{#if showDeleteConfirm}
	<ConfirmDialog
		title="Delete plan?"
		confirmLabel="Delete"
		confirmBusyLabel="Deleting…"
		danger
		busy={deleting}
		onconfirm={handleDeleteProgram}
		oncancel={() => (showDeleteConfirm = false)}
	>
		"{program?.name}" will be removed. Workout sessions you've logged are kept.
	</ConfirmDialog>
{/if}

{#if removeWorkoutName}
	<ConfirmDialog
		title="Remove workout?"
		confirmLabel="Remove"
		danger
		onconfirm={handleRemoveWorkout}
		oncancel={() => (removeWorkoutName = null)}
	>
		"{removeWorkoutName}" will be removed from all weeks.
	</ConfirmDialog>
{/if}

{#if confirmAction === 'repeat'}
	<ConfirmDialog
		title="Repeat the current block?"
		confirmLabel="Repeat block"
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The current 4-week block restarts from week 1 with its original targets. Nothing you've logged
		is changed — the plan just takes longer.
	</ConfirmDialog>
{:else if confirmAction === 'complete'}
	<ConfirmDialog
		title="Complete this plan?"
		confirmLabel="Complete plan"
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The stint ends and becomes read-only history.
	</ConfirmDialog>
{:else if confirmAction === 'removeGoal'}
	<ConfirmDialog
		title="Remove this goal?"
		confirmLabel="Remove goal"
		danger
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The plan keeps going as a plain plan to its original end. Your logged sessions are unchanged.
	</ConfirmDialog>
{/if}

{#if editingWorkout !== undefined}
	<WorkoutEditor
		{programId}
		workout={editingWorkout}
		onBack={() => (editingWorkout = undefined)}
	/>
{/if}

<style>
	.plan-page {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.plan-missing {
		color: var(--color-text-muted);
	}

	.goal-panel {
		padding: var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
		border-radius: var(--r-2xl);
	}

	.goal-panel__header {
		display: flex;
		justify-content: flex-end;
	}

	.goal-panel__rename {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		inline-size: 100%;
	}

	.goal-panel__rename-input {
		flex: 1;
		block-size: 40px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		color: var(--color-text-primary);
		outline: none;

		&:focus {
			border-color: var(--color-accent);
		}
	}

	.goal-panel__rename-save {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-accent-text);

		&:disabled {
			opacity: 0.5;
		}
	}

	.goal-panel__rename-cancel {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.goal-panel__rename-btn {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);

		&:hover {
			color: var(--color-accent-text);
		}
	}

	.goal-panel__target {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-4);

		strong {
			color: var(--color-text-primary);
		}
	}

	.goal-panel__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-4);
	}

	.goal-panel__action {
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			color: var(--color-text-primary);
		}
	}

	.goal-panel__action--danger:hover {
		color: var(--color-red);
		border-color: color-mix(in srgb, var(--color-red) 40%, var(--color-border));
	}

	.plan-page__toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.plan-page__status {
		display: flex;
		gap: var(--space-1);
	}

	.plan-page__badge {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-inline: 6px;
		block-size: 18px;
		border-radius: var(--radius-full);
		display: inline-flex;
		align-items: center;
		background: color-mix(in srgb, var(--color-text-muted) 15%, transparent);
		color: var(--color-text-muted);
	}

	.plan-page__badge--active {
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
		color: var(--color-accent-text);
	}

	.plan-page__toolbar-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.plan-page__activate-btn {
		padding-inline: var(--space-4);
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.8125rem;
		font-weight: 700;
	}

	.plan-page__pause-btn {
		padding-inline: var(--space-4);
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);

		&:hover {
			color: var(--color-red);
			border-color: color-mix(in srgb, var(--color-red) 40%, var(--color-border));
		}
	}

	.plan-page__delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-full);
		color: var(--color-text-muted);

		&:hover {
			color: var(--color-red);
		}
	}

	.plan-page__progress {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.plan-page__progress-labels {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.plan-page__progress-wk {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.plan-page__progress-bar {
		block-size: 6px;
		background: var(--color-surface-3);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.plan-page__progress-fill {
		block-size: 100%;
		background: var(--color-accent);
		border-radius: var(--radius-full);
		transition: inline-size 600ms var(--ease-spring);
	}

	.week-picker {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.week-picker__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		flex-shrink: 0;
		transition: color var(--duration-fast) var(--ease-out);

		&:disabled {
			opacity: 0.3;
			cursor: default;
		}
		&:not(:disabled):hover {
			color: var(--color-text-primary);
		}
	}

	.week-picker__label {
		flex: 1;
		text-align: center;
		font-size: 0.9375rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
	}

	.week-picker__now {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-inline: 6px;
		block-size: 20px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
		color: var(--color-accent-text);
		display: inline-flex;
		align-items: center;
	}

	.schedule__workouts {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	@container page (inline-size >= 560px) {
		.schedule__workouts {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
		}

		.schedule__add-workout-btn {
			grid-column: 1 / -1;
		}
	}

	.workout-card {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-4);
	}

	.workout-card--today {
		border-color: color-mix(in srgb, var(--waccent) 40%, transparent);
		box-shadow: var(--wshadow);
	}

	.workout-card__head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-block-end: var(--space-3);
	}

	.workout-card__letter {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--radius-lg);
		background: var(--waccent);
		color: #101010;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.workout-card__info {
		flex: 1;
		min-inline-size: 0;
	}

	.workout-card__name-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.workout-card__name {
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.2;
	}

	.workout-card__badge {
		display: inline-flex;
		align-items: center;
		padding-inline: 7px;
		block-size: 20px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--waccent) 20%, transparent);
		color: var(--waccent);
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		flex-shrink: 0;
	}

	.workout-card__focus {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
		font-weight: 500;
	}

	.workout-card__actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.workout-card__edit-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-inline: var(--space-2);
		block-size: 30px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		flex-shrink: 0;
		transition: color var(--duration-fast) var(--ease-out);

		&:hover {
			color: var(--color-text-primary);
		}
	}

	.workout-card__remove-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 30px;
		block-size: 30px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition: color var(--duration-fast) var(--ease-out);

		&:hover {
			color: var(--color-red);
		}
	}

	.workout-card__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.workout-card__chip {
		padding-inline: var(--space-2);
		block-size: 22px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
	}

	.schedule__add-workout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		inline-size: 100%;
		padding-block: var(--space-4);
		border: 2px dashed var(--color-border-strong);
		border-radius: var(--r-xl);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent-text);
		}
	}
</style>
