<script lang="ts">
	import type { Habit } from '$lib/db/types';
	import { habitTypeLabel, isProtectedHabit } from '$lib/habits';
	import Icon from './Icon.svelte';

	type Props = {
		habit: Habit;
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
		habit,
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

	let locked = $derived(isProtectedHabit(habit));

	let meta = $derived.by(() => {
		if (locked) return 'Always on';
		const parts = [habitTypeLabel(habit.type)];
		let goalUnitSuffix = '';
		if (habit.unit) goalUnitSuffix = ` ${habit.unit}`;
		if (habit.dailyGoal) {
			parts.push(`goal ${habit.dailyGoal}${goalUnitSuffix}`);
		} else if (habit.unit) {
			parts.push(habit.unit);
		}
		return parts.join(' · ');
	});

	function toggleAriaLabel(): string {
		if (habit.active) return `Deactivate ${habit.name}`;
		return `Activate ${habit.name}`;
	}
</script>

<div
	class="habit-row"
	class:habit-row--dragging={dragging}
	class:habit-row--dragover={dragover}
	draggable={!locked}
	{ondragstart}
	{ondragover}
	{ondragleave}
	{ondrop}
	{ondragend}
	role="listitem"
>
	<div class="habit-row__drag-handle" aria-hidden="true">
		{#if !locked}
			<Icon name="drag" size={16} />
		{/if}
	</div>
	<div class="habit-row__info">
		<span class="habit-row__name">{habit.name}</span>
		<span class="habit-row__meta">{meta}</span>
	</div>
	<div class="habit-row__actions">
		{#if !locked}
			<button
				class="habit-row__toggle"
				class:habit-row__toggle--active={habit.active}
				onclick={ontoggle}
				aria-label={toggleAriaLabel()}
				role="switch"
				aria-checked={habit.active}
			>
				<span class="habit-row__toggle-thumb"></span>
			</button>
			<button class="habit-row__btn" onclick={onedit} aria-label="Edit {habit.name}">
				<Icon name="edit" size={14} />
			</button>
			{#if confirmingDelete}
				<button class="habit-row__btn habit-row__btn--confirm" onclick={ondelete}>Sure?</button>
				<button class="habit-row__btn" onclick={oncanceldelete} aria-label="Cancel">
					<Icon name="close" size={14} />
				</button>
			{:else}
				<button class="habit-row__btn habit-row__btn--delete" onclick={ondelete} aria-label="Delete {habit.name}">
					<Icon name="trash" size={14} />
				</button>
			{/if}
		{/if}
	</div>
</div>

<style>
	.habit-row {
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

	.habit-row--dragging {
		opacity: 0.4;
	}

	.habit-row--dragover {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface-2));
	}

	.habit-row__drag-handle {
		display: flex;
		align-items: center;
		cursor: grab;
		color: var(--color-text-muted);
		flex-shrink: 0;

		&:active {
			cursor: grabbing;
		}
	}

	.habit-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.habit-row__name {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.habit-row__meta {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
		text-transform: capitalize;
	}

	.habit-row__actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.habit-row__toggle {
		position: relative;
		inline-size: 40px;
		block-size: 24px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.habit-row__toggle--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.habit-row__toggle-thumb {
		position: absolute;
		inset-block: 2px;
		inset-inline-start: 2px;
		inline-size: 18px;
		block-size: 18px;
		border-radius: var(--radius-full);
		background: white;
		transition: transform var(--duration-fast) var(--ease-out);

		.habit-row__toggle--active & {
			transform: translateX(16px);
		}
	}

	.habit-row__btn {
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

	.habit-row__btn--delete:hover {
		color: var(--color-red);
	}

	.habit-row__btn--confirm {
		inline-size: auto;
		padding-inline: var(--space-2);
		background: var(--color-red);
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 700;
	}
</style>
