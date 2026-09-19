<script lang="ts">
	import { untrack } from 'svelte';
	import type { Item, ItemCat, WeightUnit } from '$lib/db/types';
	import { STRENGTH_CATS } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import SheetHeader from './SheetHeader.svelte';

	const CATS: ItemCat[] = [...STRENGTH_CATS];
	const UNITS: WeightUnit[] = ['lb', 'kg', 'bodyweight', 'band'];

	type Props = {
		exercise?: Item | null;
		onClose: () => void;
		onSave?: (ex: Item) => void;
	};

	let { exercise = null, onClose, onSave }: Props = $props();

	const WEIGHT_INCREMENTS = [2.5, 5, 10];

	const snap = untrack(() => ({
		name: exercise?.name ?? '',
		cue: exercise?.cue ?? '',
		muscles: exercise?.muscles ?? '',
		cat: exercise?.cat ?? ('Chest' as ItemCat),
		unit: exercise?.unit ?? ('lb' as WeightUnit),
		defaultSets: exercise?.defaultSets ?? 3,
		defaultReps: exercise?.defaultReps ?? '8-10',
		weightIncrement: exercise?.weightIncrement ?? 5,
	}));

	let name = $state(snap.name);
	let cue = $state(snap.cue);
	let muscles = $state(snap.muscles);
	let cat = $state<ItemCat>(snap.cat);
	let unit = $state<WeightUnit>(snap.unit);
	let defaultSets = $state(snap.defaultSets);
	let defaultReps = $state(snap.defaultReps);
	let weightIncrement = $state(snap.weightIncrement);
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	function incrementForUnit(): number | undefined {
		if (unit === 'lb' || unit === 'kg') return weightIncrement;
		return undefined;
	}

	function validate(): boolean {
		const e: Record<string, string> = {};
		if (!name.trim()) e.name = 'Name is required';
		if (!muscles.trim()) e.muscles = 'Muscles worked is required';
		errors = e;
		return Object.keys(e).length === 0;
	}

	async function handleSave() {
		if (!validate() || saving) return;
		saving = true;

		let saved: Item;
		const inc = incrementForUnit();
		if (exercise) {
			const updated: Item = {
				...exercise,
				name: name.trim(),
				cue: cue.trim(),
				muscles: muscles.trim(),
				cat,
				unit,
				defaultSets,
				defaultReps,
				weightIncrement: inc,
			};
			await programStore.updateItem(updated);
			saved = updated;
		} else {
			saved = await programStore.addItem({
				name: name.trim(),
				cue: cue.trim(),
				muscles: muscles.trim(),
				cat,
				unit,
				defaultSets,
				defaultReps,
				weightIncrement: inc,
			});
		}

		saving = false;
		onSave?.(saved);
		onClose();
	}
</script>

<BottomSheet
	onclose={onClose}
	maxHeight="92dvh"
