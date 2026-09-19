<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		/** Renders a `<label for=…>`; omit for a caption that names a group rather than one input. */
		for?: string;
		/** Referenced by a group's `aria-labelledby` when this label names several controls. */
		id?: string;
		/** Muted trailing note — "optional", "max 40 chars". */
		hint?: string;
	};

	let { children, for: htmlFor, id, hint }: Props = $props();
</script>

{#if htmlFor}
	<label
		class="field-label"
		for={htmlFor}
		{id}
	>
		{@render children()}
		{#if hint}<span class="field-label__hint">{hint}</span>{/if}
	</label>
{:else}
	<span
		class="field-label"
		{id}
	>
		{@render children()}
		{#if hint}<span class="field-label__hint">{hint}</span>{/if}
	</span>
{/if}

<style>
	.field-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.field-label__hint {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: var(--color-text-muted);
	}
</style>
