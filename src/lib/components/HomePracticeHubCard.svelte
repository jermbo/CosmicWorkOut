<script lang="ts">
	import HomeCard from './HomeCard.svelte';

	type Props = {
		activeCount: number;
		completedCount: number;
		liveCount: number;
		headline: string;
		detail: string;
	};

	let { activeCount, completedCount, liveCount, headline, detail }: Props = $props();

	let badge = $derived<'live' | 'done' | null>(
		liveCount > 0 ? 'live' : completedCount > 0 ? 'done' : null,
	);

	let ariaLabel = $derived(`Practice: ${headline}`);
</script>

<HomeCard
	href="/practice"
	title="Practice"
	{ariaLabel}
	variant="workout"
	done={completedCount > 0}
	active={liveCount > 0}
	{badge}
>
	{#snippet children()}
		<p class="home-practice-card__headline">{headline}</p>
		<p class="home-practice-card__detail">{detail}</p>
		<p class="home-practice-card__meta">
			{activeCount} active {activeCount === 1 ? 'discipline' : 'disciplines'}
		</p>
	{/snippet}
</HomeCard>

<style>
	.home-practice-card__headline {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1.2;
	}

	.home-practice-card__detail {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-1);
	}

	.home-practice-card__meta {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin-block-start: var(--space-3);
	}
</style>
