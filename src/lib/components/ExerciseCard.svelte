<script lang="ts">
	import { untrack, onDestroy } from 'svelte';
	import type { ActiveItem, Item } from '$lib/db/types';
	import SetTile from './SetTile.svelte';
	import { feedback } from '$lib/feedback';

	type Props = {
		activeExercise: ActiveItem;
		exercise: Item;
		exerciseIndex: number;
		/** The exercise being worked now — drawn as the Training field. */
		current?: boolean;
		onSetTap: (exerciseIndex: number, setIndex: number) => void;
	};

	let { activeExercise, exercise, exerciseIndex, current = false, onSetTap }: Props = $props();

	let doneSets = $derived(activeExercise.sets.filter((s) => s.completed).length);
	let totalSets = $derived(activeExercise.sets.length);
	let allSetsCompleted = $derived(doneSets === totalSets && totalSets > 0);
	let nextSetIndex = $derived(activeExercise.sets.findIndex((s) => !s.completed));
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
			feedback('win');

			completionTimer = setTimeout(() => {
				justCompleted = false;
			}, 900);
		}
	});
</script>

<article
	data-exercise={exerciseIndex}
	class="exercise-card"
	class:exercise-card--current={current}
	class:exercise-card--completed={allSetsCompleted}
	aria-label={exercise.name}
>
	<header class="exercise-card__header">
		<div
			class="exercise-card__count"
			aria-hidden="true"
		>
			<span class="exercise-card__code">T{exerciseIndex + 1}</span>
			{#if allSetsCompleted}✓{:else}{doneSets}/{totalSets}{/if}
		</div>
		<div class="exercise-card__meta">
			<div class="exercise-card__title-row">
				<h3 class="exercise-card__name">{exercise.name}</h3>
				{#if allSetsCompleted}
					<span
						class="exercise-card__done-badge"
						aria-label="All sets complete"
					>
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
		<div
			class="exercise-card__target"
			aria-label="Target: {totalSets} sets"
		>
			<span class="exercise-card__target-value">
				{activeExercise.sets[0]?.targetReps ?? '—'}
			</span>
			<span class="exercise-card__target-label">target</span>
		</div>
	</header>

	{#if justCompleted}
		<span
			class="exercise-card__stamp"
			aria-hidden="true">Done</span
		>
	{/if}

	<div
		class="exercise-card__sets"
		role="group"
		aria-label={`Sets for ${exercise.name}`}
	>
		{#each activeExercise.sets as set, setIndex (setIndex)}
			<SetTile
				{set}
				next={current && setIndex === nextSetIndex}
				onTap={() => onSetTap(exerciseIndex, setIndex)}
			/>
		{/each}
	</div>
</article>

<style>
	/*
	 * Cards are transparent frames over the grid. The live one gets its blue,
	 * ink border and shadow from the plate behind it (SessionOverlay), which
	 * slides from card to card — so it never paints its own field.
	 */
	.exercise-card {
		position: relative;
		z-index: 1;
		background: transparent;
		border: var(--rule) solid var(--color-border);
		padding: var(--space-3);
	}

	.exercise-card--completed {
		border-color: var(--color-paper);
	}

	/* Text tokens re-pointed at ink so the SetTiles inside read on the plate. */
	.exercise-card--current {
		--field: var(--field-train);
		--color-text-primary: var(--color-ink);
		--color-text-secondary: var(--color-ink);
		--color-text-muted: color-mix(in srgb, var(--color-ink) 62%, var(--field));
		color: var(--color-ink);
		border-color: transparent;
	}

	/* A rubber-stamp DONE that slams down over the finished card. */
	.exercise-card__stamp {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-start: 50%;
		padding: var(--space-1) var(--space-4);
		border: var(--rule) solid var(--color-paper);
		background: var(--color-ink);
		color: var(--color-paper);
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		text-transform: uppercase;
		pointer-events: none;
		transform: translate(-50%, -50%) rotate(-6deg);
		animation: stamp 900ms cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards;
	}

	@keyframes stamp {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(-6deg) scale(2.2);
		}
		25% {
			opacity: 1;
			transform: translate(-50%, -50%) rotate(-6deg) scale(0.92);
		}
		35%,
		75% {
			opacity: 1;
			transform: translate(-50%, -50%) rotate(-6deg) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(-6deg) scale(1);
		}
	}

	.exercise-card__header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		margin-block-end: var(--space-3);
	}

	.exercise-card__count {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		inline-size: 44px;
		block-size: 44px;
		border: var(--rule) solid currentColor;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 900;
		line-height: 1;
		color: var(--color-text-primary);

		.exercise-card--completed & {
			background: var(--color-paper);
			border-color: var(--color-paper);
			color: var(--color-ink);
		}
	}

	.exercise-card__code {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		font-weight: 700;
		margin-block-end: 2px;
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
		text-transform: uppercase;
		font-size: 1.0625rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1;
		overflow-wrap: anywhere;
	}

	.exercise-card__done-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 22px;
		block-size: 22px;
		background: var(--color-paper);
		color: var(--color-ink);
		flex-shrink: 0;

		svg {
			inline-size: 11px;
			block-size: 11px;
		}
	}

	.exercise-card__cue {
		margin-block-start: var(--space-1);
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.exercise-card__target {
		flex-shrink: 0;
		text-align: end;
	}

	.exercise-card__target-value {
		display: block;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 900;
		color: var(--color-text-primary);
	}

	.exercise-card__target-label {
		display: block;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.exercise-card__sets {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
</style>
