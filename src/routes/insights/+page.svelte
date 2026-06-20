<script lang="ts">
	import { programStore } from '$lib/stores/program.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { toLocalIso } from '$lib/date';
	import {
		type RangeKey,
		computeRange,
		buildDatesBetween,
		xLabelsFor,
	} from '$lib/chart-utils';
	import RangeBar from '$lib/components/insights/RangeBar.svelte';
	import ChartMoodHabits from '$lib/components/insights/ChartMoodHabits.svelte';
	import ChartWeeklyVolume from '$lib/components/insights/ChartWeeklyVolume.svelte';
	import ChartActivityMix from '$lib/components/insights/ChartActivityMix.svelte';
	import ChartHabitRadar from '$lib/components/insights/ChartHabitRadar.svelte';
	import ChartStrengthProgress from '$lib/components/insights/ChartStrengthProgress.svelte';

	// ── Range state ───────────────────────────────────────────────
	let rangeKey    = $state<RangeKey>('last-7');
	let customStart = $state('');
	let customEnd   = $state('');

	let effectiveRange = $derived.by(() => computeRange(rangeKey, customStart, customEnd));

	let rangeLabel = $derived.by(() => {
		const { start, end } = effectiveRange;
		const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		const fmt = (d: string) => {
			const [, m, day] = d.split('-');
			return `${MONTHS[parseInt(m) - 1]} ${parseInt(day)}`;
		};
		switch (rangeKey) {
			case 'this-week': return 'This week';
			case 'last-7':    return 'Last 7 days';
			case 'mtd':       return 'Month to date';
			case 'ytd':       return 'Year to date';
			default:          return start && end ? `${fmt(start)} – ${fmt(end)}` : 'Select a range';
		}
	});

	let dates = $derived.by(() => {
		const { start, end } = effectiveRange;
		if (rangeKey === 'custom' && (!start || !end || start > end)) return [];
		return buildDatesBetween(start, end);
	});

	let xLabels = $derived(xLabelsFor(dates));

	// ── Data presence guards ──────────────────────────────────────
	let hasSessions   = $derived(programStore.sessions.length > 0);
	let hasActivities = $derived(activityStore.activities.length > 0);
	let hasHabitLogs  = $derived(habitStore.logs.length > 0);
	let hasHabits     = $derived(habitStore.activeHabits.length > 0);
	let hasAnyData    = $derived(hasSessions || hasActivities || hasHabitLogs);
</script>

<div class="insights-page">
	<header class="insights-page__header">
		<h1 class="insights-page__title">Insights</h1>
		<p class="insights-page__subtitle">{rangeLabel}</p>
	</header>

	<RangeBar bind:rangeKey bind:customStart bind:customEnd />

	{#if !hasAnyData}
		<div class="empty-state">
			<p class="empty-state__msg">Log workouts, activities, or habits to see your insights.</p>
		</div>
	{:else}
		<div class="charts">
			{#if hasHabitLogs}
				<section class="chart-section">
					<h2 class="chart-section__title">Mood vs Habits</h2>
					<p class="chart-section__desc">Mood compared to daily coffee and water intake.</p>
					<div class="chart-wrap">
						<ChartMoodHabits {dates} {xLabels} />
					</div>
				</section>
			{/if}

			{#if hasSessions}
				<section class="chart-section">
					<h2 class="chart-section__title">Weekly Volume</h2>
					<p class="chart-section__desc">Total pounds lifted per week.</p>
					<div class="chart-wrap">
						<ChartWeeklyVolume {dates} {xLabels} />
					</div>
				</section>
			{/if}

			{#if hasActivities}
				<section class="chart-section">
					<h2 class="chart-section__title">Activity Mix</h2>
					<p class="chart-section__desc">Breakdown of activities logged in the selected period.</p>
					<div class="chart-wrap chart-wrap--doughnut">
						<ChartActivityMix {dates} {rangeLabel} />
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

			{#if hasSessions}
				<section class="chart-section">
					<h2 class="chart-section__title">Strength Progress</h2>
					<p class="chart-section__desc">Max weight per session for your top 5 exercises.</p>
					<div class="chart-wrap">
						<ChartStrengthProgress {dates} {xLabels} />
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	/*
	  NOT using global .page — it caps width at 460px.
	  Sidebar offset handled globally by app__main padding-inline-start.
	*/
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

	/* ── Charts grid ───────────────────────────────────────────── */
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
