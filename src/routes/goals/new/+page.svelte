<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { GoalWizard } from '$lib/goalPlans/wizard.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ExerciseLibrarySheet from '$lib/components/ExerciseLibrarySheet.svelte';
	import GoalWizardSteps from '$lib/components/goals/GoalWizardSteps.svelte';
	import GoalFocusStep from '$lib/components/goals/GoalFocusStep.svelte';
	import GoalSetupStep from '$lib/components/goals/GoalSetupStep.svelte';
	import GoalExercisesStep from '$lib/components/goals/GoalExercisesStep.svelte';
	import GoalStartStep from '$lib/components/goals/GoalStartStep.svelte';
	import GoalPreviewStep from '$lib/components/goals/GoalPreviewStep.svelte';

	const wizard = new GoalWizard();

	async function handleCreate() {
		try {
			const result = await wizard.createPlan();
			if (!result) return;
			if (result.activated) {
				toastStore.show(`${result.name} is live. Follow the wave!`, 'info');
			} else {
				toastStore.show('Plan created as paused — another goal plan is already active.', 'info');
			}
			goto(resolve('/goals'));
		} catch {
			toastStore.error("Couldn't create the plan. Please try again.");
		}
	}
</script>

<svelte:head>
	<title>New goal plan — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide goal-new">
	<PageHeader title="New goal plan" showBack backHref="/goals" />

	{#if !prefsStore.goalProgressionPlansEnabled}
		<section class="goal-new__disabled">
			<p>Goal progression plans are turned off.</p>
			<a href={resolve('/settings')}>Enable them in Settings</a>
		</section>
	{:else}
		<GoalWizardSteps step={wizard.step} stepIndex={wizard.stepIndex} />

		{#if wizard.step === 'focus'}
			<GoalFocusStep
				focusItem={wizard.focusItem}
				quickPicks={wizard.quickPicks}
				bind:goalWeight={wizard.goalWeight}
				bind:goalReps={wizard.goalReps}
				unit={wizard.unit}
				focusIncrement={wizard.focusIncrement}
				onSetFocus={(item) => wizard.setFocus(item)}
				onBrowse={() => (wizard.pickingFocus = true)}
			/>
		{:else if wizard.step === 'setup' && wizard.focusItem}
			<GoalSetupStep
				focusItem={wizard.focusItem}
				templateId={wizard.templateId}
				onPickSetup={(kind) => wizard.pickSetup(kind)}
			/>
		{:else if wizard.step === 'exercises' && wizard.templateId && wizard.focusItem && wizard.focusItemId}
			<GoalExercisesStep
				focusItem={wizard.focusItem}
				focusItemId={wizard.focusItemId}
				routines={wizard.routines}
				isScratch={wizard.isScratch}
				exercisesValid={wizard.exercisesValid}
				focusInPlan={wizard.focusInPlan}
				onRemoveSlot={(letter, itemId) => wizard.removeSlot(letter, itemId)}
				onAddToLetter={(letter) => (wizard.addingToLetter = letter)}
			/>
		{:else if wizard.step === 'start'}
			<GoalStartStep
				focusName={wizard.focusItem?.name ?? 'this exercise'}
				startFromHistory={wizard.startFromHistory}
				bind:startWeight={wizard.startWeight}
				bind:startReps={wizard.startReps}
				goalWeight={wizard.goalWeight}
				goalValid={wizard.goalValid}
				startValid={wizard.startValid}
				unit={wizard.unit}
				focusIncrement={wizard.focusIncrement}
			/>
		{:else if wizard.step === 'preview' && wizard.focusItem}
			<GoalPreviewStep
				focusItem={wizard.focusItem}
				bind:planName={wizard.planName}
				startWeight={wizard.startWeight}
				startReps={wizard.startReps}
				goalWeight={wizard.goalWeight}
				goalReps={wizard.goalReps}
				unit={wizard.unit}
				previewBlocks={wizard.previewBlocks}
				previewWeeks={wizard.previewWeeks}
				previewMonths={wizard.previewMonths}
				daysPerWeek={wizard.daysPerWeek}
				onNameInput={() => (wizard.nameTouched = true)}
			/>
		{/if}

		<div class="goal-new__actions">
			{#if wizard.stepIndex > 0}
				<button class="goal-new__btn goal-new__btn--ghost" type="button" onclick={() => wizard.back()}>
					Back
				</button>
			{/if}
			{#if wizard.step === 'focus'}
				<button
					class="goal-new__btn"
					type="button"
					disabled={!wizard.goalValid}
					onclick={() => wizard.goToSetup()}
				>
					Continue
				</button>
			{:else if wizard.step === 'exercises'}
				<button
					class="goal-new__btn"
					type="button"
					disabled={!wizard.exercisesValid}
					onclick={() => wizard.goToStart()}
				>
					Continue
				</button>
			{:else if wizard.step === 'start'}
				<button
					class="goal-new__btn"
					type="button"
					disabled={!wizard.startValid}
					onclick={() => wizard.goToPreview()}
				>
					Generate plan
				</button>
			{:else if wizard.step === 'preview'}
				<button
					class="goal-new__btn"
					type="button"
					disabled={wizard.creating || !wizard.planName.trim()}
					aria-busy={wizard.creating}
					onclick={handleCreate}
				>
					{#if wizard.creating}Creating…{:else}Create plan{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>

{#if wizard.addingToLetter}
	<ExerciseLibrarySheet
		exercises={programStore.items}
		onAdd={(item) => wizard.addExercise(item)}
		onClose={() => (wizard.addingToLetter = null)}
	/>
{/if}

{#if wizard.pickingFocus}
	<ExerciseLibrarySheet
		exercises={programStore.items}
		onAdd={(item) => wizard.setFocus(item)}
		onClose={() => (wizard.pickingFocus = false)}
	/>
{/if}

<style>
	.goal-new__disabled {
		padding: var(--space-8);
		text-align: center;
		color: var(--color-text-secondary);
		background: var(--color-surface-2);
		border-radius: var(--r-xl);
		border: 1px dashed var(--color-border-strong);

		a {
			display: inline-block;
			margin-block-start: var(--space-3);
			color: var(--color-accent);
			font-weight: 700;
		}
	}

	.goal-new__actions {
		display: flex;
		gap: var(--space-3);
		margin-block-start: var(--space-4);
		padding-block-end: var(--space-6);
	}

	.goal-new__btn {
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

	.goal-new__btn--ghost {
		flex: 0 0 auto;
		padding-inline: var(--space-5);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}
</style>
