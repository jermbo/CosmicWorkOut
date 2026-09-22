<script lang="ts">
	import type { Program } from '$lib/db/types';
	import { SCRATCH_TEMPLATE_ID } from '$lib/goalPlans/templates';
	import FieldLabel from '../FieldLabel.svelte';

	type Props = {
		templates: Program[];
		templateId: string | null;
		isScratch: boolean;
		name: string;
		durationWeeks: number;
		onPickTemplate: (program: Program) => void;
		onPickScratch: () => void;
		onNameInput: () => void;
	};

	let {
		templates,
		templateId,
		isScratch,
		name = $bindable(''),
		durationWeeks = $bindable(12),
		onPickTemplate,
		onPickScratch,
		onNameInput,
	}: Props = $props();
</script>

<p class="lead">Start from one of your templates, or build your own week from scratch.</p>

<div class="template-list">
	{#each templates as t (t.id)}
		<button
			type="button"
			class="template-card"
			class:template-card--selected={templateId === t.id}
			onclick={() => onPickTemplate(t)}
		>
			<span class="template-card__name">{t.name}</span>
			{#if t.description}
				<span class="template-card__desc">{t.description}</span>
			{/if}
			<span class="template-card__meta">{t.durationWeeks} wk · {t.daysPerWeek}×/week</span>
		</button>
	{/each}
	<button
		type="button"
		class="template-card"
		class:template-card--selected={templateId === SCRATCH_TEMPLATE_ID}
		onclick={onPickScratch}
	>
		<span class="template-card__name">Start from scratch</span>
		<span class="template-card__desc">Build Days A/B/C from your exercise library.</span>
	</button>
</div>

{#if templateId}
	<div class="form-field">
		<FieldLabel for="plan-name">Plan name</FieldLabel>
		<input
			id="plan-name"
			class="form-field__input"
			type="text"
			bind:value={name}
			oninput={onNameInput}
			autocomplete="off"
		/>
	</div>

	{#if isScratch}
		<div class="form-field">
			<FieldLabel for="plan-weeks">Duration (weeks)</FieldLabel>
			<div class="stepper">
				<button
					type="button"
					onclick={() => {
						if (durationWeeks > 1) durationWeeks--;
					}}
					aria-label="Decrease weeks">−</button
				>
				<span id="plan-weeks">{durationWeeks}</span>
				<button
					type="button"
					onclick={() => {
						if (durationWeeks < 52) durationWeeks++;
					}}
					aria-label="Increase weeks">+</button
				>
			</div>
		</div>
	{/if}
{/if}

<style>
	.lead {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-4);
	}

	.template-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-block-end: var(--space-5);
	}

	.template-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-1);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.template-card--selected {
		border-color: var(--color-accent);
	}

	.template-card__name {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
	}

	.template-card__desc {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		line-height: 1.45;
	}

	.template-card__meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-block-start: var(--space-1);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-block-end: var(--space-5);
	}

	.form-field__input {
		block-size: 48px;
		padding-inline: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 1rem;
		color: var(--color-text-primary);
		outline: none;
		inline-size: 100%;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus {
			border-color: var(--color-accent);
		}
	}

	.stepper {
		display: flex;
		align-items: center;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		block-size: 52px;
		max-inline-size: 200px;

		button {
			inline-size: 56px;
			font-size: 1.5rem;
			color: var(--color-text-secondary);

			&:hover {
				background: var(--color-surface-3);
			}
		}

		span {
			flex: 1;
			text-align: center;
			font-family: var(--font-mono);
			font-size: 1.25rem;
			font-weight: 700;
		}
	}
</style>
