<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { Program, Routine, RoutineItem, RoutineSection, Item } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import { disciplineById, routineALetter } from '$lib/discipline';
	import LibrarySheet from './LibrarySheet.svelte';
	import { danceLibrary } from '$lib/itemLibrary';
	import Icon from './Icon.svelte';
	import FieldLabel from './FieldLabel.svelte';

	type Props = {
		program: Program;
		routine: Routine;
		onBack: () => void;
	};

	let { program, routine, onBack }: Props = $props();

	type EditItem = RoutineItem & { _key: number };
	type EditSection = {
		key: string;
		label: string;
		isBookend: boolean;
		inherits: boolean;
		items: EditItem[];
	};

	let isRoutineA = $derived(routine.letter === 'A');

	let keyCounter = 0;
	function withKeys(items: RoutineItem[]): EditItem[] {
		return items.map((it) => ({ ...it, _key: keyCounter++ }));
	}

	const snap = untrack(() => {
		const discSections = disciplineById(routine.disciplineId)?.sections ?? [];
		const routineA = routineALetter(program);
		return {
			name: routine.name,
			focus: routine.focus ?? '',
			sections: discSections.map((s): EditSection => {
				const isA = routine.letter === 'A';
				const own = routine.sections.find((rs) => rs.key === s.key);
				const inherits = !!s.isBookend && !isA && own?.overridesBookends !== true;
				const items = inherits
					? (routineA?.sections.find((rs) => rs.key === s.key)?.items ?? [])
					: (own?.items ?? []);
				return {
					key: s.key,
					label: s.label,
					isBookend: !!s.isBookend,
					inherits,
					items: withKeys(items),
				};
			}),
		};
	});

	let name = $state(snap.name);
	let focus = $state(snap.focus);
	let sections = $state<EditSection[]>(snap.sections);
	let saving = $state(false);
	let librarySection = $state<string | null>(null);

	function move(secIdx: number, i: number, dir: number) {
		const items = sections[secIdx].items;
		const j = i + dir;
		if (j < 0 || j >= items.length) return;
		const arr = items.slice();
		[arr[i], arr[j]] = [arr[j], arr[i]];
		sections[secIdx].items = arr;
	}

	function remove(secIdx: number, i: number) {
		sections[secIdx].items = sections[secIdx].items.filter((_, idx) => idx !== i);
	}

	function addFromLibrary(secKey: string, item: Item) {
		const idx = sections.findIndex((s) => s.key === secKey);
		if (idx < 0) return;
		sections[idx].items = [...sections[idx].items, { itemId: item.id, _key: keyCounter++ }];
		librarySection = null;
	}

	function customizeBookend(secIdx: number) {
		sections[secIdx].inherits = false;
	}

	function resetBookend(secIdx: number) {
		const routineA = routineALetter(program);
		const inheritedItems =
			routineA?.sections.find((rs) => rs.key === sections[secIdx].key)?.items ?? [];
		sections[secIdx].inherits = true;
		sections[secIdx].items = withKeys(inheritedItems);
	}

	async function handleSave() {
		if (saving) return;
		saving = true;
		try {
			const cleanSections: RoutineSection[] = sections.map((s) => {
				const overrides = s.isBookend && !isRoutineA && !s.inherits;
				const inheritsBookend = s.inherits && s.isBookend && !isRoutineA;
				const section: RoutineSection = {
					key: s.key,
					items: [],
				};
				if (!inheritsBookend) {
					section.items = s.items.map((item) => {
						const { _key: _itemKey, ...rest } = item;
						void _itemKey;
						return rest;
					});
				}
				if (overrides) {
					section.overridesBookends = true;
				}
				return section;
			});

			await programStore.saveRoutineSections(program.id, routine.name, {
				name: name.trim() || routine.name,
				focus: focus.trim(),
				color: routine.color,
				sections: cleanSections,
			});

			onBack();
		} finally {
			saving = false;
		}
	}

	let dialog: HTMLDialogElement;
	onMount(() => dialog.showModal());

	function itemName(id: string): string {
		return programStore.getItemById(id)?.name ?? 'Unknown item';
	}
</script>

<dialog
	bind:this={dialog}
	class="dance-editor"
	oncancel={(e) => {
		e.preventDefault();
		onBack();
	}}
	aria-labelledby="dance-editor-title"
	aria-modal="true"
