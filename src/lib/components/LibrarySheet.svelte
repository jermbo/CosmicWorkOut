<script lang="ts">
	import { untrack } from 'svelte';
	import type { Item } from '$lib/db/types';
	import type { LibraryConfig } from '$lib/itemLibrary';
	import { programStore } from '$lib/stores/program.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import SheetHeader from './SheetHeader.svelte';
	import ItemFormSheet from './ItemFormSheet.svelte';
	import ExerciseFormSheet from './ExerciseFormSheet.svelte';
	import Chip from './Chip.svelte';
	import SheetBody from './SheetBody.svelte';

	type Props = {
		config: LibraryConfig;
		onAdd: (item: Item) => void;
		onClose: () => void;
	};

	let { config, onAdd, onClose }: Props = $props();

	let selected = $state<string[]>(
		untrack(() => config.filters.map((f) => f.initial ?? f.anyValue)),
	);
	let query = $state('');
	let expandedId = $state<string | null>(null);
	let formItem = $state<Item | null | undefined>(undefined);
	let confirmDeleteId = $state<string | null>(null);
	let deleteError = $state<string | null>(null);

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return programStore.items.filter((item) => {
			if (!config.accepts(item)) return false;
			if (q && !config.search(item, q)) return false;
			return config.filters.every((f, i) => {
				const value = selected[i];
				return value === f.anyValue || f.matches(item, value);
			});
		});
	});

	function pickFilter(index: number, value: string) {
		const group = config.filters[index];
		const clearing = group.clearOnReselect && selected[index] === value;
		selected[index] = clearing ? group.anyValue : value;
	}

	function toggleExpand(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	/** New items inherit the section being filtered, falling back to the caller's. */
	function resolveDefaultSection(fallback: string | undefined): string | undefined {
		const section = selected[0];
		if (!section || section === config.filters[0]?.anyValue) return fallback;
		return section;
	}

	async function deleteItem(item: Item) {
		if (confirmDeleteId !== item.id) {
			deleteError = null;
			confirmDeleteId = item.id;
			return;
		}
		confirmDeleteId = null;
		try {
			await programStore.deleteItem(item.id);
			if (expandedId === item.id) expandedId = null;
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'Could not delete item.';
		}
	}
</script>

<BottomSheet
	onclose={onClose}
	maxHeight="85dvh"
>
	<SheetBody>
		<SheetHeader
			title={config.title}
			{onClose}
			tight
			closeLabel="Close library"
		>
			{#snippet actions()}
				<button
					class="lib-sheet__add-btn"
					onclick={() => (formItem = null)}
					aria-label={config.addLabel}
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
			{/snippet}
		</SheetHeader>

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
				placeholder={config.searchPlaceholder}
				bind:value={query}
				aria-label={config.searchLabel}
			/>
		</div>

		{#each config.filters as group, i (group.ariaLabel)}
			<div
				class="lib-sheet__cats"
				role="group"
				aria-label={group.ariaLabel}
			>
				<Chip
					caps={config.capitalize}
					small={group.small}
					active={selected[i] === group.anyValue}
					onclick={() => (selected[i] = group.anyValue)}>{group.anyLabel}</Chip
				>
				{#each group.options as option (option.value)}
					<Chip
						caps={config.capitalize}
						small={group.small}
						active={selected[i] === option.value}
						onclick={() => pickFilter(i, option.value)}>{option.label}</Chip
					>
				{/each}
			</div>
		{/each}

		<div class="lib-sheet__list">
			{#if filtered.length === 0}
				<p class="lib-sheet__empty">{config.emptyText}</p>
			{/if}
			{#each filtered as item (item.id)}
				{@const row = config.row(item)}
				{@const isOpen = expandedId === item.id}
				<div class="lib-row">
					<button
						class="lib-row__main"
						onclick={() => toggleExpand(item.id)}
						aria-expanded={isOpen}
					>
						{#if row.color}
							<span
								class="lib-row__dot"
								style:background={row.color}
								aria-hidden="true"
							></span>
						{/if}
						<div class="lib-row__info">
							<span class="lib-row__name">
								{item.name}
								{#if !item.isBuiltIn}
									<span class="lib-row__custom-badge">Custom</span>
								{/if}
							</span>
							<span
								class="lib-row__subtitle"
								class:lib-row__subtitle--caps={config.capitalize}>{row.subtitle}</span
							>
						</div>
						<span
							class="lib-row__cat"
							style:--tag-color={row.color ?? 'var(--color-accent)'}>{row.tag}</span
						>
						{#if row.meta}
							<span class="lib-row__meta">{row.meta}</span>
						{/if}
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
							{#if item.cue}
								<p class="lib-row__cue">"{item.cue}"</p>
							{/if}
							{#if deleteError}
								<p class="lib-row__error">{deleteError}</p>
							{/if}
							<div class="lib-row__actions">
								<button
									class="lib-row__add"
									onclick={() => {
										onAdd(item);
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
								{#if !item.isBuiltIn}
									<button
										class="lib-row__edit"
										onclick={() => (formItem = item)}
										aria-label="Edit {item.name}"
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
									{#if confirmDeleteId === item.id}
										<button
											class="lib-row__delete lib-row__delete--confirm"
											onclick={() => deleteItem(item)}
											aria-label="Confirm delete {item.name}">Sure?</button
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
											onclick={() => deleteItem(item)}
											aria-label="Delete {item.name}"
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
	</SheetBody>
</BottomSheet>

{#if formItem !== undefined}
	{#if config.kind === 'dance'}
		<ItemFormSheet
			disciplineId={config.disciplineId}
			item={formItem}
			defaultSection={resolveDefaultSection(config.defaultSection)}
			onClose={() => (formItem = undefined)}
		/>
	{:else}
		<ExerciseFormSheet
			exercise={formItem}
			onClose={() => (formItem = undefined)}
		/>
	{/if}
{/if}

<style>
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
		color: var(--color-accent-text);

		svg {
			inline-size: 14px;
			block-size: 14px;
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
		transition: background-color var(--duration-fast) var(--ease-out);

		&:hover {
			background: var(--color-surface-2);
		}
	}

	.lib-row__dot {
		inline-size: 8px;
		block-size: 8px;
		border-radius: var(--radius-full);
		flex-shrink: 0;
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
		color: var(--color-accent-text);
		display: inline-flex;
		align-items: center;
	}

	.lib-row__error {
		font-size: 0.75rem;
		color: var(--color-red);
		padding-block-end: var(--space-2);
		line-height: 1.4;
	}

	.lib-row__subtitle {
		display: block;
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		margin-block-start: 1px;
	}

	.lib-row__subtitle--caps {
		text-transform: capitalize;
	}

	.lib-row__cat {
		font-size: 0.6875rem;
		font-weight: 600;
		padding-inline: 6px;
		block-size: 20px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--tag-color) 15%, transparent);
		color: var(--tag-color);
		white-space: nowrap;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.lib-row__meta {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		flex-shrink: 0;
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
