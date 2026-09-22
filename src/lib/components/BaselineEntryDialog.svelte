<script lang="ts">
	import { untrack } from 'svelte';
	import type { Baseline, BaselineMetric } from '$lib/db/types';
	import {
		durationInputText,
		formatValue,
		metricUnit,
		parseDuration,
		visibleMetrics,
	} from '$lib/baselines/logic';
	import Button from './Button.svelte';
	import FieldLabel from './FieldLabel.svelte';
	import DialogTitle from './DialogTitle.svelte';

	type Props = {
		baseline: Baseline;
		/** metricId → value; prefills the fields for an edit or a repeat of the last entry. */
		initialValues?: Record<string, number>;
		mode: 'add' | 'edit';
		onsave: (values: Record<string, number>) => void | Promise<void>;
		onclose: () => void;
	};

	let { baseline, initialValues = {}, mode, onsave, onclose }: Props = $props();

	let metrics = $derived(visibleMetrics(baseline));

	/** Text per metric so durations can be typed as m:ss. Blank = not logged this entry. */
	let texts = $state<Record<string, string>>(
		untrack(() => {
			const seed: Record<string, string> = {};
			for (const metric of visibleMetrics(baseline)) {
				const v = initialValues[metric.id];
				if (typeof v !== 'number') seed[metric.id] = '';
				else seed[metric.id] = metric.measure === 'duration' ? durationInputText(v) : String(v);
			}
			return seed;
		}),
	);
	let saving = $state(false);

	const titleId = $props.id();

	function parse(metric: BaselineMetric, text: string): number | null {
		if (text.trim() === '') return null;
		if (metric.measure === 'duration') return parseDuration(text);
		const n = Number(text);
		return Number.isFinite(n) && n >= 0 ? n : null;
	}

	/** Blank fields are fine; typed fields must parse. */
	let invalidIds = $derived(
		metrics.filter((m) => (texts[m.id] ?? '').trim() !== '' && parse(m, texts[m.id]) === null),
	);

	/** At least one metric must carry a number, so an entry always means something. */
	let valid = $derived(
		invalidIds.length === 0 && metrics.some((m) => parse(m, texts[m.id] ?? '') !== null),
	);

	async function save() {
		if (!valid || saving) return;
		saving = true;
		try {
			const payload: Record<string, number> = {};
			for (const metric of metrics) {
				const v = parse(metric, texts[metric.id] ?? '');
				if (v !== null) payload[metric.id] = v;
			}
			await onsave(payload);
			onclose();
		} finally {
			saving = false;
		}
	}
</script>

<div
	class="modal-backdrop"
	role="presentation"
	onclick={() => !saving && onclose()}
></div>
<div
	class="modal"
	role="dialog"
	aria-labelledby={titleId}
	aria-modal="true"
>
	<DialogTitle id={titleId}>
		{#if mode === 'edit'}Edit entry{:else}{baseline.name}{/if}
	</DialogTitle>

	<p class="bed-hint">Log what you did. Leave any field blank to skip it.</p>

	{#each metrics as metric (metric.id)}
		{@const bad = invalidIds.includes(metric)}
		<div class="bed-field">
			<FieldLabel
				for="bed-{metric.id}"
				hint="baseline {formatValue(metric, metric.baseline)}">{metric.name}</FieldLabel
			>
			<div class="bed-row">
				<input
					id="bed-{metric.id}"
					class="bed-input"
					class:bed-input--bad={bad}
					type="text"
					inputmode={metric.measure === 'duration' ? 'text' : 'decimal'}
					bind:value={texts[metric.id]}
					placeholder={metric.measure === 'duration' ? 'min or m:ss' : '0'}
					aria-invalid={bad}
				/>
				<span class="bed-unit">{metricUnit(metric)}</span>
			</div>
		</div>
	{/each}

	<div class="modal__actions">
		<Button
			variant="ghost"
			grow
			onclick={onclose}
			disabled={saving}>Cancel</Button
		>
		<Button
			grow
			onclick={save}
			disabled={!valid || saving}
		>
			{#if saving}Saving…{:else}Save{/if}
		</Button>
	</div>
</div>

<style>
	.bed-hint {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.bed-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.bed-row .bed-input {
		flex: 1;
		min-inline-size: 0;
	}

	.bed-input--bad {
		border-color: var(--color-red) !important;
	}

	.bed-unit {
		flex: 0 0 auto;
		min-inline-size: 36px;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 90;
	}

	.modal {
		position: fixed;
		inset-inline: var(--space-4);
		inset-block-start: 50%;
		transform: translateY(-50%);
		max-inline-size: 400px;
		max-block-size: 85dvh;
		overflow-y: auto;
		margin-inline: auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--r-xl);
		padding: var(--space-5);
		z-index: 91;
		box-shadow: var(--shadow-lg);
	}

	.modal__actions {
		display: flex;
		gap: var(--space-2);
		margin-block-start: var(--space-4);
	}

	.bed-field {
		margin-block-end: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.bed-input {
		block-size: 52px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 700;
		text-align: center;
		color: var(--color-text-primary);
		outline: none;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus {
			border-color: var(--color-accent);
		}
		&::placeholder {
			color: var(--color-text-muted);
			font-weight: 400;
		}
	}
</style>
