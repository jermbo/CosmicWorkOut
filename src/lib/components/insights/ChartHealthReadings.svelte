<!--
	Readings view of the Health card (US-060): one bar per blood-pressure reading,
	from diastolic up to systolic, in the colour of its zone. Readings on the same
	date sit side by side, in time order. Dashed lines mark the top of Normal.
-->
<script lang="ts">
	import { barY, defineChart, group, ruleY } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
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
	import { BP_NORMAL_LIMIT, BP_ZONES, type BpRow } from '$lib/health/bpZones';

	let { dates, rows }: { dates: string[]; rows: BpRow[] } = $props();

	/** A reading's place among the readings of its date: 0 for the first, 1 for the next. */
	type Bar = BpRow & { slot: number; alone: boolean };

	// Rows come sorted by date then time, so a reading's slot counts up from the
	// previous one on the same date.
	let bars = $derived.by<Bar[]>(() => {
		const out: Bar[] = [];
		for (const r of rows) {
			const prev = out.at(-1);
			out.push({ ...r, slot: prev?.date === r.date ? prev.slot + 1 : 0, alone: true });
		}
		for (let i = 1; i < out.length; i++) {
			if (out[i].date === out[i - 1].date) out[i].alone = out[i - 1].alone = false;
		}
		return out;
	});

	// A group splits every column into as many slots as the busiest day, so a lone
	// reading is drawn by its own mark to stay centred on its date.
	let lone = $derived(bars.filter((b) => b.alone));
	let paired = $derived(bars.filter((b) => !b.alone));

	const BAR_STYLE = {
		fill: (b: Bar) => b.zone.color,
		stroke: FIELD.paper,
		strokeOpacity: 0.2,
		strokeWidth: 1,
		radius: 3,
		maxThickness: 14,
	};

	// Keep both guide lines on the axis, even when every reading sits between them.
	let axis = $derived(
		niceAxis([
			...rows.flatMap((r) => [r.systolic, r.diastolic]),
			BP_NORMAL_LIMIT.systolic + 10,
			BP_NORMAL_LIMIT.diastolic - 10,
		]),
	);

	let zonesShown = $derived(BP_ZONES.filter((z) => rows.some((r) => r.zone.id === z.id)));

	function build() {
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: chartGrid() }),
				ruleY([BP_NORMAL_LIMIT.systolic, BP_NORMAL_LIMIT.diastolic], {
					stroke: FIELD.paper,
					strokeOpacity: 0.45,
					strokeDasharray: '4 4',
				}),
				barY(lone, { x: 'date', y1: 'diastolic', y2: 'systolic', ...BAR_STYLE }),
				barY(paired, {
					x: 'date',
					y1: 'diastolic',
					y2: 'systolic',
					z: (b) => b.slot,
					layout: group({ padding: 0.25 }),
					...BAR_STYLE,
				}),
			],
			scales: {
				x: {
					scale: scaleBand<string>().domain(dates).padding(0.2),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: { scale: scaleLinear().domain(axis.domain), axis: false },
			},
			margin: PLOT_MARGIN,
			tooltip: chartTooltip<Bar>(
				(b) => `${longDate(b.date)}${b.time ? ` · ${b.time}` : ''}`,
				(p) => ({
					label: p.datum.zone.label,
					value: `${p.datum.systolic}/${p.datum.diastolic}${p.datum.pulse === null ? '' : ` · ♥ ${p.datum.pulse}`}`,
					color: p.datum.zone.color,
				}),
			),
		});
	}
</script>

<ScrollChart
	columns={dates.length}
	definition={build}
	ariaLabel="Range bars: each blood-pressure reading from diastolic to systolic, coloured by zone"
	left={{ axis, unit: 'mmHg' }}
/>

<ul
	class="chart-legend"
	aria-hidden="true"
>
	{#each zonesShown as z (z.id)}
		<li><span style:background={z.color}></span>{z.label}</li>
	{/each}
	<li><span class="legend-dash"></span>120 / 80</li>
</ul>

<style>
	.legend-dash {
		block-size: 0 !important;
		border-block-start: 2px dashed var(--color-text-secondary);
	}
</style>
