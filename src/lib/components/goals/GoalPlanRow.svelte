<script lang="ts">
	import type { GoalPlan } from '$lib/goalPlans/types';

	type Props = {
		plan: GoalPlan;
		metaLines: string[];
		done?: boolean;
		onResume?: () => void;
		onComplete?: () => void;
	};

	let { plan, metaLines, done = false, onResume, onComplete }: Props = $props();
</script>

<div class="plan-row" class:plan-row--done={done}>
	<div class="plan-row__info">
		<span class="plan-row__name">{plan.name}</span>
		{#each metaLines as line, i (`${i}:${line}`)}
			<span class="plan-row__meta">{line}</span>
		{/each}
	</div>
	{#if onResume || onComplete}
		<div class="plan-row__actions">
			{#if onResume}
				<button class="plan-row__btn plan-row__btn--primary" type="button" onclick={onResume}>Resume</button>
			{/if}
			{#if onComplete}
				<button class="plan-row__btn" type="button" onclick={onComplete}>Complete</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.plan-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		margin-block-end: var(--space-2);
	}

	.plan-row--done {
		opacity: 0.85;
	}

	.plan-row__info {
		flex: 1;
		min-inline-size: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.plan-row__name {
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.plan-row__meta {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.plan-row__actions {
		display: flex;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.plan-row__btn {
		padding-inline: var(--space-3);
		block-size: 34px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.plan-row__btn--primary {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
	}
</style>
