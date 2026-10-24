<script lang="ts">
	import type { ActivityLog } from '$lib/db/types';
	import { formatActivityChip } from '$lib/activities';
	import { formatCountWithWord } from '$lib/format';
	import HomeCard from './HomeCard.svelte';

	type Props = {
		activities: ActivityLog[];
	};

	let { activities }: Props = $props();

	let ariaLabel = $derived(
		activities.length === 0
			? 'Activity log: No activities yet'
			: `Activity log: ${formatCountWithWord(activities.length, 'activity', 'activities')} logged`,
	);
</script>

<HomeCard
	href="/log"
	title="Activity"
	code="A"
	{ariaLabel}
	field="active"
>
	{#if activities.length === 0}
		<p class="home-activity-card__empty">No activities yet.</p>
	{:else}
		<p class="home-activity-card__summary">
			{formatCountWithWord(activities.length, 'activity', 'activities')} logged
		</p>
		<div class="home-activity-card__chips">
			{#each activities.slice(0, 3) as activity (activity.id)}
				<span class="home-activity-card__chip">
					{formatActivityChip(activity)}
				</span>
			{/each}
			{#if activities.length > 3}
				<span class="home-activity-card__chip home-activity-card__chip--more">
					+{activities.length - 3} more
				</span>
			{/if}
		</div>
	{/if}
</HomeCard>

<style>
	.home-activity-card__empty {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.home-activity-card__summary {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		text-transform: uppercase;
		line-height: 1;
		margin-block-end: var(--space-2);
	}

	.home-activity-card__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.home-activity-card__chip {
		padding-inline: var(--space-2);
		block-size: 26px;
		background: var(--color-ink);
		color: var(--field);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
	}

	.home-activity-card__chip--more {
		background: transparent;
		color: var(--color-ink);
		border: var(--rule-thin) solid var(--color-ink);
	}
</style>
