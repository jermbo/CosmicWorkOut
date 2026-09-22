<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { defineChart, lineY, ruleY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { healthStore } from '$lib/stores/health.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { isWeightReading } from '$lib/health/metrics';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import { niceAxis } from '$lib/charts/scale';
	import { chartGrid, PLOT_MARGIN, chartTooltip, longDate, shortDate } from '$lib/charts/theme';

	let { dates }: { dates: string[] } = $props();

	type Row = { date: string; value: number };

	let unit = $derived(prefsStore.weightUnit);

	// Missing days are skipped, so the line connects readings across gaps.
	let rows = $derived.by<Row[]>(() => {
		const byDate = new SvelteMap<string, number>();
		for (const r of healthStore.readings) {
			if (isWeightReading(r)) byDate.set(r.date, r.values.value);
		}
		return dates.flatMap((date) => {
			const value = byDate.get(date);
			return value === undefined ? [] : [{ date, value }];
		});
	});

	let axis = $derived(niceAxis(rows.map((r) => r.value)));

	function build() {
		const accent = prefsStore.accentColor;
		const [lo, hi] = axis.domain;
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: chartGrid() }),
				lineY(rows, {
					x: 'date',
					y: 'value',
					stroke: accent,
					strokeWidth: 2,
					points: true,
				}),
			],
			scales: {
				x: {
					scale: scalePoint<string>().domain(dates).padding(0.5),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: { scale: scaleLinear().domain([lo, hi]), axis: false },
			},
			margin: PLOT_MARGIN,
			tooltip: chartTooltip<Row>(
				(d) => longDate(d.date),
				(p) => ({ label: 'Weight', value: `${p.datum.value} ${unit}` }),
			),
		});
	}
</script>

<ScrollChart
	columns={dates.length}
	definition={build}
	ariaLabel="Line chart: body weight over the selected period"
	left={{ axis, unit }}
/>
