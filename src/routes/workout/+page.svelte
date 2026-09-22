<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GoalPlan } from '$lib/goalPlans/types';
	import { programStore } from '$lib/stores/program.svelte';
	import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { effectiveSections } from '$lib/discipline';
	import { formatDuration, formatCountWithWord } from '$lib/format';
	import { unitLabel } from '$lib/goalPlans/format';
	import { allPlans, activatePlan, pausePlan, runItAgain } from '$lib/plans/actions';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ActiveGoalPlanCard from '$lib/components/goals/ActiveGoalPlanCard.svelte';
	import ActivePlanCard from '$lib/components/plans/ActivePlanCard.svelte';
	import PlanRow from '$lib/components/plans/PlanRow.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { redirectWhenDisabled } from '$lib/featureGate.svelte';

	redirectWhenDisabled(() => prefsStore.practiceEnabled);

	let contextDate = $derived(loggingContext.date);
	let plans = $derived(allPlans());
	let activeMeta = $derived(plans.find((p) => p.isActive) ?? null);
	let otherMeta = $derived(plans.filter((p) => !p.isActive));

	let renaming = $state(false);
	let renameValue = $state('');
	let confirmAction = $state<'repeat' | 'complete' | 'pause' | null>(null);

	function focusName(plan: GoalPlan): string {
		return programStore.getItemById(plan.focusItemId)?.name ?? 'Focus lift';
	}

	function unitFor(plan: GoalPlan): string {
		return unitLabel(programStore.getItemById(plan.focusItemId)?.unit);
	}

	let todayInfo = $derived.by(() => {
		if (!activeMeta) return { name: '', meta: null as string | null };
		const program = activeMeta.program;
		const session = programStore.sessionForProgramDate(program.id, contextDate);
		const suggested = programStore.suggestedRoutineInCurrentWeekForProgram(program.id);

		if (session) {
			const routine = programStore.getRoutineForSession(session);
			const itemCount = routine
				? effectiveSections(program, routine).reduce((n, s) => n + s.items.length, 0)
				: session.items.length;
			return {
				name: routine?.name ?? 'Session logged',
				meta: `${formatDuration(session.durationSeconds ?? 0)} · ${formatCountWithWord(itemCount, 'item')}`,
			};
		}

		if (suggested) {
			const count = effectiveSections(program, suggested).reduce((n, s) => n + s.items.length, 0);
			return {
				name: suggested.name,
				meta: `Routine ${suggested.letter ?? '?'} · ${formatCountWithWord(count, 'item')}`,
			};
		}

		return { name: program.name, meta: 'Ready when you are' };
	});

	let finished = $derived(
		activeMeta ? programStore.isProgramCompleteForProgram(activeMeta.program.id) : false,
	);
	let weekNumber = $derived(
		activeMeta ? programStore.currentWeekForProgram(activeMeta.program.id) : 1,
	);

	async function handleActivate(programId: string) {
		await activatePlan(programId);
	}

	async function handlePause() {
		if (!activeMeta) return;
		await pausePlan(activeMeta.program.id);
	}

	async function handleRunItAgain() {
		if (!activeMeta) return;
		await runItAgain(activeMeta.program);
	}

	function startRename() {
		if (!activeMeta?.goal) return;
		renameValue = activeMeta.goal.name;
		renaming = true;
	}

	async function saveRename() {
		if (!activeMeta?.goal || !renameValue.trim()) return;
		await goalPlanStore.renamePlan(activeMeta.goal.id, renameValue);
		renaming = false;
	}

	async function handleConfirm() {
		if (!activeMeta?.goal || !confirmAction) return;
		const goal = activeMeta.goal;
		const action = confirmAction;
		confirmAction = null;
		if (action === 'repeat') {
			await goalPlanStore.repeatCurrentBlock(goal.id);
		} else if (action === 'pause') {
			await goalPlanStore.pausePlan(goal.id);
		} else {
			await goalPlanStore.completePlan(goal.id);
		}
	}
</script>

<svelte:head>
	<title>Workout — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide workout-hub">
	<PageHeader title="Workout" />

	{#if !programStore.loaded}
		<div
			class="workout-hub__loading"
			aria-busy="true"
		>
			<div class="workout-hub__spinner"></div>
		</div>
	{:else}
		<div class="workout-hub__toolbar">
			<a
				class="workout-hub__new"
				href={resolve('/workout/new')}>New plan</a
			>
		</div>

		{#if activeMeta}
			{#if activeMeta.goal}
				{@const plan = activeMeta.goal}
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
				<ActivePlanCard
					program={activeMeta.program}
					{weekNumber}
					todayName={todayInfo.name}
					todayMeta={todayInfo.meta}
					{finished}
					onPause={handlePause}
					onRunItAgain={handleRunItAgain}
				/>
			{/if}
		{:else}
			<section class="workout-hub__empty">
				<h2 class="workout-hub__empty-title">No active plan</h2>
				<p class="workout-hub__empty-body">
					Start from a template or your own routine, with a goal if you want one.
				</p>
				<a
					class="workout-hub__empty-cta"
					href={resolve('/workout/new')}>Create your first plan</a
				>
			</section>
		{/if}

		{#if otherMeta.length > 0}
			<section class="plan-list">
				<h2 class="plan-list__title">Other plans</h2>
				{#each otherMeta as meta (meta.program.id)}
					<PlanRow
						program={meta.program}
						goal={meta.goal}
						onActivate={() => handleActivate(meta.program.id)}
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
		The current 4-week block restarts from week 1 with its original targets. Nothing you've logged
		is changed — the plan just takes longer.
	</ConfirmDialog>
{:else if confirmAction === 'pause'}
	<ConfirmDialog
		title="Pause this plan?"
		confirmLabel="Pause plan"
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The plan holds its block and week until you resume. Resting between sessions doesn't need a
		pause — the plan never moves on its own.
	</ConfirmDialog>
{:else if confirmAction === 'complete'}
	<ConfirmDialog
		title="Complete this plan?"
		confirmLabel="Complete plan"
		onconfirm={handleConfirm}
		oncancel={() => (confirmAction = null)}
	>
		The stint ends and becomes read-only history. Starting the same goal again later creates a fresh
		plan instance.
	</ConfirmDialog>
{/if}

<style>
	.workout-hub__loading {
		display: flex;
		justify-content: center;
		padding-block: var(--space-12);
	}

	.workout-hub__spinner {
		inline-size: 28px;
		block-size: 28px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.workout-hub__toolbar {
		display: flex;
		justify-content: flex-end;
		margin-block-end: var(--space-4);
	}

	.workout-hub__new {
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

	.workout-hub__empty {
		padding: var(--space-8);
		text-align: center;
		color: var(--color-text-secondary);
		background: var(--color-surface-2);
		border-radius: var(--r-xl);
		border: 1px dashed var(--color-border-strong);
	}

	.workout-hub__empty-title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.workout-hub__empty-body {
		margin-block-start: var(--space-2);
		max-inline-size: 34ch;
		margin-inline: auto;
		line-height: 1.5;
	}

	.workout-hub__empty-cta {
		display: inline-block;
		margin-block-start: var(--space-4);
		color: var(--color-accent-text);
		font-weight: 700;
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
