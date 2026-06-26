<script lang="ts">
	import HomeCard from './HomeCard.svelte';

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

<HomeCard href="/habits" title="Habits" {ariaLabel} variant="habits">
	{#if total === 0}
		<p class="home-habits-card__empty">Add habits in Settings to get started.</p>
	{:else}
		<div class="home-habits-card__summary">
			<span class="home-habits-card__count">{logged}</span>
			<span class="home-habits-card__sep">/</span>
			<span class="home-habits-card__total">{total}</span>
			<span class="home-habits-card__label">habits logged</span>
		</div>
		{#if logged === total}
			<p class="home-habits-card__done-note">All done today!</p>
		{/if}
	{/if}
</HomeCard>

<style>
	.home-habits-card__summary {
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
	}

	.home-habits-card__count {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-accent);
		line-height: 1;
	}

	.home-habits-card__sep {
		font-size: 1.25rem;
		color: var(--color-text-muted);
	}

	.home-habits-card__total {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	.home-habits-card__label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-inline-start: var(--space-1);
	}

	.home-habits-card__done-note {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		margin-block-start: var(--space-1);
	}

	.home-habits-card__empty {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}
</style>
