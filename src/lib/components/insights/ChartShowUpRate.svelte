<!-- US-044 #2 Showing-up rate: % of days logged per week, per baseline and habit. -->
<script lang="ts">
	import { defineChart, lineY, ruleY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { habitColor } from '$lib/habitColors';
	import {
		baselineLoggedDates,
		habitDailyValues,
		showUpRate,
		type WeekRate,
	} from '$lib/insights/logic';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import { niceAxis } from '$lib/charts/scale';
	import {
		chartGrid,
		PLOT_MARGIN,
		SERIES_COLORS,
		chartTooltip,
		longDate,
		shortDate,
	} from '$lib/charts/theme';
	import ChipPicker from './ChipPicker.svelte';

	let { dates }: { dates: string[] } = $props();

	type Item = { id: string; label: string; color: string; logged: Set<string> };
	type Row = WeekRate & { itemId: string };

	const ALL = '__all';
	let focus = $state(ALL);

	let items = $derived.by<Item[]>(() => {
		const list: Item[] = [];
		if (prefsStore.baselinesEnabled) {
			baselineStore.activeBaselines.forEach((b, i) =>
				list.push({
					id: `b:${b.id}`,
					label: b.name,
					color: SERIES_COLORS[i % SERIES_COLORS.length],
					logged: baselineLoggedDates(baselineStore.logs, b.id),
				}),
			);
		}
		if (prefsStore.habitsEnabled) {
			for (const h of habitStore.activeHabits) {
				list.push({
					id: `h:${h.id}`,
					label: h.name,
					color: habitColor(h),
					logged: new Set(habitDailyValues(h, habitStore.logs).keys()),
				});
			}
		}
		return list;
	});

	let shown = $derived(focus === ALL ? items : items.filter((i) => i.id === focus));
	let series = $derived(
		shown.map((item) => ({
			item,
			rows: showUpRate(item.logged, dates).map((r) => ({ ...r, itemId: item.id })),
		})),
	);
	let weeks = $derived(series[0]?.rows.map((r) => r.week) ?? []);
	let labels = $derived(new Map(items.map((i) => [i.id, i.label])));

	const axis = niceAxis([], { min: 0, max: 100 });

	function build() {
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: chartGrid() }),
				...series.map((s) =>
					lineY(s.rows, {
						id: s.item.id,
						x: 'week',
						y: 'pct',
						stroke: s.item.color,
						strokeWidth: 2,
						points: true,
					}),
				),
			],
			scales: {
				x: {
					scale: scalePoint<string>().domain(weeks).padding(0.5),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: { scale: scaleLinear().domain(axis.domain), axis: false },
			},
			margin: PLOT_MARGIN,
			focus: 'group-x',
			tooltip: chartTooltip<Row>(
				(r) => `Week of ${longDate(r.week)}`,
				(p) => ({
					label: labels.get(p.datum.itemId) ?? '',
					value: `${p.datum.pct}% (${p.datum.logged}/${p.datum.days} days)`,
				}),
			),
		});
	}
</script>

{#if items.length === 0}
	<p class="insight-empty">Add a baseline or habit to see how often you show up.</p>
{:else}
	<ChipPicker
		label="Show"
		options={[
			{ id: ALL, label: 'All' },
			...items.map((i) => ({ id: i.id, label: i.label, color: i.color })),
		]}
		value={focus}
		onchange={(id) => (focus = id)}
	/>
	<ScrollChart
		columns={weeks.length}
		definition={build}
		ariaLabel="Line chart: percent of days logged per week for each baseline and habit"
		left={{ axis, format: (v) => `${v}%` }}
	/>
{/if}
