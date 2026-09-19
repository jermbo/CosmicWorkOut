<script lang="ts">
	import { untrack } from 'svelte';
	import type { Item } from '$lib/db/types';
	import { FOCUS_TAGS } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import { disciplineById, sectionMetric } from '$lib/discipline';
	import BottomSheet from './BottomSheet.svelte';
	import SheetHeader from './SheetHeader.svelte';

	type Props = {
		disciplineId: string;
		item?: Item | null;
		defaultSection?: string;
		onClose: () => void;
		onSave?: (item: Item) => void;
	};

	let { disciplineId, item = null, defaultSection, onClose, onSave }: Props = $props();

	let sections = $derived(disciplineById(disciplineId)?.sections ?? []);

	const snap = untrack(() => ({
		name: item?.name ?? '',
		cue: item?.cue ?? '',
		section: item?.section ?? defaultSection ?? sections[0]?.key ?? '',
		focus: item?.focus ?? ([] as string[]),
	}));

	let name = $state(snap.name);
	let cue = $state(snap.cue);
	let section = $state(snap.section);
	let focus = $state<string[]>([...snap.focus]);
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	function toggleFocus(tag: string) {
		if (focus.includes(tag)) {
			focus = focus.filter((f) => f !== tag);
		} else {
			focus = [...focus, tag];
		}
	}

	function metricHint(): string {
		if (sectionMetric(disciplineId, section) === 'check') return 'checkbox';
		return 'duration / reps';
	}

	function validate(): boolean {
		const e: Record<string, string> = {};
		if (!name.trim()) e.name = 'Name is required';
		if (focus.length === 0) e.focus = 'Pick at least one focus';
		errors = e;
		return Object.keys(e).length === 0;
	}

	async function handleSave() {
		if (!validate() || saving) return;
		saving = true;

		const metric = sectionMetric(disciplineId, section);
		let saved: Item;
		if (item) {
			const updated: Item = {
				...item,
				name: name.trim(),
				cue: cue.trim(),
				section,
				metric,
				focus: [...focus],
			};
			await programStore.updateItem(updated);
			saved = updated;
		} else {
			saved = await programStore.addItem({
				disciplineId,
				name: name.trim(),
				cue: cue.trim(),
				section,
				metric,
				focus: [...focus],
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
			title={item ? 'Edit Item' : 'New Item'}
			{onClose}
		/>

		<form
			class="item-form__body"
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
					for="item-name">Name</label
				>
				<input
					id="item-name"
					class="form-field__input"
					type="text"
					bind:value={name}
					placeholder="e.g. Hip Shimmy"
					autocomplete="off"
				/>
				{#if errors.name}<span class="form-field__error">{errors.name}</span>{/if}
			</div>

			<div class="form-field">
				<label
					class="field-label"
					for="item-cue">Cue <span class="field-hint">optional</span></label
				>
				<input
					id="item-cue"
					class="form-field__input"
					type="text"
					bind:value={cue}
					placeholder="e.g. Relax the knees, let it travel"
					autocomplete="off"
				/>
			</div>

			<div class="form-field">
				<span
					class="field-label"
					id="item-section-label">Section</span
				>
				<div
					class="chips"
					role="radiogroup"
					aria-labelledby="item-section-label"
				>
					{#each sections as s (s.key)}
						<button
							type="button"
							class="chip chip--caps"
							class:chip--active={section === s.key}
							role="radio"
							aria-checked={section === s.key}
							onclick={() => (section = s.key)}
						>
							{s.label}
						</button>
					{/each}
				</div>
				<span class="form-field__hint">Logged as: {metricHint()}</span>
			</div>

			<div
				class="form-field"
				class:form-field--error={errors.focus}
			>
				<span
					class="field-label"
					id="item-focus-label">Focus</span
				>
				<div
					class="chips"
					role="group"
					aria-labelledby="item-focus-label"
				>
					{#each FOCUS_TAGS as tag (tag)}
						<button
							type="button"
							class="chip chip--caps"
							class:chip--active={focus.includes(tag)}
							aria-pressed={focus.includes(tag)}
							onclick={() => toggleFocus(tag)}
						>
							{tag}
						</button>
					{/each}
				</div>
				{#if errors.focus}<span class="form-field__error">{errors.focus}</span>{/if}
			</div>

			<button
				type="submit"
				class="item-form__submit"
				disabled={saving}
				aria-busy={saving}
			>
				{#if saving}Saving…{:else if item}Save changes{:else}Add item{/if}
			</button>
		</form>
	</div>
</BottomSheet>

<style>
	.item-form__body {
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

	.form-field__hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
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

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.item-form__submit {
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
