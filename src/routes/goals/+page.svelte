<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GoalPlan } from '$lib/goalPlans/types';
	import { WEEKS_PER_BLOCK } from '$lib/goalPlans/generator';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let confirmAction = $state<'repeat' | 'complete' | 'pause' | null>(null);
	let renaming = $state(false);
	let renameValue = $state('');

	let activePlan = $derived(goalPlanStore.activePlan);

	function focusName(plan: GoalPlan): string {
		return programStore.getItemById(plan.focusItemId)?.name ?? 'Focus lift';
	}

	function unitFor(plan: GoalPlan): string {
		const unit = programStore.getItemById(plan.focusItemId)?.unit;
		return unit === 'kg' ? 'kg' : 'lb';
	}

	function targetLabel(t: { weight: number; reps: number }, unit: string): string {
		return `${t.weight} ${unit} × ${t.reps}`;
	}

	function planDates(plan: GoalPlan): string {
		const started = new Date(plan.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
		if (plan.status === 'completed' && plan.completedAt) {
			const ended = new Date(plan.completedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
			return `${started} – ${ended}`;
		}
		return `Started ${started}`;
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
			{@const unit = unitFor(plan)}
			{@const week = goalPlanStore.currentWeek(plan)}
			{@const block = goalPlanStore.currentBlock(plan)}
			{@const blockWeek = goalPlanStore.currentBlockWeek(plan)}
			{@const focus = goalPlanStore.focusTarget(plan)}
			{@const finished = goalPlanStore.isFinished(plan)}
			{@const completedCount = goalPlanStore.completedCountFor(plan)}
			<section class="plan-card" aria-label="Active goal plan">
				<header class="plan-card__header">
					{#if renaming}
						<form
							class="plan-card__rename"
							onsubmit={(e) => {
								e.preventDefault();
								saveRename();
							}}
						>
							<!-- svelte-ignore a11y_autofocus -->
							<input class="plan-card__rename-input" type="text" bind:value={renameValue} autofocus aria-label="Plan name" />
							<button type="submit" class="plan-card__rename-save" disabled={!renameValue.trim()}>Save</button>
							<button type="button" class="plan-card__rename-cancel" onclick={() => (renaming = false)}>Cancel</button>
						</form>
					{:else}
						<div class="plan-card__title-row">
							<h2 class="plan-card__name">{plan.name}</h2>
							<button class="plan-card__rename-btn" type="button" onclick={startRename}>Rename</button>
						</div>
					{/if}
					<p class="plan-card__goal">
						{focusName(plan)} · {targetLabel(plan.start, unit)} → <strong>{targetLabel(plan.goal, unit)}</strong>
					</p>
				</header>

				{#if finished}
					<div class="plan-card__finished">
						<p>
							Every block is trained through — you're at the end of the wave. Mark the plan complete, or repeat the
							final block for another push.
						</p>
					</div>
				{:else if focus && block}
					<div class="plan-card__now">
						<div class="plan-card__now-cell">
							<span class="plan-card__now-value">{String(block.blockNumber).padStart(2, '0')}/{String(plan.blocks.length).padStart(2, '0')}</span>
							<span class="plan-card__now-label">block</span>
						</div>
						<div class="plan-card__now-cell">
							<span class="plan-card__now-value">{blockWeek}/{WEEKS_PER_BLOCK}</span>
							<span class="plan-card__now-label">week · {focus.phase}</span>
						</div>
						<div class="plan-card__now-cell plan-card__now-cell--target">
							<span class="plan-card__now-value">{focus.weight}×{focus.reps}</span>
							<span class="plan-card__now-label">{focusName(plan)}</span>
						</div>
					</div>
				{/if}

				<div class="plan-card__timeline" role="img" aria-label="Block timeline, week {week} of {plan.blocks.length * WEEKS_PER_BLOCK}">
					{#each plan.blocks as b (b.blockNumber)}
						<div class="timeline-block" class:timeline-block--current={b.blockNumber === block?.blockNumber && !finished}>
							<div class="timeline-block__weeks">
								{#each b.weeks as wk (wk.planWeek)}
									<span
										class="timeline-week"
										class:timeline-week--done={wk.planWeek < week || finished}
										class:timeline-week--current={wk.planWeek === week && !finished}
										class:timeline-week--deload={wk.phase === 'deload'}
										title="Wk {wk.planWeek}: {wk.weight}×{wk.reps}"
									></span>
								{/each}
							</div>
							<span class="timeline-block__label">
								B{b.blockNumber}
								{#if plan.repeatEvents.some((r) => r.blockNumber === b.blockNumber)}
									<span class="timeline-block__repeat" title="Block repeated">↻</span>
								{/if}
							</span>
						</div>
					{/each}
				</div>

				<p class="plan-card__meta">
					{completedCount} sessions logged · {plan.daysPerWeek}×/week
					{#if plan.repeatEvents.length > 0}
						· {plan.repeatEvents.length} block {plan.repeatEvents.length === 1 ? 'repeat' : 'repeats'}
					{/if}
				</p>

				<div class="plan-card__actions">
					<a class="plan-card__cta" href={resolve('/workout') + `?program=${plan.programId}`}>Go to workout</a>
					<button class="plan-card__action" type="button" onclick={() => (confirmAction = 'repeat')}>
						Repeat block
					</button>
					<button class="plan-card__action" type="button" onclick={() => (confirmAction = 'pause')}>Pause</button>
					<button class="plan-card__action plan-card__action--complete" type="button" onclick={() => (confirmAction = 'complete')}>
						Complete
					</button>
				</div>
			</section>
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
					<div class="plan-row">
						<div class="plan-row__info">
							<span class="plan-row__name">{plan.name}</span>
							<span class="plan-row__meta">
								{targetLabel(plan.goal, unit)} · block {goalPlanStore.currentBlock(plan)?.blockNumber ?? 1} of
								{plan.blocks.length} · {planDates(plan)}
							</span>
						</div>
						<div class="plan-row__actions">
							<button class="plan-row__btn plan-row__btn--primary" type="button" onclick={() => handleResume(plan)}>
								Resume
							</button>
							<button class="plan-row__btn" type="button" onclick={() => goalPlanStore.completePlan(plan.id)}>
								Complete
							</button>
						</div>
					</div>
				{/each}
			</section>
		{/if}

		{#if goalPlanStore.completedPlans.length > 0}
			<section class="plan-list">
				<h2 class="plan-list__title">Completed</h2>
				{#each goalPlanStore.completedPlans as plan (plan.id)}
					{@const unit = unitFor(plan)}
					<div class="plan-row plan-row--done">
						<div class="plan-row__info">
							<span class="plan-row__name">{plan.name}</span>
							<span class="plan-row__meta">
								{focusName(plan)} · {targetLabel(plan.start, unit)} → {targetLabel(plan.goal, unit)}
							</span>
							<span class="plan-row__meta">
								{plan.blocks.length} blocks · {goalPlanStore.completedCountFor(plan)} sessions · {planDates(plan)}
							</span>
						</div>
					</div>
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
		The current 4-week block restarts from week 1 with its original targets. Nothing you've logged is changed — the
		plan just takes longer.
	</ConfirmDialog>
{:else if confirmAction === 'pause'}
	<ConfirmDialog
		title="Pause this plan?"
		confirmLabel="Pause plan"
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The plan holds its block and week until you resume. Resting between sessions doesn't need a pause — the plan
		never moves on its own.
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

	.plan-card__timeline {
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
		color: var(--color-accent);
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
