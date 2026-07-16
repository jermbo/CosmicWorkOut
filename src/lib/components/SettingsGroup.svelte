<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		children: Snippet;
	};

	let { title, children }: Props = $props();

	const titleId = $props.id();
</script>

<section
	class="settings-group"
	aria-labelledby={titleId}
>
	<h2
		class="settings-group__title"
		id={titleId}
	>
		{title}
	</h2>
	<div class="settings-group__rows">
		{@render children()}
	</div>
</section>

<style>
	.settings-group {
		margin-block-end: var(--space-6);
	}

	.settings-group__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.settings-group__rows {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
