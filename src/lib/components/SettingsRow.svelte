<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = {
		href: string;
		label: string;
		detail?: string;
		preview?: Snippet;
	};

	let { href, label, detail, preview }: Props = $props();
</script>

<a {href} class="settings-row">
	<span class="settings-row__label">{label}</span>
	<span class="settings-row__trailing">
		{#if preview}
			{@render preview()}
		{:else if detail}
			<span class="settings-row__detail">{detail}</span>
		{/if}
		<Icon name="chevron-right" size={18} />
	</span>
</a>

<style>
	.settings-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-block-size: 56px;
		padding-inline: var(--space-4);
		padding-block: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		text-decoration: none;
		color: inherit;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.settings-row__label {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.settings-row__trailing {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.settings-row__detail {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.settings-row__trailing :global(.icon) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
</style>
