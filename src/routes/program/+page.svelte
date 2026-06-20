<script lang="ts">
	import { page } from '$app/state';
	import type { Program, Routine } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import {
		flattenItems,
		effectiveSections,
		STRENGTH_DISCIPLINE_ID,
		BELLYDANCE_DISCIPLINE_ID,
	} from '$lib/discipline';
	import WorkoutEditor from '$lib/components/WorkoutEditor.svelte';
	import DanceRoutineEditor from '$lib/components/DanceRoutineEditor.svelte';
	import CreateProgramSheet from '$lib/components/CreateProgramSheet.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let editingWorkout = $state<Routine | null | undefined>(undefined);
	let showCreateProgram = $state(false);
	let showDeleteProgramConfirm = $state(false);
	let deletingProgram = $state(false);
	let removeWorkoutName = $state<string | null>(null);
	let selectedWeek = $state(1);

	let disciplineId = $derived(
		page.url.searchParams.get('discipline') === BELLYDANCE_DISCIPLINE_ID
			? BELLYDANCE_DISCIPLINE_ID
			: STRENGTH_DISCIPLINE_ID,
	);

	let disciplinePrograms = $derived(programStore.programs.filter((p) => p.disciplineId === disciplineId));

	// Which program's schedule is shown in the detail panel (defaults to active for discipline)
	let viewingProgramId = $state<string | undefined>(undefined);

	$effect(() => {
		if (viewingProgramId === undefined && disciplinePrograms.length > 0) {
			viewingProgramId =
				programStore.activeProgramFor(disciplineId)?.id ?? disciplinePrograms[0]?.id;
		}
	});

	$effect(() => {
		void disciplineId;
		viewingProgramId = undefined;
	});

	let viewingProgram = $derived(disciplinePrograms.find((p) => p.id === viewingProgramId));

	let viewingIsActive = $derived(
		viewingProgramId ? programStore.isProgramActive(viewingProgramId) : false,
	);

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
		if (!viewingProgram) return [] as Routine[];
		const week = viewingProgram.weeks[selectedWeek - 1];
		return week?.routines ?? [];
	});

	let totalWeeks = $derived(viewingProgram?.durationWeeks ?? 1);

	// Reset week when switching programs
	$effect(() => {
		void viewingProgramId;
		selectedWeek = 1;
	});

	$effect(() => {
		if (selectedWeek > totalWeeks) selectedWeek = 1;
	});

	function getWorkoutStatus(workout: Routine): 'today' | 'done' | 'scheduled' {
		if (!viewingIsActive) return 'scheduled';
		const todaysId = programStore.todaysRoutineFor(disciplineId)?.id;
		if (workout.id === todaysId) return 'today';
		const allIds = programStore.allRoutinesFor(disciplineId).map((w) => w.id);
		const todayIdx = allIds.indexOf(todaysId ?? '');
		const thisIdx = allIds.indexOf(workout.id);
		if (thisIdx < todayIdx) return 'done';
		return 'scheduled';
	}

	function displayItemsForRoutine(routine: Routine) {
		if (!viewingProgram || disciplineId === STRENGTH_DISCIPLINE_ID) {
			return flattenItems(routine);
		}
		return effectiveSections(viewingProgram, routine).flatMap((s) => s.items);
	}

	async function handleDeleteProgram() {
		if (!viewingProgram || deletingProgram) return;
		deletingProgram = true;
		try {
			await programStore.deleteProgram(viewingProgram.id);
			viewingProgramId = programStore.activeProgramFor(disciplineId)?.id ?? disciplinePrograms[0]?.id;
		} finally {
			deletingProgram = false;
			showDeleteProgramConfirm = false;
		}
	}

	async function handleRemoveWorkout() {
		if (!removeWorkoutName) return;
		await programStore.removeRoutine(removeWorkoutName);
		removeWorkoutName = null;
	}

	function openCard(program: Program) {
		viewingProgramId = program.id;
	}
</script>

