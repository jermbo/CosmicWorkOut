<script lang="ts">
	import type { Item } from '$lib/db/types';
	import WeightRepsInputs from '../goals/WeightRepsInputs.svelte';
	import FieldLabel from '../FieldLabel.svelte';

	type Props = {
		hasGoal: boolean | null;
		focusCandidates: Item[];
		focusItem: Item | undefined;
		startFromHistory: boolean;
		startWeight: number | null;
		startReps: number | null;
		goalWeight: number | null;
		goalReps: number | null;
		unit: string;
		focusIncrement: number;
		onSetHasGoal: (value: boolean) => void;
		onSetFocus: (item: Item) => void;
	};

	let {
		hasGoal,
		focusCandidates,
		focusItem,
		startFromHistory,
		startWeight = $bindable(null),
		startReps = $bindable(null),
		goalWeight = $bindable(null),
		goalReps = $bindable(null),
		unit,
		focusIncrement,
		onSetHasGoal,
		onSetFocus,
	}: Props = $props();
</script>

<p class="lead">
	Working toward a specific lift? The app will lay out a weekly wave that builds to it.
</p>

<div
	class="choice-row"
	role="radiogroup"
	aria-label="Working toward a specific lift?"
>
	<button
		type="button"
		class="choice-btn"
		class:choice-btn--selected={hasGoal === false}
		onclick={() => onSetHasGoal(false)}
	>
		No
	</button>
	<button
		type="button"
		class="choice-btn"
		class:choice-btn--selected={hasGoal === true}
		onclick={() => onSetHasGoal(true)}
	>
		Yes
	</button>
</div>

{#if hasGoal === true}
	<div class="form-field">
		<FieldLabel id="focus-label">Focus lift</FieldLabel>
		{#if focusItem}
			<div class="focus-selected">
				<span class="focus-selected__name">{focusItem.name}</span>
				<span class="focus-selected__meta"
					>{focusItem.cat} · +{focusItem.weightIncrement ?? 5}
					{focusItem.unit}</span
				>
			</div>
		{:else if focusCandidates.length > 0}
			<div
				class="focus-list"
				role="radiogroup"
				aria-labelledby="focus-label"
			>
				{#each focusCandidates as item (item.id)}
					<button
						type="button"
						class="focus-option"
						onclick={() => onSetFocus(item)}
					>
						<span class="focus-option__name">{item.name}</span>
						<span class="focus-option__meta">{item.cat}</span>
					</button>
				{/each}
			</div>
		{:else}
			<p class="hint">
				None of your exercises use a weight yet — add a barbell or dumbbell lift on the Routines
				step first.
			</p>
		{/if}
	</div>

	{#if focusItem}
		<WeightRepsInputs
			label="Starting point — weight × reps"
			bind:weight={startWeight}
			bind:reps={startReps}
			{unit}
			weightStep={focusIncrement}
			weightPlaceholder="150"
			repsPlaceholder="10"
			weightAriaLabel="Starting weight"
			repsAriaLabel="Starting reps"
			hint={startFromHistory ? `From your last logged set of ${focusItem.name}.` : undefined}
		/>
		<WeightRepsInputs
			label="Goal — weight × reps"
			bind:weight={goalWeight}
			bind:reps={goalReps}
			{unit}
			weightStep={focusIncrement}
			weightPlaceholder="250"
			repsPlaceholder="5"
			weightAriaLabel="Goal weight"
			repsAriaLabel="Goal reps"
		/>
	{/if}
{/if}

<style>
	.lead {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-4);
	}

	.choice-row {
		display: flex;
		gap: var(--space-3);
		margin-block-end: var(--space-5);
	}

	.choice-btn {
		flex: 1;
		block-size: 52px;
		border-radius: var(--radius-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text-secondary);
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.choice-btn--selected {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-2));
		color: var(--color-text-primary);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-block-end: var(--space-5);
	}

	.hint {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.focus-selected {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-3) var(--space-4);
		background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface-2));
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-lg);
	}

	.focus-selected__name {
		font-size: 1rem;
		font-weight: 700;
	}

	.focus-selected__meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.focus-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.focus-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-border-strong);
		}
	}

	.focus-option__name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.focus-option__meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
</style>
