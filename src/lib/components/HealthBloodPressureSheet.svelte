<script lang="ts">
	import { untrack } from 'svelte';
	import type { HealthReading, BloodPressureValues } from '$lib/db/types';
	import { healthStore } from '$lib/stores/health.svelte';
	import BottomSheet from './BottomSheet.svelte';

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

<BottomSheet onclose={onClose} maxHeight="70dvh">
	<div class="bp-sheet">
		<div class="bp-sheet__header">
			<h2 class="bp-sheet__title">
				{#if editing}Edit Reading{:else}Log Blood Pressure{/if}
			</h2>
			<button class="bp-sheet__close" onclick={onClose} aria-label="Close">
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
				<span class="bp-row__sep" aria-hidden="true">/</span>
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
				<span class="bp-field__label">Pulse <span class="bp-field__optional">(optional)</span></span>
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
			<button class="bp-sheet__save-btn" onclick={handleSave} disabled={saving || !canSave} aria-busy={saving}>
				{#if saving}Saving…{:else if editing}Save changes{:else}Log reading{/if}
			</button>
			{#if editing}
				<button class="bp-sheet__delete-btn" class:bp-sheet__delete-btn--confirm={confirming} onclick={handleDelete}>
					{#if confirming}Tap to confirm delete{:else}Delete{/if}
				</button>
			{/if}
		</div>
	</div>
</BottomSheet>

<style>
	.bp-sheet {
		display: flex;
		flex-direction: column;
		padding-block-start: var(--space-2);
	}

	.bp-sheet__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--space-5);
		padding-block-end: var(--space-4);
	}

	.bp-sheet__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.bp-sheet__close {
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

	.bp-sheet__body {
		padding-inline: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.bp-row {
		display: flex;
		align-items: flex-end;
		gap: var(--space-3);
	}

	.bp-row__sep {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-muted);
		padding-block-end: var(--space-3);
	}

	.bp-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1;
		min-inline-size: 0;
	}

	.bp-field__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
	}

	.bp-field__optional {
		text-transform: none;
		letter-spacing: 0;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.bp-field__input {
		block-size: 56px;
		inline-size: 100%;
		padding-inline: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: 1.5rem;
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
		}
	}

	.bp-field__unit {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		text-align: center;
	}

	.bp-sheet__footer {
		padding: var(--space-4) var(--space-5);
		padding-block-end: max(var(--space-4), env(safe-area-inset-bottom));
		border-block-start: 1px solid var(--color-border);
		margin-block-start: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.bp-sheet__save-btn {
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

	.bp-sheet__delete-btn {
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

	.bp-sheet__delete-btn--confirm {
		background: color-mix(in srgb, #ef4444 12%, transparent);
		border-color: #ef4444;
	}
</style>
