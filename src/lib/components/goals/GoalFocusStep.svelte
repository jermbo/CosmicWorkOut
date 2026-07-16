<script lang="ts">
	import type { Item } from '$lib/db/types';
	import WeightRepsInputs from './WeightRepsInputs.svelte';

	type Props = {
		focusItem: Item | undefined;
		quickPicks: Item[];
		goalWeight: number | null;
		goalReps: number | null;
		unit: string;
		focusIncrement: number;
		onSetFocus: (item: Item) => void;
		onBrowse: () => void;
	};

	let {
		focusItem,
		quickPicks,
		goalWeight = $bindable(null),
		goalReps = $bindable(null),
		unit,
		focusIncrement,
		onSetFocus,
		onBrowse,
	}: Props = $props();
</script>

<p class="lead">
	Pick the <strong>one lift</strong> this plan is for — e.g. bench press — then set the weight × reps you're chasing.
	Everything else in the week supports that lift.
</p>

<div class="form-field">
	<span class="form-field__label" id="focus-label">Focus lift</span>
	{#if focusItem}
		<div class="focus-selected">
			<div class="focus-selected__info">
				<span class="focus-selected__name">{focusItem.name}</span>
				<span class="focus-selected__meta"
					>{focusItem.cat} · +{focusItem.weightIncrement ?? 5} {focusItem.unit}</span
				>
			</div>
			<button type="button" class="focus-selected__change" onclick={onBrowse}>Change</button>
		</div>
	{:else}
		<div class="focus-list" role="radiogroup" aria-labelledby="focus-label">
			{#each quickPicks as item (item.id)}
				<button type="button" class="focus-option" onclick={() => onSetFocus(item)}>
					<span class="focus-option__name">{item.name}</span>
					<span class="focus-option__meta">{item.cat}</span>
				</button>
			{/each}
		</div>
		<button type="button" class="focus-browse" onclick={onBrowse}>Browse full library…</button>
	{/if}
</div>

{#if focusItem}
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

<style>
	.lead {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-4);

		strong {
			color: var(--color-text-primary);
			font-weight: 700;
		}
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-block-end: var(--space-5);
	}

	.form-field__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.focus-selected {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface-2));
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-lg);
	}

	.focus-selected__info {
		flex: 1;
		min-inline-size: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.focus-selected__name {
		font-size: 1rem;
		font-weight: 700;
	}

	.focus-selected__meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.focus-selected__change {
		flex-shrink: 0;
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.focus-browse {
		margin-block-start: var(--space-3);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-accent);
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
