<script lang="ts">
	import type { Item } from '$lib/db/types';
	import type { ProgressionBlock } from '$lib/goalPlans/types';

	type Props = {
		focusItem: Item;
		planName: string;
		startWeight: number | null;
		startReps: number | null;
		goalWeight: number | null;
		goalReps: number | null;
		unit: string;
		previewBlocks: ProgressionBlock[];
		previewWeeks: number;
		previewMonths: number;
		daysPerWeek: number;
		onNameInput: () => void;
	};

	let {
		focusItem,
		planName = $bindable(''),
		startWeight,
		startReps,
		goalWeight,
		goalReps,
		unit,
		previewBlocks,
		previewWeeks,
		previewMonths,
		daysPerWeek,
		onNameInput,
	}: Props = $props();
</script>

<div class="form-field">
	<label class="form-field__label" for="plan-name">Plan name</label>
	<input
		id="plan-name"
		class="form-field__input"
		type="text"
		bind:value={planName}
		oninput={onNameInput}
		autocomplete="off"
	/>
</div>

<section class="preview-summary">
	<p class="preview-summary__line">
		<strong>{focusItem.name}</strong> — {startWeight} × {startReps} → goal {goalWeight} × {goalReps}
		{unit === 'kg' ? '(kg)' : '(lb)'}
	</p>
	<p class="preview-summary__line">
		{previewBlocks.length} blocks · ~{previewWeeks} weeks · about {previewMonths}
		{previewMonths === 1 ? 'month' : 'months'} at {daysPerWeek}×/week
	</p>
	<p class="preview-summary__note">
		Only {focusItem.name} rides the wave. Other exercises bump weekly by their weight increment.
	</p>
</section>

<div class="preview-blocks">
	{#each previewBlocks as block (block.blockNumber)}
		<section class="preview-block">
			<h3 class="preview-block__title">Block {String(block.blockNumber).padStart(2, '0')}</h3>
			<div class="preview-block__weeks">
				{#each block.weeks as wk (wk.planWeek)}
					<div
						class="preview-week"
						class:preview-week--peak={wk.phase === 'peak'}
						class:preview-week--deload={wk.phase === 'deload'}
					>
						<span class="preview-week__label">Wk {wk.planWeek}</span>
						<span class="preview-week__target">{wk.weight}×{wk.reps}</span>
						<span class="preview-week__phase">{wk.phase}</span>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-block-end: var(--space-5);
	}

	.form-field__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
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

	.preview-summary {
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
		border-radius: var(--r-xl);
		margin-block-end: var(--space-5);
	}

	.preview-summary__line {
		font-size: 0.9375rem;
		line-height: 1.55;
	}

	.preview-summary__note {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-2);
		line-height: 1.5;
	}

	.preview-blocks {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-block-end: var(--space-5);
	}

	.preview-block__title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.preview-block__weeks {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.preview-week {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding-block: var(--space-2);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.preview-week--peak {
		border-color: color-mix(in srgb, var(--color-accent) 45%, transparent);
	}

	.preview-week--deload {
		opacity: 0.7;
	}

	.preview-week__label {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.preview-week__target {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.preview-week__phase {
		font-size: 0.625rem;
		color: var(--color-text-muted);
	}
</style>
