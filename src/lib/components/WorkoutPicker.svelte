<script lang="ts">
	import type { Routine } from '$lib/db/types';

	type Props = {
		workouts: Routine[];
		selectedId: string;
		suggestedId: string | undefined;
		onSelect: (workoutId: string) => void;
	};

	let { workouts, selectedId, suggestedId, onSelect }: Props = $props();

	const ACCENT_MAP: Record<string, string> = {
		lime: 'var(--color-lime)',
		lavender: 'var(--color-lavender)',
		red: 'var(--color-red)',
	};
</script>

<div
	class="workout-picker"
	role="radiogroup"
	aria-label="Select workout"
>
	{#each workouts as workout (workout.id)}
		{@const isSelected = workout.id === selectedId}
		{@const isSuggested = workout.id === suggestedId && workout.id !== selectedId}
		<button
			type="button"
			class="workout-picker__option"
			class:workout-picker__option--selected={isSelected}
			role="radio"
			aria-checked={isSelected}
			style:--option-accent={ACCENT_MAP[workout.color ?? 'lime'] ?? 'var(--color-accent)'}
			onclick={() => onSelect(workout.id)}
		>
			<span class="workout-picker__letter">{workout.letter ?? '?'}</span>
			<span class="workout-picker__name">{workout.name}</span>
			{#if isSuggested}
				<span class="workout-picker__suggested">Suggested</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.workout-picker {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 6px;
		margin-block-end: var(--space-4);
		inline-size: 100%;
	}

	/* Ink cells; the selected routine is filled with its own color, ink on top. */
	.workout-picker__option {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: start;
		gap: 4px;
		min-inline-size: 0;
		padding: var(--space-2);
		background: var(--color-ink);
		border: var(--rule) solid var(--color-border);
		color: var(--color-text-primary);
	}

	.workout-picker__option--selected {
		background: var(--option-accent);
		border-color: var(--color-ink);
		color: var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
	}

	.workout-picker__letter {
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1.5rem;
		font-weight: 900;
		line-height: 1;
		color: var(--option-accent);

		.workout-picker__option--selected & {
			color: inherit;
		}
	}

	.workout-picker__name {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-inline-size: 100%;
	}

	.workout-picker__suggested {
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding-inline: 3px;
		background: var(--color-paper);
		color: var(--color-ink);
	}
</style>
