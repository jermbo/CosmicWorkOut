<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = {
		streak: number;
	};

	let { streak }: Props = $props();
</script>

{#if streak > 0}
	<div
		class="week-streak"
		aria-label="{streak} week streak"
	>
		<Icon
			name="flame"
			size={14}
		/>
		<span><strong>{streak}</strong> wk streak</span>
	</div>
{/if}

<style>
	.week-streak {
		display: flex;
		align-items: center;
		gap: 5px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		padding-inline: var(--space-3);
		block-size: 32px;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		flex-shrink: 0;
		margin-block-start: var(--space-1);
	}

	.week-streak :global(.icon) {
		color: var(--color-accent-text);
	}

	.week-streak strong {
		color: var(--color-text-primary);
	}
</style>
