<script lang="ts">
	import type { Workout } from '$lib/db/types';

	type Props = {
		workouts: Workout[];
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

<div class="workout-picker" role="radiogroup" aria-label="Select workout">
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
		gap: var(--space-2);
		margin-block-end: var(--space-3);
		inline-size: 100%;
	}

	.workout-picker__option {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 2px;
		min-inline-size: 0;
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.workout-picker__option--selected {
		border-color: var(--option-accent);
		background: color-mix(in srgb, var(--option-accent) 10%, var(--color-surface-2));
	}

	.workout-picker__letter {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--option-accent);
	}

	.workout-picker__name {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-inline-size: 100%;
	}

	.workout-picker__suggested {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}
</style>
