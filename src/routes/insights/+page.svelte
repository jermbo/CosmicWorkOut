<script lang="ts">
	import { programStore } from '$lib/stores/program.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { healthStore } from '$lib/stores/health.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { type RangeKey, computeRange, buildDatesBetween } from '$lib/chart-utils';
	import RangeBar from '$lib/components/insights/RangeBar.svelte';
	import ChartMoodHabits from '$lib/components/insights/ChartMoodHabits.svelte';
	import ChartWeeklyVolume from '$lib/components/insights/ChartWeeklyVolume.svelte';
	import ChartActivityMix from '$lib/components/insights/ChartActivityMix.svelte';
	import ChartHealth from '$lib/components/insights/ChartHealth.svelte';
	import ChartAllHabits from '$lib/components/insights/ChartAllHabits.svelte';
	import ChartWeekVsWeek from '$lib/components/insights/ChartWeekVsWeek.svelte';
	import InsightCard from '$lib/components/insights/InsightCard.svelte';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { INSIGHT_CHARTS, chartAvailable, type InsightFeature } from '$lib/insights/charts';
	import { resolve } from '$app/paths';

	let rangeKey = $state<RangeKey>('last-7');
	let customStart = $state('');
	let customEnd = $state('');

	let effectiveRange = $derived.by(() => computeRange(rangeKey, customStart, customEnd));

	let rangeLabel = $derived.by(() => {
		const { start, end } = effectiveRange;
		const MONTHS = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		const fmt = (d: string) => {
			const [, m, day] = d.split('-');
			return `${MONTHS[parseInt(m) - 1]} ${parseInt(day)}`;
		};
		switch (rangeKey) {
			case 'this-week':
				return 'This week';
			case 'last-7':
				return 'Last 7 days';
			case 'mtd':
				return 'Month to date';
			case 'ytd':
				return 'Year to date';
			default:
				if (start && end) return `${fmt(start)} – ${fmt(end)}`;
				return 'Select a range';
		}
	});

	let dates = $derived.by(() => {
		const { start, end } = effectiveRange;
		if (rangeKey === 'custom' && (!start || !end || start > end)) return [];
		return buildDatesBetween(start, end);
	});

	let practiceEnabled = $derived(prefsStore.practiceEnabled);
	let hasSessions = $derived(practiceEnabled && programStore.sessions.length > 0);
	let activityLogEnabled = $derived(prefsStore.activityLogEnabled);
	let habitsEnabled = $derived(prefsStore.habitsEnabled);
	let hasActivities = $derived(activityLogEnabled && activityStore.activities.length > 0);
	let hasHabitLogs = $derived(habitsEnabled && habitStore.logs.length > 0);

	let healthEnabled = $derived(prefsStore.healthMetricsEnabled);
	let hasWeight = $derived(
		healthEnabled && healthStore.readings.some((r) => r.metricId === 'weight'),
	);
	let hasBp = $derived(
		healthEnabled && healthStore.readings.some((r) => r.metricId === 'bloodPressure'),
	);

	let baselinesEnabled = $derived(prefsStore.baselinesEnabled);
	let hasBaselineLogs = $derived(baselinesEnabled && baselineStore.logs.length > 0);

	let hasAnyData = $derived(
		hasSessions || hasActivities || hasHabitLogs || hasWeight || hasBp || hasBaselineLogs,
	);

	let enabledFeatures = $derived<Record<InsightFeature, boolean>>({
		habits: habitsEnabled,
		practice: practiceEnabled,
		activity: activityLogEnabled,
		health: healthEnabled,
		baselines: baselinesEnabled,
	});

	/** Charts whose feature is on, in page order (US-043). */
	let availableCharts = $derived(INSIGHT_CHARTS.filter((c) => chartAvailable(c, enabledFeatures)));
	let visibleCharts = $derived(availableCharts.filter((c) => !prefsStore.isChartHidden(c.id)));

	/** Existing charts need their own data; experimental ones explain their own empty state. */
	let hasData = $derived<Record<string, boolean>>({
		'mood-habits': hasHabitLogs,
		'weekly-volume': hasSessions,
		'activity-mix': hasActivities,
		'health-summary': hasWeight || hasBp,
	});

	/** Only name the things the user has actually turned on. */
	let trackableNames = $derived.by(() => {
		const names: string[] = [];
		if (practiceEnabled) names.push('workouts');
		if (activityLogEnabled) names.push('activities');
		if (habitsEnabled) names.push('habits');
		if (healthEnabled) names.push('health metrics');
		if (baselinesEnabled) names.push('baselines');
		return names;
	});

	let emptyMessage = $derived.by(() => {
		if (trackableNames.length === 0) {
			return 'Turn on something to track in Settings to see your insights.';
		}
		if (trackableNames.length === 1) return `Log ${trackableNames[0]} to see your insights.`;
		const last = trackableNames[trackableNames.length - 1];
		return `Log ${trackableNames.slice(0, -1).join(', ')}, or ${last} to see your insights.`;
	});
