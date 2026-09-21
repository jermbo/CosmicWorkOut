<script lang="ts">
	import { untrack } from 'svelte';
	import type { Baseline, BaselineMeasure, DistanceUnit } from '$lib/db/types';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import {
		BASELINE_MEASURES,
		BASELINE_PRESETS,
		DISTANCE_UNITS,
		durationInputText,
		parseDuration,
		visibleMetrics,
		type BaselineMetricDraft,
	} from '$lib/baselines/logic';
	import Button from './Button.svelte';
	import FieldLabel from './FieldLabel.svelte';
	import DialogTitle from './DialogTitle.svelte';

	type Props = {
		editing?: Baseline | null;
		onclose: () => void;
	};

	let { editing = null, onclose }: Props = $props();

	/** Form row. `amount` is text so durations can be typed as m:ss. */
	type MetricRow = {
		key: number;
		id?: string;
		name: string;
		measure: BaselineMeasure;
		amount: string;
		unit: DistanceUnit;
		label: string;
	};

	let nextKey = 0;

	function rowFrom(draft: BaselineMetricDraft): MetricRow {
		return {
			key: nextKey++,
			id: draft.id,
			name: draft.name,
			measure: draft.measure,
			amount:
				draft.measure === 'duration' ? durationInputText(draft.baseline) : String(draft.baseline),
			unit: draft.unit ?? 'mi',
			label: draft.label ?? '',
		};
	}

	function blankRow(): MetricRow {
		return { key: nextKey++, name: '', measure: 'count', amount: '', unit: 'mi', label: '' };
	}

	let name = $state(untrack(() => editing?.name ?? ''));
	let rows = $state<MetricRow[]>(
		untrack(() => {
			if (editing) return visibleMetrics(editing).map((m) => rowFrom(m));
			return [blankRow()];
		}),
	);
	let saving = $state(false);
	let showPresets = $state(untrack(() => editing === null));

	const titleId = $props.id();

	function amountOf(row: MetricRow): number | null {
		if (row.measure === 'duration') return parseDuration(row.amount);
		const n = Number(row.amount);
		return row.amount.trim() !== '' && Number.isFinite(n) ? n : null;
	}

	function rowValid(row: MetricRow): boolean {
		const amount = amountOf(row);
		if (row.name.trim().length === 0 || amount === null || amount <= 0) return false;
		if (row.measure === 'count' && row.label.trim().length === 0) return false;
		return true;
	}

	let valid = $derived(name.trim().length > 0 && rows.length > 0 && rows.every(rowValid));

	function applyPreset(preset: (typeof BASELINE_PRESETS)[number]) {
		name = preset.name;
		rows = preset.metrics.map((m) => rowFrom(m));
		showPresets = false;
	}

	function addMetric() {
		rows = [...rows, blankRow()];
	}

	function removeMetric(key: number) {
		rows = rows.filter((r) => r.key !== key);
	}

	function move(index: number, delta: -1 | 1) {
		const target = index + delta;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		rows = next;
	}

	function amountPlaceholder(measure: BaselineMeasure): string {
		if (measure === 'duration') return 'min or m:ss';
		if (measure === 'distance') return '0.5';
		return '10';
	}

	async function save() {
		if (!valid || saving) return;
		saving = true;
		try {
			const drafts: BaselineMetricDraft[] = rows.map((r) => ({
				id: r.id,
				name: r.name.trim(),
				measure: r.measure,
				baseline: amountOf(r) as number,
				unit: r.measure === 'distance' ? r.unit : undefined,
				label: r.measure === 'count' ? r.label.trim() : undefined,
			}));
			if (editing) {
				await baselineStore.updateBaseline(editing.id, { name: name.trim(), metrics: drafts });
			} else {
				await baselineStore.addBaseline({ name: name.trim(), metrics: drafts });
			}
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
		{#if editing}Edit Baseline{:else}New Baseline{/if}
	</DialogTitle>

	{#if showPresets && !editing}
		<div class="bf-presets">
			<FieldLabel>Start from an example</FieldLabel>
			<div class="bf-presets__grid">
				{#each BASELINE_PRESETS as preset (preset.name)}
					<button
						class="bf-preset-btn"
						onclick={() => applyPreset(preset)}>{preset.name}</button
					>
				{/each}
			</div>
			<button
				class="bf-presets__skip"
				onclick={() => (showPresets = false)}
			>
				Start from scratch
			</button>
		</div>
	{:else}
		<div class="bf-field">
			<FieldLabel
				for="baseline-name"
				hint="max 40 chars">Name</FieldLabel
			>
			<input
				id="baseline-name"
				class="bf-input"
				type="text"
				bind:value={name}
				placeholder="e.g. Daily 10, Reading, Bike ride"
				maxlength={40}
			/>
			<p class="bf-tip">
				Tip: word it so doing more is the win — "Phone locked away", not "Phone time under 30".
			</p>
		</div>

		<div class="bf-field">
			<FieldLabel hint="set it embarrassingly low">Your baseline</FieldLabel>

			{#each rows as row, i (row.key)}
				<fieldset class="bf-metric">
					<legend class="sr-only">Metric {i + 1}</legend>
					<div class="bf-metric__head">
						<input
							class="bf-input bf-metric__name"
							type="text"
							bind:value={row.name}
							placeholder="What, e.g. Pushups"
							maxlength={30}
							aria-label="Metric {i + 1} name"
						/>
						<div class="bf-metric__order">
							<button
								class="bf-icon-btn"
								onclick={() => move(i, -1)}
								disabled={i === 0}
								aria-label="Move metric {i + 1} up">↑</button
							>
							<button
								class="bf-icon-btn"
								onclick={() => move(i, 1)}
								disabled={i === rows.length - 1}
								aria-label="Move metric {i + 1} down">↓</button
							>
							{#if rows.length > 1}
								<button
									class="bf-icon-btn bf-icon-btn--remove"
									onclick={() => removeMetric(row.key)}
									aria-label="Remove metric {i + 1}">&times;</button
								>
							{/if}
						</div>
					</div>

					<div
						class="bf-measures"
						role="radiogroup"
						aria-label="Metric {i + 1} type"
					>
						{#each BASELINE_MEASURES as option (option.value)}
							<button
								class="bf-measure-btn"
								class:bf-measure-btn--active={row.measure === option.value}
								role="radio"
								aria-checked={row.measure === option.value}
								disabled={row.id !== undefined && row.measure !== option.value}
								title={option.desc}
								onclick={() => (row.measure = option.value)}>{option.label}</button
							>
						{/each}
					</div>

					<div class="bf-metric__amount">
						<input
							class="bf-input bf-input--amount"
							type="text"
							inputmode={row.measure === 'duration' ? 'text' : 'decimal'}
							bind:value={row.amount}
							placeholder={amountPlaceholder(row.measure)}
							aria-label="Metric {i + 1} baseline"
						/>
						{#if row.measure === 'duration'}
							<span class="bf-unit">minutes</span>
						{:else if row.measure === 'distance'}
							<select
								class="bf-input bf-input--unit"
								bind:value={row.unit}
								aria-label="Metric {i + 1} distance unit"
							>
								{#each DISTANCE_UNITS as unit (unit.value)}
									<option value={unit.value}>{unit.label}</option>
								{/each}
							</select>
						{:else}
							<input
								class="bf-input bf-input--unit"
								type="text"
								bind:value={row.label}
								placeholder="reps, words…"
								maxlength={20}
								aria-label="Metric {i + 1} count label"
							/>
						{/if}
					</div>
					{#if row.id !== undefined}
						<p class="bf-tip">Type is fixed once saved, so your history keeps its meaning.</p>
					{/if}
				</fieldset>
			{/each}

			<button
				class="bf-add-metric"
				onclick={addMetric}
			>
				+ Add a metric
			</button>
		</div>

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
	{/if}
</div>

<style>
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
		max-inline-size: 440px;
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

	.bf-field {
		margin-block-end: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.bf-input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		outline: none;
		min-inline-size: 0;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus {
			border-color: var(--color-accent);
		}
		&::placeholder {
			color: var(--color-text-muted);
		}
	}

	.bf-tip {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.bf-metric {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface-1);
	}

	.bf-metric__head,
	.bf-metric__amount {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.bf-metric__name {
		flex: 1;
	}

	.bf-metric__order {
		display: flex;
		gap: 4px;
	}

	.bf-icon-btn {
		flex-shrink: 0;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		line-height: 1;

		&:disabled {
			opacity: 0.35;
		}
	}

	.bf-icon-btn--remove:hover {
		color: var(--color-red);
	}

	.bf-measures {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
	}

	.bf-measure-btn {
		block-size: 34px;
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition: border-color var(--duration-fast) var(--ease-out);

		&:disabled {
			opacity: 0.35;
		}
	}

	.bf-measure-btn--active {
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	.bf-input--amount {
		flex: 0 0 110px;
		text-align: center;
	}

	.bf-input--unit {
		flex: 1;
	}

	.bf-unit {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	.bf-add-metric {
		align-self: flex-start;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent-text);
	}

	.bf-presets {
		padding-block-end: var(--space-2);
	}

	.bf-presets__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: var(--space-2);
		margin-block: var(--space-3) var(--space-4);
	}

	.bf-preset-btn {
		padding: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		text-align: center;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent-text);
		}
	}

	.bf-presets__skip {
		display: block;
		inline-size: 100%;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		font-weight: 600;
	}
</style>
