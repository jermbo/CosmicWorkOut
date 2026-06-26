<script lang="ts">
	import { healthStore } from '$lib/stores/health.svelte';
	import { bloodPressureDailyAverages } from '$lib/health/metrics';
	import { Chart, chartTheme } from '$lib/chart-utils';

	let { dates, xLabels }: { dates: string[]; xLabels: string[] } = $props();

	let canvas: HTMLCanvasElement = $state()!;

	const SYSTOLIC_COLOR = '#e55733';
	const DIASTOLIC_COLOR = '#60c6ff';
	const PULSE_COLOR = '#b286fd';

	$effect(() => {
		if (!canvas || dates.length === 0) return;

		const { gridOpts, tickOpts, legendOpts } = chartTheme();

		const dailies = bloodPressureDailyAverages(healthStore.readings);
		const byDate = new Map(dailies.map((d) => [d.date, d]));

		const systolic = dates.map((d) => byDate.get(d)?.systolic ?? null);
		const diastolic = dates.map((d) => byDate.get(d)?.diastolic ?? null);
		const pulse = dates.map((d) => byDate.get(d)?.pulse ?? null);
		const hasPulse = pulse.some((p) => p !== null);

		const datasets = [
			{
				label: 'Systolic',
				data: systolic,
				borderColor: SYSTOLIC_COLOR,
				backgroundColor: SYSTOLIC_COLOR,
				borderWidth: 2,
				pointRadius: 2,
				tension: 0.3,
				spanGaps: true,
			},
			{
				label: 'Diastolic',
				data: diastolic,
				borderColor: DIASTOLIC_COLOR,
				backgroundColor: DIASTOLIC_COLOR,
				borderWidth: 2,
				pointRadius: 2,
				tension: 0.3,
				spanGaps: true,
			},
		];

		if (hasPulse) {
			datasets.push({
				label: 'Pulse',
				data: pulse,
				borderColor: PULSE_COLOR,
				backgroundColor: PULSE_COLOR,
				borderWidth: 2,
				pointRadius: 2,
				tension: 0.3,
				spanGaps: true,
			});
		}

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
					y: { grid: gridOpts, ticks: tickOpts },
				},
			},
		});

		return () => chart.destroy();
	});
</script>

<canvas
	bind:this={canvas}
	aria-label="Line chart: daily average systolic and diastolic blood pressure over the selected period"
></canvas>
