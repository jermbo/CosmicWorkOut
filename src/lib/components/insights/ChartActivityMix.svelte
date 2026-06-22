<script lang="ts">
	import { activityStore } from '$lib/stores/activities.svelte';
	import { Chart, chartTheme, ACTIVITY_PALETTE } from '$lib/chart-utils';

	let { dates, rangeLabel }: { dates: string[]; rangeLabel: string } = $props();

	let canvas: HTMLCanvasElement = $state()!;

	let activityBreakdown = $derived.by(() => {
		if (dates.length === 0) return [];
		const dateSet = new Set(dates);
		const counts = new Map<string, number>();
		for (const a of activityStore.activities) {
			if (!dateSet.has(a.date)) continue;
			counts.set(a.type, (counts.get(a.type) ?? 0) + 1);
		}
		return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }));
	});

	let activityTotal = $derived(activityBreakdown.reduce((s, a) => s + a.count, 0));

	$effect(() => {
		if (!canvas || dates.length === 0) return;

		const { legendOpts } = chartTheme();
		const { textPrimary } = chartTheme();

		const types = activityBreakdown.map((a) => a.type);
		const counts = activityBreakdown.map((a) => a.count);

		const chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels: types,
				datasets: [
					{
						data: counts,
						backgroundColor: types.map((_, i) => ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length] + 'cc'),
						borderColor: types.map((_, i) => ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length]),
						borderWidth: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				onResize(chart, { width }) {
					let pos: 'right' | 'bottom' = 'bottom';
					if (width >= 360) pos = 'right';
					if (chart.options.plugins?.legend?.position !== pos) {
						chart.options.plugins!.legend!.position = pos;
						chart.update('none');
					}
				},
				plugins: {
					legend: {
						position: 'right',
						labels: {
							...legendOpts,
							boxWidth: 14,
							boxHeight: 14,
							generateLabels: (chart) => {
								const data = chart.data;
								return (data.labels as string[]).map((label, i) => ({
									text: `${label} (${(data.datasets[0].data as number[])[i]})`,
									fillStyle: ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length] + 'cc',
									strokeStyle: ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length],
									fontColor: textPrimary,
									lineWidth: 1,
									index: i,
									hidden: false,
								}));
							},
						},
					},
					tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.formattedValue}` } },
				},
			},
		});

		return () => chart.destroy();
	});
</script>

<div aria-hidden="true">
	<canvas bind:this={canvas}></canvas>
</div>

<table class="sr-only">
	<caption>Activity breakdown — {rangeLabel} ({activityTotal} total)</caption>
	<thead>
		<tr><th scope="col">Activity</th><th scope="col">Count</th><th scope="col">Share</th></tr>
	</thead>
	<tbody>
		{#each activityBreakdown as { type, count }}
			<tr>
				<td>{type}</td>
				<td>{count}</td>
				<td>{Math.round((count / activityTotal) * 100)}%</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
