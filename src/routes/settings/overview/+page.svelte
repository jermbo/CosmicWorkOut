<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import {
		DEFAULT_HOME_CARD_ORDER,
		HOME_CARD_LABELS,
		reorderHomeCards,
		type HomeCardId,
	} from '$lib/homeCards';
	import Icon from '$lib/components/Icon.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';

	let draggingId = $state<HomeCardId | null>(null);
	let dragOverId = $state<HomeCardId | null>(null);

	let order = $derived(prefsStore.homeCardOrder);

	let cardEnabled = $derived<Record<HomeCardId, boolean>>({
		habits: prefsStore.habitsEnabled,
		practice: prefsStore.practiceEnabled,
		activity: prefsStore.activityLogEnabled,
		baselines: prefsStore.baselinesEnabled,
		health: prefsStore.healthMetricsEnabled,
	});

	let isDefaultOrder = $derived(order.join() === DEFAULT_HOME_CARD_ORDER.join());

	function onDragStart(e: DragEvent, id: HomeCardId) {
		draggingId = id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', id);
		}
	}

	function onDragOver(e: DragEvent, id: HomeCardId) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		if (id !== draggingId) dragOverId = id;
	}

	function clearDrag() {
		draggingId = null;
		dragOverId = null;
	}

	function onDrop(e: DragEvent, targetId: HomeCardId) {
		e.preventDefault();
		if (draggingId) prefsStore.setHomeCardOrder(reorderHomeCards(order, draggingId, targetId));
		clearDrag();
	}

	/** Keyboard equivalent of the drag, so ordering isn't pointer-only. */
	function move(id: HomeCardId, delta: -1 | 1) {
		const idx = order.indexOf(id);
		const targetIdx = idx + delta;
		if (targetIdx < 0 || targetIdx >= order.length) return;
		prefsStore.setHomeCardOrder(reorderHomeCards(order, id, order[targetIdx]));
	}
</script>

<svelte:head>
	<title>Overview layout — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Overview layout" />

	<section
		class="settings-section"
		aria-labelledby="section-overview-order"
	>
		<div class="settings-section__title-row">
			<h2
				class="settings-section__title"
				id="section-overview-order"
			>
				Card order
			</h2>
			{#if !isDefaultOrder}
				<button
					class="order-reset"
					onclick={() => prefsStore.resetHomeCardOrder()}
				>
					Reset
				</button>
			{/if}
		</div>

		<p class="order-hint">
			Drag to reorder, or use the arrows. Cards for features you have turned off keep their place
			here but stay hidden on Overview.
		</p>

		<div class="order-list">
			{#each order as cardId, i (cardId)}
				<div
					class="order-row"
					class:order-row--dragging={draggingId === cardId}
					class:order-row--dragover={dragOverId === cardId}
					class:order-row--hidden={!cardEnabled[cardId]}
					draggable="true"
					ondragstart={(e) => onDragStart(e, cardId)}
					ondragover={(e) => onDragOver(e, cardId)}
					ondragleave={() => (dragOverId = null)}
					ondrop={(e) => onDrop(e, cardId)}
					ondragend={clearDrag}
					role="listitem"
				>
					<div
						class="order-row__handle"
						aria-hidden="true"
					>
						<Icon
							name="drag"
							size={16}
						/>
					</div>
					<span class="order-row__position">{i + 1}</span>
					<div class="order-row__info">
						<span class="order-row__name">{HOME_CARD_LABELS[cardId]}</span>
						{#if !cardEnabled[cardId]}
							<span class="order-row__meta">Turned off</span>
						{/if}
					</div>
					<div class="order-row__actions">
						<button
							class="order-row__btn order-row__btn--up"
							onclick={() => move(cardId, -1)}
							disabled={i === 0}
							aria-label="Move {HOME_CARD_LABELS[cardId]} up"
						>
							<Icon
								name="chevron-down"
								size={14}
							/>
						</button>
						<button
							class="order-row__btn"
							onclick={() => move(cardId, 1)}
							disabled={i === order.length - 1}
							aria-label="Move {HOME_CARD_LABELS[cardId]} down"
						>
							<Icon
								name="chevron-down"
								size={14}
							/>
						</button>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.settings-section {
		margin-block-end: var(--space-6);
	}

	.settings-section__title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-2);
	}

	.settings-section__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
	}

	.order-reset {
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
	}

	.order-hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-block-end: var(--space-3);
	}

	.order-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.order-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			opacity var(--duration-fast) var(--ease-out);
	}

	.order-row--dragging {
		opacity: 0.4;
	}

	.order-row--dragover {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface-2));
	}

	.order-row--hidden .order-row__name {
		color: var(--color-text-muted);
	}

	.order-row__handle {
		display: flex;
		align-items: center;
		cursor: grab;
		color: var(--color-text-muted);
		flex-shrink: 0;

		&:active {
			cursor: grabbing;
		}
	}

	.order-row__position {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-muted);
	}

	.order-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.order-row__name {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.order-row__meta {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-block-start: 2px;
	}

	.order-row__actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.order-row__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		transition: color var(--duration-fast) var(--ease-out);

		&:hover:not(:disabled) {
			color: var(--color-text-secondary);
		}

		&:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}
	}

	/* One chevron asset for both directions. */
	.order-row__btn--up :global(svg) {
		transform: rotate(180deg);
	}
</style>
