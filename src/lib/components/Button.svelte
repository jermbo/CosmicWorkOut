<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		onclick?: () => void;
		variant?: 'primary' | 'ghost' | 'danger';
		/** Take an equal share of a flex row of actions. */
		grow?: boolean;
		/** Heavier label, for a destructive-or-confirm pair. */
		bold?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit';
	};

	let {
		children,
		onclick,
		variant = 'primary',
		grow = false,
		bold = false,
		disabled = false,
		type = 'button',
	}: Props = $props();
</script>

<button
	class="btn btn--{variant}"
	class:btn--grow={grow}
	class:btn--bold={bold}
	{type}
	{onclick}
	{disabled}
>
	{@render children()}
</button>

<style>
	.btn {
		min-block-size: 48px;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;
		transition: opacity var(--duration-fast) var(--ease-out);

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.btn--grow {
		flex: 1;
	}

	.btn--bold {
		font-weight: 700;
	}

	.btn--primary {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.btn--ghost {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
	}

	.btn--danger {
		background: var(--color-red);
		color: #ffffff;
	}
</style>
