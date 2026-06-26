<script lang="ts">
	import { habitStore } from '$lib/stores/habits.svelte';
	import { Chart, chartTheme } from '$lib/chart-utils';

	let { dates }: { dates: string[] } = $props();

	let canvas: HTMLCanvasElement = $state()!;

	$effect(() => {
		if (!canvas || dates.length === 0) return;

		const { accent, textPrimary, borderColor, fontBody } = chartTheme();
		const dateSet = new Set(dates);

		const activeHabits = habitStore.trackableHabits;
		const logsByHabit = new Map(activeHabits.map((h) => [h.id, [] as number[]]));
		for (const log of habitStore.logs) {
			if (!dateSet.has(log.date)) continue;
			logsByHabit.get(log.habitId)?.push(log.value);
		}

		const radarLabels = activeHabits.map((h) => h.name);
		const radarValues = activeHabits.map((h) => {
			const vals = logsByHabit.get(h.id) ?? [];
			if (vals.length === 0) return 0;
			const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
			if (h.type === 'boolean') return avg;
			if (h.dailyGoal) return Math.min(1, avg / h.dailyGoal);
			if (avg > 0) return 1;
			return 0;
		});

		const chart = new Chart(canvas, {
			type: 'radar',
			data: {
				labels: radarLabels,
				datasets: [
					{
						label: 'Habit Balance',
						data: radarValues,
						backgroundColor: accent + '33',
						borderColor: accent,
						borderWidth: 2,
						pointBackgroundColor: accent,
						pointRadius: 3,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: (ctx) => ` ${Math.round((ctx.raw as number) * 100)}%` } },
				},
				scales: {
					r: {
						min: 0,
						max: 1,
						ticks: { display: false },
						grid: { color: borderColor },
						pointLabels: { color: textPrimary, font: { family: fontBody, size: 12 } },
						angleLines: { color: borderColor },
					},
				},
			},
		});

		return () => chart.destroy();
	});
</script>

<canvas bind:this={canvas} aria-label="Radar chart: average consistency per habit"></canvas>
