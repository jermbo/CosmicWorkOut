<script lang="ts">
	import type { PracticeGroup } from '$lib/practice';
	import HomeCard from './HomeCard.svelte';

	type Props = {
		group: PracticeGroup;
		planCount: number;
		summary: string;
		meta: string;
	};

	let { group, planCount, summary, meta }: Props = $props();

	let variant = $derived.by<'workout' | 'dance'>(() => {
		if (group.color === 'lavender') return 'dance';
		return 'workout';
	});
</script>

<HomeCard href="/practice/{group.id}" title={group.label} ariaLabel="{group.label}: {summary}" {variant}>
	{#snippet children()}
		<p class="practice-group-card__summary">{summary}</p>
		<p class="practice-group-card__meta">{meta}</p>
		<p class="practice-group-card__count">
			{planCount} active {#if planCount === 1}plan{:else}plans{/if}
		</p>
	{/snippet}
</HomeCard>

<style>
	.practice-group-card__summary {
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.practice-group-card__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-1);
	}

	.practice-group-card__count {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin-block-start: var(--space-3);
	}
</style>
