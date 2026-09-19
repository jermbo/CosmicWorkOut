<script lang="ts">
	import type { Baseline } from '$lib/db/types';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { dailySeries, directionLabel } from '$lib/baselines/logic';
	import { Chart, chartTheme } from '$lib/chart-utils';

	let { baseline, dates, xLabels }: { baseline: Baseline; dates: string[]; xLabels: string[] } =
		$props();

	let canvas: HTMLCanvasElement = $state()!;

	const SERIES_COLORS = ['#b2f042', '#60c6ff'];

	let ariaLabel = $derived(
		`Line chart: daily totals for ${baseline.name} (${directionLabel(baseline.direction).toLowerCase()}) against target, over the selected period`,
	);

	$effect(() => {
		if (!canvas || dates.length === 0) return;

		const { gridOpts, tickOpts, legendOpts, textSecondary } = chartTheme();

		const logs = baselineStore.logs.filter((l) => l.baselineId === baseline.id);

		const datasets = baseline.metrics.flatMap((metric, i) => {
			const color = SERIES_COLORS[i % SERIES_COLORS.length];
			return [
				{
					label: metric.label,
					data: dailySeries(logs, metric.id, dates),
					borderColor: color,
					backgroundColor: color,
					borderWidth: 2,
					pointRadius: 2,
					tension: 0.3,
					borderDash: [] as number[],
				},
				{
					label: `${metric.label} target`,
					data: dates.map(() => metric.target),
					borderColor: textSecondary,
					backgroundColor: textSecondary,
					borderWidth: 1,
					pointRadius: 0,
					tension: 0,
					borderDash: [5, 4],
				},
			];
		});

		const chart = new Chart(canvas, {
			type: 'line',
			data: { labels: xLabels, datasets },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: true, position: 'bottom', labels: legendOpts },
				},
				scales: {
					x: { grid: { display: false }, ticks: tickOpts },
					y: { grid: gridOpts, ticks: tickOpts, beginAtZero: true },
				},
			},
		});

		return () => chart.destroy();
	});
</script>

<canvas
	bind:this={canvas}
	aria-label={ariaLabel}
></canvas>
