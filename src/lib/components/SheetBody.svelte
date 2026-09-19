<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div class="sheet-body">
	{@render children()}
</div>

<style>
	.sheet-body {
		display: flex;
		flex-direction: column;
		padding-block-start: var(--space-2);
	}
</style>
