<script lang="ts">
	import type { ActivityType } from '$lib/db/types';
	import { formatCountWithWord } from '$lib/format';
	import Icon from './Icon.svelte';

	type Props = {
		type: ActivityType;
		entries: number;
		ontoggle: () => void;
		onrename: () => void;
	};

	let { type, entries, ontoggle, onrename }: Props = $props();

	let meta = $derived(
		[formatCountWithWord(entries, 'entry', 'entries'), type.hidden ? 'Hidden' : null]
			.filter(Boolean)
			.join(' · '),
	);
</script>

<div
	class="type-row"
	class:type-row--hidden={type.hidden}
	role="listitem"
>
	<div class="type-row__info">
		<span class="type-row__name">{type.name}</span>
		<span class="type-row__meta">{meta}</span>
	</div>
	<div class="type-row__actions">
		<button
			class="type-row__toggle"
			class:type-row__toggle--active={!type.hidden}
			onclick={ontoggle}
			role="switch"
			aria-checked={!type.hidden}
			aria-label="Show {type.name} in the picker and Activity Mix"
		>
			<span class="type-row__toggle-thumb"></span>
		</button>
		<button
			class="type-row__btn"
			onclick={onrename}
			aria-label="Rename {type.name}"
		>
			<Icon
				name="edit"
				size={14}
			/>
		</button>
	</div>
</div>

<style>
	.type-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
		border-radius: var(--radius-lg);
	}

	.type-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.type-row__name {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		overflow-wrap: anywhere;

		.type-row--hidden & {
			color: var(--color-text-muted);
		}
	}

	.type-row__meta {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.type-row__actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	/* Square brutal switch, same as SettingsToggleRow and HabitRow. */
	.type-row__toggle {
		position: relative;
		inline-size: 52px;
		block-size: 28px;
		background: var(--field-empty);
		border: var(--rule) solid var(--color-paper);
	}

	.type-row__toggle--active {
		background: var(--color-accent);
	}

	.type-row__toggle-thumb {
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		inline-size: 22px;
		background: var(--color-paper);
		border-inline-end: var(--rule) solid var(--color-ink);
		transition: transform var(--duration-press) linear;

		.type-row__toggle--active & {
			transform: translateX(24px);
			border-inline-end: none;
			border-inline-start: var(--rule) solid var(--color-ink);
		}
	}

	.type-row__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		background: transparent;
		border: var(--rule-thin) solid var(--color-paper);
		color: var(--color-text-muted);
		transition: color var(--duration-fast) var(--ease-out);

		&:hover {
			color: var(--color-text-secondary);
		}
	}
</style>