>
	<div class="sheet-body">
		<SheetHeader
			title={exercise ? 'Edit Exercise' : 'New Exercise'}
			{onClose}
		/>

		<form
			class="ex-form__body"
			onsubmit={(e) => {
				e.preventDefault();
				handleSave();
			}}
		>
			<div
				class="form-field"
				class:form-field--error={errors.name}
			>
				<label
					class="field-label"
					for="ex-name">Name</label
				>
				<input
					id="ex-name"
					class="form-field__input"
					type="text"
					bind:value={name}
					placeholder="e.g. Romanian Deadlift"
					autocomplete="off"
				/>
				{#if errors.name}<span class="form-field__error">{errors.name}</span>{/if}
			</div>

			<div class="form-field">
				<label
					class="field-label"
					for="ex-cue">Coaching cue <span class="field-hint">optional</span></label
				>
				<input
					id="ex-cue"
					class="form-field__input"
					type="text"
					bind:value={cue}
					placeholder="e.g. Hinge at hips, proud chest"
					autocomplete="off"
				/>
			</div>

			<div
				class="form-field"
				class:form-field--error={errors.muscles}
			>
				<label
					class="field-label"
					for="ex-muscles">Muscles worked</label
				>
				<input
					id="ex-muscles"
					class="form-field__input"
					type="text"
					bind:value={muscles}
					placeholder="e.g. Hamstrings, glutes"
					autocomplete="off"
				/>
				{#if errors.muscles}<span class="form-field__error">{errors.muscles}</span>{/if}
			</div>

			<div class="form-field">
				<span
					class="field-label"
					id="ex-cat-label">Category</span
				>
				<div
					class="cat-chips"
					role="radiogroup"
					aria-labelledby="ex-cat-label"
				>
					{#each CATS as c (c)}
						<button
							type="button"
							class="chip"
							class:chip--active={cat === c}
							role="radio"
							aria-checked={cat === c}
							onclick={() => (cat = c)}>{c}</button
						>
					{/each}
				</div>
			</div>

			<div class="form-row">
				<div class="form-field">
					<span
						class="field-label"
						id="ex-unit-label">Weight type</span
					>
					<div
						class="seg-control"
						role="radiogroup"
						aria-labelledby="ex-unit-label"
					>
						{#each UNITS as u (u)}
							<button
								type="button"
								class="seg-control__btn"
								class:seg-control__btn--active={unit === u}
								role="radio"
								aria-checked={unit === u}
								onclick={() => (unit = u)}>{u}</button
							>
						{/each}
					</div>
				</div>
			</div>

			<div class="form-row">
				<div class="form-field">
					<label
						class="field-label"
						for="ex-sets">Default sets</label
					>
					<div class="stepper">
						<button
							type="button"
							onclick={() => {
								if (defaultSets > 1) defaultSets--;
							}}
							aria-label="Decrease sets">−</button
						>
						<span id="ex-sets">{defaultSets}</span>
						<button
							type="button"
							onclick={() => {
								if (defaultSets < 8) defaultSets++;
							}}
							aria-label="Increase sets">+</button
						>
					</div>
				</div>
				<div class="form-field">
					<label
						class="field-label"
						for="ex-reps">Default reps</label
					>
					<input
						id="ex-reps"
						class="form-field__input"
						type="text"
						bind:value={defaultReps}
						placeholder="e.g. 8-10"
					/>
				</div>
			</div>

			{#if unit === 'lb' || unit === 'kg'}
				<div class="form-field">
					<span
						class="field-label"
						id="ex-increment-label">Weight increment ({unit})</span
					>
					<div
						class="seg-control"
						role="radiogroup"
						aria-labelledby="ex-increment-label"
					>
						{#each WEIGHT_INCREMENTS as inc (inc)}
							<button
								type="button"
								class="seg-control__btn"
								class:seg-control__btn--active={weightIncrement === inc}
								role="radio"
								aria-checked={weightIncrement === inc}
								onclick={() => (weightIncrement = inc)}>{inc}</button
							>
						{/each}
					</div>
				</div>
			{/if}

			<button
				type="submit"
				class="ex-form__submit"
				disabled={saving}
				aria-busy={saving}
			>
				{#if saving}Saving…{:else if exercise}Save changes{:else}Add exercise{/if}
			</button>
		</form>
	</div>
</BottomSheet>

<style>
	.ex-form__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-inline: var(--space-5);
		overflow-y: auto;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-field--error .form-field__input {
		border-color: var(--color-red);
	}

	.form-field__input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 0.9375rem;
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

	.form-field__error {
		font-size: 0.75rem;
		color: var(--color-red);
	}

	.cat-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.form-row {
		display: flex;
		gap: var(--space-4);

		.form-field {
			flex: 1;
		}
	}

	.seg-control {
		display: flex;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 3px;
		gap: 3px;
	}

	.seg-control__btn {
		flex: 1;
		block-size: 34px;
		border-radius: calc(var(--radius-md) - 4px);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.seg-control__btn--active {
		background: var(--color-surface-2);
		color: var(--color-text-primary);
	}

	.stepper {
		display: flex;
		align-items: center;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		block-size: 44px;

		button {
			inline-size: 44px;
			font-size: 1.25rem;
			color: var(--color-text-secondary);
			transition: background-color var(--duration-fast) var(--ease-out);

			&:hover {
				background: var(--color-surface-2);
			}
		}

		span {
			flex: 1;
			text-align: center;
			font-family: var(--font-mono);
			font-size: 1.125rem;
			font-weight: 700;
		}
	}

	.ex-form__submit {
		block-size: 52px;
		border-radius: var(--radius-lg);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 1rem;
		font-weight: 700;
		margin-block-start: var(--space-2);
		transition: opacity var(--duration-fast) var(--ease-out);

		&:disabled {
			opacity: 0.6;
			cursor: default;
		}
	}
</style>
