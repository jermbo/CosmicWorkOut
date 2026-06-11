<script lang="ts">
	import type { Exercise, WorkoutExercise } from '$lib/db/types';
	import BottomSheet from './BottomSheet.svelte';

	const CAT_COLORS: Record<string, string> = {
		Hinge: '#b2f042',
		Squat: '#b2f042',
		Push: '#b286fd',
		Pull: '#60c6ff',
		Lateral: '#e55733',
		Rotational: '#e55733',
		Power: '#b2f042',
		Carry: '#b286fd'
	};

	const CATS = ['All', 'Hinge', 'Squat', 'Push', 'Pull', 'Lateral', 'Rotational', 'Power', 'Carry'];

	let {
		exercises,
		onAdd,
		onClose
	}: {
		exercises: Exercise[];
		onAdd: (exercise: Exercise) => void;
		onClose: () => void;
	} = $props();

	let activeCat = $state('All');
	let query = $state('');
	let expandedId = $state<string | null>(null);

	let filtered = $derived(
		exercises.filter((ex) => {
			if (!ex.cat || !ex.muscles) return false;
			const matchCat = activeCat === 'All' || ex.cat === activeCat;
			const q = query.toLowerCase();
			const matchQuery =
				!q ||
				ex.name.toLowerCase().includes(q) ||
				ex.muscles.toLowerCase().includes(q) ||
				ex.cat.toLowerCase().includes(q);
			return matchCat && matchQuery;
		})
	);

	function toggleExpand(id: string) {
		if (expandedId === id) {
			expandedId = null;
		} else {
			expandedId = id;
		}
	}
</script>

<BottomSheet onclose={onClose} maxHeight="85dvh">
	<div class="lib-sheet">
		<div class="lib-sheet__header">
			<h2 class="lib-sheet__title">Exercise Library</h2>
			<button class="lib-sheet__close" onclick={onClose} aria-label="Close library">
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
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<input
				class="lib-sheet__search-input"
				type="search"
				placeholder="Search exercises or muscles…"
				bind:value={query}
				aria-label="Search exercises"
			/>
		</div>

		<div class="lib-sheet__cats" role="group" aria-label="Filter by category">
			{#each CATS as cat}
				<button
					class="lib-cat-chip"
					class:lib-cat-chip--active={activeCat === cat}
					onclick={() => (activeCat = cat)}
					aria-pressed={activeCat === cat}
				>
					{cat}
				</button>
			{/each}
		</div>

		<div class="lib-sheet__list">
			{#if filtered.length === 0}
				<p class="lib-sheet__empty">No exercises match.</p>
			{/if}
			{#each filtered as ex (ex.id)}
				{@const dot = CAT_COLORS[ex.cat] ?? 'var(--color-accent)'}
				{@const isOpen = expandedId === ex.id}
				<div class="lib-row" class:lib-row--open={isOpen}>
					<button
						class="lib-row__main"
						onclick={() => toggleExpand(ex.id)}
						aria-expanded={isOpen}
					>
						<span class="lib-row__dot" style:background={dot} aria-hidden="true"></span>
						<div class="lib-row__info">
							<span class="lib-row__name">{ex.name}</span>
							<span class="lib-row__muscles">{ex.muscles}</span>
						</div>
						<span class="lib-row__cat" style:--dot-color={dot}>{ex.cat}</span>
						<span class="lib-row__sets">{ex.defaultSets}×{ex.defaultReps}</span>
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
							<p class="lib-row__cue">"{ex.cue}"</p>
							<button
								class="lib-row__add"
								onclick={() => {
									onAdd(ex);
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
									<line x1="12" y1="5" x2="12" y2="19" />
									<line x1="5" y1="12" x2="19" y2="12" />
								</svg>
								Add to workout
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</BottomSheet>

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

	.lib-cat-chip {
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
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.lib-cat-chip--active {
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
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.lib-row__muscles {
		display: block;
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		margin-block-start: 1px;
	}

	.lib-row__cat {
		font-size: 0.6875rem;
		font-weight: 600;
		padding-inline: 6px;
		block-size: 20px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--dot-color) 15%, transparent);
		color: var(--dot-color);
		white-space: nowrap;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.lib-row__sets {
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

	.lib-row__add {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		inline-size: 100%;
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
</style>
