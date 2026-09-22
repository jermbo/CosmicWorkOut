<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { programStore } from '$lib/stores/program.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
	import { PlanWizard, DAYS_PER_WEEK } from '$lib/plans/wizard.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import LibrarySheet from '$lib/components/LibrarySheet.svelte';
	import { strengthLibrary } from '$lib/itemLibrary';
	import PlanWizardSteps from '$lib/components/plans/PlanWizardSteps.svelte';
	import PlanStartStep from '$lib/components/plans/PlanStartStep.svelte';
	import PlanRoutinesStep from '$lib/components/plans/PlanRoutinesStep.svelte';
	import PlanGoalStep from '$lib/components/plans/PlanGoalStep.svelte';
	import PlanReviewStep from '$lib/components/plans/PlanReviewStep.svelte';
	import { redirectWhenDisabled } from '$lib/featureGate.svelte';

	redirectWhenDisabled(() => prefsStore.practiceEnabled);

	const wizard = new PlanWizard();

	let templates = $derived(
		programStore.programs.filter((p) => p.isBuiltIn && p.disciplineId === STRENGTH_DISCIPLINE_ID),
	);

	async function handleCreate() {
		try {
			const result = await wizard.create();
			if (!result) return;
			toastStore.show(`${result.name} is live.`, 'info');
			goto(resolve('/workout'));
		} catch {
			toastStore.error("Couldn't create the plan. Please try again.");
		}
	}
</script>

<svelte:head>
	<title>New plan — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide plan-new">
	<PageHeader
		title="New plan"
		showBack
		backHref="/workout"
	/>

	<PlanWizardSteps
		step={wizard.step}
		stepIndex={wizard.stepIndex}
	/>

	{#if wizard.step === 'start'}
		<PlanStartStep
			{templates}
			templateId={wizard.templateId}
			isScratch={wizard.isScratch}
			bind:name={wizard.name}
			bind:durationWeeks={wizard.durationWeeks}
			onPickTemplate={(p) => wizard.pickTemplate(p)}
			onPickScratch={() => wizard.pickScratch()}
			onNameInput={() => (wizard.nameTouched = true)}
		/>
	{:else if wizard.step === 'routines'}
		<PlanRoutinesStep
			routines={wizard.routines}
			routinesValid={wizard.routinesValid}
			onRemoveSlot={(letter, itemId) => wizard.removeSlot(letter, itemId)}
			onAddToLetter={(letter) => (wizard.addingToLetter = letter)}
		/>
	{:else if wizard.step === 'goal'}
		<PlanGoalStep
			hasGoal={wizard.hasGoal}
			focusCandidates={wizard.focusCandidates}
			focusItem={wizard.focusItem}
			startFromHistory={wizard.startFromHistory}
			bind:startWeight={wizard.startWeight}
			bind:startReps={wizard.startReps}
			bind:goalWeight={wizard.goalWeight}
			bind:goalReps={wizard.goalReps}
			unit={wizard.unit}
			focusIncrement={wizard.focusIncrement}
			onSetHasGoal={(v) => wizard.setHasGoal(v)}
			onSetFocus={(item) => wizard.setFocus(item)}
		/>
	{:else if wizard.step === 'review' && wizard.hasGoal !== null}
		<PlanReviewStep
			name={wizard.name}
			hasGoal={wizard.hasGoal}
			focusItem={wizard.focusItem}
			startWeight={wizard.startWeight}
			startReps={wizard.startReps}
			goalWeight={wizard.goalWeight}
			goalReps={wizard.goalReps}
			unit={wizard.unit}
			previewBlocks={wizard.previewBlocks}
			previewWeeks={wizard.previewWeeks}
			previewMonths={wizard.previewMonths}
			durationWeeks={wizard.durationWeeks}
			daysPerWeek={DAYS_PER_WEEK}
			routineCount={wizard.routines.length}
		/>
	{/if}

	<div class="plan-new__actions">
		{#if wizard.stepIndex > 0}
			<button
				class="plan-new__btn plan-new__btn--ghost"
				type="button"
				onclick={() => wizard.back()}
			>
				Back
			</button>
		{/if}
		{#if wizard.step === 'start'}
			<button
				class="plan-new__btn"
				type="button"
				disabled={!wizard.templateId || !wizard.name.trim()}
				onclick={() => wizard.goToRoutines()}
			>
				Continue
			</button>
		{:else if wizard.step === 'routines'}
			<button
				class="plan-new__btn"
				type="button"
				disabled={!wizard.routinesValid}
				onclick={() => wizard.goToGoal()}
			>
				Continue
			</button>
		{:else if wizard.step === 'goal'}
			<button
				class="plan-new__btn"
				type="button"
				disabled={wizard.hasGoal === null ||
					(wizard.hasGoal && !(wizard.goalTargetValid && wizard.startValid))}
				onclick={() => wizard.goToReview()}
			>
				Review
			</button>
		{:else if wizard.step === 'review'}
			<button
				class="plan-new__btn"
				type="button"
				disabled={wizard.creating || !wizard.reviewValid}
				aria-busy={wizard.creating}
				onclick={handleCreate}
			>
				{#if wizard.creating}Creating…{:else}Start plan{/if}
			</button>
		{/if}
	</div>
</div>

{#if wizard.addingToLetter}
	<LibrarySheet
		config={strengthLibrary()}
		onAdd={(item) => wizard.addExercise(item)}
		onClose={() => (wizard.addingToLetter = null)}
	/>
{/if}

<style>
	.plan-new__actions {
		display: flex;
		gap: var(--space-3);
		margin-block-start: var(--space-4);
		padding-block-end: var(--space-6);
	}

	.plan-new__btn {
		flex: 1;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
	}

	.plan-new__btn--ghost {
		flex: 0 0 auto;
		padding-inline: var(--space-5);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}
</style>
