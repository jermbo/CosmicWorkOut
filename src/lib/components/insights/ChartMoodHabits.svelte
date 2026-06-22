<script lang="ts">
	import { Chart } from 'chart.js';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { chartTheme } from '$lib/chart-utils';

	let { dates, xLabels }: { dates: string[]; xLabels: string[] } = $props();

	let canvas: HTMLCanvasElement = $state()!;

	$effect(() => {
		if (!canvas || dates.length === 0) return;

		const { gridOpts, tickOpts, legendOpts } = chartTheme();

		const moodHabit = habitStore.habits.find((h) => h.type === 'mood');
		const coffeeHabit = habitStore.habits.find((h) => h.name.toLowerCase().includes('coffee'));
		const waterHabit = habitStore.habits.find((h) => h.name.toLowerCase().includes('water'));

		const logMap = new Map<string, Map<string, number>>();
		for (const log of habitStore.logs) {
			if (!logMap.has(log.habitId)) logMap.set(log.habitId, new Map());
			logMap.get(log.habitId)!.set(log.date, log.value);
		}

		const moodData = moodHabit ? dates.map((d) => logMap.get(moodHabit.id)?.get(d) ?? null) : null;
		const coffeeData = coffeeHabit ? dates.map((d) => logMap.get(coffeeHabit.id)?.get(d) ?? null) : null;
		const waterData = waterHabit ? dates.map((d) => logMap.get(waterHabit.id)?.get(d) ?? null) : null;

		const moodColor = '#e879f9';
		const coffeeColor = '#f59e0b';
		const waterColor = '#60c6ff';

		const chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: xLabels,
				datasets: [
					...(moodData
						? [
								{
									label: 'Mood',
									data: moodData,
									yAxisID: 'yMood',
									borderColor: moodColor,
									backgroundColor: moodColor + '22',
									pointBackgroundColor: moodColor,
									borderWidth: 1.5,
									pointRadius: 2,
									spanGaps: true,
									tension: 0.3,
								},
							]
						: []),
					...(coffeeData
						? [
								{
									label: coffeeHabit!.name,
									data: coffeeData,
									yAxisID: 'yHabits',
									borderColor: coffeeColor,
									backgroundColor: coffeeColor + '22',
									pointBackgroundColor: coffeeColor,
									borderWidth: 1.5,
									borderDash: [6, 3],
									pointRadius: 2,
									spanGaps: true,
									tension: 0.3,
								},
							]
						: []),
					...(waterData
						? [
								{
									label: waterHabit!.name,
									data: waterData,
									yAxisID: 'yHabits',
									borderColor: waterColor,
									backgroundColor: waterColor + '22',
									pointBackgroundColor: waterColor,
									borderWidth: 1.5,
									borderDash: [2, 3],
									pointRadius: 2,
									spanGaps: true,
									tension: 0.3,
								},
							]
						: []),
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: { legend: { labels: legendOpts }, tooltip: {} },
				scales: {
					x: { grid: gridOpts, ticks: { ...tickOpts, maxTicksLimit: 8 } },
					yMood: {
						type: 'linear',
						position: 'left',
						min: -5,
						max: 5,
						grid: gridOpts,
						ticks: { ...tickOpts, stepSize: 5 },
						title: { display: true, text: 'Mood', color: chartTheme().textSecondary },
					},
					yHabits: {
						type: 'linear',
						position: 'right',
						min: 0,
						grid: { display: false },
						ticks: tickOpts,
						title: { display: true, text: 'Count', color: chartTheme().textSecondary },
					},
				},
			},
		});

		return () => chart.destroy();
	});
</script>

<canvas bind:this={canvas} aria-label="Line chart: mood, coffee, and water over the selected period"></canvas>
