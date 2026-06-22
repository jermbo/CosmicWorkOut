<script lang="ts">
	import { untrack, onDestroy } from 'svelte';
	import type { ActiveItem, Item } from '$lib/db/types';
	import ProgressRing from './ProgressRing.svelte';
	import SetTile from './SetTile.svelte';

	type Props = {
		activeExercise: ActiveItem;
		exercise: Item;
		exerciseIndex: number;
		onSetTap: (exerciseIndex: number, setIndex: number) => void;
	};

	let { activeExercise, exercise, exerciseIndex, onSetTap }: Props = $props();

	let doneSets = $derived(activeExercise.sets.filter((s) => s.completed).length);
	let totalSets = $derived(activeExercise.sets.length);
	let allSetsCompleted = $derived(doneSets === totalSets && totalSets > 0);
	let justCompleted = $state(false);
	let wasCompleted = $state(untrack(() => allSetsCompleted));
	let completionTimer: ReturnType<typeof setTimeout> | null = null;

	onDestroy(() => {
		if (completionTimer !== null) clearTimeout(completionTimer);
	});

	$effect(() => {
		if (allSetsCompleted && !wasCompleted) {
			wasCompleted = true;
			justCompleted = true;

			try {
				navigator.vibrate([12, 40, 18]);
			} catch {
				justCompleted = true;
			}

			completionTimer = setTimeout(() => {
				justCompleted = false;
			}, 700);
		}
	});
</script>

<article
	class="exercise-card"
	class:exercise-card--completed={allSetsCompleted}
	class:exercise-card--just-completed={justCompleted}
	aria-label={exercise.name}
>
	<header class="exercise-card__header">
		<div class="exercise-card__ring-wrap" aria-hidden="true">
			<ProgressRing done={doneSets} total={totalSets} complete={allSetsCompleted} />
			{#if allSetsCompleted}
				<span class="exercise-card__ring-check">✓</span>
			{:else}
				<span class="exercise-card__ring-fraction">{doneSets}/{totalSets}</span>
			{/if}
		</div>
		<div class="exercise-card__meta">
			<div class="exercise-card__title-row">
				<h3 class="exercise-card__name">{exercise.name}</h3>
				{#if allSetsCompleted}
					<span class="exercise-card__done-badge" aria-label="All sets complete">
						<svg
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="3 8 6.5 11.5 13 4.5" />
						</svg>
					</span>
				{/if}
			</div>
			{#if exercise.cue}
				<p class="exercise-card__cue">{exercise.cue}</p>
			{/if}
		</div>
		<div class="exercise-card__target" aria-label="Target: {totalSets} sets">
			<span class="exercise-card__target-value">
				{activeExercise.sets[0]?.targetReps ?? '—'}
			</span>
			<span class="exercise-card__target-label">target</span>
		</div>
	</header>

	<div class="exercise-card__sets" role="group" aria-label={`Sets for ${exercise.name}`}>
		{#each activeExercise.sets as set, setIndex}
			<SetTile {set} onTap={() => onSetTap(exerciseIndex, setIndex)} />
		{/each}
	</div>
</article>

<style>
	@keyframes ripple-out {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 40%, transparent);
		}
		100% {
			box-shadow: 0 0 0 12px color-mix(in srgb, var(--color-accent) 0%, transparent);
		}
	}

	@keyframes check-pop {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		60% {
			transform: scale(1.2);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.exercise-card {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-4) var(--space-4);
		transition:
			border-color var(--duration-normal) var(--ease-out),
			background-color var(--duration-normal) var(--ease-out);
	}

	.exercise-card--completed {
		border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
		background: color-mix(in srgb, var(--color-accent) 7%, var(--color-surface-2));
	}

	.exercise-card--just-completed {
		animation: ripple-out 600ms var(--ease-out) forwards;
	}

	.exercise-card__header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		margin-block-end: var(--space-3);
	}

	.exercise-card__ring-wrap {
		position: relative;
		flex-shrink: 0;
	}

	.exercise-card__ring-fraction,
	.exercise-card__ring-check {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	.exercise-card__ring-check {
		font-size: 0.75rem;
		color: var(--color-accent);
	}

	.exercise-card__meta {
		flex: 1;
		min-inline-size: 0;
	}

	.exercise-card__title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.exercise-card__name {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.exercise-card__done-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 22px;
		block-size: 22px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		flex-shrink: 0;
		animation: check-pop var(--duration-slow) var(--ease-spring) forwards;

		svg {
			inline-size: 11px;
			block-size: 11px;
		}
	}

	.exercise-card__cue {
		margin-block-start: 2px;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.exercise-card__target {
		flex-shrink: 0;
		text-align: end;
	}

	.exercise-card__target-value {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.exercise-card__target-label {
		display: block;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.exercise-card__sets {
		display: flex;
		flex-wrap: wrap;
		gap: var(--card-gap);
	}
</style>
