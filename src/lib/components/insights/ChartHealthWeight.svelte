<script lang="ts">
	import { healthStore } from '$lib/stores/health.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { isWeightReading } from '$lib/health/metrics';
	import { Chart, chartTheme } from '$lib/chart-utils';

	let { dates, xLabels }: { dates: string[]; xLabels: string[] } = $props();

	let canvas: HTMLCanvasElement = $state()!;

	$effect(() => {
		if (!canvas || dates.length === 0) return;

		const { accent, textSecondary, gridOpts, tickOpts } = chartTheme();
		const unit = prefsStore.weightUnit;

		const byDate = new Map<string, number>();
		for (const r of healthStore.readings) {
			if (isWeightReading(r)) byDate.set(r.date, r.values.value);
		}

		const data = dates.map((d) => byDate.get(d) ?? null);

		const chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: xLabels,
				datasets: [
					{
						label: `Weight (${unit})`,
						data,
						borderColor: accent,
						backgroundColor: accent + '22',
						borderWidth: 2,
						pointRadius: 2,
						tension: 0.3,
						spanGaps: true,
						fill: true,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) => `${ctx.formattedValue} ${unit}`,
						},
					},
				},
				scales: {
					x: { grid: { display: false }, ticks: tickOpts },
					y: {
						grid: gridOpts,
						ticks: tickOpts,
						title: { display: true, text: unit, color: textSecondary },
					},
				},
			},
		});

		return () => chart.destroy();
	});
</script>

<canvas bind:this={canvas} aria-label="Line chart: body weight trend over the selected period"></canvas>
