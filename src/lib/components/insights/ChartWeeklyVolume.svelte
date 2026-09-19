<script lang="ts">
	import { programStore } from '$lib/stores/program.svelte';
	import { Chart, chartTheme, getMondayOf } from '$lib/chart-utils';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	let { dates }: { dates: string[] } = $props();

	let canvas: HTMLCanvasElement = $state()!;

	$effect(() => {
		if (!canvas || dates.length === 0) return;

		const { accent, textSecondary, gridOpts, tickOpts } = chartTheme();
		const dateSet = new SvelteSet(dates);

		const barFill = (volume: number) => {
			if (volume === 0) return accent + '33';
			return accent + 'bb';
		};
		const barBorder = (volume: number) => {
			if (volume === 0) return accent + '55';
			return accent;
		};
		const sessionSuffix = (count: number) => {
			if (count === 1) return '';
			return 's';
		};

		const sessionsInWindow = programStore.sessions.filter((s) => dateSet.has(s.date));

		const weekMondays: string[] = [];
		const seenMondays = new SvelteSet<string>();
		for (const d of dates) {
			const monday = getMondayOf(d);
			if (!seenMondays.has(monday)) {
				seenMondays.add(monday);
				weekMondays.push(monday);
			}
		}

		const volumeByWeek = new SvelteMap(weekMondays.map((m) => [m, 0]));
		const countByWeek = new SvelteMap(weekMondays.map((m) => [m, 0]));
		for (const s of sessionsInWindow) {
			const monday = getMondayOf(s.date);
			volumeByWeek.set(monday, (volumeByWeek.get(monday) ?? 0) + s.totalVolume);
			countByWeek.set(monday, (countByWeek.get(monday) ?? 0) + 1);
		}

		const weekLabels = weekMondays.map((m) => m.slice(5).replace('-', '/'));
		const weekVolumes = weekMondays.map((m) => volumeByWeek.get(m) ?? 0);

		const chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: weekLabels,
				datasets: [
					{
						label: 'Volume (lb)',
						data: weekVolumes,
						backgroundColor: weekVolumes.map(barFill),
						borderColor: weekVolumes.map(barBorder),
						borderWidth: 1,
						borderRadius: 4,
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
							label: (ctx) => {
								const monday = weekMondays[ctx.dataIndex];
								const count = countByWeek.get(monday) ?? 0;
								return [`${ctx.formattedValue} lb`, `${count} session${sessionSuffix(count)}`];
							},
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { ...tickOpts, maxTicksLimit: 7 },
					},
					y: {
						min: 0,
						grid: gridOpts,
						ticks: tickOpts,
						title: { display: true, text: 'lb lifted', color: textSecondary },
					},
				},
			},
		});

		return () => chart.destroy();
	});
</script>

<canvas
	bind:this={canvas}
	aria-label="Bar chart: total pounds lifted per week over the selected period"
></canvas>
