<script lang="ts">
	import HomeCard from './HomeCard.svelte';

	type Props = {
		completedCount: number;
		live: boolean;
		headline: string;
		detail: string;
	};

	let { completedCount, live, headline, detail }: Props = $props();

	let badge = $derived.by<'live' | 'done' | null>(() => {
		if (live) return 'live';
		if (completedCount > 0) return 'done';
		return null;
	});

	let ariaLabel = $derived(`Workout: ${headline}`);
</script>

<HomeCard
	href="/workout"
	title="Workout"
	code="T"
	{ariaLabel}
	field="train"
	{badge}
>
	<p class="home-practice-card__headline">{headline}</p>
	<p class="home-practice-card__detail">{detail}</p>
</HomeCard>

<style>
	.home-practice-card__headline {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		text-transform: uppercase;
		line-height: 0.95;
		overflow-wrap: anywhere;
	}

	.home-practice-card__detail {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		margin-block-start: var(--space-2);
	}
</style>
