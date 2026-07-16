<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GoalPlan } from '$lib/goalPlans/types';
	import { planDates, targetLabel, unitLabel } from '$lib/goalPlans/format';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ActiveGoalPlanCard from '$lib/components/goals/ActiveGoalPlanCard.svelte';
	import GoalPlanRow from '$lib/components/goals/GoalPlanRow.svelte';

	let confirmAction = $state<'repeat' | 'complete' | 'pause' | null>(null);
	let renaming = $state(false);
	let renameValue = $state('');

	let activePlan = $derived(goalPlanStore.activePlan);

	function focusName(plan: GoalPlan): string {
		return programStore.getItemById(plan.focusItemId)?.name ?? 'Focus lift';
	}

	function unitFor(plan: GoalPlan): string {
		return unitLabel(programStore.getItemById(plan.focusItemId)?.unit);
	}

	async function handleResume(plan: GoalPlan) {
		const ok = await goalPlanStore.activatePlan(plan.id);
		if (!ok) {
			toastStore.error('Another goal plan is active. Pause or complete it first.');
		}
	}

	async function handleConfirm() {
		if (!activePlan || !confirmAction) return;
		const action = confirmAction;
		confirmAction = null;
		if (action === 'repeat') {
			await goalPlanStore.repeatCurrentBlock(activePlan.id);
			toastStore.show('Block restarted from week 1. Same targets, more time.', 'info');
		} else if (action === 'pause') {
			await goalPlanStore.pausePlan(activePlan.id);
		} else {
			await goalPlanStore.completePlan(activePlan.id);
		}
	}

	function startRename() {
		if (!activePlan) return;
		renameValue = activePlan.name;
		renaming = true;
	}

	async function saveRename() {
		if (!activePlan || !renameValue.trim()) return;
		await goalPlanStore.renamePlan(activePlan.id, renameValue);
		renaming = false;
	}
</script>

<svelte:head>
	<title>Goal plans — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide goals-page">
	<PageHeader title="Goal plans" showBack backHref="/practice/workout" />

	{#if !prefsStore.goalProgressionPlansEnabled}
		<section class="goals-disabled">
			<p>Goal progression plans are turned off. Your plan data is kept either way.</p>
			<a href={resolve('/settings')}>Enable them in Settings</a>
		</section>
	{:else}
		<div class="goals-page__toolbar">
			<a class="goals-page__new" href={resolve('/goals/new')}>New goal plan</a>
		</div>

		{#if activePlan}
			{@const plan = activePlan}
			<ActiveGoalPlanCard
				{plan}
				focusName={focusName(plan)}
				unit={unitFor(plan)}
				week={goalPlanStore.currentWeek(plan)}
				block={goalPlanStore.currentBlock(plan)}
				blockWeek={goalPlanStore.currentBlockWeek(plan)}
				focus={goalPlanStore.focusTarget(plan)}
				finished={goalPlanStore.isFinished(plan)}
				completedCount={goalPlanStore.completedCountFor(plan)}
				{renaming}
				bind:renameValue
				onStartRename={startRename}
				onSaveRename={saveRename}
				onCancelRename={() => (renaming = false)}
				onRepeat={() => (confirmAction = 'repeat')}
				onPause={() => (confirmAction = 'pause')}
				onComplete={() => (confirmAction = 'complete')}
			/>
		{:else}
			<section class="goals-empty">
				<p class="goals-empty__title">No active goal plan</p>
				<p class="goals-empty__body">
					Set a goal — like bench 250×5 — and get a generated multi-month wave plan that builds toward it.
				</p>
				<a class="goals-empty__cta" href={resolve('/goals/new')}>Create your first goal plan</a>
			</section>
		{/if}

		{#if goalPlanStore.pausedPlans.length > 0}
			<section class="plan-list">
				<h2 class="plan-list__title">Paused</h2>
				{#each goalPlanStore.pausedPlans as plan (plan.id)}
					{@const unit = unitFor(plan)}
					<GoalPlanRow
						{plan}
						metaLines={[
							`${targetLabel(plan.goal, unit)} · block ${goalPlanStore.currentBlock(plan)?.blockNumber ?? 1} of ${plan.blocks.length} · ${planDates(plan)}`,
						]}
						onResume={() => handleResume(plan)}
						onComplete={() => goalPlanStore.completePlan(plan.id)}
					/>
				{/each}
			</section>
		{/if}

		{#if goalPlanStore.completedPlans.length > 0}
			<section class="plan-list">
				<h2 class="plan-list__title">Completed</h2>
				{#each goalPlanStore.completedPlans as plan (plan.id)}
					{@const unit = unitFor(plan)}
					<GoalPlanRow
						{plan}
						done
						metaLines={[
							`${focusName(plan)} · ${targetLabel(plan.start, unit)} → ${targetLabel(plan.goal, unit)}`,
							`${plan.blocks.length} blocks · ${goalPlanStore.completedCountFor(plan)} sessions · ${planDates(plan)}`,
						]}
					/>
				{/each}
			</section>
		{/if}
	{/if}
</div>

{#if confirmAction === 'repeat'}
	<ConfirmDialog
		title="Repeat the current block?"
		confirmLabel="Repeat block"
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The current 4-week block restarts from week 1 with its original targets. Nothing you've logged is changed — the plan
		just takes longer.
	</ConfirmDialog>
{:else if confirmAction === 'pause'}
	<ConfirmDialog
		title="Pause this plan?"
		confirmLabel="Pause plan"
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The plan holds its block and week until you resume. Resting between sessions doesn't need a pause — the plan never
		moves on its own.
	</ConfirmDialog>
{:else if confirmAction === 'complete'}
	<ConfirmDialog
		title="Complete this plan?"
		confirmLabel="Complete plan"
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The stint ends and becomes read-only history. Starting the same goal again later creates a fresh plan instance.
	</ConfirmDialog>
{/if}

<style>
	.goals-disabled,
	.goals-empty {
		padding: var(--space-8);
		text-align: center;
		color: var(--color-text-secondary);
		background: var(--color-surface-2);
		border-radius: var(--r-xl);
		border: 1px dashed var(--color-border-strong);

		a {
			display: inline-block;
			margin-block-start: var(--space-4);
			color: var(--color-accent);
			font-weight: 700;
		}
	}

	.goals-page__toolbar {
		display: flex;
		justify-content: flex-end;
		margin-block-end: var(--space-4);
	}

	.goals-page__new {
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

	.goals-empty__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.goals-empty__body {
		margin-block-start: var(--space-2);
		max-inline-size: 34ch;
		margin-inline: auto;
		line-height: 1.5;
	}

	.goals-empty__cta {
		display: inline-block;
	}

	.plan-list {
		margin-block-end: var(--space-6);
	}

	.plan-list__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}
</style>