<svelte:head>
	<title>Programs — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide program-page">
	<!-- ── Library ── -->
	<div class="prog-header">
		<h1 class="prog-header__title">Programs</h1>
		<button class="prog-header__new" onclick={() => (showCreateProgram = true)}>
			<Icon name="plus" size={14} stroke={2.5} />
			New Program
		</button>
	</div>

	<div class="prog-list" role="list" aria-label="Available programs">
		{#each disciplinePrograms as program (program.id)}
			{@const isActive = programStore.isProgramActive(program.id)}
			{@const isViewing = program.id === viewingProgramId}
			<div
				class="prog-card"
				class:prog-card--active={isActive}
				class:prog-card--viewing={isViewing && !isActive}
				role="listitem"
			>
				<button
					class="prog-card__body"
					onclick={() => openCard(program)}
					aria-pressed={isViewing}
					aria-label="View {program.name} schedule"
				>
					<div class="prog-card__name-row">
						<span class="prog-card__name">{program.name}</span>
						<div class="prog-card__badges">
							{#if isActive}
								<span class="prog-badge prog-badge--active">Active</span>
							{/if}
							{#if program.isBuiltIn}
								<span class="prog-badge prog-badge--builtin">Built-in</span>
							{/if}
						</div>
					</div>
					{#if program.description}
						<p class="prog-card__desc">{program.description}</p>
					{/if}
					<span class="prog-card__meta">
						{program.durationWeeks} weeks · {program.daysPerWeek} days/week
					</span>
				</button>

				<div class="prog-card__actions">
					{#if isActive}
						<button
							class="prog-card__deactivate-btn"
							onclick={() => programStore.deactivateProgram(program.id)}
						>
							Deactivate
						</button>
					{:else}
						<button
							class="prog-card__activate-btn"
							onclick={() => {
								programStore.setActiveProgram(program.id);
								viewingProgramId = program.id;
							}}
						>
							Activate
						</button>
					{/if}
					{#if !program.isBuiltIn}
						<button
							class="prog-card__delete-btn"
							onclick={() => {
								viewingProgramId = program.id;
								showDeleteProgramConfirm = true;
							}}
							aria-label="Delete {program.name}"
						>
							<Icon name="trash" size={15} />
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- ── Program Schedule ── -->
	{#if viewingProgram}
		<section class="schedule" aria-labelledby="schedule-heading">
			<!-- Schedule header -->
			<div class="schedule__header">
				<div class="schedule__title-row">
					<h2 class="schedule__title" id="schedule-heading">{viewingProgram.name}</h2>
					{#if viewingIsActive}
						<button
							class="schedule__deactivate-btn"
							onclick={() => programStore.deactivateProgram(viewingProgram!.id)}
						>
							Deactivate
						</button>
					{:else}
						<button class="schedule__activate-btn" onclick={() => programStore.setActiveProgram(viewingProgram!.id)}>
							Activate this program
						</button>
					{/if}
				</div>

				{#if viewingIsActive}
					<div class="schedule__progress">
						<div class="schedule__progress-labels">
							<span class="schedule__progress-label">Progress</span>
							<span class="schedule__progress-wk">
								Week {programStore.currentWeekFor(disciplineId)} of {viewingProgram.durationWeeks}
							</span>
						</div>
						<div
							class="schedule__progress-bar"
							role="progressbar"
							aria-valuenow={programStore.currentWeekFor(disciplineId)}
							aria-valuemin={1}
							aria-valuemax={viewingProgram.durationWeeks}
						>
							<div
								class="schedule__progress-fill"
								style:inline-size="{((programStore.currentWeekFor(disciplineId) - 1) / viewingProgram.durationWeeks) * 100}%"
							></div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Week picker -->
			<div class="week-picker" aria-label="Browse weeks">
				<button
					class="week-picker__btn"
					onclick={() => {
						if (selectedWeek > 1) selectedWeek--;
					}}
					disabled={selectedWeek <= 1}
					aria-label="Previous week"
				>
					<Icon name="chevron-left" size={16} stroke={2.5} />
				</button>
				<span class="week-picker__label">
					Week {selectedWeek}
					{#if viewingIsActive && selectedWeek === programStore.currentWeekFor(disciplineId)}
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
					<Icon name="chevron-right" size={16} stroke={2.5} />
				</button>
			</div>

			<!-- Workout cards -->
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
							<span class="workout-card__letter" aria-hidden="true">
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
									<Icon name="edit" size={13} />
									Edit
								</button>
								{#if weekWorkouts.length > 1}
									<button
										class="workout-card__remove-btn"
										onclick={() => (removeWorkoutName = workout.name)}
										aria-label="Remove {workout.name}"
									>
										<Icon name="close" size={13} />
									</button>
								{/if}
							</div>
						</div>

						{#if displayItemsForRoutine(workout).length > 0}
							<div class="workout-card__chips" role="list" aria-label="Items in {workout.name}">
								{#each displayItemsForRoutine(workout) as we}
									{@const ex = programStore.itemMap.get(we.itemId)}
									{#if ex}
										<span class="workout-card__chip" role="listitem">{ex.name}</span>
									{/if}
								{/each}
							</div>
						{/if}
					</article>
				{/each}

				{#if disciplineId === STRENGTH_DISCIPLINE_ID}
					<button class="schedule__add-workout-btn" onclick={() => (editingWorkout = null)}>
						<Icon name="plus" size={18} stroke={2.5} />
						Add workout
					</button>
				{/if}
			</div>
		</section>
	{/if}
</div>

<!-- Confirm dialogs -->
{#if showDeleteProgramConfirm}
	<ConfirmDialog
		title="Delete program?"
		confirmLabel="Delete"
		confirmBusyLabel="Deleting…"
		danger
		busy={deletingProgram}
		onconfirm={handleDeleteProgram}
		oncancel={() => (showDeleteProgramConfirm = false)}
	>
		"{viewingProgram?.name}" will be removed. Workout sessions you've logged are kept.
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

{#if editingWorkout !== undefined}
	{#if disciplineId === BELLYDANCE_DISCIPLINE_ID && editingWorkout && viewingProgram}
		<DanceRoutineEditor
			program={viewingProgram}
			routine={editingWorkout}
			onBack={() => (editingWorkout = undefined)}
		/>
	{:else}
		<WorkoutEditor workout={editingWorkout} onBack={() => (editingWorkout = undefined)} />
	{/if}
{/if}

{#if showCreateProgram}
	<CreateProgramSheet {disciplineId} onClose={() => (showCreateProgram = false)} />
{/if}

<style>
	.program-page {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ── Library header ── */
	.prog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.prog-header__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.prog-header__new {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding-inline: var(--space-4);
		block-size: 38px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.875rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	/* ── Program cards ── */
	.prog-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.prog-card {
		display: flex;
		align-items: stretch;
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--r-xl);
		overflow: hidden;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.prog-card--active {
		border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
	}

	.prog-card--viewing {
		border-color: color-mix(in srgb, var(--color-text-primary) 30%, transparent);
	}

	.prog-card__body {
		flex: 1;
		padding: var(--space-4);
		text-align: start;
		min-inline-size: 0;
	}

	.prog-card__name-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin-block-end: var(--space-1);
	}

	.prog-card__name {
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.prog-card__badges {
		display: flex;
		gap: var(--space-1);
	}

	.prog-badge {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-inline: 6px;
		block-size: 18px;
		border-radius: var(--radius-full);
		display: inline-flex;
		align-items: center;
	}

	.prog-badge--active {
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
		color: var(--color-accent);
	}

	.prog-badge--builtin {
		background: color-mix(in srgb, var(--color-text-muted) 15%, transparent);
		color: var(--color-text-muted);
	}

	.prog-card__desc {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-1);
		line-height: 1.4;
	}

	.prog-card__meta {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--color-text-muted);
	}

	.prog-card__actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3);
		border-inline-start: 1px solid var(--color-border);
		background: var(--color-surface-1);
	}

	.prog-card__activate-btn {
		padding-inline: var(--space-3);
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.8125rem;
		font-weight: 700;
		white-space: nowrap;
		transition: opacity var(--duration-fast) var(--ease-out);

		&:hover {
			opacity: 0.85;
		}
	}

	.prog-card__deactivate-btn {
		padding-inline: var(--space-3);
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
		white-space: nowrap;

		&:hover {
			color: var(--color-red);
			border-color: color-mix(in srgb, var(--color-red) 40%, var(--color-border));
		}
	}

	.prog-card__delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--color-text-muted);
		transition: color var(--duration-fast) var(--ease-out);

		&:hover {
			color: var(--color-red);
		}
	}

	/* ── Schedule panel ── */
	.schedule {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.schedule__header {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.schedule__title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.schedule__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.schedule__activate-btn {
		padding-inline: var(--space-4);
		block-size: 34px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.8125rem;
		font-weight: 700;
		flex-shrink: 0;
		transition: opacity var(--duration-fast) var(--ease-out);

		&:hover {
			opacity: 0.85;
		}
	}

	.schedule__deactivate-btn {
		padding-inline: var(--space-4);
		block-size: 34px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
		flex-shrink: 0;

		&:hover {
			color: var(--color-red);
			border-color: color-mix(in srgb, var(--color-red) 40%, var(--color-border));
		}
	}

	/* Progress */
	.schedule__progress {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.schedule__progress-labels {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.schedule__progress-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.schedule__progress-wk {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.schedule__progress-bar {
		block-size: 6px;
		background: var(--color-surface-3);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.schedule__progress-fill {
		block-size: 100%;
		background: var(--color-accent);
		border-radius: var(--radius-full);
		transition: inline-size 600ms var(--ease-spring);
	}

	/* Week picker */
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
		color: var(--color-accent);
		display: inline-flex;
		align-items: center;
	}

	/* Workout cards */
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
			color: var(--color-accent);
		}
	}
</style>
