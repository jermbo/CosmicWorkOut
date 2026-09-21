<!-- US-044 #1 Baseline growth + #7 personal bests: pick a baseline, optionally one metric. -->
<script lang="ts">
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { visibleMetrics } from '$lib/baselines/logic';
	import { SERIES_COLORS } from '$lib/charts/theme';
	import BaselineChart from '$lib/components/BaselineChart.svelte';
	import ChipPicker from './ChipPicker.svelte';

	let { dates }: { dates: string[] } = $props();

	const ALL = '__all';

	let baselines = $derived(baselineStore.activeBaselines);
	let pickedId = $state<string | null>(null);
	let baseline = $derived(baselines.find((b) => b.id === pickedId) ?? baselines[0] ?? null);

	let metricPick = $state(ALL);
	let metrics = $derived(baseline ? visibleMetrics(baseline) : []);
	let metricId = $derived(metrics.some((m) => m.id === metricPick) ? metricPick : null);

	function pickBaseline(id: string) {
		pickedId = id;
		metricPick = ALL;
	}
</script>

{#if !baseline}
	<p class="insight-empty">Add a baseline in Settings to see it grow.</p>
{:else}
	{#if baselines.length > 1}
		<ChipPicker
			label="Baseline"
			options={baselines.map((b) => ({ id: b.id, label: b.name }))}
			value={baseline.id}
			onchange={pickBaseline}
		/>
	{/if}
	{#if metrics.length > 1}
		<ChipPicker
			label="Metric"
			options={[
				{ id: ALL, label: 'All' },
				...metrics.map((m, i) => ({
					id: m.id,
					label: m.name,
					color: SERIES_COLORS[i % SERIES_COLORS.length],
				})),
			]}
			value={metricId ?? ALL}
			onchange={(id) => (metricPick = id)}
		/>
	{/if}
	{#key `${baseline.id}:${metricId}`}
		<BaselineChart
			{baseline}
			{dates}
			{metricId}
			showBests
		/>
	{/key}
{/if}
