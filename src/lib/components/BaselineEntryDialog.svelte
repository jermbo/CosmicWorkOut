<script lang="ts">
	import { untrack } from 'svelte';
	import type { Baseline } from '$lib/db/types';
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
	<DialogTitle id={titleId}>
		{#if mode === 'edit'}Edit entry{:else}{baseline.name}{/if}
	</DialogTitle>

	{#each baseline.metrics as metric (metric.id)}
		<div class="bed-field">
			<FieldLabel
				for="bed-{metric.id}"
				hint="target {metric.target}">{metric.label}</FieldLabel
			>
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
