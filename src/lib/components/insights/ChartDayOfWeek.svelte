<!-- US-044 #3 Day-of-week pattern: average per weekday for one baseline metric or habit. -->
<script lang="ts">
	import { barY, defineChart, ruleY } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { Chart } from '@tanstack/charts/svelte';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { formatValue, visibleMetrics } from '$lib/baselines/logic';
	import { habitColor } from '$lib/habitColors';
	import {
		WEEKDAY_LABELS,
		habitDailyValues,
		metricDailyTotals,
		weekdayAverages,
		type WeekdayAverage,
	} from '$lib/insights/logic';
	import { niceAxis } from '$lib/charts/scale';
	import { CHART_GRID, SERIES_COLORS, chartTooltip, withAlpha } from '$lib/charts/theme';

	let { dates }: { dates: string[] } = $props();

	type Source = {
		id: string;
		label: string;
		color: string;
		values: () => Map<string, number>;
		format: (v: number) => string;
	};

	let sources = $derived.by<Source[]>(() => {
		const list: Source[] = [];
		if (prefsStore.baselinesEnabled) {
			for (const b of baselineStore.activeBaselines) {
				visibleMetrics(b).forEach((m, i) =>
					list.push({
						id: `b:${b.id}:${m.id}`,
						label: `${b.name} · ${m.name}`,
						color: SERIES_COLORS[i % SERIES_COLORS.length],
						values: () => metricDailyTotals(baselineStore.logs, b.id, m.id),
						format: (v) => formatValue(m, v),
					}),
				);
			}
		}
		if (prefsStore.habitsEnabled) {
			for (const h of habitStore.activeHabits) {
				if (h.type === 'boolean') continue;
				list.push({
					id: `h:${h.id}`,
					label: h.name,
					color: habitColor(h),
					values: () => habitDailyValues(h, habitStore.logs),
					format: (v) =>
						h.type === 'mood' && v > 0 ? `+${v}` : `${v}${h.unit ? ` ${h.unit}` : ''}`,
				});
			}
		}
		return list;
	});

	let pickedId = $state('');
	let source = $derived(sources.find((s) => s.id === pickedId) ?? sources[0] ?? null);
	let averages = $derived(source ? weekdayAverages(source.values(), dates) : []);
	let bars = $derived(
		averages.filter((a): a is WeekdayAverage & { average: number } => a.average !== null),
	);
	let axis = $derived(
		niceAxis(
			bars.map((b) => b.average),
			{ includeZero: true },
		),
	);

	let definition = $derived.by(() => {
		const color = source?.color ?? '#888888';
		const format = source?.format ?? String;
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: CHART_GRID }),
				barY(bars, {
					x: 'weekday',
					y: 'average',
					fill: withAlpha(color, 0.75),
					stroke: color,
					strokeWidth: 1,
					radius: 4,
					maxThickness: 36,
				}),
			],
			scales: {
				x: {
					scale: scaleBand<string>()
						.domain([...WEEKDAY_LABELS])
						.padding(0.2),
					axis: { ticks: { size: 0 } },
				},
				y: {
					scale: scaleLinear().domain(axis.domain),
					axis: { ticks: { values: axis.ticks, size: 0 } },
				},
			},
			tooltip: chartTooltip<WeekdayAverage & { average: number }>(
				(a) => a.weekday,
				(p) => ({
					label: `avg of ${p.datum.days} day${p.datum.days === 1 ? '' : 's'}`,
					value: format(p.datum.average),
				}),
			),
		});
	});

	let emptyDays = $derived(averages.filter((a) => a.average === null).map((a) => a.weekday));
</script>

{#if !source}
	<p class="insight-empty">Add a baseline or a habit with a number to see weekday patterns.</p>
{:else}
	<label class="insight-select">
		<span>Show</span>
		<select
			value={source.id}
			onchange={(e) => (pickedId = e.currentTarget.value)}
		>
			{#each sources as s (s.id)}
				<option value={s.id}>{s.label}</option>
			{/each}
		</select>
	</label>
	<div class="dow-chart">
		<Chart
			{definition}
			height={220}
			ariaLabel="Bar chart: average {source.label} for each weekday"
		/>
	</div>
	{#if emptyDays.length > 0 && bars.length > 0}
		<p class="insight-note">No data on {emptyDays.join(', ')} in this range.</p>
	{:else if bars.length === 0}
		<p class="insight-note">Nothing logged for {source.label} in this range.</p>
	{/if}
{/if}

<style>
	.dow-chart {
		color: var(--color-text-secondary);
	}
</style>
