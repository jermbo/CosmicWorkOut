<script lang="ts">
	import WeightRepsInputs from './WeightRepsInputs.svelte';

	type Props = {
		focusName: string;
		startFromHistory: boolean;
		startWeight: number | null;
		startReps: number | null;
		goalWeight: number | null;
		goalValid: boolean;
		startValid: boolean;
		unit: string;
		focusIncrement: number;
	};

	let {
		focusName,
		startFromHistory,
		startWeight = $bindable(null),
		startReps = $bindable(null),
		goalWeight,
		goalValid,
		startValid,
		unit,
		focusIncrement,
	}: Props = $props();
</script>

<p class="lead">
	{#if startFromHistory}
		Proposed from your session history — confirm it or adjust to match where you are today.
	{:else}
		No history for {focusName} yet. Enter a challenging-but-doable weight × reps to start from.
	{/if}
</p>
<WeightRepsInputs
	label="Starting point — weight × reps"
	bind:weight={startWeight}
	bind:reps={startReps}
	{unit}
	weightStep={focusIncrement}
	weightPlaceholder="150"
	repsPlaceholder="10"
	weightAriaLabel="Starting weight"
	repsAriaLabel="Starting reps"
	hint={startFromHistory ? `From your last logged set of ${focusName}.` : undefined}
/>
{#if startValid && goalValid && startWeight != null && goalWeight != null && startWeight >= goalWeight}
	<p class="hint">Your starting weight already meets the goal — the plan will be a single block.</p>
{/if}

<style>
	.lead {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-4);
	}

	.hint {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-3);
	}
</style>
