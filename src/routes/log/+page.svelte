<script lang="ts">
	import { goto } from '$app/navigation';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import ActivityLogSheet from '$lib/components/ActivityLogSheet.svelte';

	const MONTHS_SHORT = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	];
	const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	let contextDate = $derived(loggingContext.date);

	let displayDate = $derived.by(() => {
		const d = new Date(contextDate + 'T00:00:00');
		return `${DAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
	});

	let dateActivities = $derived(activityStore.activitiesByDate.get(contextDate) ?? []);

	let showActivitySheet = $state(false);
	let editingActivity = $state<typeof activityStore.activities[0] | null>(null);

	function openNew() {
		editingActivity = null;
		showActivitySheet = true;
	}

	function openEdit(activity: typeof activityStore.activities[0]) {
		editingActivity = activity;
		showActivitySheet = true;
	}

	function chipLabel(activity: typeof activityStore.activities[0]): string {
		const name = activity.type === 'Other' ? (activity.customType || 'Other') : activity.type;
		return `${name} · ${activity.durationMinutes} min · ${activity.intensity}`;
	}
</script>

<svelte:head>
	<title>Activity — CosmicWorkOut</title>
</svelte:head>

<div class="page log-page">
	<header class="log-page__header">
		<button class="log-page__back" onclick={() => goto('/')} aria-label="Back to home">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
				<polyline points="15 18 9 12 15 6" />
			</svg>
		</button>
		<div class="log-page__heading">
			<p class="log-page__date">{displayDate}</p>
			<h1 class="log-page__title">Activity</h1>
		</div>
	</header>

	<button class="log-page__add-btn" onclick={openNew}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
		Log Activity
	</button>

	{#if dateActivities.length === 0}
		<div class="log-page__empty">
			<p>No activities logged for this day.</p>
		</div>
	{:else}
		<ul class="activity-list">
			{#each dateActivities as activity (activity.id)}
				<li>
				<button
					class="activity-item"
					onclick={() => openEdit(activity)}
					aria-label="Edit: {chipLabel(activity)}"
				>
					<div class="activity-item__info">
						<span class="activity-item__name">
							{activity.type === 'Other' ? (activity.customType || 'Other') : activity.type}
						</span>
						<span class="activity-item__meta">
							{activity.durationMinutes} min · {activity.intensity}
						</span>
					</div>
					<svg class="activity-item__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

{#if showActivitySheet}
	<ActivityLogSheet
		editing={editingActivity}
		initialDate={editingActivity ? undefined : contextDate}
		onClose={() => { showActivitySheet = false; editingActivity = null; }}
	/>
{/if}

<style>
	.log-page__header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		margin-block-end: var(--space-5);
	}

	.log-page__back {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		flex-shrink: 0;
		margin-block-start: 4px;

		svg { inline-size: 20px; block-size: 20px; }
	}

	.log-page__heading { flex: 1; }

	.log-page__date {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-block-end: var(--space-1);
	}

	.log-page__title {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.log-page__add-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding-inline: var(--space-4);
		block-size: 48px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-5);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);

		svg { inline-size: 18px; block-size: 18px; }
		&:hover { border-color: var(--color-accent); color: var(--color-accent); }
	}

	.log-page__empty {
		padding-block: var(--space-12);
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.9375rem;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		list-style: none;
		padding: 0;
		margin: 0;

		li { display: contents; }
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover { border-color: var(--color-accent); }
	}

	.activity-item__info { flex: 1; min-inline-size: 0; }

	.activity-item__name {
		display: block;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.activity-item__meta {
		display: block;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.activity-item__chevron {
		inline-size: 18px;
		block-size: 18px;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
</style>
