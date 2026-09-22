<script lang="ts">
	import type { Item } from '$lib/db/types';
	import type { ProgressionBlock } from '$lib/goalPlans/types';

	type Props = {
		name: string;
		hasGoal: boolean;
		focusItem: Item | undefined;
		startWeight: number | null;
		startReps: number | null;
		goalWeight: number | null;
		goalReps: number | null;
		unit: string;
		previewBlocks: ProgressionBlock[];
		previewWeeks: number;
		previewMonths: number;
		durationWeeks: number;
		daysPerWeek: number;
		routineCount: number;
	};

	let {
		name,
		hasGoal,
		focusItem,
		startWeight,
		startReps,
		goalWeight,
		goalReps,
		unit,
		previewBlocks,
		previewWeeks,
		previewMonths,
		durationWeeks,
		daysPerWeek,
		routineCount,
	}: Props = $props();
</script>

<section class="preview-summary">
	<p class="preview-summary__name">{name}</p>
	{#if hasGoal && focusItem}
		<p class="preview-summary__line">
			<strong>{focusItem.name}</strong> — {startWeight} × {startReps} → goal {goalWeight}
			× {goalReps}
			{unit === 'kg' ? '(kg)' : '(lb)'}
		</p>
		<p class="preview-summary__line">
			{previewBlocks.length} blocks · ~{previewWeeks} weeks · about {previewMonths}
			{previewMonths === 1 ? 'month' : 'months'} at {daysPerWeek}×/week
		</p>
		<p class="preview-summary__note">
			Only {focusItem.name} rides the wave. Other exercises bump weekly by their weight increment.
		</p>
	{:else}
		<p class="preview-summary__line">
			{durationWeeks} weeks · {routineCount} routines · {daysPerWeek}×/week
		</p>
		<p class="preview-summary__note">
			No goal — you progress by beating what you logged last time.
		</p>
	{/if}
</section>

{#if hasGoal}
	<div class="preview-blocks">
		{#each previewBlocks as block (block.blockNumber)}
			<section class="preview-block">
				<h3 class="preview-block__title">
					Block {String(block.blockNumber).padStart(2, '0')}
				</h3>
				<div class="preview-block__weeks">
					{#each block.weeks as wk (wk.planWeek)}
						<div
							class="preview-week"
							class:preview-week--peak={wk.phase === 'peak'}
							class:preview-week--deload={wk.phase === 'deload'}
						>
							<span class="preview-week__label">Wk {wk.planWeek}</span>
							<span class="preview-week__target">{wk.weight}×{wk.reps}</span>
							<span class="preview-week__phase">{wk.phase}</span>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
{/if}

<style>
	.preview-summary {
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
		border-radius: var(--r-xl);
		margin-block-end: var(--space-5);
	}

	.preview-summary__name {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.preview-summary__line {
		font-size: 0.9375rem;
		line-height: 1.55;
	}

	.preview-summary__note {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-2);
		line-height: 1.5;
	}

	.preview-blocks {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-block-end: var(--space-5);
	}

	.preview-block__title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.preview-block__weeks {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.preview-week {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding-block: var(--space-2);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.preview-week--peak {
		border-color: color-mix(in srgb, var(--color-accent) 45%, transparent);
	}

	.preview-week--deload {
		opacity: 0.7;
	}

	.preview-week__label {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.preview-week__target {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.preview-week__phase {
		font-size: 0.625rem;
		color: var(--color-text-muted);
	}
</style>
