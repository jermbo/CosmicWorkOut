<script lang="ts">
	import { untrack } from 'svelte';
	import type { Item } from '$lib/db/types';
	import { FOCUS_TAGS } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import { disciplineById } from '$lib/discipline';
	import BottomSheet from './BottomSheet.svelte';
	import ItemFormSheet from './ItemFormSheet.svelte';

	type Props = {
		disciplineId: string;
		defaultSection?: string;
		onAdd: (item: Item) => void;
		onClose: () => void;
	};

	let { disciplineId, defaultSection, onAdd, onClose }: Props = $props();

	let sections = $derived(disciplineById(disciplineId)?.sections ?? []);

	let activeSection = $state(untrack(() => defaultSection ?? 'all'));
	let activeFocus = $state<string | null>(null);
	let query = $state('');
	let expandedId = $state<string | null>(null);
	let formItem = $state<Item | null | undefined>(undefined);
	let confirmDeleteId = $state<string | null>(null);
	let deleteError = $state<string | null>(null);

	function sectionLabel(key: string): string {
		return sections.find((s) => s.key === key)?.label ?? key;
	}

	let filtered = $derived(
		programStore.itemsForDiscipline(disciplineId).filter((it) => {
			const matchSection = activeSection === 'all' || it.section === activeSection;
			const matchFocus = !activeFocus || (it.focus ?? []).includes(activeFocus);
			const q = query.trim().toLowerCase();
			const matchQuery =
				!q || it.name.toLowerCase().includes(q) || (it.focus ?? []).some((f) => f.includes(q));
			return matchSection && matchFocus && matchQuery;
		}),
	);

	function toggleExpand(id: string) {
		if (expandedId === id) {
			expandedId = null;
		} else {
			expandedId = id;
		}
	}

	function toggleFocusFilter(tag: string) {
		if (activeFocus === tag) {
			activeFocus = null;
		} else {
			activeFocus = tag;
		}
	}

	function resolveDefaultSection(): string | undefined {
		if (activeSection === 'all') return defaultSection;
		return activeSection;
	}

	async function deleteItem(it: Item) {
		if (confirmDeleteId !== it.id) {
			deleteError = null;
			confirmDeleteId = it.id;
			return;
		}
		confirmDeleteId = null;
		try {
			await programStore.deleteItem(it.id);
			if (expandedId === it.id) expandedId = null;
		} catch (e) {
			if (e instanceof Error) {
				deleteError = e.message;
			} else {
				deleteError = 'Could not delete item.';
			}
		}
	}
</script>

<BottomSheet
	onclose={onClose}
	maxHeight="85dvh"
