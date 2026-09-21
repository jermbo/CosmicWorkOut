<!-- US-044 #6 Time of day: when a baseline's entries get recorded, by hour. -->
<script lang="ts">
	import { barY, defineChart, ruleY } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { hourHistogram, hourLabel } from '$lib/insights/logic';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import { niceAxis } from '$lib/charts/scale';
	import { CHART_GRID, PLOT_MARGIN, chartTooltip, withAlpha } from '$lib/charts/theme';
	import ChipPicker from './ChipPicker.svelte';

	let { dates }: { dates: string[] } = $props();

	type Hour = { hour: string; index: number; entries: number };

	let baselines = $derived(baselineStore.activeBaselines);
	let pickedId = $state('');
	let baseline = $derived(baselines.find((b) => b.id === pickedId) ?? baselines[0] ?? null);

	let hours = $derived.by<Hour[]>(() => {
		if (!baseline) return [];
		const inRange = new Set(dates);
		const stamps = baselineStore.logs
			.filter((l) => l.baselineId === baseline.id && inRange.has(l.date))
			.map((l) => l.recordedAt);
		return hourHistogram(stamps).map((entries, index) => ({
			hour: hourLabel(index),
			index,
			entries,
		}));
	});

	let total = $derived(hours.reduce((s, h) => s + h.entries, 0));
	let axis = $derived(
		niceAxis(
			hours.map((h) => h.entries),
			{ includeZero: true, count: 3 },
		),
	);

	function build() {
		const accent = prefsStore.accentColor;
		return defineChart({
			marks: [
				ruleY(axis.ticks, { stroke: CHART_GRID }),
				barY(hours, {
					x: 'hour',
					y: 'entries',
					fill: withAlpha(accent, 0.75),
					stroke: accent,
					strokeWidth: 1,
					radius: 3,
					maxThickness: 18,
				}),
			],
			scales: {
				x: {
					scale: scaleBand<string>()
						.domain(hours.map((h) => h.hour))
						.padding(0.2),
					axis: { ticks: { size: 0 } },
				},
				y: { scale: scaleLinear().domain(axis.domain), axis: false },
			},
			margin: PLOT_MARGIN,
			tooltip: chartTooltip<Hour>(
				(h) => `${hourLabel(h.index)}–${hourLabel((h.index + 1) % 24)}`,
				(p) => ({ label: 'Entries', value: String(p.datum.entries) }),
			),
		});
	}
</script>

{#if !baseline}
	<p class="insight-empty">Add a baseline to see when you get it done.</p>
{:else}
	{#if baselines.length > 1}
		<ChipPicker
			label="Baseline"
			options={baselines.map((b) => ({ id: b.id, label: b.name }))}
			value={baseline.id}
			onchange={(id) => (pickedId = id)}
		/>
	{/if}
	{#if total === 0}
		<p class="insight-note">No {baseline.name} entries in this range.</p>
	{:else}
		<ScrollChart
			columns={24}
			columnWidth={30}
			startAt="start"
			height={200}
			definition={build}
			ariaLabel="Bar chart: {baseline.name} entries by hour of day"
			left={{ axis }}
		/>
		<p class="insight-note">
			Uses the time each entry was saved — a backdated entry counts at the time you logged it.
		</p>
	{/if}
{/if}