>
	<div class="dance-editor__inner">
		<div class="dance-editor__top">
			<button
				class="icon-btn"
				onclick={onBack}
				aria-label="Back"
			>
				<Icon
					name="chevron-left"
					size={20}
					stroke={2.5}
				/>
			</button>
			<span class="dance-editor__letter">{routine.letter ?? '?'}</span>
			<h2
				class="dance-editor__title"
				id="dance-editor-title"
			>
				Edit Routine
			</h2>
			<button
				class="dance-editor__save"
				onclick={handleSave}
				disabled={saving}
				aria-busy={saving}
			>
				{#if saving}Saving…{:else}Save{/if}
			</button>
		</div>

		<div class="dance-editor__body">
			<div class="dance-field">
				<FieldLabel for="dance-name">Name</FieldLabel>
				<input
					id="dance-name"
					class="dance-field__input"
					type="text"
					bind:value={name}
					autocomplete="off"
				/>
			</div>
			<div class="dance-field">
				<FieldLabel
					for="dance-focus"
					hint="optional">Focus</FieldLabel
				>
				<input
					id="dance-focus"
					class="dance-field__input"
					type="text"
					bind:value={focus}
					placeholder="e.g. Hip isolations & shimmies"
					autocomplete="off"
				/>
			</div>

			{#each sections as section, secIdx (section.key)}
				<section class="sec">
					<div class="sec__head">
						<h3 class="sec__title">{section.label}</h3>
						{#if section.isBookend && !isRoutineA}
							{#if section.inherits}
								<span class="sec__badge sec__badge--inherited">Inherited from A</span>
							{:else}
								<span class="sec__badge sec__badge--custom">Custom</span>
							{/if}
						{/if}
					</div>

					{#if section.inherits}
						<ul
							class="sec__list sec__list--readonly"
							aria-label="{section.label} items (inherited)"
						>
							{#if section.items.length === 0}
								<li class="sec__empty">
									Routine A has no {section.label.toLowerCase()} items yet.
								</li>
							{/if}
							{#each section.items as it (it._key)}
								<li class="sec__row sec__row--readonly">
									{itemName(it.itemId)}
								</li>
							{/each}
						</ul>
						<button
							class="sec__bookend-btn"
							onclick={() => customizeBookend(secIdx)}>Customize for this routine</button
						>
					{:else}
						<ul
							class="sec__list"
							aria-label="{section.label} items"
						>
							{#if section.items.length === 0}
								<li class="sec__empty">No items yet.</li>
							{/if}
							{#each section.items as it, i (it._key)}
								<li class="sec__row">
									<span class="sec__row-name">{itemName(it.itemId)}</span>
									<div class="sec__row-actions">
										<button
											class="sec__icon"
											onclick={() => move(secIdx, i, -1)}
											disabled={i === 0}
											aria-label="Move up"
										>
											<Icon
												name="chevron-left"
												size={14}
												stroke={2.5}
											/>
										</button>
										<button
											class="sec__icon"
											onclick={() => move(secIdx, i, 1)}
											disabled={i === section.items.length - 1}
											aria-label="Move down"
										>
											<Icon
												name="chevron-right"
												size={14}
												stroke={2.5}
											/>
										</button>
										<button
											class="sec__icon sec__icon--remove"
											onclick={() => remove(secIdx, i)}
											aria-label="Remove {itemName(it.itemId)}"
										>
											<Icon
												name="close"
												size={14}
												stroke={2.5}
											/>
										</button>
									</div>
								</li>
							{/each}
						</ul>
						<div class="sec__foot">
							<button
								class="sec__add"
								onclick={() => (librarySection = section.key)}
							>
								<Icon
									name="plus"
									size={14}
									stroke={2.5}
								/>
								Add item
							</button>
							{#if section.isBookend && !isRoutineA}
								<button
									class="sec__bookend-btn sec__bookend-btn--reset"
									onclick={() => resetBookend(secIdx)}>Reset to inherit</button
								>
							{/if}
						</div>
					{/if}
				</section>
			{/each}
		</div>
	</div>
</dialog>

{#if librarySection}
	<LibrarySheet
		config={danceLibrary(routine.disciplineId, librarySection)}
		onAdd={(item) => addFromLibrary(librarySection!, item)}
		onClose={() => (librarySection = null)}
	/>
{/if}

<style>
	.dance-editor {
		position: fixed;
		inset: 0;
		inline-size: 100%;
		max-inline-size: 100%;
		block-size: 100%;
		max-block-size: 100%;
		margin: 0;
		padding: 0;
		border: none;
		background: var(--color-surface-1);
		color: var(--color-text-primary);

		&::backdrop {
			background: rgba(0, 0, 0, 0.5);
		}
	}

	.dance-editor__inner {
		display: flex;
		flex-direction: column;
		block-size: 100%;
		max-inline-size: var(--max-width);
		margin-inline: auto;
	}

	.dance-editor__top {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--page-gutter);
		border-block-end: 1px solid var(--color-border);
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.dance-editor__letter {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-family: var(--font-display);
		font-weight: 700;
		flex-shrink: 0;
	}

	.dance-editor__title {
		flex: 1;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
	}

	.dance-editor__save {
		padding-inline: var(--space-4);
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.875rem;
		font-weight: 700;
		flex-shrink: 0;

		&:disabled {
			opacity: 0.6;
		}
	}

	.dance-editor__body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4) var(--page-gutter) var(--space-12);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.dance-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.dance-field__input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		outline: none;

		&:focus {
			border-color: var(--color-accent);
		}
	}

	.sec {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
	}

	.sec__head {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.sec__title {
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.sec__badge {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-inline: 6px;
		block-size: 18px;
		border-radius: var(--radius-full);
		display: inline-flex;
		align-items: center;
	}

	.sec__badge--inherited {
		background: color-mix(in srgb, var(--color-text-muted) 18%, transparent);
		color: var(--color-text-muted);
	}

	.sec__badge--custom {
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
		color: var(--color-accent-text);
	}

	.sec__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		list-style: none;
	}

	.sec__row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
	}

	.sec__row--readonly {
		opacity: 0.8;
	}

	.sec__row-name {
		flex: 1;
		min-inline-size: 0;
	}

	.sec__row-actions {
		display: flex;
		gap: 2px;
	}

	.sec__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 30px;
		block-size: 30px;
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);

		&:disabled {
			opacity: 0.3;
		}
	}

	.sec__icon--remove:hover {
		color: var(--color-red);
	}

	.sec__empty {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		padding-block: var(--space-1);
	}

	.sec__foot {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.sec__add {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-inline: var(--space-3);
		block-size: 34px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent-text);
	}

	.sec__bookend-btn {
		align-self: flex-start;
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.sec__bookend-btn--reset {
		color: var(--color-text-muted);
	}
</style>
