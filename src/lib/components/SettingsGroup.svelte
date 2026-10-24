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
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
		margin-block-end: var(--space-3);
	}

	.settings-group__rows {
		display: flex;
		flex-direction: column;
		gap: 0;

		/* Rows stack into one ruled block. */
		& > :global(* + *) {
			margin-block-start: calc(var(--rule) * -1);
		}
	}
</style>
