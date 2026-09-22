<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { barY, defineChart, ruleY } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { programStore } from '$lib/stores/program.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { getMondayOf } from '$lib/chart-utils';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import { niceAxis } from '$lib/charts/scale';
	import {
		chartGrid,
		PLOT_MARGIN,
		chartTooltip,
		longDate,
		shortDate,
		withAlpha,
	} from '$lib/charts/theme';

	let { dates }: { dates: string[] } = $props();

	type Week = { monday: string; volume: number; sessions: number };

	let weeks = $derived.by<Week[]>(() => {
		const byMonday = new SvelteMap<string, Week>();
		for (const d of dates) {
			const monday = getMondayOf(d);
			if (!byMonday.has(monday)) byMonday.set(monday, { monday, volume: 0, sessions: 0 });
		}
		const dateSet = new Set(dates);
		for (const s of programStore.sessions) {
			if (!dateSet.has(s.date)) continue;
			const week = byMonday.get(getMondayOf(s.date));
			if (!week) continue;
			week.volume += s.totalVolume;
			week.sessions += 1;
		}
		return [...byMonday.values()];
	});

	let axis = $derived(
		niceAxis(
			weeks.map((w) => w.volume),
			{ includeZero: true },
		),
	);

	function build() {
		const accent = prefsStore.accentColor;
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: chartGrid() }),
				barY(weeks, {
					x: 'monday',
					y: 'volume',
					fill: (w) => withAlpha(accent, w.volume === 0 ? 0.2 : 0.75),
					stroke: accent,
					strokeWidth: 1,
					radius: 4,
					maxThickness: 32,
				}),
			],
			scales: {
				x: {
					scale: scaleBand<string>()
						.domain(weeks.map((w) => w.monday))
						.padding(0.2),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: { scale: scaleLinear().domain(axis.domain), axis: false },
			},
			margin: PLOT_MARGIN,
			tooltip: chartTooltip<Week>(
				(w) => `Week of ${longDate(w.monday)}`,
				(p) => ({
					label: `${p.datum.sessions} session${p.datum.sessions === 1 ? '' : 's'}`,
					value: `${p.datum.volume.toLocaleString()} lb`,
				}),
			),
		});
	}
</script>

<ScrollChart
	columns={weeks.length}
	definition={build}
	ariaLabel="Bar chart: total pounds lifted per week over the selected period"
	left={{ axis, unit: 'lb' }}
/>
