<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		onclick: () => void;
		/** Selected state — drives both the accent fill and the ARIA state below. */
		active?: boolean;
		/**
		 * How selection is announced. `toggle` is an independent on/off (aria-pressed),
		 * `radio` one of a radiogroup, `tab` one of a tablist.
		 */
		select?: 'toggle' | 'radio' | 'tab';
		/** Capitalise lowercase source text — focus tags, section keys. */
		caps?: boolean;
		/** Smaller, for a secondary filter row under the primary one. */
		small?: boolean;
	};

	let {
		children,
		onclick,
		active = false,
		select = 'toggle',
		caps = false,
		small = false,
	}: Props = $props();
</script>

<button
	type="button"
	class="chip"
	class:chip--active={active}
	class:chip--caps={caps}
	class:chip--small={small}
	role={select === 'toggle' ? undefined : select}
	aria-pressed={select === 'toggle' ? active : undefined}
	aria-checked={select === 'radio' ? active : undefined}
	aria-selected={select === 'tab' ? active : undefined}
	{onclick}
>
	{@render children()}
</button>

<style>
	.chip {
		flex-shrink: 0;
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 600;
		white-space: nowrap;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.chip--caps {
		text-transform: capitalize;
	}

	.chip--small {
		block-size: 28px;
		font-size: 0.75rem;
	}

	.chip--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
	}
</style>
