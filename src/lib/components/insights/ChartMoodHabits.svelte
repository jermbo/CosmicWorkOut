<script lang="ts">
	import { habitStore } from '$lib/stores/habits.svelte';
	import { Chart, chartTheme } from '$lib/chart-utils';

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

		let moodData: (number | null)[] | null = null;
		if (moodHabit) {
			moodData = dates.map((d) => logMap.get(moodHabit.id)?.get(d) ?? null);
		}

		let coffeeData: (number | null)[] | null = null;
		if (coffeeHabit) {
			coffeeData = dates.map((d) => logMap.get(coffeeHabit.id)?.get(d) ?? null);
		}

		let waterData: (number | null)[] | null = null;
		if (waterHabit) {
			waterData = dates.map((d) => logMap.get(waterHabit.id)?.get(d) ?? null);
		}

		const moodColor = '#e879f9';
		const coffeeColor = '#f59e0b';
		const waterColor = '#60c6ff';

		const datasets = [];

		if (moodData) {
			datasets.push({
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
			});
		}

		if (coffeeData) {
			datasets.push({
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
			});
		}

		if (waterData) {
			datasets.push({
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
			});
		}

		const chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: xLabels,
				datasets,
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
