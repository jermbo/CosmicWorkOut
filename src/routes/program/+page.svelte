<script lang="ts">
	import type { Workout } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import WorkoutEditor from '$lib/components/WorkoutEditor.svelte';
	import ProgramSelectSheet from '$lib/components/ProgramSelectSheet.svelte';
	import CreateProgramSheet from '$lib/components/CreateProgramSheet.svelte';

	let editingWorkout = $state<Workout | null | undefined>(undefined);
	// undefined = closed, null = new workout, Workout = editing existing

	let showProgramSelect = $state(false);
	let showCreateProgram = $state(false);
	let showCopyConfirm = $state<Workout | null | 'new' | undefined>(undefined);
	// showCopyConfirm: the workout we want to edit (or 'new'), pending copy confirmation

	let selectedWeek = $state(1);

	const ACCENT_MAP: Record<string, string> = {
		lime: 'var(--color-lime)',
		lavender: 'var(--color-lavender)',
		red: 'var(--color-red)'
	};

	const SHADOW_MAP: Record<string, string> = {
		lime: 'var(--shadow-lime)',
		lavender: 'var(--shadow-lavender)',
		red: 'none'
	};

	let weekWorkouts = $derived.by(() => {
		if (!programStore.activeProgram) return [] as Workout[];
		const week = programStore.activeProgram.weeks[selectedWeek - 1];
		return week?.workouts ?? [];
	});

	let totalWeeks = $derived(programStore.activeProgram?.durationWeeks ?? 1);

	// Clamp selectedWeek when program changes
	$effect(() => {
		if (selectedWeek > totalWeeks) selectedWeek = 1;
	});

	function getWorkoutStatus(workout: Workout): 'today' | 'done' | 'scheduled' {
		const todaysId = programStore.todaysWorkout?.id;
		if (workout.id === todaysId) return 'today';
		const allIds = programStore.allWorkouts.map((w) => w.id);
		const todayIdx = allIds.indexOf(todaysId ?? '');
		const thisIdx = allIds.indexOf(workout.id);
		if (thisIdx < todayIdx) return 'done';
		return 'scheduled';
	}

	function requestEdit(workout: Workout | null) {
		if (programStore.activeProgram?.isBuiltIn) {
			showCopyConfirm = workout;
		} else {
			editingWorkout = workout;
		}
	}

	async function handleCopyAndEdit() {
		if (!programStore.activeProgram) return;
		const pending = showCopyConfirm;
		showCopyConfirm = undefined;
		const copy = await programStore.copyProgram(programStore.activeProgram);
		programStore.setActiveProgram(copy.id);
		// Now open the equivalent workout in the copy
		if (pending === null || pending === 'new') {
			editingWorkout = null;
		} else if (pending) {
			// Find the workout by name in the new program
			const match = programStore.activeProgram?.weeks[0]?.workouts.find(
				(w) => w.name === (pending as Workout).name
			);
			editingWorkout = match ?? null;
		}
	}
</script>

