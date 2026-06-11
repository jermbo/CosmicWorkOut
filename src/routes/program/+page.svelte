<script lang="ts">
	import type { Workout } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import WorkoutEditor from '$lib/components/WorkoutEditor.svelte';

	let editingWorkout = $state<Workout | null | undefined>(undefined);
	// undefined = closed, null = new workout, Workout = editing existing

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

	function getWorkoutStatus(workout: Workout): 'today' | 'done' | 'scheduled' {
		const todaysId = programStore.todaysWorkout?.id;
		if (workout.id === todaysId) {
			return 'today';
		}

		const allIds = programStore.allWorkouts.map((w) => w.id);
		const todayIdx = allIds.indexOf(todaysId ?? '');
		const thisIdx = allIds.indexOf(workout.id);

		if (thisIdx < todayIdx) {
			return 'done';
		}
		return 'scheduled';
	}
</script>

<svelte:head>
	<title>Program — CosmicWorkOut</title>
</svelte:head>

<div class="program-page">
	{#if programStore.activeProgram}
		<header class="program-page__header">
			<p class="program-page__eyebrow">Program</p>
			<h1 class="program-page__title">
				{programStore.activeProgram.name}
			</h1>
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

		<!-- Workout cards (canonical workouts from week 1) -->
		<div class="program-page__workouts">
			{#each programStore.uniqueWorkouts as workout (workout.id)}
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
							onclick={() => (editingWorkout = workout)}
							aria-label="Edit {workout.name}"
						>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								aria-hidden="true"
							>
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
			<button class="program-page__new-btn" onclick={() => (editingWorkout = null)}>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
				New workout
			</button>
		</div>
	{:else}
		<div class="program-page__empty">
			<p>No program active. Please restart the app to initialize.</p>
		</div>
	{/if}
</div>

{#if editingWorkout !== undefined}
	<WorkoutEditor
		workout={editingWorkout}
		onBack={() => (editingWorkout = undefined)}
	/>
{/if}

<style>
	.program-page {
		padding-inline: var(--space-4);
		padding-block-start: calc(var(--safe-top) + var(--space-6));
		padding-block-end: var(--space-8);
	}

	.program-page__header {
		margin-block-end: var(--space-5);
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
		margin-block-end: var(--space-6);
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

	/* Workout cards */
	.program-page__workouts {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
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

	/* Exercise chips */
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

	/* New workout button */
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
	}
</style>
