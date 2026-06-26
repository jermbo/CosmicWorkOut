<script lang="ts">
	import { untrack } from 'svelte';
	import type { HealthReading, WeightValues } from '$lib/db/types';
	import { healthStore } from '$lib/stores/health.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import BottomSheet from './BottomSheet.svelte';

	type Props = {
		date: string;
		editing?: (HealthReading & { values: WeightValues }) | null;
		onClose: () => void;
	};

	let { date, editing = null, onClose }: Props = $props();

	let value = $state<number | null>(untrack(() => editing?.values.value ?? null));
	let saving = $state(false);
	let confirming = $state(false);

	let unit = $derived(prefsStore.weightUnit);
	let canSave = $derived(value !== null && value > 0);

	function adjust(delta: number) {
		const base = value ?? 0;
		value = Math.round(Math.max(0, base + delta) * 10) / 10;
	}

	async function handleSave() {
		if (saving || !canSave) return;
		saving = true;
		try {
			await healthStore.logWeight(date, value as number);
			onClose();
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!editing) return;
		if (!confirming) {
			confirming = true;
			return;
		}
		try {
			await healthStore.deleteReading(editing.id);
			onClose();
		} catch {
			confirming = false;
		}
	}
</script>

<BottomSheet onclose={onClose} maxHeight="60dvh">
	<div class="wt-sheet">
		<div class="wt-sheet__header">
			<h2 class="wt-sheet__title">
				{#if editing}Edit Weight{:else}Log Weight{/if}
			</h2>
			<button class="wt-sheet__close" onclick={onClose} aria-label="Close">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="wt-sheet__body">
			<div class="wt-stepper" aria-label="Weight in {unit}">
				<button onclick={() => adjust(-0.5)} aria-label="Decrease half {unit}">−</button>
				<div class="wt-stepper__val">
					<input
						class="wt-stepper__input"
						type="number"
						inputmode="decimal"
						min="0"
						step="0.1"
						placeholder="0"
						bind:value
						aria-label="Weight"
					/>
					<span class="wt-stepper__unit">{unit}</span>
				</div>
				<button onclick={() => adjust(0.5)} aria-label="Increase half {unit}">+</button>
			</div>
		</div>

		<div class="wt-sheet__footer">
			<button class="wt-sheet__save-btn" onclick={handleSave} disabled={saving || !canSave} aria-busy={saving}>
				{#if saving}Saving…{:else if editing}Save changes{:else}Log weight{/if}
			</button>
			{#if editing}
				<button class="wt-sheet__delete-btn" class:wt-sheet__delete-btn--confirm={confirming} onclick={handleDelete}>
					{#if confirming}Tap to confirm delete{:else}Delete{/if}
				</button>
			{/if}
		</div>
	</div>
</BottomSheet>

<style>
	.wt-sheet {
		display: flex;
		flex-direction: column;
		padding-block-start: var(--space-2);
	}

	.wt-sheet__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--space-5);
		padding-block-end: var(--space-4);
	}

	.wt-sheet__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.wt-sheet__close {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);

		svg {
			inline-size: 16px;
			block-size: 16px;
		}
	}

	.wt-sheet__body {
		padding-inline: var(--space-5);
	}

	.wt-stepper {
		display: flex;
		align-items: stretch;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		block-size: 72px;

		> button {
			inline-size: 64px;
			font-size: 1.75rem;
			color: var(--color-text-secondary);
			transition: background-color var(--duration-fast) var(--ease-out);

			&:hover {
				background: var(--color-surface-3);
			}
		}
	}

	.wt-stepper__val {
		flex: 1;
		align-self: stretch;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-inline-size: 0;
		padding-inline: var(--space-2);
	}

	.wt-stepper__input {
		inline-size: 5ch;
		field-sizing: content;
		min-inline-size: 2ch;
		max-inline-size: 100%;
		background: transparent;
		border: none;
		outline: none;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
		-moz-appearance: textfield;
		appearance: textfield;

		&::placeholder {
			color: var(--color-text-muted);
		}

		&::-webkit-inner-spin-button,
		&::-webkit-outer-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
	}

	.wt-stepper__unit {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.wt-sheet__footer {
		padding: var(--space-4) var(--space-5);
		padding-block-end: max(var(--space-4), env(safe-area-inset-bottom));
		border-block-start: 1px solid var(--color-border);
		margin-block-start: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.wt-sheet__save-btn {
		inline-size: 100%;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 1rem;
		font-weight: 700;
		transition: opacity var(--duration-fast) var(--ease-out);

		&:disabled {
			opacity: 0.6;
			cursor: default;
		}
	}

	.wt-sheet__delete-btn {
		inline-size: 100%;
		block-size: 44px;
		border-radius: var(--radius-full);
		background: transparent;
		border: 1px solid color-mix(in srgb, #ef4444 40%, transparent);
		color: #ef4444;
		font-size: 0.9375rem;
		font-weight: 600;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.wt-sheet__delete-btn--confirm {
		background: color-mix(in srgb, #ef4444 12%, transparent);
		border-color: #ef4444;
	}
</style>
