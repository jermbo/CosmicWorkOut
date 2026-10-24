<script lang="ts">
	import HomeCard from './HomeCard.svelte';
	import ProgressBlocks from './ProgressBlocks.svelte';

	type Props = {
		logged: number;
		total: number;
	};

	let { logged, total }: Props = $props();

	let ariaLabel = $derived.by(() => {
		if (total === 0) return 'Habits: Add habits';
		return `Habits: ${logged} of ${total} logged`;
	});
</script>

<HomeCard
	href="/habits"
	title="Habits"
	code="H"
	{ariaLabel}
	field="habit"
>
	{#if total === 0}
		<p class="home-habits-card__empty">Add habits in Settings to get started.</p>
	{:else}
		<div class="home-habits-card__summary">
			<span class="home-habits-card__count">{logged}/{total}</span>
			<span class="home-habits-card__label">
				{#if logged === total}All done today!{:else}habits logged{/if}
			</span>
		</div>
		<ProgressBlocks
			{total}
			on={logged}
		/>
	{/if}
</HomeCard>

<style>
	.home-habits-card__summary {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
		margin-block-end: var(--space-2);
	}

	.home-habits-card__count {
		order: 2;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.home-habits-card__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.home-habits-card__empty {
		font-size: 0.875rem;
		font-weight: 500;
	}
</style>
