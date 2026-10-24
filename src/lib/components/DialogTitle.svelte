<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		/** `h2` when the title is the surface's heading; `p` when it only labels it. */
		as?: 'p' | 'h2';
		/** Target for the dialog's `aria-labelledby`. */
		id?: string;
	};

	let { children, as = 'p', id }: Props = $props();
</script>

<svelte:element
	this={as}
	class="dialog-title"
	{id}
>
	{@render children()}
</svelte:element>

<style>
	.dialog-title {
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1.25rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		margin-block-end: var(--space-4);
	}
</style>