</script>

<div class="insights-page">
	<header class="insights-page__header">
		<h1 class="insights-page__title">Insights</h1>
		<p class="insights-page__subtitle">{rangeLabel}</p>
	</header>

	<RangeBar
		bind:rangeKey
		bind:customStart
		bind:customEnd
	/>

	{#if !hasAnyData}
		<div class="empty-state">
			<p class="empty-state__msg">{emptyMessage}</p>
		</div>
	{:else if visibleCharts.length === 0}
		<div class="empty-state">
			<p class="empty-state__msg">
				Every chart is hidden. <a href={resolve('/settings/insights')}>Choose charts to show</a> in Settings
				→ Insights.
			</p>
		</div>
	{:else}
		<div class="charts">
			{#each visibleCharts as chart (chart.id)}
				<InsightCard {chart}>
					{#if hasData[chart.id] === false}
						<p class="insight-empty">Nothing logged in this range yet.</p>
					{:else if chart.id === 'mood-habits'}
						<ChartMoodHabits {dates} />
					{:else if chart.id === 'all-habits'}
						<ChartAllHabits {dates} />
					{:else if chart.id === 'week-vs-week'}
						<ChartWeekVsWeek />
					{:else if chart.id === 'weekly-volume'}
						<ChartWeeklyVolume {dates} />
					{:else if chart.id === 'activity-mix'}
						<ChartActivityMix
							{dates}
							{rangeLabel}
						/>
					{:else if chart.id === 'health-summary'}
						<ChartHealth {dates} />
					{/if}
				</InsightCard>
			{/each}
		</div>
	{/if}
</div>

<style>
	.insights-page {
		inline-size: 100%;
		max-inline-size: 920px;
		padding-block-start: var(--space-6);
		padding-block-end: calc(var(--nav-height) + var(--safe-bottom) + var(--space-8));
	}

	@container app (inline-size >= 720px) {
		.insights-page {
			padding-block-end: var(--space-10);
		}
	}

	.insights-page__header {
		margin-inline: var(--page-gutter);
		padding-block-end: var(--space-2);
		border-block-end: var(--rule) solid var(--color-paper);
	}

	.insights-page__title {
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 2.5rem;
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.04em;
		color: var(--color-text-primary);
		margin: 0;
	}

	.insights-page__subtitle {
		margin: var(--space-1) 0 0;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.charts {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-6);
		padding: 0 var(--page-gutter) var(--space-4);
	}

	@container app (inline-size >= 720px) {
		.charts {
			grid-template-columns: 1fr 1fr;
		}
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: var(--page-gutter);
	}

	.empty-state__msg a {
		color: var(--color-accent-text);
		font-weight: 600;
	}

	.empty-state__msg {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		text-align: center;
		max-inline-size: 280px;
		line-height: 1.5;
	}
</style>
