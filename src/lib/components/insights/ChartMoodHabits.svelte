<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { defineChart, lineY, ruleY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { habitStore } from '$lib/stores/habits.svelte';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import { niceAxis } from '$lib/charts/scale';
	import { CHART_GRID, PLOT_MARGIN, chartTooltip, longDate, shortDate } from '$lib/charts/theme';

	let { dates }: { dates: string[] } = $props();

	type Row = { date: string; value: number };

	const MOOD_COLOR = '#e879f9';
	const COFFEE_COLOR = '#f59e0b';
	const WATER_COLOR = '#60c6ff';

	let moodHabit = $derived(habitStore.habits.find((h) => h.type === 'mood'));
	let coffeeHabit = $derived(
		habitStore.habits.find((h) => h.name.toLowerCase().includes('coffee')),
	);
	let waterHabit = $derived(habitStore.habits.find((h) => h.name.toLowerCase().includes('water')));

	/** Only logged days — lines connect across gaps, as before. */
	function seriesFor(habitId: string | undefined): Row[] {
		if (!habitId) return [];
		const byDate = new SvelteMap<string, number>();
		for (const log of habitStore.logs) {
			if (log.habitId === habitId) byDate.set(log.date, log.value);
		}
		return dates.flatMap((date) => {
			const value = byDate.get(date);
			return value === undefined ? [] : [{ date, value }];
		});
	}

	let mood = $derived(seriesFor(moodHabit?.id));
	let coffee = $derived(seriesFor(coffeeHabit?.id));
	let water = $derived(seriesFor(waterHabit?.id));

	let moodAxis = niceAxis([], { min: -5, max: 5, count: 2 });
	let countAxis = $derived(
		niceAxis(
			[...coffee, ...water].map((r) => r.value),
			{ includeZero: true },
		),
	);

	let labels = $derived<Record<string, string>>({
		mood: 'Mood',
		coffee: coffeeHabit?.name ?? 'Coffee',
		water: waterHabit?.name ?? 'Water',
	});

	function build() {
		return defineChart({
			marks: [
				ruleY(moodAxis.ticks, { stroke: CHART_GRID }),
				lineY(coffee, {
					id: 'coffee',
					x: 'date',
					y: 'value',
					yScale: 'count',
					stroke: COFFEE_COLOR,
					strokeWidth: 1.5,
					strokeDasharray: '6 3',
					points: true,
				}),
				lineY(water, {
					id: 'water',
					x: 'date',
					y: 'value',
					yScale: 'count',
					stroke: WATER_COLOR,
					strokeWidth: 1.5,
					strokeDasharray: '2 3',
					points: true,
				}),
				lineY(mood, {
					id: 'mood',
					x: 'date',
					y: 'value',
					stroke: MOOD_COLOR,
					strokeWidth: 2,
					points: true,
				}),
			],
			scales: {
				x: {
					scale: scalePoint<string>().domain(dates).padding(0.5),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: { scale: scaleLinear().domain(moodAxis.domain), axis: false },
				count: {
					channel: 'y',
					scale: scaleLinear().domain(countAxis.domain),
					axis: false,
				},
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
	ariaLabel="Line chart: mood, coffee, and water over the selected period"
	left={{ axis: moodAxis, unit: 'mood' }}
	right={{ axis: countAxis, unit: 'count' }}
/>

<ul
	class="chart-legend"
	aria-hidden="true"
>
	{#if moodHabit}<li><span style:background={MOOD_COLOR}></span>Mood</li>{/if}
	{#if coffeeHabit}<li><span style:background={COFFEE_COLOR}></span>{coffeeHabit.name}</li>{/if}
	{#if waterHabit}<li><span style:background={WATER_COLOR}></span>{waterHabit.name}</li>{/if}
</ul>