<svelte:head>
	<title>Program — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide program-page">
	{#if programStore.activeProgram}
		<header class="program-page__header">
			<div class="program-page__header-row">
				<div>
					<p class="program-page__eyebrow">Program</p>
					<h1 class="program-page__title">{programStore.activeProgram.name}</h1>
				</div>
				<div class="program-page__header-actions">
					{#if programStore.activeProgram.isBuiltIn}
						<span class="built-in-badge" aria-label="Built-in program">Built-in</span>
					{/if}
					<button
						class="program-page__switch-btn"
						onclick={() => (showProgramSelect = true)}
						aria-label="Switch program"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<polyline points="17 1 21 5 17 9" />
							<path d="M3 11V9a4 4 0 0 1 4-4h14" />
							<polyline points="7 23 3 19 7 15" />
							<path d="M21 13v2a4 4 0 0 1-4 4H3" />
						</svg>
					</button>
				</div>
			</div>
		</header>

		<!-- Week progress bar -->
		<div class="program-page__progress">
			<div class="program-page__progress-labels">
				<span class="program-page__progress-label">Week progress</span>
				<span class="program-page__progress-wk">
					Wk {programStore.currentWeekNumber} of {programStore.activeProgram.durationWeeks}
				</span>
			</div>
			<div
				class="program-page__progress-bar"
				role="progressbar"
				aria-valuenow={programStore.currentWeekNumber}
				aria-valuemin={1}
				aria-valuemax={programStore.activeProgram.durationWeeks}
				aria-label="Program progress: week {programStore.currentWeekNumber} of {programStore.activeProgram.durationWeeks}"
			>
				<div
					class="program-page__progress-fill"
					style:inline-size="{((programStore.currentWeekNumber - 1) / programStore.activeProgram.durationWeeks) * 100}%"
				></div>
			</div>
		</div>

		<!-- Week picker -->
		<div class="week-picker" aria-label="Browse program weeks">
			<button
				class="week-picker__btn"
				onclick={() => { if (selectedWeek > 1) selectedWeek--; }}
				disabled={selectedWeek <= 1}
				aria-label="Previous week"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>
			<span class="week-picker__label">
				Week {selectedWeek}
				{#if selectedWeek === programStore.currentWeekNumber}
					<span class="week-picker__now">current</span>
				{/if}
			</span>
			<button
				class="week-picker__btn"
				onclick={() => { if (selectedWeek < totalWeeks) selectedWeek++; }}
				disabled={selectedWeek >= totalWeeks}
				aria-label="Next week"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
		</div>

		<!-- Workout cards -->
		<div class="program-page__workouts">
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
								<h2 class="workout-card__name">{workout.name}</h2>
								{#if status === 'today'}
									<span class="workout-card__today-badge">Today</span>
								{/if}
							</div>
							{#if workout.focus}
								<p class="workout-card__focus">{workout.focus}</p>
							{/if}
						</div>
						<button
							class="workout-card__edit-btn"
							onclick={() => requestEdit(workout)}
							aria-label="Edit {workout.name}"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
							</svg>
							Edit
						</button>
					</div>

					{#if workout.exercises.length > 0}
						<div class="workout-card__chips" role="list" aria-label="Exercises in {workout.name}">
							{#each workout.exercises as we}
								{@const ex = programStore.exerciseMap.get(we.exerciseId)}
								{#if ex}
									<span class="workout-card__chip" role="listitem">{ex.name}</span>
								{/if}
							{/each}
						</div>
					{/if}
				</article>
			{/each}

			<!-- New workout -->
			<button class="program-page__new-btn" onclick={() => requestEdit(null)}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
				New workout
			</button>
		</div>
	{:else}
		<div class="program-page__empty">
			<p>No program active.</p>
			<button class="program-page__create-btn" onclick={() => (showCreateProgram = true)}>
				Create a program
			</button>
		</div>
	{/if}
</div>

<!-- Copy-before-edit confirmation -->
{#if showCopyConfirm !== undefined}
	<div class="copy-confirm-backdrop" role="presentation" onclick={() => (showCopyConfirm = undefined)}></div>
	<div class="copy-confirm" role="alertdialog" aria-labelledby="copy-confirm-title" aria-modal="true">
		<p class="copy-confirm__title" id="copy-confirm-title">Edit a copy?</p>
		<p class="copy-confirm__body">This is a built-in program. Editing will create a personal copy and switch to it.</p>
		<div class="copy-confirm__actions">
			<button class="copy-confirm__btn copy-confirm__btn--primary" onclick={handleCopyAndEdit}>
				Copy &amp; Edit
			</button>
			<button class="copy-confirm__btn copy-confirm__btn--ghost" onclick={() => (showCopyConfirm = undefined)}>
				Cancel
			</button>
		</div>
	</div>
{/if}

{#if editingWorkout !== undefined}
	<WorkoutEditor workout={editingWorkout} onBack={() => (editingWorkout = undefined)} />
{/if}

{#if showProgramSelect}
	<ProgramSelectSheet
		onClose={() => (showProgramSelect = false)}
		onCreateNew={() => { showProgramSelect = false; showCreateProgram = true; }}
	/>
{/if}

{#if showCreateProgram}
	<CreateProgramSheet onClose={() => (showCreateProgram = false)} />
{/if}

<style>
	.program-page {
		container-type: inline-size;
	}

	.program-page__header {
		margin-block-end: var(--space-5);
	}

	.program-page__header-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.program-page__header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-block-start: var(--space-1);
	}

	.built-in-badge {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-inline: var(--space-2);
		block-size: 22px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
		display: flex;
		align-items: center;
	}

	.program-page__switch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 38px;
		block-size: 38px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		transition: color var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 16px;
			block-size: 16px;
		}

		&:hover {
			color: var(--color-text-primary);
		}
	}

	.program-page__eyebrow {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-1);
	}

	.program-page__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	/* Progress */
	.program-page__progress {
		margin-block-end: var(--space-4);
	}

	.program-page__progress-labels {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-2);
	}

	.program-page__progress-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.program-page__progress-wk {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.program-page__progress-bar {
		block-size: 6px;
		background: var(--color-surface-3);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.program-page__progress-fill {
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
		margin-block-end: var(--space-4);
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
		transition: color var(--duration-fast) var(--ease-out);
		flex-shrink: 0;

		svg {
			inline-size: 16px;
			block-size: 16px;
		}

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
	.program-page__workouts {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	@container page (inline-size >= 560px) {
		.program-page__workouts {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
		}

		.program-page__new-btn {
			grid-column: 1 / -1;
		}
	}

	.workout-card {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-4);
		transition: border-color var(--duration-fast) var(--ease-out);
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

	.workout-card__today-badge {
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

		svg {
			inline-size: 13px;
			block-size: 13px;
		}

		&:hover {
			color: var(--color-text-primary);
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

	.program-page__new-btn {
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

		svg {
			inline-size: 18px;
			block-size: 18px;
		}

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}

	.program-page__empty {
		padding-block: var(--space-12);
		text-align: center;
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.program-page__create-btn {
		padding-inline: var(--space-5);
		block-size: 44px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	/* Copy confirm dialog */
	.copy-confirm-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 90;
	}

	.copy-confirm {
		position: fixed;
		inset-inline: var(--space-4);
		inset-block-start: 50%;
		transform: translateY(-50%);
		max-inline-size: 400px;
		margin-inline: auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--r-xl);
		padding: var(--space-5);
		z-index: 91;
		box-shadow: var(--shadow-lg);
	}

	.copy-confirm__title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.copy-confirm__body {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-5);
		line-height: 1.5;
	}

	.copy-confirm__actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.copy-confirm__btn {
		block-size: 48px;
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.copy-confirm__btn--primary {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.copy-confirm__btn--ghost {
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
	}
</style>
