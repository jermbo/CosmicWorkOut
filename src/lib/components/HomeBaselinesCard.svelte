<script lang="ts">
	import HomeCard from './HomeCard.svelte';

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
	{ariaLabel}
	variant="log"
>
	{#if total === 0}
		<p class="home-baselines-card__empty">Set your first baseline in Settings.</p>
	{:else}
		<div class="home-baselines-card__summary">
			<span class="home-baselines-card__count">{done}</span>
			<span class="home-baselines-card__sep">/</span>
			<span class="home-baselines-card__total">{total}</span>
			<span class="home-baselines-card__label">done</span>
		</div>
		{#if done === total}
			<p class="home-baselines-card__done-note">You showed up for all of them.</p>
		{/if}
	{/if}
</HomeCard>

<style>
	.home-baselines-card__summary {
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
	}

	.home-baselines-card__count {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-accent);
		line-height: 1;
	}

	.home-baselines-card__sep {
		font-size: 1.25rem;
		color: var(--color-text-muted);
	}

	.home-baselines-card__total {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	.home-baselines-card__label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-inline-start: var(--space-1);
	}

	.home-baselines-card__done-note {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		margin-block-start: var(--space-1);
	}

	.home-baselines-card__empty {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}
</style>
