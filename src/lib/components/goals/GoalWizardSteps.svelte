<script lang="ts">
	import type { WizardStep } from '$lib/goalPlans/wizard.svelte';
	import { WIZARD_STEPS, WIZARD_STEP_LABELS } from '$lib/goalPlans/wizard.svelte';

	type Props = {
		step: WizardStep;
		stepIndex: number;
	};

	let { step, stepIndex }: Props = $props();
</script>

<ol class="goal-steps" aria-label="Plan creation steps">
	{#each WIZARD_STEPS as s, i (s)}
		<li
			class="goal-steps__item"
			class:goal-steps__item--active={s === step}
			class:goal-steps__item--done={i < stepIndex}
			aria-current={s === step ? 'step' : undefined}
		>
			<span class="goal-steps__num">{i + 1}</span>
			<span class="goal-steps__label">{WIZARD_STEP_LABELS[s]}</span>
		</li>
	{/each}
</ol>

<style>
	.goal-steps {
		display: flex;
		gap: var(--space-2);
		margin-block-end: var(--space-5);
		list-style: none;
		overflow-x: auto;
		padding-block-end: var(--space-1);
	}

	.goal-steps__item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding-inline: var(--space-3);
		block-size: 30px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.goal-steps__item--active {
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	.goal-steps__item--done {
		color: var(--color-text-secondary);
	}

	.goal-steps__num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 16px;
		block-size: 16px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		font-family: var(--font-mono);
		font-size: 0.625rem;
	}

	.goal-steps__item--active .goal-steps__num {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}
</style>
