<script lang="ts">
	import { defineChart, lineY, ruleY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { healthStore } from '$lib/stores/health.svelte';
	import { bloodPressureDailyAverages } from '$lib/health/metrics';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import { niceAxis } from '$lib/charts/scale';
	import { chartGrid, PLOT_MARGIN, chartTooltip, longDate, shortDate } from '$lib/charts/theme';

	let { dates }: { dates: string[] } = $props();

	type Row = { date: string; value: number };

	const SERIES = [
		{ id: 'systolic', label: 'Systolic', color: '#e55733' },
		{ id: 'diastolic', label: 'Diastolic', color: '#60c6ff' },
		{ id: 'pulse', label: 'Pulse', color: '#b286fd' },
	] as const;

	let series = $derived.by(() => {
		const dateSet = new Set(dates);
		const dailies = bloodPressureDailyAverages(healthStore.readings).filter((d) =>
			dateSet.has(d.date),
		);
		const pick = (key: 'systolic' | 'diastolic' | 'pulse'): Row[] =>
			dailies.flatMap((d) => (d[key] === null ? [] : [{ date: d.date, value: d[key] as number }]));
		return { systolic: pick('systolic'), diastolic: pick('diastolic'), pulse: pick('pulse') };
	});

	let visible = $derived(SERIES.filter((s) => series[s.id].length > 0));

	let axis = $derived(niceAxis(visible.flatMap((s) => series[s.id].map((r) => r.value))));

	let labels: Record<string, string> = Object.fromEntries(SERIES.map((s) => [s.id, s.label]));

	function build() {
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: chartGrid() }),
				...visible.map((s) =>
					lineY(series[s.id], {
						id: s.id,
						x: 'date',
						y: 'value',
						stroke: s.color,
						strokeWidth: 2,
						points: true,
					}),
				),
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
				(p) => ({ label: labels[p.markId] ?? p.markId, value: String(p.datum.value) }),
			),
		});
	}
</script>

<ScrollChart
	columns={dates.length}
	definition={build}
	ariaLabel="Line chart: daily average systolic and diastolic blood pressure over the selected period"
	left={{ axis, unit: 'mmHg' }}
/>

<ul
	class="chart-legend"
	aria-hidden="true"
>
	{#each visible as s (s.id)}
		<li><span style:background={s.color}></span>{s.label}</li>
	{/each}
</ul>
