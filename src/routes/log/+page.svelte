<script lang="ts">
	import { activityStore } from '$lib/stores/activities.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import ActivityLogSheet from '$lib/components/ActivityLogSheet.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { formatActivitySummary } from '$lib/activities';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { redirectWhenDisabled } from '$lib/featureGate.svelte';

	redirectWhenDisabled(() => prefsStore.activityLogEnabled);

	let contextDate = $derived(loggingContext.date);

	let dateActivities = $derived(activityStore.activitiesByDate.get(contextDate) ?? []);

	let showActivitySheet = $state(false);
	let editingActivity = $state<(typeof activityStore.activities)[0] | null>(null);

	function openNew() {
		editingActivity = null;
		showActivitySheet = true;
	}

	function openEdit(activity: (typeof activityStore.activities)[0]) {
		editingActivity = activity;
		showActivitySheet = true;
	}

	function chipLabel(activity: (typeof activityStore.activities)[0]): string {
		return formatActivitySummary(activity);
	}

	let sheetInitialDate = $derived.by(() => {
		if (editingActivity) return undefined;
		return contextDate;
	});
</script>

<svelte:head>
	<title>Activity — CosmicWorkOut</title>
</svelte:head>

<div class="page log-page">
	<PageHeader
		title="Activity"
		showBack
	/>

	<button
		class="log-page__add-btn"
		onclick={openNew}
	>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<line
				x1="12"
				y1="5"
				x2="12"
				y2="19"
			/>
			<line
				x1="5"
				y1="12"
				x2="19"
				y2="12"
			/>
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
								{#if activity.type === 'Other'}{activity.customType ||
										'Other'}{:else}{activity.type}{/if}
							</span>
							<span class="activity-item__meta">
								{formatActivitySummary(activity)}
							</span>
						</div>
						<svg
							class="activity-item__chevron"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							aria-hidden="true"
						>
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
		initialDate={sheetInitialDate}
		onClose={() => {
			showActivitySheet = false;
			editingActivity = null;
		}}
	/>
{/if}

<style>
	.log-page__add-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding-inline: var(--space-4);
		block-size: 52px;
		background: var(--field-active);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		text-transform: uppercase;
		color: var(--color-ink);
		margin-block-end: var(--space-5);
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		svg {
			inline-size: 18px;
			block-size: 18px;
		}
		&:active {
			transform: translate(4px, 4px);
			box-shadow: none;
		}
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
		gap: var(--card-gap);
		list-style: none;
		padding: 0 var(--press-offset) 0 0;
		margin: 0;

		li {
			display: contents;
		}
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--color-ink);
		border: var(--rule) solid var(--field-active);
		box-shadow: var(--press-offset) var(--press-offset) 0 var(--field-active);
		text-align: start;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		&:active {
			transform: translate(var(--press-offset), var(--press-offset));
			box-shadow: none;
		}
	}

	.activity-item__info {
		flex: 1;
		min-inline-size: 0;
	}

	.activity-item__name {
		display: block;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		text-transform: uppercase;
		color: var(--color-text-primary);
	}

	.activity-item__meta {
		display: block;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--field-active);
		margin-block-start: var(--space-1);
	}

	.activity-item__chevron {
		inline-size: 18px;
		block-size: 18px;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
</style>
