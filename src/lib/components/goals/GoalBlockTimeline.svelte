<script lang="ts">
	import type { GoalPlan } from '$lib/goalPlans/types';
	import { WEEKS_PER_BLOCK } from '$lib/goalPlans/generator';

	type Props = {
		plan: GoalPlan;
		currentWeek: number;
		currentBlockNumber: number | null;
		finished: boolean;
	};

	let { plan, currentWeek, currentBlockNumber, finished }: Props = $props();
</script>

<div
	class="timeline"
	role="img"
	aria-label="Block timeline, week {currentWeek} of {plan.blocks.length * WEEKS_PER_BLOCK}"
>
	{#each plan.blocks as b (b.blockNumber)}
		<div
			class="timeline-block"
			class:timeline-block--current={b.blockNumber === currentBlockNumber && !finished}
		>
			<div class="timeline-block__weeks">
				{#each b.weeks as wk (wk.planWeek)}
					<span
						class="timeline-week"
						class:timeline-week--done={wk.planWeek < currentWeek || finished}
						class:timeline-week--current={wk.planWeek === currentWeek && !finished}
						class:timeline-week--deload={wk.phase === 'deload'}
						title="Wk {wk.planWeek}: {wk.weight}×{wk.reps}"
					></span>
				{/each}
			</div>
			<span class="timeline-block__label">
				B{b.blockNumber}
				{#if plan.repeatEvents.some((r) => r.blockNumber === b.blockNumber)}
					<span
						class="timeline-block__repeat"
						title="Block repeated">↻</span
					>
				{/if}
			</span>
		</div>
	{/each}
</div>

<style>
	.timeline {
		display: flex;
		gap: var(--space-2);
		margin-block-start: var(--space-4);
		overflow-x: auto;
		padding-block-end: var(--space-1);
	}

	.timeline-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		flex: 1;
		min-inline-size: 56px;
	}

	.timeline-block__weeks {
		display: flex;
		gap: 3px;
		inline-size: 100%;
	}

	.timeline-week {
		flex: 1;
		block-size: 18px;
		border-radius: 4px;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
	}

	.timeline-week--deload {
		block-size: 12px;
		align-self: flex-end;
	}

	.timeline-week--done {
		background: color-mix(in srgb, var(--color-accent) 45%, var(--color-surface-3));
		border-color: transparent;
	}

	.timeline-week--current {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.timeline-block--current .timeline-block__label {
		color: var(--color-text-primary);
	}

	.timeline-block__label {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--color-text-muted);
	}

	.timeline-block__repeat {
		color: var(--color-accent-text);
	}
</style>
