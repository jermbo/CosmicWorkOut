<!-- Weight line under the blood-pressure view of the Health card (US-060), on the same dates. -->
<script lang="ts">
	import { defineChart, lineY, ruleY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import { niceAxis } from '$lib/charts/scale';
	import {
		chartGrid,
		PLOT_MARGIN,
		chartTooltip,
		longDate,
		shortDate,
		FIELD,
	} from '$lib/charts/theme';
	import type { WeightRow } from '$lib/health/bpZones';

	let { dates, rows, unit }: { dates: string[]; rows: WeightRow[]; unit: string } = $props();

	let axis = $derived(
		niceAxis(
			rows.map((r) => r.value),
			{ count: 2 },
		),
	);

	function build() {
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: chartGrid() }),
				lineY(rows, {
					x: 'date',
					y: 'value',
					stroke: FIELD.health,
					strokeWidth: 2,
					points: true,
				}),
			],
			scales: {
				x: {
					scale: scalePoint<string>().domain(dates).padding(0.5),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: { scale: scaleLinear().domain(axis.domain), axis: false },
			},
			margin: PLOT_MARGIN,
			tooltip: chartTooltip<WeightRow>(
				(d) => longDate(d.date),
				(p) => ({ label: 'Weight', value: `${p.datum.value} ${unit}` }),
			),
		});
	}
</script>

<ScrollChart
	columns={dates.length}
	definition={build}
	height={120}
	ariaLabel="Line chart: body weight over the selected period"
	left={{ axis, unit }}
/>
