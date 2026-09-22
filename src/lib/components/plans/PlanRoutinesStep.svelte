<script lang="ts">
	import type { GoalTemplateRoutine } from '$lib/goalPlans/types';
	import { programStore } from '$lib/stores/program.svelte';

	type Props = {
		routines: GoalTemplateRoutine[];
		routinesValid: boolean;
		onRemoveSlot: (letter: 'A' | 'B' | 'C', itemId: string) => void;
		onAddToLetter: (letter: 'A' | 'B' | 'C') => void;
	};

	let { routines, routinesValid, onRemoveSlot, onAddToLetter }: Props = $props();
</script>

<p class="lead">Add exercises to each day. Every day needs at least one.</p>
{#each routines as routine (routine.letter)}
	<section class="routine-group">
		<h2 class="routine-group__title">
			<span class="routine-group__letter">{routine.letter}</span>
			{routine.name}
		</h2>
		<ul
			class="routine-group__list"
			role="list"
		>
			{#each routine.slots as slot (slot.itemId)}
				{@const item = programStore.getItemById(slot.itemId)}
				<li class="slot-row">
					<div class="slot-row__info">
						<span class="slot-row__name">{item?.name ?? slot.itemId}</span>
						<span class="slot-row__meta">{slot.sets}×{slot.reps}</span>
					</div>
					<button
						type="button"
						class="slot-row__toggle"
						onclick={() => onRemoveSlot(routine.letter, slot.itemId)}
					>
						Remove
					</button>
				</li>
			{:else}
				<li class="slot-row slot-row--empty">No exercises yet</li>
			{/each}
		</ul>
		<button
			type="button"
			class="routine-group__add"
			onclick={() => onAddToLetter(routine.letter)}
		>
			Add exercise
		</button>
	</section>
{/each}
{#if !routinesValid}
	<p class="error">Each day needs at least one exercise.</p>
{/if}

<style>
	.lead {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-4);
	}

	.error {
		font-size: 0.8125rem;
		color: var(--color-red);
		margin-block-start: var(--space-2);
	}

	.routine-group {
		margin-block-end: var(--space-5);
	}

	.routine-group__title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.routine-group__letter {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 26px;
		block-size: 26px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent-text);
		font-size: 0.8125rem;
	}

	.routine-group__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.routine-group__add {
		margin-block-start: var(--space-2);
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		border: 2px dashed var(--color-border-strong);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent-text);
		}
	}

	.slot-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.slot-row--empty {
		justify-content: center;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		border-style: dashed;
	}

	.slot-row__info {
		flex: 1;
		min-inline-size: 0;
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}

	.slot-row__name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.slot-row__meta {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.slot-row__toggle {
		flex-shrink: 0;
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			color: var(--color-red);
			border-color: color-mix(in srgb, var(--color-red) 40%, var(--color-border));
		}
	}
</style>