>
	<div class="lib-sheet">
		<div class="lib-sheet__header">
			<h2 class="lib-sheet__title">Item Library</h2>
			<div class="lib-sheet__header-actions">
				<button
					class="lib-sheet__add-btn"
					onclick={() => (formItem = null)}
					aria-label="Add custom item"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<line
							x1="12"
							y1="5"
							x2="12"
							y2="19"
						/>
						<line
							x1="5"
							y1="12"
							x2="19"
							y2="12"
						/>
					</svg>
					New
				</button>
				<button
					class="lib-sheet__close"
					onclick={onClose}
					aria-label="Close library"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<line
							x1="18"
							y1="6"
							x2="6"
							y2="18"
						/>
						<line
							x1="6"
							y1="6"
							x2="18"
							y2="18"
						/>
					</svg>
				</button>
			</div>
		</div>

		<div class="lib-sheet__search">
			<svg
				class="lib-sheet__search-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle
					cx="11"
					cy="11"
					r="8"
				/>
				<line
					x1="21"
					y1="21"
					x2="16.65"
					y2="16.65"
				/>
			</svg>
			<input
				class="lib-sheet__search-input"
				type="search"
				placeholder="Search items…"
				bind:value={query}
				aria-label="Search items"
			/>
		</div>

		<div
			class="lib-sheet__cats"
			role="group"
			aria-label="Filter by section"
		>
			<button
				class="lib-chip"
				class:lib-chip--active={activeSection === 'all'}
				onclick={() => (activeSection = 'all')}
				aria-pressed={activeSection === 'all'}>All</button
			>
			{#each sections as s (s.key)}
				<button
					class="lib-chip"
					class:lib-chip--active={activeSection === s.key}
					onclick={() => (activeSection = s.key)}
					aria-pressed={activeSection === s.key}>{s.label}</button
				>
			{/each}
		</div>

		<div
			class="lib-sheet__cats"
			role="group"
			aria-label="Filter by focus"
		>
			<button
				class="lib-chip lib-chip--focus"
				class:lib-chip--active={activeFocus === null}
				onclick={() => (activeFocus = null)}
				aria-pressed={activeFocus === null}>Any focus</button
			>
			{#each FOCUS_TAGS as tag (tag)}
				<button
					class="lib-chip lib-chip--focus"
					class:lib-chip--active={activeFocus === tag}
					onclick={() => toggleFocusFilter(tag)}
					aria-pressed={activeFocus === tag}>{tag}</button
				>
			{/each}
		</div>

		<div class="lib-sheet__list">
			{#if filtered.length === 0}
				<p class="lib-sheet__empty">No items match.</p>
			{/if}
			{#each filtered as it (it.id)}
				{@const isOpen = expandedId === it.id}
				<div
					class="lib-row"
					class:lib-row--open={isOpen}
				>
					<button
						class="lib-row__main"
						onclick={() => toggleExpand(it.id)}
						aria-expanded={isOpen}
					>
						<div class="lib-row__info">
							<span class="lib-row__name">
								{it.name}
								{#if !it.isBuiltIn}
									<span class="lib-row__custom-badge">Custom</span>
								{/if}
							</span>
							<span class="lib-row__focus">{(it.focus ?? []).join(' · ')}</span>
						</div>
						<span class="lib-row__cat">{sectionLabel(it.section)}</span>
						<svg
							class="lib-row__chevron"
							class:lib-row__chevron--open={isOpen}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>
					{#if isOpen}
						<div class="lib-row__detail">
							{#if it.cue}
								<p class="lib-row__cue">"{it.cue}"</p>
							{/if}
							{#if deleteError && expandedId === it.id}
								<p class="lib-row__error">{deleteError}</p>
							{/if}
							<div class="lib-row__actions">
								<button
									class="lib-row__add"
									onclick={() => {
										onAdd(it);
										expandedId = null;
									}}
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										aria-hidden="true"
									>
										<line
											x1="12"
											y1="5"
											x2="12"
											y2="19"
										/>
										<line
											x1="5"
											y1="12"
											x2="19"
											y2="12"
										/>
									</svg>
									Add to routine
								</button>
								{#if !it.isBuiltIn}
									<button
										class="lib-row__edit"
										onclick={() => (formItem = it)}
										aria-label="Edit {it.name}"
									>
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											aria-hidden="true"
										>
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
									</button>
									{#if confirmDeleteId === it.id}
										<button
											class="lib-row__delete lib-row__delete--confirm"
											onclick={() => deleteItem(it)}
											aria-label="Confirm delete {it.name}">Sure?</button
										>
										<button
											class="lib-row__delete"
											onclick={() => (confirmDeleteId = null)}
											aria-label="Cancel delete"
										>
											<svg
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												aria-hidden="true"
											>
												<line
													x1="18"
													y1="6"
													x2="6"
													y2="18"
												/>
												<line
													x1="6"
													y1="6"
													x2="18"
													y2="18"
												/>
											</svg>
										</button>
									{:else}
										<button
											class="lib-row__delete"
											onclick={() => deleteItem(it)}
											aria-label="Delete {it.name}"
										>
											<svg
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												aria-hidden="true"
											>
												<polyline points="3 6 5 6 21 6" />
												<path d="M19 6l-1 14H6L5 6" />
												<path d="M10 11v6M14 11v6" />
												<path d="M9 6V4h6v2" />
											</svg>
										</button>
									{/if}
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</BottomSheet>

{#if formItem !== undefined}
	<ItemFormSheet
		{disciplineId}
		item={formItem}
		defaultSection={resolveDefaultSection()}
		onClose={() => (formItem = undefined)}
	/>
{/if}

<style>
	.lib-sheet {
		display: flex;
		flex-direction: column;
		padding-block-start: var(--space-2);
	}

	.lib-sheet__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--space-5);
		padding-block-end: var(--space-3);
	}

	.lib-sheet__header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.lib-sheet__add-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-inline: var(--space-3);
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);

		svg {
			inline-size: 14px;
			block-size: 14px;
		}
	}

	.lib-sheet__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.lib-sheet__close {
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

	.lib-sheet__search {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-inline: var(--space-5);
		margin-block-end: var(--space-3);
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		block-size: 44px;
	}

	.lib-sheet__search-icon {
		inline-size: 16px;
		block-size: 16px;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.lib-sheet__search-input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-primary);

		&::placeholder {
			color: var(--color-text-muted);
		}
	}

	.lib-sheet__cats {
		display: flex;
		gap: var(--space-2);
		padding-inline: var(--space-5);
		padding-block-end: var(--space-3);
		overflow-x: auto;
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.lib-chip {
		flex-shrink: 0;
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 600;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		white-space: nowrap;
		text-transform: capitalize;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.lib-chip--focus {
		block-size: 28px;
		font-size: 0.75rem;
	}

	.lib-chip--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.lib-sheet__list {
		flex: 1;
		overflow-y: auto;
		padding-inline: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-block-end: var(--space-4);
	}

	.lib-sheet__empty {
		text-align: center;
		padding-block: var(--space-8);
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.lib-row {
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.lib-row__main {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		inline-size: 100%;
		padding: var(--space-3) var(--space-3);
		text-align: start;
	}

	.lib-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.lib-row__name {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.lib-row__custom-badge {
		flex-shrink: 0;
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-inline: 5px;
		block-size: 16px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
		color: var(--color-accent);
		display: inline-flex;
		align-items: center;
	}

	.lib-row__error {
		font-size: 0.75rem;
		color: var(--color-red);
		padding-block-end: var(--space-2);
		line-height: 1.4;
	}

	.lib-row__focus {
		display: block;
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		margin-block-start: 1px;
		text-transform: capitalize;
	}

	.lib-row__cat {
		font-size: 0.6875rem;
		font-weight: 600;
		padding-inline: 6px;
		block-size: 20px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
		white-space: nowrap;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.lib-row__chevron {
		inline-size: 16px;
		block-size: 16px;
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.lib-row__chevron--open {
		transform: rotate(180deg);
	}

	.lib-row__detail {
		padding-inline: var(--space-3);
		padding-block: var(--space-2) var(--space-3);
		border-block-start: 1px solid var(--color-border);
		background: var(--color-surface-2);
	}

	.lib-row__cue {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		font-style: italic;
		margin-block-end: var(--space-3);
	}

	.lib-row__actions {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.lib-row__add {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-block: var(--space-2);
		padding-inline: var(--space-3);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 700;
		justify-content: center;

		svg {
			inline-size: 16px;
			block-size: 16px;
		}
	}

	.lib-row__edit,
	.lib-row__delete {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 40px;
		block-size: 36px;
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		flex-shrink: 0;
		transition: color var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 15px;
			block-size: 15px;
		}
	}

	.lib-row__delete:hover {
		color: var(--color-red);
	}

	.lib-row__delete--confirm {
		inline-size: auto;
		padding-inline: var(--space-2);
		background: var(--color-red);
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 700;
	}
</style>
