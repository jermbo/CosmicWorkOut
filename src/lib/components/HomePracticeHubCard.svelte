<script lang="ts">
	import HomeCard from './HomeCard.svelte';

	type Props = {
		groupCount: number;
		planCount: number;
		completedCount: number;
		live: boolean;
		headline: string;
		detail: string;
	};

	let { groupCount, planCount, completedCount, live, headline, detail }: Props = $props();

	let badge = $derived.by<'live' | 'done' | null>(() => {
		if (live) return 'live';
		if (completedCount > 0) return 'done';
		return null;
	});

	let ariaLabel = $derived(`Practice: ${headline}`);
</script>

<HomeCard
	href="/practice"
	title="Practice"
	{ariaLabel}
	variant="workout"
	done={completedCount > 0}
	active={live}
	{badge}
>
	{#snippet children()}
		<p class="home-practice-card__headline">{headline}</p>
		<p class="home-practice-card__detail">{detail}</p>
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
</style>
