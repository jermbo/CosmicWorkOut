<script lang="ts">
	import type { Baseline } from '$lib/db/types';
	import { directionLabel, targetLabel } from '$lib/baselines/logic';
	import Icon from './Icon.svelte';

	type Props = {
		baseline: Baseline;
		dragging?: boolean;
		dragover?: boolean;
		confirmingDelete?: boolean;
		ondragstart: (e: DragEvent) => void;
		ondragover: (e: DragEvent) => void;
		ondragleave: () => void;
		ondrop: (e: DragEvent) => void;
		ondragend: () => void;
		ontoggle: () => void;
		onedit: () => void;
		ondelete: () => void;
		oncanceldelete: () => void;
	};

	let {
		baseline,
		dragging = false,
		dragover = false,
		confirmingDelete = false,
		ondragstart,
		ondragover,
		ondragleave,
		ondrop,
		ondragend,
		ontoggle,
		onedit,
		ondelete,
		oncanceldelete,
	}: Props = $props();

	let meta = $derived(
		[
			directionLabel(baseline.direction),
			...baseline.metrics.map((m) => targetLabel(baseline.direction, m)),
		].join(' · '),
	);

	function toggleAriaLabel(): string {
		if (baseline.active) return `Deactivate ${baseline.name}`;
		return `Activate ${baseline.name}`;
	}
</script>

<div
	class="baseline-row"
	class:baseline-row--dragging={dragging}
	class:baseline-row--dragover={dragover}
	draggable="true"
	{ondragstart}
	{ondragover}
	{ondragleave}
	{ondrop}
	{ondragend}
	role="listitem"
>
	<div
		class="baseline-row__drag-handle"
		aria-hidden="true"
	>
		<Icon
			name="drag"
			size={16}
		/>
	</div>
	<div class="baseline-row__info">
		<span class="baseline-row__name">{baseline.name}</span>
		<span class="baseline-row__meta">{meta}</span>
	</div>
	<div class="baseline-row__actions">
		<button
			class="baseline-row__toggle"
			class:baseline-row__toggle--active={baseline.active}
			onclick={ontoggle}
			aria-label={toggleAriaLabel()}
			role="switch"
			aria-checked={baseline.active}
		>
			<span class="baseline-row__toggle-thumb"></span>
		</button>
		<button
			class="baseline-row__btn"
			onclick={onedit}
			aria-label="Edit {baseline.name}"
		>
			<Icon
				name="edit"
				size={14}
			/>
		</button>
		{#if confirmingDelete}
			<button
				class="baseline-row__btn baseline-row__btn--confirm"
				onclick={ondelete}>Sure?</button
			>
			<button
				class="baseline-row__btn"
				onclick={oncanceldelete}
				aria-label="Cancel"
			>
				<Icon
					name="close"
					size={14}
				/>
			</button>
		{:else}
			<button
				class="baseline-row__btn baseline-row__btn--delete"
				onclick={ondelete}
				aria-label="Delete {baseline.name}"
			>
				<Icon
					name="trash"
					size={14}
				/>
			</button>
		{/if}
	</div>
</div>

<style>
	.baseline-row {
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

	.baseline-row--dragging {
		opacity: 0.4;
	}

	.baseline-row--dragover {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface-2));
	}

	.baseline-row__drag-handle {
		display: flex;
		align-items: center;
		cursor: grab;
		color: var(--color-text-muted);
		flex-shrink: 0;

		&:active {
			cursor: grabbing;
		}
	}

	.baseline-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.baseline-row__name {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.baseline-row__meta {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.baseline-row__actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.baseline-row__toggle {
		position: relative;
		inline-size: 40px;
		block-size: 24px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.baseline-row__toggle--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.baseline-row__toggle-thumb {
		position: absolute;
		inset-block: 2px;
		inset-inline-start: 2px;
		inline-size: 18px;
		block-size: 18px;
		border-radius: var(--radius-full);
		background: white;
		transition: transform var(--duration-fast) var(--ease-out);

		.baseline-row__toggle--active & {
			transform: translateX(16px);
		}
	}

	.baseline-row__btn {
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

		&:hover {
			color: var(--color-text-secondary);
		}
	}

	.baseline-row__btn--delete:hover {
		color: var(--color-red);
	}

	.baseline-row__btn--confirm {
		inline-size: auto;
		padding-inline: var(--space-2);
		background: var(--color-red);
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 700;
	}
</style>
