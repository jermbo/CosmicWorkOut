<script lang="ts">
	import { Chart } from 'chart.js';
	import { programStore } from '$lib/stores/program.svelte';
	import { chartTheme, PROGRESS_PALETTE } from '$lib/chart-utils';

	let { dates, xLabels }: { dates: string[]; xLabels: string[] } = $props();

	let canvas: HTMLCanvasElement = $state()!;

	$effect(() => {
		if (!canvas || dates.length === 0) return;

		const { textSecondary, gridOpts, tickOpts, legendOpts } = chartTheme();
		const dateSet = new Set(dates);

		const sessionsInWindow = programStore.sessions.filter((s) => dateSet.has(s.date));
		const sessionCountByItem = new Map<string, number>();
		for (const s of sessionsInWindow) {
			for (const li of s.items) {
				if (li.skipped || li.sets.length === 0) continue;
				sessionCountByItem.set(li.itemId, (sessionCountByItem.get(li.itemId) ?? 0) + 1);
			}
		}

		const top5 = [...sessionCountByItem.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([id]) => id);

		if (top5.length === 0) return;

		const maxByItemDate = new Map(top5.map((id) => [id, new Map<string, number>()]));
		for (const s of sessionsInWindow) {
			for (const li of s.items) {
				if (!top5.includes(li.itemId) || li.skipped || li.sets.length === 0) continue;
				const maxW = Math.max(...li.sets.map((set) => Number(set.weight) || 0));
				if (maxW > 0) {
					const prev = maxByItemDate.get(li.itemId)?.get(s.date) ?? 0;
					maxByItemDate.get(li.itemId)!.set(s.date, Math.max(prev, maxW));
				}
			}
		}

		const datasets = top5.map((itemId, i) => {
			const item = programStore.getItemById(itemId);
			const pointMap = maxByItemDate.get(itemId)!;
			return {
				label: item?.name ?? itemId,
				data: dates.map((d) => pointMap.get(d) ?? null),
				borderColor: PROGRESS_PALETTE[i], backgroundColor: PROGRESS_PALETTE[i] + '33',
				pointBackgroundColor: PROGRESS_PALETTE[i], pointRadius: 4,
				spanGaps: false, tension: 0.2,
			};
		});

		const chart = new Chart(canvas, {
			type: 'line',
			data: { labels: xLabels, datasets },
			options: {
				responsive: true, maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: { labels: legendOpts },
					tooltip: {
						callbacks: {
							label: (ctx) => ctx.raw !== null ? ` ${ctx.dataset.label}: ${ctx.raw} lb` : '',
						},
					},
				},
				scales: {
					x: { grid: gridOpts, ticks: { ...tickOpts, maxTicksLimit: 8 } },
					y: {
						min: 0, grid: gridOpts, ticks: tickOpts,
						title: { display: true, text: 'lb', color: textSecondary },
					},
				},
			},
		});

		return () => chart.destroy();
	});
</script>

<canvas bind:this={canvas} role="img" aria-label="Line chart: max weight per session for top 5 exercises"></canvas>
