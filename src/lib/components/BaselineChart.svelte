<!--
	Daily totals per metric against each metric's flat baseline line (US-036, reworked
	for v1.10.0). Also the body of the Insights "Baseline growth" chart (US-044): pass
	`metricId` to show one metric, and `showBests` to mark each metric's best day.
-->
<script lang="ts">
	import { defineChart, dot, lineY, ruleY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import type { Baseline } from '$lib/db/types';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { dailySeries, formatValue, visibleMetrics } from '$lib/baselines/logic';
	import { bestDay } from '$lib/insights/logic';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import { niceAxis } from '$lib/charts/scale';
	import {
		CHART_GRID,
		PLOT_MARGIN,
		SERIES_COLORS,
		chartTooltip,
		longDate,
		shortDate,
	} from '$lib/charts/theme';

	let {
		baseline,
		dates,
		metricId = null,
		showBests = false,
	}: {
		baseline: Baseline;
		dates: string[];
		/** Show only this metric; null shows all visible metrics. */
		metricId?: string | null;
		showBests?: boolean;
	} = $props();

	type Row = { date: string; value: number; metricId: string };

	let metrics = $derived(
		visibleMetrics(baseline)
			.map((m, i) => ({ metric: m, color: SERIES_COLORS[i % SERIES_COLORS.length] }))
			.filter(({ metric }) => metricId === null || metric.id === metricId),
	);

	let series = $derived.by(() => {
		const logs = baselineStore.logs.filter((l) => l.baselineId === baseline.id);
		return metrics.map(({ metric, color }) => {
			const values = dailySeries(logs, metric.id, dates);
			const rows: Row[] = dates.map((date, i) => ({ date, value: values[i], metricId: metric.id }));
			const best = bestDay(rows);
			return { metric, color, rows, best };
		});
	});

	let axis = $derived(
		niceAxis(
			series.flatMap((s) => [...s.rows.map((r) => r.value), s.metric.baseline]),
			{ includeZero: true },
		),
	);

	let byId = $derived(new Map(metrics.map(({ metric }) => [metric.id, metric])));

	function build() {
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: CHART_GRID }),
				...series.map((s) =>
					ruleY([s.metric.baseline], {
						stroke: s.color,
						strokeOpacity: 0.55,
						strokeDasharray: '5 4',
					}),
				),
				...series.map((s) =>
					lineY(s.rows, {
						id: s.metric.id,
						x: 'date',
						y: 'value',
						stroke: s.color,
						strokeWidth: 2,
						points: true,
					}),
				),
				...(showBests
					? series.flatMap((s) =>
							s.best
								? [
										dot([s.best], {
											id: `best-${s.metric.id}`,
											x: 'date',
											y: 'value',
											r: 7,
											fill: 'transparent',
											stroke: s.color,
											strokeWidth: 2,
										}),
									]
								: [],
						)
					: []),
			],
			scales: {
				x: {
					scale: scalePoint<string>().domain(dates).padding(0.5),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: { scale: scaleLinear().domain(axis.domain), axis: false },
			},
			margin: PLOT_MARGIN,
			focus: 'group-x',
			tooltip: chartTooltip<Row>(
				(d) => longDate(d.date),
				(p) => {
					const metric = byId.get(p.datum.metricId);
					const isBest = p.markId.startsWith('best-');
					return {
						label: `${metric?.name ?? ''}${isBest ? ' — best' : ''}`,
						value: metric ? formatValue(metric, p.datum.value) : String(p.datum.value),
					};
				},
			),
		});
	}

	let ariaLabel = $derived(
		`Line chart: daily totals for ${baseline.name}, each against its baseline, over the selected period`,
	);
</script>

<ScrollChart
	columns={dates.length}
	definition={build}
	{ariaLabel}
	left={{ axis }}
/>

<ul
	class="chart-legend"
	aria-hidden="true"
>
	{#each series as s (s.metric.id)}
		<li>
			<span style:background={s.color}></span>{s.metric.name}
			<small>(base {formatValue(s.metric, s.metric.baseline)})</small>
		</li>
	{/each}
</ul>
