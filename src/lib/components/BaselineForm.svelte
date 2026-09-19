<script lang="ts">
	import { untrack } from 'svelte';
	import type { Baseline, BaselineDirection } from '$lib/db/types';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { BASELINE_DIRECTIONS, BASELINE_PRESETS } from '$lib/baselines/logic';

	type Props = {
		editing?: Baseline | null;
		onclose: () => void;
	};

	let { editing = null, onclose }: Props = $props();

	type MetricDraft = { label: string; target: number | undefined };

	let name = $state(untrack(() => editing?.name ?? ''));
	let direction = $state<BaselineDirection>(untrack(() => editing?.direction ?? 'up'));
	let metrics = $state<MetricDraft[]>(
		untrack(() => {
			if (editing) return editing.metrics.map((m) => ({ label: m.label, target: m.target }));
			return [{ label: '', target: undefined }];
		}),
	);
	let saving = $state(false);
	let showPresets = $state(untrack(() => editing === null));

	const titleId = $props.id();

	/** Metric count is fixed at creation so existing logs keep matching their metric. */
	let metricCountLocked = $derived(editing !== null);

	let valid = $derived(
		name.trim().length > 0 &&
			metrics.every((m) => m.label.trim().length > 0 && m.target !== undefined && m.target > 0),
	);

	function applyPreset(preset: (typeof BASELINE_PRESETS)[number]) {
		name = preset.name;
		direction = preset.direction;
		metrics = preset.metrics.map((m) => ({ label: m.label, target: m.target }));
		showPresets = false;
	}

	function addMetric() {
		metrics = [...metrics, { label: '', target: undefined }];
	}

	function removeMetric(index: number) {
		metrics = metrics.filter((_, i) => i !== index);
	}

	async function save() {
		if (!valid || saving) return;
		saving = true;
		try {
			const drafts = metrics.map((m) => ({ label: m.label.trim(), target: m.target as number }));
			if (editing) {
				await baselineStore.updateBaseline(editing.id, {
					name: name.trim(),
					direction,
					metrics: drafts,
				});
			} else {
				await baselineStore.addBaseline({ name: name.trim(), direction, metrics: drafts });
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
	<p
		class="modal-title"
		id={titleId}
	>
		{#if editing}Edit Baseline{:else}New Baseline{/if}
	</p>

	{#if showPresets && !editing}
		<div class="bf-presets">
			<p class="field-label">Start from a preset</p>
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
			<label
				class="field-label"
				for="baseline-name">Name <span class="field-hint">max 40 chars</span></label
			>
			<input
				id="baseline-name"
				class="bf-input"
				type="text"
				bind:value={name}
				placeholder="e.g. Walking"
				maxlength={40}
			/>
		</div>

		<div class="bf-field">
			<span class="field-label">Direction</span>
			<div class="bf-directions">
				{#each BASELINE_DIRECTIONS as option (option.value)}
					<button
						class="bf-direction-btn"
						class:bf-direction-btn--active={direction === option.value}
						onclick={() => (direction = option.value)}
						aria-pressed={direction === option.value}
					>
						<span class="bf-direction-btn__label">{option.label}</span>
						<span class="bf-direction-btn__desc">{option.desc}</span>
					</button>
				{/each}
			</div>
		</div>

		<div class="bf-field">
			<span class="field-label">
				Daily target
				{#if metricCountLocked}
					<span class="field-hint">metric count locked after creation</span>
				{:else}
					<span class="field-hint">one or two metrics</span>
				{/if}
			</span>

			{#each metrics as metric, i (i)}
				<div class="bf-metric">
					<input
						class="bf-input bf-input--target"
						type="number"
						bind:value={metric.target}
						placeholder="30"
						min="0"
						step="any"
						aria-label="Target for metric {i + 1}"
					/>
					<input
						class="bf-input"
						type="text"
						bind:value={metric.label}
						placeholder="unit, e.g. minutes"
						maxlength={20}
						aria-label="Unit label for metric {i + 1}"
					/>
					{#if !metricCountLocked && metrics.length > 1}
						<button
							class="bf-metric__remove"
							onclick={() => removeMetric(i)}
							aria-label="Remove metric {i + 1}">&times;</button
						>
					{/if}
				</div>
			{/each}

			{#if !metricCountLocked && metrics.length < 2}
				<button
					class="bf-add-metric"
					onclick={addMetric}
				>
					Add a second metric
				</button>
			{/if}
		</div>

		<div class="modal__actions">
			<button
				class="btn btn--grow btn--ghost"
				onclick={onclose}
				disabled={saving}>Cancel</button
			>
			<button
				class="btn btn--grow btn--primary"
				onclick={save}
				disabled={!valid || saving}
			>
				{#if saving}Saving…{:else}Save{/if}
			</button>
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

	.bf-directions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.bf-direction-btn {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.bf-direction-btn--active {
		border-color: var(--color-accent);
	}

	.bf-direction-btn__label {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.bf-direction-btn__desc {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.bf-metric {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.bf-input--target {
		flex: 0 0 90px;
		text-align: center;
	}

	.bf-metric .bf-input:not(.bf-input--target) {
		flex: 1;
	}

	.bf-metric__remove {
		flex-shrink: 0;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 1.125rem;
		line-height: 1;

		&:hover {
			color: var(--color-red);
		}
	}

	.bf-add-metric {
		align-self: flex-start;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
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
			color: var(--color-accent);
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
