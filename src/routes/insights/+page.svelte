<script lang="ts">
	import { programStore } from '$lib/stores/program.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { healthStore } from '$lib/stores/health.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { todayIso } from '$lib/date';
	import { rollingBpAverage } from '$lib/health/metrics';
	import { type RangeKey, computeRange, buildDatesBetween, xLabelsFor } from '$lib/chart-utils';
	import RangeBar from '$lib/components/insights/RangeBar.svelte';
	import ChartMoodHabits from '$lib/components/insights/ChartMoodHabits.svelte';
	import ChartWeeklyVolume from '$lib/components/insights/ChartWeeklyVolume.svelte';
	import ChartActivityMix from '$lib/components/insights/ChartActivityMix.svelte';
	import ChartHabitRadar from '$lib/components/insights/ChartHabitRadar.svelte';
	import ChartHealthWeight from '$lib/components/insights/ChartHealthWeight.svelte';
	import ChartHealthBP from '$lib/components/insights/ChartHealthBP.svelte';

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

	let xLabels = $derived(xLabelsFor(dates));

	let practiceEnabled = $derived(prefsStore.practiceEnabled);
	let hasSessions = $derived(practiceEnabled && programStore.sessions.length > 0);
	let activityLogEnabled = $derived(prefsStore.activityLogEnabled);
	let habitsEnabled = $derived(prefsStore.habitsEnabled);
	let hasActivities = $derived(activityLogEnabled && activityStore.activities.length > 0);
	let hasHabitLogs = $derived(habitsEnabled && habitStore.logs.length > 0);
	let hasHabits = $derived(habitsEnabled && habitStore.activeHabits.length > 0);

	let healthEnabled = $derived(prefsStore.healthMetricsEnabled);
	let hasWeight = $derived(
		healthEnabled && healthStore.readings.some((r) => r.metricId === 'weight'),
	);
	let hasBp = $derived(
		healthEnabled && healthStore.readings.some((r) => r.metricId === 'bloodPressure'),
	);
	let latestWeight = $derived(healthStore.latestWeight());
	let bp7day = $derived(rollingBpAverage(healthStore.readings, 7, todayIso()));

	let hasAnyData = $derived(hasSessions || hasActivities || hasHabitLogs || hasWeight || hasBp);

	/** Only name the things the user has actually turned on. */
	let trackableNames = $derived.by(() => {
		const names: string[] = [];
		if (practiceEnabled) names.push('workouts');
		if (activityLogEnabled) names.push('activities');
		if (habitsEnabled) names.push('habits');
		if (healthEnabled) names.push('health metrics');
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
	{:else}
		<div class="charts">
			{#if hasHabitLogs}
				<section class="chart-section">
					<h2 class="chart-section__title">Mood vs Habits</h2>
					<p class="chart-section__desc">Mood compared to daily coffee and water intake.</p>
					<div class="chart-wrap">
						<ChartMoodHabits
							{dates}
							{xLabels}
						/>
					</div>
				</section>
			{/if}

			{#if hasSessions}
				<section class="chart-section">
					<h2 class="chart-section__title">Weekly Volume</h2>
					<p class="chart-section__desc">Total pounds lifted per week.</p>
					<div class="chart-wrap">
						<ChartWeeklyVolume {dates} />
					</div>
				</section>
			{/if}

			{#if hasActivities}
				<section class="chart-section">
					<h2 class="chart-section__title">Activity Mix</h2>
					<p class="chart-section__desc">Breakdown of activities logged in the selected period.</p>
					<div class="chart-wrap chart-wrap--doughnut">
						<ChartActivityMix
							{dates}
							{rangeLabel}
						/>
					</div>
				</section>
			{/if}

			{#if hasHabits && hasHabitLogs}
				<section class="chart-section">
					<h2 class="chart-section__title">Habit Balance</h2>
					<p class="chart-section__desc">Average habit consistency over the selected period.</p>
					<div class="chart-wrap chart-wrap--radar">
						<ChartHabitRadar {dates} />
					</div>
				</section>
			{/if}

			{#if healthEnabled && (hasWeight || hasBp)}
				<section class="chart-section chart-section--full">
					<h2 class="chart-section__title">Health Summary</h2>
					<div class="health-summary">
						{#if latestWeight}
							<div class="health-summary__stat">
								<span class="health-summary__num"
									>{latestWeight.values.value}<span class="health-summary__unit"
										>{prefsStore.weightUnit}</span
									></span
								>
								<span class="health-summary__label">Latest weight</span>
							</div>
						{/if}
						{#if bp7day}
							<div class="health-summary__stat">
								<span class="health-summary__num">{bp7day.systolic}/{bp7day.diastolic}</span>
								<span class="health-summary__label">7-day avg BP</span>
							</div>
						{/if}
					</div>
				</section>
			{/if}

			{#if hasWeight}
				<section class="chart-section">
					<h2 class="chart-section__title">Weight Trend</h2>
					<p class="chart-section__desc">Body weight over the selected period.</p>
					<div class="chart-wrap">
						<ChartHealthWeight
							{dates}
							{xLabels}
						/>
					</div>
				</section>
			{/if}

			{#if hasBp}
				<section class="chart-section">
					<h2 class="chart-section__title">Blood Pressure</h2>
					<p class="chart-section__desc">Daily average systolic and diastolic.</p>
					<div class="chart-wrap">
						<ChartHealthBP
							{dates}
							{xLabels}
						/>
					</div>
				</section>
			{/if}
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
		padding: 0 var(--page-gutter) var(--space-2);
	}

	.insights-page__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.03em;
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

		.chart-section:last-child:nth-child(odd) {
			grid-column: 1 / -1;
		}

		.chart-wrap {
			height: 300px;
		}

		.chart-wrap--doughnut,
		.chart-wrap--radar {
			height: 340px;
		}
	}

	.chart-section {
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-5);
	}

	@container app (inline-size >= 720px) {
		.chart-section--full {
			grid-column: 1 / -1;
		}
	}

	.health-summary {
		display: flex;
		gap: var(--space-8);
		margin-block-start: var(--space-3);
	}

	.health-summary__stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.health-summary__num {
		font-family: var(--font-mono);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.health-summary__unit {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin-inline-start: 4px;
	}

	.health-summary__label {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.chart-section__title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text-primary);
		margin: 0;
	}

	.chart-section__desc {
		margin: var(--space-1) 0 var(--space-4);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.chart-wrap {
		position: relative;
		height: 260px;
	}

	.chart-wrap--doughnut {
		height: 300px;
	}

	.chart-wrap--radar {
		height: 300px;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: var(--page-gutter);
	}

	.empty-state__msg {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		text-align: center;
		max-inline-size: 280px;
		line-height: 1.5;
	}
</style>
