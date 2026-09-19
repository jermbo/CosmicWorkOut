<script lang="ts">
	import { untrack } from 'svelte';
	import type { Baseline } from '$lib/db/types';

	type Props = {
		baseline: Baseline;
		/** metricId → value; prefills the fields for an edit or a repeat of the last entry. */
		initialValues?: Record<string, number>;
		mode: 'add' | 'edit';
		onsave: (values: Record<string, number>) => void | Promise<void>;
		onclose: () => void;
	};

	let { baseline, initialValues = {}, mode, onsave, onclose }: Props = $props();

	let values = $state<Record<string, number | undefined>>(
		untrack(() => {
			const seed: Record<string, number | undefined> = {};
			for (const metric of baseline.metrics) seed[metric.id] = initialValues[metric.id];
			return seed;
		}),
	);
	let saving = $state(false);

	const titleId = $props.id();

	/** At least one metric must carry a number, so an entry always means something. */
	let valid = $derived(baseline.metrics.some((m) => typeof values[m.id] === 'number'));

	async function save() {
		if (!valid || saving) return;
		saving = true;
		try {
			const payload: Record<string, number> = {};
			for (const metric of baseline.metrics) {
				const v = values[metric.id];
				if (typeof v === 'number') payload[metric.id] = v;
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
	<p
		class="modal__title"
		id={titleId}
	>
		{#if mode === 'edit'}Edit entry{:else}{baseline.name}{/if}
	</p>

	{#each baseline.metrics as metric (metric.id)}
		<div class="bed-field">
			<label
				class="bed-label"
				for="bed-{metric.id}"
			>
				{metric.label}
				<span class="bed-hint">target {metric.target}</span>
			</label>
			<input
				id="bed-{metric.id}"
				class="bed-input"
				type="number"
				inputmode="decimal"
				bind:value={values[metric.id]}
				min="0"
				step="any"
				placeholder="0"
			/>
		</div>
	{/each}

	<div class="modal__actions">
		<button
			class="modal__btn modal__btn--ghost"
			onclick={onclose}
			disabled={saving}>Cancel</button
		>
		<button
			class="modal__btn modal__btn--primary"
			onclick={save}
			disabled={!valid || saving}
		>
			{#if saving}Saving…{:else}Save{/if}
		</button>
	</div>
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

	.modal__title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-4);
	}

	.modal__actions {
		display: flex;
		gap: var(--space-2);
		margin-block-start: var(--space-4);
	}

	.modal__btn {
		flex: 1;
		min-block-size: 48px;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.modal__btn--ghost {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
	}

	.modal__btn--primary {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.bed-field {
		margin-block-end: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.bed-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.bed-hint {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: var(--color-text-muted);
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
