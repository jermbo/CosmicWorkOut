<script lang="ts">
	import HomeCard from './HomeCard.svelte';
	import ProgressBlocks from './ProgressBlocks.svelte';

	type Props = {
		/** Baselines logged on the date — logging is showing up (US-038). */
		done: number;
		total: number;
	};

	let { done, total }: Props = $props();

	let ariaLabel = $derived.by(() => {
		if (total === 0) return 'Baselines: Add baselines';
		return `Baselines: ${done} of ${total} done`;
	});
</script>

<HomeCard
	href="/baselines"
	title="Baselines"
	code="B"
	{ariaLabel}
	field="base"
>
	{#if total === 0}
		<p class="home-baselines-card__empty">Set your first baseline in Settings.</p>
	{:else}
		<div class="home-baselines-card__summary">
			<span class="home-baselines-card__count">{done}/{total}</span>
			<span class="home-baselines-card__label">
				{#if done === total}You showed up for all of them.{:else}done{/if}
			</span>
		</div>
		<ProgressBlocks
			{total}
			on={done}
		/>
	{/if}
</HomeCard>

<style>
	.home-baselines-card__summary {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
		margin-block-end: var(--space-2);
	}

	.home-baselines-card__count {
		order: 2;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.home-baselines-card__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.home-baselines-card__empty {
		font-size: 0.875rem;
		font-weight: 500;
	}
</style>
