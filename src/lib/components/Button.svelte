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
	data-feedback={variant === 'danger' ? 'warn' : undefined}
>
	{@render children()}
</button>

<style>
	/* Chunky block buttons. Primary carries a hard shadow and sinks on press. */
	.btn {
		min-block-size: 52px;
		padding-block: var(--space-3);
		padding-inline: var(--space-4);
		border: var(--rule) solid var(--color-paper);
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		letter-spacing: -0.01em;
		text-transform: uppercase;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.btn--grow {
		flex: 1;
	}

	.btn--bold {
		font-weight: 900;
	}

	.btn--primary,
	.btn--danger {
		border-color: var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
	}

	.btn--primary {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-text-primary);

		&:active:not(:disabled) {
			background: var(--color-paper);
			color: var(--color-ink);
		}
	}

	.btn--danger {
		background: var(--color-red);
		color: var(--color-ink);
	}
</style>
