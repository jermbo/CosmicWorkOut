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

<HomeCard href="/log" title="Activity" {ariaLabel} variant="log">
	{#snippet children()}
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
	{/snippet}
</HomeCard>

<style>
	.home-activity-card__empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.home-activity-card__summary {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-block-end: var(--space-2);
	}

	.home-activity-card__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.home-activity-card__chip {
		padding-inline: var(--space-2);
		block-size: 28px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-3));
		border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
	}

	.home-activity-card__chip--more {
		background: var(--color-surface-3);
		border-color: var(--color-border);
	}
</style>
