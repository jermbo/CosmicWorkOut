<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GoalPlan } from '$lib/goalPlans/types';
	import type { Program } from '$lib/db/types';
	import { targetLabel, unitLabel } from '$lib/goalPlans/format';
	import { programStore } from '$lib/stores/program.svelte';

	type Props = {
		program: Program;
		goal: GoalPlan | null;
		onActivate: () => void;
	};

	let { program, goal, onActivate }: Props = $props();

	let metaLine = $derived.by(() => {
		if (goal) {
			const unit = unitLabel(programStore.getItemById(goal.focusItemId)?.unit);
			if (goal.status === 'completed') {
				return `${targetLabel(goal.start, unit)} → ${targetLabel(goal.goal, unit)} · completed`;
			}
			return `Goal ${targetLabel(goal.goal, unit)} · paused`;
		}
		return `${program.durationWeeks} wk · ${program.daysPerWeek}×/wk`;
	});

	let done = $derived(goal?.status === 'completed');
</script>

<div
	class="plan-row"
	class:plan-row--done={done}
>
	<a
		class="plan-row__info"
		href={resolve(`/workout/plan/${program.id}`)}
	>
		<span class="plan-row__name">{program.name}</span>
		<span class="plan-row__meta">{metaLine}</span>
	</a>
	{#if !done}
		<button
			class="plan-row__btn"
			type="button"
			onclick={onActivate}
		>
			Activate
		</button>
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
		text-decoration: none;
		color: inherit;
	}

	.plan-row__name {
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.plan-row__meta {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.plan-row__btn {
		flex-shrink: 0;
		padding-inline: var(--space-3);
		block-size: 34px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		border: 1px solid var(--color-accent);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent-ink);
	}
</style>
