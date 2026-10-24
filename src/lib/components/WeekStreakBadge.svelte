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
		background: var(--color-ink);
		border: var(--rule-thin) solid var(--color-paper);
		padding-inline: var(--space-2);
		block-size: 30px;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.week-streak :global(.icon) {
		color: var(--color-accent-text);
	}

	.week-streak strong {
		color: var(--color-text-primary);
	}
</style>
