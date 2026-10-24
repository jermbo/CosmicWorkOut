<script lang="ts">
	import { untrack } from 'svelte';
	import type { HealthReading, BloodPressureValues } from '$lib/db/types';
	import { healthStore } from '$lib/stores/health.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import SheetHeader from './SheetHeader.svelte';
	import SheetBody from './SheetBody.svelte';

	type Props = {
		date: string;
		editing?: (HealthReading & { values: BloodPressureValues }) | null;
		onClose: () => void;
	};

	let { date, editing = null, onClose }: Props = $props();

	let systolic = $state<number | null>(untrack(() => editing?.values.systolic ?? null));
	let diastolic = $state<number | null>(untrack(() => editing?.values.diastolic ?? null));
	let pulse = $state<number | null>(untrack(() => editing?.values.pulse ?? null));
	let saving = $state(false);
	let confirming = $state(false);

	let canSave = $derived(systolic !== null && systolic > 0 && diastolic !== null && diastolic > 0);

	async function handleSave() {
		if (saving || !canSave) return;
		saving = true;
		try {
			const values: BloodPressureValues = {
				systolic: systolic as number,
				diastolic: diastolic as number,
			};
			if (pulse !== null && pulse > 0) values.pulse = pulse;

			if (editing) {
				await healthStore.updateReading({ ...editing, values });
			} else {
				await healthStore.addBloodPressure(date, values);
			}
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
	maxHeight="70dvh"
>
	<SheetBody>
		<SheetHeader
			title={editing ? 'Edit Reading' : 'Log Blood Pressure'}
			{onClose}
		/>

		<div class="bp-sheet__body">
			<div class="bp-row">
				<label class="bp-field">
					<span class="bp-field__label">Systolic</span>
					<input
						class="bp-field__input"
						type="number"
						inputmode="numeric"
						min="1"
						max="300"
						placeholder="120"
						bind:value={systolic}
					/>
					<span class="bp-field__unit">mmHg</span>
				</label>
				<span
					class="bp-row__sep"
					aria-hidden="true">/</span
				>
				<label class="bp-field">
					<span class="bp-field__label">Diastolic</span>
					<input
						class="bp-field__input"
						type="number"
						inputmode="numeric"
						min="1"
						max="200"
						placeholder="80"
						bind:value={diastolic}
					/>
					<span class="bp-field__unit">mmHg</span>
				</label>
			</div>

			<label class="bp-field bp-field--full">
				<span class="bp-field__label">Pulse <span class="bp-field__optional">(optional)</span></span
				>
				<input
					class="bp-field__input"
					type="number"
					inputmode="numeric"
					min="1"
					max="300"
					placeholder="—"
					bind:value={pulse}
				/>
				<span class="bp-field__unit">bpm</span>
			</label>
		</div>

		<div class="bp-sheet__footer">
			<button
				class="bp-sheet__save-btn"
				onclick={handleSave}
				disabled={saving || !canSave}
				aria-busy={saving}
			>
				{#if saving}Saving…{:else if editing}Save changes{:else}Log reading{/if}
			</button>
			{#if editing}
				<button
					class="bp-sheet__delete-btn"
					class:bp-sheet__delete-btn--confirm={confirming}
					onclick={handleDelete}
				>
					{#if confirming}Tap to confirm delete{:else}Delete{/if}
				</button>
			{/if}
		</div>
	</SheetBody>
</BottomSheet>

<style>
	.bp-sheet__body {
		padding-inline: var(--space-4) calc(var(--space-4) + var(--press-offset));
		display: flex;
		flex-direction: column;
		gap: var(--card-gap);
	}

	/* Each reading is its own Health field row: label top-left, huge figure. */
	.bp-row {
		display: flex;
		flex-direction: column;
		gap: var(--card-gap);
	}

	.bp-row__sep {
		display: none;
	}

	.bp-field {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
		gap: var(--space-1) var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--field-health);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
	}

	.bp-field__label {
		grid-column: 1 / -1;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.bp-field__optional {
		font-weight: 500;
	}

	.bp-field__input {
		inline-size: 100%;
		min-inline-size: 0;
		block-size: 64px;
		padding: 0;
		background: transparent;
		border: none;
		border-block-end: var(--rule) solid transparent;
		font-family: var(--font-display);
		font-size: 3.25rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		line-height: 1;
		color: var(--color-ink);
		outline: none;
		-moz-appearance: textfield;
		appearance: textfield;

		&:focus {
			border-block-end-color: var(--color-ink);
		}
		&::placeholder {
			color: color-mix(in srgb, var(--color-ink) 35%, var(--field-health));
		}

		&::-webkit-inner-spin-button,
		&::-webkit-outer-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
	}

	.bp-field__unit {
		padding-block-end: var(--space-2);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.bp-sheet__footer {
		padding: var(--space-4) calc(var(--space-4) + var(--press-offset)) var(--space-4) var(--space-4);
		padding-block-end: max(var(--space-4), env(safe-area-inset-bottom));
		margin-block-start: var(--space-2);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	/* Big paper SAVE block with a Health-hued shadow. */
	.bp-sheet__save-btn {
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

		&:active:not(:disabled) {
			transform: translate(var(--press-offset), var(--press-offset));
			box-shadow: none;
		}

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
	}

	.bp-sheet__delete-btn {
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

	.bp-sheet__delete-btn--confirm {
		background: var(--color-red);
		color: var(--color-ink);
	}
</style>
