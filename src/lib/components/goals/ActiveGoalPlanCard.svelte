<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GoalPlan, WaveWeek, ProgressionBlock } from '$lib/goalPlans/types';
	import { WEEKS_PER_BLOCK } from '$lib/goalPlans/generator';
	import { targetLabel } from '$lib/goalPlans/format';
	import GoalBlockTimeline from './GoalBlockTimeline.svelte';

	type Props = {
		plan: GoalPlan;
		focusName: string;
		unit: string;
		week: number;
		block: ProgressionBlock | null;
		blockWeek: number;
		focus: WaveWeek | null;
		finished: boolean;
		completedCount: number;
		renaming: boolean;
		renameValue: string;
		onStartRename: () => void;
		onSaveRename: () => void;
		onCancelRename: () => void;
		onRepeat: () => void;
		onPause: () => void;
		onComplete: () => void;
	};

	let {
		plan,
		focusName,
		unit,
		week,
		block,
		blockWeek,
		focus,
		finished,
		completedCount,
		renaming,
		renameValue = $bindable(''),
		onStartRename,
		onSaveRename,
		onCancelRename,
		onRepeat,
		onPause,
		onComplete,
	}: Props = $props();
</script>

<section
	class="plan-card"
	aria-label="Active goal plan"
>
	<header class="plan-card__header">
		{#if renaming}
			<form
				class="plan-card__rename"
				onsubmit={(e) => {
					e.preventDefault();
					onSaveRename();
				}}
			>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					class="plan-card__rename-input"
					type="text"
					bind:value={renameValue}
					autofocus
					aria-label="Plan name"
				/>
				<button
					type="submit"
					class="plan-card__rename-save"
					disabled={!renameValue.trim()}>Save</button
				>
				<button
					type="button"
					class="plan-card__rename-cancel"
					onclick={onCancelRename}>Cancel</button
				>
			</form>
		{:else}
			<div class="plan-card__title-row">
				<h2 class="plan-card__name">{plan.name}</h2>
				<button
					class="plan-card__rename-btn"
					type="button"
					onclick={onStartRename}>Rename</button
				>
			</div>
		{/if}
		<p class="plan-card__goal">
			{focusName} · {targetLabel(plan.start, unit)} →
			<strong>{targetLabel(plan.goal, unit)}</strong>
		</p>
	</header>

	{#if finished}
		<div class="plan-card__finished">
			<p>
				Every block is trained through — you're at the end of the wave. Mark the plan complete, or
				repeat the final block for another push.
			</p>
		</div>
	{:else if focus && block}
		<div class="plan-card__now">
			<div class="plan-card__now-cell">
				<span class="plan-card__now-value"
					>{String(block.blockNumber).padStart(2, '0')}/{String(plan.blocks.length).padStart(
						2,
						'0',
					)}</span
				>
				<span class="plan-card__now-label">block</span>
			</div>
			<div class="plan-card__now-cell">
				<span class="plan-card__now-value">{blockWeek}/{WEEKS_PER_BLOCK}</span>
				<span class="plan-card__now-label">week · {focus.phase}</span>
			</div>
			<div class="plan-card__now-cell plan-card__now-cell--target">
				<span class="plan-card__now-value">{focus.weight}×{focus.reps}</span>
				<span class="plan-card__now-label">{focusName}</span>
			</div>
		</div>
	{/if}

	<GoalBlockTimeline
		{plan}
		currentWeek={week}
		currentBlockNumber={block?.blockNumber ?? null}
		{finished}
	/>

	<p class="plan-card__meta">
		{completedCount} sessions logged · {plan.daysPerWeek}×/week
		{#if plan.repeatEvents.length > 0}
			· {plan.repeatEvents.length} block {plan.repeatEvents.length === 1 ? 'repeat' : 'repeats'}
		{/if}
	</p>

	<div class="plan-card__actions">
		<a
			class="plan-card__cta"
			href={resolve(`/workout?program=${plan.programId}`)}>Go to workout</a
		>
		<button
			class="plan-card__action"
			type="button"
			onclick={onRepeat}>Repeat block</button
		>
		<button
			class="plan-card__action"
			type="button"
			onclick={onPause}>Pause</button
		>
		<button
			class="plan-card__action plan-card__action--complete"
			type="button"
			onclick={onComplete}
		>
			Complete
		</button>
	</div>
</section>

<style>
	.plan-card {
		background: var(--color-surface-2);
		border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
		border-radius: var(--r-2xl);
		padding: var(--space-5);
		margin-block-end: var(--space-6);
	}

	.plan-card__title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.plan-card__name {
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.plan-card__rename-btn {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
		flex-shrink: 0;

		&:hover {
			color: var(--color-accent);
		}
	}

	.plan-card__rename {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.plan-card__rename-input {
		flex: 1;
		block-size: 40px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		color: var(--color-text-primary);
		outline: none;

		&:focus {
			border-color: var(--color-accent);
		}
	}

	.plan-card__rename-save {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-accent);

		&:disabled {
			opacity: 0.5;
		}
	}

	.plan-card__rename-cancel {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.plan-card__goal {
		margin-block-start: var(--space-1);
		font-size: 0.875rem;
		color: var(--color-text-secondary);

		strong {
			color: var(--color-text-primary);
		}
	}

	.plan-card__finished {
		margin-block-start: var(--space-4);
		padding: var(--space-4);
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		border-radius: var(--radius-lg);
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-primary);
	}

	.plan-card__now {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-2);
		margin-block-start: var(--space-4);
	}

	.plan-card__now-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding-block: var(--space-3);
		background: var(--color-surface-3);
		border-radius: var(--radius-lg);
	}

	.plan-card__now-cell--target {
		background: color-mix(in srgb, var(--color-accent) 12%, var(--color-surface-3));
	}

	.plan-card__now-value {
		font-family: var(--font-mono);
		font-size: 1.0625rem;
		font-weight: 700;
	}

	.plan-card__now-label {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		text-align: center;
		padding-inline: var(--space-1);
	}

	.plan-card__meta {
		margin-block-start: var(--space-3);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.plan-card__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-4);
	}

	.plan-card__cta {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.875rem;
		font-weight: 700;
	}

	.plan-card__action {
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			color: var(--color-text-primary);
		}
	}

	.plan-card__action--complete:hover {
		color: var(--color-accent);
		border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
	}
</style>
