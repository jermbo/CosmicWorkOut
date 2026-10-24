<script lang="ts">
	import { holdRepeat } from '$lib/feedback/holdRepeat';
	import { untrack } from 'svelte';
	import type { HealthReading, WeightValues } from '$lib/db/types';
	import { healthStore } from '$lib/stores/health.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import SheetHeader from './SheetHeader.svelte';
	import SheetBody from './SheetBody.svelte';

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

<BottomSheet
	onclose={onClose}
	maxHeight="60dvh"
>
	<SheetBody>
		<SheetHeader
			title={editing ? 'Edit Weight' : 'Log Weight'}
			{onClose}
		/>

		<div class="wt-sheet__body">
			<div
				class="wt-stepper"
				aria-label="Weight in {unit}"
			>
				<button
					onclick={() => adjust(-0.5)}
					use:holdRepeat={() => adjust(-0.5)}
					aria-label="Decrease half {unit}">−</button
				>
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
				<button
					onclick={() => adjust(0.5)}
					use:holdRepeat={() => adjust(0.5)}
					aria-label="Increase half {unit}">+</button
				>
			</div>
		</div>

		<div class="wt-sheet__footer">
			<button
				class="wt-sheet__save-btn"
				data-feedback="success"
				onclick={handleSave}
				disabled={saving || !canSave}
				aria-busy={saving}
			>
				{#if saving}Saving…{:else if editing}Save changes{:else}Log weight{/if}
			</button>
			{#if editing}
				<button
					class="wt-sheet__delete-btn"
					data-feedback="warn"
					class:wt-sheet__delete-btn--confirm={confirming}
					onclick={handleDelete}
				>
					{#if confirming}Tap to confirm delete{:else}Delete{/if}
				</button>
			{/if}
		</div>
	</SheetBody>
</BottomSheet>

<style>
	.wt-sheet__body {
		padding-inline: var(--space-4) calc(var(--space-4) + var(--press-offset));
	}

	/* The Health field: − | huge figure | + , split by ink rules. */
	.wt-stepper {
		display: grid;
		grid-template-columns: 64px minmax(0, 1fr) 64px;
		background: var(--field-health);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
		block-size: 112px;

		> button {
			font-family: var(--font-display);
			font-size: 1.75rem;
			font-weight: 800;
			color: var(--color-ink);

			&:first-child {
				border-inline-end: var(--rule) solid var(--color-ink);
			}

			&:last-child {
				border-inline-start: var(--rule) solid var(--color-ink);
			}

			&:active {
				background: var(--color-ink);
				color: var(--field-health);
			}
		}
	}

	.wt-stepper__val {
		display: flex;
		align-items: flex-end;
		justify-content: flex-start;
		gap: 6px;
		min-inline-size: 0;
		padding: var(--space-2) var(--space-3);
	}

	.wt-stepper__input {
		inline-size: 5ch;
		field-sizing: content;
		min-inline-size: 2ch;
		max-inline-size: 100%;
		background: transparent;
		border: none;
		outline: none;
		font-family: var(--font-display);
		font-size: 3rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		line-height: 1;
		color: var(--color-ink);
		-moz-appearance: textfield;
		appearance: textfield;

		&::placeholder {
			color: color-mix(in srgb, var(--color-ink) 35%, var(--field-health));
		}

		&::-webkit-inner-spin-button,
		&::-webkit-outer-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
	}

	.wt-stepper__unit {
		padding-block-end: 6px;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.wt-sheet__footer {
		padding: var(--space-4) calc(var(--space-4) + var(--press-offset)) var(--space-4) var(--space-4);
		padding-block-end: max(var(--space-4), env(safe-area-inset-bottom));
		margin-block-start: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	/* Big paper SAVE block with a Health-hued shadow. */
	.wt-sheet__save-btn {
		inline-size: 100%;
		block-size: 72px;
		background: var(--color-paper);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
		box-shadow: var(--press-offset) var(--press-offset) 0 var(--field-health);
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 900;
		text-transform: uppercase;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
	}

	.wt-sheet__delete-btn {
		inline-size: 100%;
		block-size: 48px;
		background: transparent;
		border: var(--rule) solid var(--color-red);
		color: var(--color-red);
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	.wt-sheet__delete-btn--confirm {
		background: var(--color-red);
		color: var(--color-ink);
	}
</style>
