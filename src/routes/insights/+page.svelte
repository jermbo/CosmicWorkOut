<script lang="ts">
	import {
		Chart,
		CategoryScale,
		LinearScale,
		RadialLinearScale,
		BarController,
		BarElement,
		LineController,
		LineElement,
		PointElement,
		DoughnutController,
		ArcElement,
		RadarController,
		Legend,
		Tooltip,
	} from 'chart.js';
	import { programStore } from '$lib/stores/program.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { toLocalIso } from '$lib/date';

	Chart.register(
		CategoryScale,
		LinearScale,
		RadialLinearScale,
		BarController,
		BarElement,
		LineController,
		LineElement,
		PointElement,
		DoughnutController,
		ArcElement,
		RadarController,
		Legend,
		Tooltip,
	);

	// ── Palettes ─────────────────────────────────────────────────
	// Warm/cool alternating so adjacent doughnut slices never clash.
	const ACTIVITY_PALETTE = [
		'#60c6ff', '#b2f042', '#f472b6', '#f59e0b', '#818cf8',
		'#e55733', '#34d399', '#b286fd', '#4ade80', '#fb923c',
		'#e879f9', '#94a3b8',
	];
	const PROGRESS_PALETTE = ['#b2f042', '#60c6ff', '#f59e0b', '#b286fd', '#e55733'];

	// ── Date range ────────────────────────────────────────────────
	type RangeKey = 'this-week' | 'last-7' | 'mtd' | 'ytd' | 'custom';

	const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
		{ key: 'this-week',  label: 'This week' },
		{ key: 'last-7',     label: 'Last 7d' },
		{ key: 'mtd',        label: 'MTD' },
		{ key: 'ytd',        label: 'YTD' },
		{ key: 'custom',     label: 'Custom' },
	];

	let rangeKey   = $state<RangeKey>('last-7');
	let customStart = $state('');
	let customEnd   = $state('');

	function getMondayOf(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		const dow = d.getDay();
		d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
		return toLocalIso(d);
	}

	function computeRange(key: RangeKey, cs: string, ce: string): { start: string; end: string } {
		const today = new Date();
		const todayStr = toLocalIso(today);
		switch (key) {
			case 'this-week':
				return { start: getMondayOf(todayStr), end: todayStr };
			case 'last-7': {
				const d = new Date(today);
				d.setDate(d.getDate() - 6);
				return { start: toLocalIso(d), end: todayStr };
			}
			case 'mtd':
				return { start: toLocalIso(new Date(today.getFullYear(), today.getMonth(), 1)), end: todayStr };
			case 'ytd':
				return { start: toLocalIso(new Date(today.getFullYear(), 0, 1)), end: todayStr };
			case 'custom':
				return { start: cs, end: ce };
		}
	}

	function buildDatesBetween(start: string, end: string): string[] {
		const dates: string[] = [];
		const d = new Date(start + 'T00:00:00');
		const endD = new Date(end + 'T00:00:00');
		while (d <= endD) {
			dates.push(toLocalIso(d));
			d.setDate(d.getDate() + 1);
		}
		return dates;
	}

	function handleRangeChange(key: RangeKey) {
		if (key === 'custom' && !customStart) {
			const today = new Date();
			customEnd = toLocalIso(today);
			const s = new Date(today);
			s.setDate(s.getDate() - 29);
			customStart = toLocalIso(s);
		}
		rangeKey = key;
	}

	// ── Derived state ─────────────────────────────────────────────
	let effectiveRange = $derived.by(() => computeRange(rangeKey, customStart, customEnd));
	let todayStr = $derived(toLocalIso(new Date()));

	let rangeLabel = $derived.by(() => {
		const { start, end } = effectiveRange;
		const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		const fmt = (d: string) => {
			const [, m, day] = d.split('-');
			return `${MONTHS[parseInt(m) - 1]} ${parseInt(day)}`;
		};
		switch (rangeKey) {
			case 'this-week': return 'This week';
			case 'last-7':    return 'Last 7 days';
			case 'mtd':       return 'Month to date';
			case 'ytd':       return 'Year to date';
			default:          return start && end ? `${fmt(start)} – ${fmt(end)}` : 'Select a range';
		}
	});

	let activityBreakdown = $derived.by(() => {
		const { start, end } = effectiveRange;
		if (!start || !end) return [];
		const counts = new Map<string, number>();
		for (const a of activityStore.activities) {
			if (a.date < start || a.date > end) continue;
			counts.set(a.type, (counts.get(a.type) ?? 0) + 1);
		}
		return [...counts.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([type, count]) => ({ type, count }));
	});
	let activityTotal = $derived(activityBreakdown.reduce((s, a) => s + a.count, 0));

	let hasSessions   = $derived(programStore.sessions.length > 0);
	let hasActivities = $derived(activityStore.activities.length > 0);
	let hasHabitLogs  = $derived(habitStore.logs.length > 0);
	let hasHabits     = $derived(habitStore.activeHabits.length > 0);
	let hasAnyData    = $derived(hasSessions || hasActivities || hasHabitLogs);

	// ── Canvas refs ───────────────────────────────────────────────
	let moodCanvas:     HTMLCanvasElement = $state()!;
	let volumeCanvas:   HTMLCanvasElement = $state()!;
	let activityCanvas: HTMLCanvasElement = $state()!;
	let radarCanvas:    HTMLCanvasElement = $state()!;
	let progressCanvas: HTMLCanvasElement = $state()!;

	function cssVar(name: string): string {
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	}

	// ── Chart building — reactive via $effect ─────────────────────
	// Re-runs whenever rangeKey / customStart / customEnd change.
	// Cleanup destroys old chart instances before rebuilding.
	$effect(() => {
		const { start, end } = effectiveRange;

		// Don't render until both custom dates are filled in
		if (rangeKey === 'custom' && (!start || !end || start > end)) return;

		const dates   = buildDatesBetween(start, end);
		if (dates.length === 0) return;

		const dateSet = new Set(dates);

		// Thin x-axis labels based on range length
		const step = dates.length <= 14 ? 1 : dates.length <= 90 ? 7 : 30;
		const xLabels = dates.map((d, i) => (i % step === 0 ? d.slice(5).replace('-', '/') : ''));

		const accent      = cssVar('--color-accent');
		const textPrimary = cssVar('--color-text-primary');
		const textSecondary = cssVar('--color-text-secondary');
		const borderColor = cssVar('--color-border');

		const gridOpts = { color: borderColor };
		const tickOpts = {
			color: textSecondary,
			font: { family: 'Inter, sans-serif', size: 11 },
			autoSkip: true,
			maxRotation: 0,
		};
		const legendOpts = { color: textPrimary, font: { family: 'Inter, sans-serif', size: 12 } };

		const charts: Chart[] = [];

		// ── Chart 1: Mood vs Coffee & Water ──────────────────────
		if (moodCanvas) {
			const moodHabit   = habitStore.habits.find((h) => h.type === 'mood');
			const coffeeHabit = habitStore.habits.find((h) => h.name.toLowerCase().includes('coffee'));
			const waterHabit  = habitStore.habits.find((h) => h.name.toLowerCase().includes('water'));

			const logMap = new Map<string, Map<string, number>>();
			for (const log of habitStore.logs) {
				if (!logMap.has(log.habitId)) logMap.set(log.habitId, new Map());
				logMap.get(log.habitId)!.set(log.date, log.value);
			}

			const moodData   = moodHabit   ? dates.map((d) => logMap.get(moodHabit.id)?.get(d)   ?? null) : null;
			const coffeeData = coffeeHabit ? dates.map((d) => logMap.get(coffeeHabit.id)?.get(d) ?? null) : null;
			const waterData  = waterHabit  ? dates.map((d) => logMap.get(waterHabit.id)?.get(d)  ?? null) : null;

			const moodColor   = '#e879f9'; // fuchsia — distinct from accent
			const coffeeColor = '#f59e0b'; // amber
			const waterColor  = '#60c6ff'; // sky

			charts.push(new Chart(moodCanvas, {
				type: 'line',
				data: {
					labels: xLabels,
					datasets: [
						...(moodData ? [{
							label: 'Mood', data: moodData, yAxisID: 'yMood',
							borderColor: moodColor, backgroundColor: moodColor + '22',
							pointBackgroundColor: moodColor,
							borderWidth: 1.5, pointRadius: 2,
							spanGaps: true, tension: 0.3,
						}] : []),
						...(coffeeData ? [{
							label: coffeeHabit!.name, data: coffeeData, yAxisID: 'yHabits',
							borderColor: coffeeColor, backgroundColor: coffeeColor + '22',
							pointBackgroundColor: coffeeColor,
							borderWidth: 1.5, borderDash: [6, 3], pointRadius: 2,
							spanGaps: true, tension: 0.3,
						}] : []),
						...(waterData ? [{
							label: waterHabit!.name, data: waterData, yAxisID: 'yHabits',
							borderColor: waterColor, backgroundColor: waterColor + '22',
							pointBackgroundColor: waterColor,
							borderWidth: 1.5, borderDash: [2, 3], pointRadius: 2,
							spanGaps: true, tension: 0.3,
						}] : []),
					],
				},
				options: {
					responsive: true, maintainAspectRatio: false,
					interaction: { mode: 'index', intersect: false },
					plugins: { legend: { labels: legendOpts }, tooltip: {} },
					scales: {
						x: { grid: gridOpts, ticks: { ...tickOpts, maxTicksLimit: 8 } },
						yMood: {
							type: 'linear', position: 'left', min: -5, max: 5,
							grid: gridOpts, ticks: { ...tickOpts, stepSize: 5 },
							title: { display: true, text: 'Mood', color: textSecondary },
						},
						yHabits: {
							type: 'linear', position: 'right', min: 0,
							grid: { display: false }, ticks: tickOpts,
							title: { display: true, text: 'Count', color: textSecondary },
						},
					},
				},
			}));
		}

		// ── Chart 2: Weekly Volume ────────────────────────────────
		if (volumeCanvas) {
			const sessionsInWindow = programStore.sessions.filter((s) => dateSet.has(s.date));

			const weekMondays: string[] = [];
			const seenMondays = new Set<string>();
			for (const d of dates) {
				const monday = getMondayOf(d);
				if (!seenMondays.has(monday)) { seenMondays.add(monday); weekMondays.push(monday); }
			}

			const volumeByWeek = new Map(weekMondays.map((m) => [m, 0]));
			const countByWeek  = new Map(weekMondays.map((m) => [m, 0]));
			for (const s of sessionsInWindow) {
				const monday = getMondayOf(s.date);
				volumeByWeek.set(monday, (volumeByWeek.get(monday) ?? 0) + s.totalVolume);
				countByWeek.set(monday,  (countByWeek.get(monday)  ?? 0) + 1);
			}

			const weekLabels  = weekMondays.map((m) => m.slice(5).replace('-', '/'));
			const weekVolumes = weekMondays.map((m) => volumeByWeek.get(m) ?? 0);

			charts.push(new Chart(volumeCanvas, {
				type: 'bar',
				data: {
					labels: weekLabels,
					datasets: [{
						label: 'Volume (lb)',
						data: weekVolumes,
						backgroundColor: weekVolumes.map((v) => v === 0 ? accent + '33' : accent + 'bb'),
						borderColor:     weekVolumes.map((v) => v === 0 ? accent + '55' : accent),
						borderWidth: 1, borderRadius: 4,
					}],
				},
				options: {
					responsive: true, maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label: (ctx) => {
									const monday = weekMondays[ctx.dataIndex];
									const count = countByWeek.get(monday) ?? 0;
									return [`${ctx.formattedValue} lb`, `${count} session${count === 1 ? '' : 's'}`];
								},
							},
						},
					},
					scales: {
						x: { grid: { display: false }, ticks: { ...tickOpts, maxTicksLimit: 7 } },
						y: { min: 0, grid: gridOpts, ticks: tickOpts,
							title: { display: true, text: 'lb lifted', color: textSecondary } },
					},
				},
			}));
		}

		// ── Chart 3: Activity Mix ─────────────────────────────────
		if (activityCanvas) {
			const activitiesInWindow = activityStore.activities.filter((a) => dateSet.has(a.date));
			const countByType = new Map<string, number>();
			for (const a of activitiesInWindow) {
				countByType.set(a.type, (countByType.get(a.type) ?? 0) + 1);
			}
			const types  = [...countByType.keys()];
			const counts = types.map((t) => countByType.get(t)!);

			charts.push(new Chart(activityCanvas, {
				type: 'doughnut',
				data: {
					labels: types,
					datasets: [{
						data: counts,
						backgroundColor: types.map((_, i) => ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length] + 'cc'),
						borderColor:     types.map((_, i) => ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length]),
						borderWidth: 1,
					}],
				},
				options: {
					responsive: true, maintainAspectRatio: false,
					onResize(chart, { width }) {
						const pos = width >= 360 ? 'right' : 'bottom';
						if (chart.options.plugins?.legend?.position !== pos) {
							chart.options.plugins!.legend!.position = pos;
							chart.update('none');
						}
					},
					plugins: {
						legend: {
							position: 'right',
							labels: {
								...legendOpts, boxWidth: 14, boxHeight: 14,
								generateLabels: (chart) => {
									const data = chart.data;
									return (data.labels as string[]).map((label, i) => ({
										text: `${label} (${(data.datasets[0].data as number[])[i]})`,
										fillStyle:  ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length] + 'cc',
										strokeStyle: ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length],
										fontColor: textPrimary,
										lineWidth: 1, index: i, hidden: false,
									}));
								},
							},
						},
						tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.formattedValue}` } },
					},
				},
			}));
		}

		// ── Chart 4: Habit Balance Radar ──────────────────────────
		if (radarCanvas) {
			const activeHabits = habitStore.activeHabits;
			const logsByHabit  = new Map(activeHabits.map((h) => [h.id, [] as number[]]));
			for (const log of habitStore.logs) {
				if (!dateSet.has(log.date)) continue;
				logsByHabit.get(log.habitId)?.push(log.value);
			}

			const radarLabels = activeHabits.map((h) => h.name);
			const radarValues = activeHabits.map((h) => {
				const vals = logsByHabit.get(h.id) ?? [];
				if (vals.length === 0) return 0;
				const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
				if (h.type === 'mood')    return Math.min(1, Math.max(0, (avg + 5) / 10));
				if (h.type === 'boolean') return avg;
				if (h.dailyGoal)          return Math.min(1, avg / h.dailyGoal);
				return avg > 0 ? 1 : 0;
			});

			charts.push(new Chart(radarCanvas, {
				type: 'radar',
				data: {
					labels: radarLabels,
					datasets: [{
						label: 'Habit Balance', data: radarValues,
						backgroundColor: accent + '33', borderColor: accent, borderWidth: 2,
						pointBackgroundColor: accent, pointRadius: 3,
					}],
				},
				options: {
					responsive: true, maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: { callbacks: { label: (ctx) => ` ${Math.round((ctx.raw as number) * 100)}%` } },
					},
					scales: {
						r: {
							min: 0, max: 1,
							ticks: { display: false },
							grid: { color: borderColor },
							pointLabels: { color: textPrimary, font: { family: 'Inter, sans-serif', size: 12 } },
							angleLines: { color: borderColor },
						},
					},
				},
			}));
		}

		// ── Chart 5: Top Exercise Progress ────────────────────────
		if (progressCanvas) {
			const sessionsInWindow = programStore.sessions.filter((s) => dateSet.has(s.date));
			const sessionCountByItem = new Map<string, number>();
			for (const s of sessionsInWindow) {
				for (const li of s.items) {
					if (li.skipped || li.sets.length === 0) continue;
					sessionCountByItem.set(li.itemId, (sessionCountByItem.get(li.itemId) ?? 0) + 1);
				}
			}
			const top5 = [...sessionCountByItem.entries()]
				.sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);

			if (top5.length > 0) {
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

				charts.push(new Chart(progressCanvas, {
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
							y: { min: 0, grid: gridOpts, ticks: tickOpts,
								title: { display: true, text: 'lb', color: textSecondary } },
						},
					},
				}));
			}
		}

		return () => {
			for (const c of charts) c.destroy();
		};
	});
</script>

<div class="insights-page">
	<header class="insights-page__header">
		<h1 class="insights-page__title">Insights</h1>
		<p class="insights-page__subtitle">{rangeLabel}</p>
	</header>

	<div class="range-bar">
		<div class="range-chips" role="group" aria-label="Date range">
			{#each RANGE_OPTIONS as opt}
				<button
					class="range-chip"
					class:range-chip--active={rangeKey === opt.key}
					onclick={() => handleRangeChange(opt.key)}
					aria-pressed={rangeKey === opt.key}
				>
					{opt.label}
				</button>
			{/each}
		</div>

		{#if rangeKey === 'custom'}
			<div class="range-custom">
				<label class="range-custom__label">
					From
					<input class="range-custom__input" type="date" bind:value={customStart} max={customEnd || todayStr} />
				</label>
				<span class="range-custom__sep" aria-hidden="true">→</span>
				<label class="range-custom__label">
					To
					<input class="range-custom__input" type="date" bind:value={customEnd} min={customStart} max={todayStr} />
				</label>
			</div>
		{/if}
	</div>

	{#if !hasAnyData}
		<div class="empty-state">
			<p class="empty-state__msg">Log workouts, activities, or habits to see your insights.</p>
		</div>
	{:else}
		<div class="charts">
			{#if hasHabitLogs}
				<section class="chart-section">
					<h2 class="chart-section__title">Mood vs Habits</h2>
					<p class="chart-section__desc">Mood compared to daily coffee and water intake.</p>
					<div class="chart-wrap">
						<canvas bind:this={moodCanvas} role="img" aria-label="Line chart: mood, coffee, and water over the selected period"></canvas>
					</div>
				</section>
			{/if}

			{#if hasSessions}
				<section class="chart-section">
					<h2 class="chart-section__title">Weekly Volume</h2>
					<p class="chart-section__desc">Total pounds lifted per week.</p>
					<div class="chart-wrap">
						<canvas bind:this={volumeCanvas} role="img" aria-label="Bar chart: total pounds lifted per week over the selected period"></canvas>
					</div>
				</section>
			{/if}

			{#if hasActivities}
				<section class="chart-section">
					<h2 class="chart-section__title">Activity Mix</h2>
					<p class="chart-section__desc">Breakdown of activities logged in the selected period.</p>
					<div class="chart-wrap chart-wrap--doughnut" aria-hidden="true">
						<canvas bind:this={activityCanvas}></canvas>
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
				</section>
			{/if}

			{#if hasHabits && hasHabitLogs}
				<section class="chart-section">
					<h2 class="chart-section__title">Habit Balance</h2>
					<p class="chart-section__desc">Average habit consistency over the selected period.</p>
					<div class="chart-wrap chart-wrap--radar">
						<canvas bind:this={radarCanvas} role="img" aria-label="Radar chart: average consistency per habit"></canvas>
					</div>
				</section>
			{/if}

			{#if hasSessions}
				<section class="chart-section">
					<h2 class="chart-section__title">Strength Progress</h2>
					<p class="chart-section__desc">Max weight per session for your top 5 exercises.</p>
					<div class="chart-wrap">
						<canvas bind:this={progressCanvas} role="img" aria-label="Line chart: max weight per session for top 5 exercises"></canvas>
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	/*
	  Intentionally NOT using the global .page class — it caps width at --max-width
	  (460px). Sidebar offset is handled globally by app__main's padding-inline-start.
	*/
	.insights-page {
		inline-size: 100%;
		max-inline-size: 920px;
		padding-block-start: var(--space-6);
		padding-block-end: calc(var(--nav-height) + var(--safe-bottom) + var(--space-8));
	}

	@container app (inline-size >= 720px) {
		.insights-page {
			padding-block-end: var(--space-10);
		}
	}

	.insights-page__header {
		padding: 0 var(--page-gutter) var(--space-2);
	}

	.insights-page__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text-primary);
		margin: 0;
	}

	.insights-page__subtitle {
		margin: var(--space-1) 0 0;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	/* ── Range selector ────────────────────────────────────────── */
	.range-bar {
		padding: var(--space-3) var(--page-gutter) var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.range-chips {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.range-chips::-webkit-scrollbar {
		display: none;
	}

	.range-chip {
		flex-shrink: 0;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		transition:
			color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
		cursor: pointer;
	}

	.range-chip--active {
		color: var(--color-accent-ink);
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.range-custom {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.range-custom__label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.range-custom__input {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		padding: var(--space-2) var(--space-3);
		font-size: 0.875rem;
		font-family: var(--font-body);
		color-scheme: dark;
	}

	.range-custom__input:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.range-custom__sep {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-block-start: var(--space-4);
	}

	/* ── Charts grid ───────────────────────────────────────────── */
	.charts {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-6);
		padding: 0 var(--page-gutter) var(--space-4);
	}

	@container app (inline-size >= 720px) {
		.charts {
			grid-template-columns: 1fr 1fr;
		}

		.chart-section:last-child:nth-child(odd) {
			grid-column: 1 / -1;
		}

		.chart-wrap {
			height: 300px;
		}

		.chart-wrap--doughnut,
		.chart-wrap--radar {
			height: 340px;
		}
	}

	.chart-section {
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-5);
	}

	.chart-section__title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text-primary);
		margin: 0;
	}

	.chart-section__desc {
		margin: var(--space-1) 0 var(--space-4);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.chart-wrap {
		position: relative;
		height: 260px;
	}

	.chart-wrap--doughnut {
		height: 300px;
	}

	.chart-wrap--radar {
		height: 300px;
	}

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

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: var(--page-gutter);
	}

	.empty-state__msg {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		text-align: center;
		max-inline-size: 280px;
		line-height: 1.5;
	}
</style>
