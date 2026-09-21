<!--
	All-habits heat chart (US-041, experimental).
	All: stacked strips — one row per habit, days left→right, scrolls like other day charts.
	Tap a habit: that habit's calendar grid — weeks × weekdays. Tap again (or All) to go back.
	Shading: the more, the darker, in 10% steps against each habit's own busiest day.
-->
<script lang="ts">
	import { cell, defineChart } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import type { Habit } from '$lib/db/types';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { habitColor, moodBadColor } from '$lib/habitColors';
	import {
		HEAT_EMPTY,
		HEAT_NEUTRAL,
		calendarSlots,
		habitHeatRow,
		heatValueLabel,
		type HeatCell,
	} from '$lib/insights/heat';
	import ScrollChart from '$lib/charts/ScrollChart.svelte';
	import {
		PLOT_MARGIN,
		chartPalette,
		chartTooltip,
		longDate,
		shortDate,
		withAlpha,
	} from '$lib/charts/theme';

	let { dates }: { dates: string[] } = $props();

	const ROW_HEIGHT = 26;
	/** Both views use the same small square cells, so a month fits on a laptop screen. */
	const GRID_COLUMN = 32;
	const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	let habits = $derived(habitStore.activeHabits);
	let focusedId = $state<string | null>(null);
	let focused = $derived(habits.find((h) => h.id === focusedId) ?? null);

	function toggleFocus(id: string | null) {
		focusedId = id === null || focusedId === id ? null : id;
	}

	let habitsById = $derived(new Map(habits.map((h) => [h.id, h])));

	/** heat.ts paints empty / neutral days in dark grays; swap in the current theme's. */
	function themed<T extends HeatCell>(c: T): T {
		const palette = chartPalette();
		if (c.fill === HEAT_EMPTY) return { ...c, fill: palette.heatEmpty };
		if (c.fill === HEAT_NEUTRAL) return { ...c, fill: palette.heatNeutral };
		return c;
	}

	/** Stable identity-mapped color scale: each cell's fill is its own color key. */
	function colorScale(fills: readonly string[]) {
		const domain = [...new Set(fills)];
		return { domain, range: domain };
	}

	function tooltipFor() {
		return chartTooltip<HeatCell>(
			(c) => `${c.habitName} · ${longDate(c.date)}`,
			(p) => {
				const habit = habitsById.get(p.datum.habitId);
				return {
					label: 'Logged',
					value: habit ? heatValueLabel(habit, p.datum.value) : String(p.datum.value ?? '—'),
				};
			},
		);
	}

	// ── All: stacked strips ──────────────────────────────────
	let stripCells = $derived(
		habits.flatMap((h) => habitHeatRow(h, habitStore.logs, dates)).map(themed),
	);

	function buildStrips() {
		return defineChart({
			marks: [
				cell(stripCells, {
					x: 'date',
					y: 'habitId',
					color: 'fill',
					key: (c) => `${c.habitId}:${c.date}`,
					inset: 1.5,
					radius: 3,
				}),
			],
			scales: {
				x: {
					scale: scaleBand<string>().domain(dates).padding(0),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: {
					scale: scaleBand<string>()
						.domain(habits.map((h) => h.id))
						.padding(0),
					axis: false,
				},
			},
			color: colorScale(stripCells.map((c) => c.fill)),
			margin: PLOT_MARGIN,
			tooltip: tooltipFor(),
		});
	}

	// ── Focused: calendar grid ───────────────────────────────
	type GridCell = HeatCell & { week: string; weekday: string };

	let grid = $derived.by(() => {
		if (!focused)
			return { weeks: [] as string[], cells: [] as GridCell[], outside: [] as GridCell[] };
		const { weeks, slots } = calendarSlots(dates);
		const byDate = new Map(
			habitHeatRow(focused, habitStore.logs, dates).map((c) => [c.date, themed(c)]),
		);
		const cells: GridCell[] = [];
		const outside: GridCell[] = [];
		for (const slot of slots) {
			const weekday = WEEKDAYS[slot.weekday];
			const heat = byDate.get(slot.date);
			if (slot.inRange && heat) cells.push({ ...heat, week: slot.week, weekday });
			else
				outside.push({
					habitId: focused.id,
					habitName: focused.name,
					date: slot.date,
					value: undefined,
					kind: 'empty',
					level: 0,
					fill: 'transparent',
					week: slot.week,
					weekday,
				});
		}
		return { weeks, cells, outside };
	});

	function buildGrid() {
		return defineChart({
			marks: [
				cell(grid.outside, {
					x: 'week',
					y: 'weekday',
					key: (c) => `out:${c.date}`,
					fill: 'transparent',
					stroke: chartPalette().outline,
					strokeWidth: 1,
					inset: 2.5,
					radius: 3,
				}),
				cell(grid.cells, {
					x: 'week',
					y: 'weekday',
					color: 'fill',
					key: (c) => c.date,
					inset: 1.5,
					radius: 3,
				}),
			],
			scales: {
				x: {
					scale: scaleBand<string>().domain(grid.weeks).padding(0),
					axis: { ticks: { format: shortDate, size: 0 } },
				},
				y: {
					scale: scaleBand<string>().domain(WEEKDAYS).padding(0),
					axis: false,
				},
			},
			color: colorScale(grid.cells.map((c) => c.fill)),
			margin: PLOT_MARGIN,
			tooltip: chartTooltip<GridCell>(
				(c) => `${c.habitName} · ${longDate(c.date)}`,
				(p) => {
					const outsideRange = !dates.includes(p.datum.date);
					if (outsideRange) return { label: 'Outside range', value: '' };
					const habit = habitsById.get(p.datum.habitId);
					return {
						label: 'Logged',
						value: habit ? heatValueLabel(habit, p.datum.value) : '—',
					};
				},
			),
		});
	}

	/** 10% … 100% ramp for the legend. */
	function ramp(color: string): string[] {
		return [1, 3, 5, 7, 10].map((l) => withAlpha(color, l / 10));
	}

	function legendFor(habit: Habit | null) {
		if (!habit) return null;
		if (habit.type === 'mood') {
			return {
				low: [...ramp(moodBadColor(habit))].reverse(),
				mid: chartPalette().heatNeutral,
				high: ramp(habitColor(habit)),
			};
		}
		return { low: [] as string[], mid: null, high: ramp(habitColor(habit)) };
	}

	let legend = $derived(legendFor(focused));
</script>

<div
	class="heat-focus"
	role="group"
	aria-label="Focus on one habit"
>
	<button
		class="heat-focus__btn"
		class:heat-focus__btn--on={focusedId === null}
		aria-pressed={focusedId === null}
		onclick={() => toggleFocus(null)}>All</button
	>
	{#each habits as habit (habit.id)}
		<button
			class="heat-focus__btn"
			class:heat-focus__btn--on={focusedId === habit.id}
			aria-pressed={focusedId === habit.id}
			onclick={() => toggleFocus(habit.id)}
		>
			<span
				class="heat-focus__dot"
				style:background={habitColor(habit)}
			></span>
			{habit.name}
		</button>
	{/each}
</div>

{#if focused}
	{#key focused.id}
		<ScrollChart
			columns={grid.weeks.length}
			columnWidth={GRID_COLUMN}
			height={7 * ROW_HEIGHT + PLOT_MARGIN.top + PLOT_MARGIN.bottom}
			definition={buildGrid}
			ariaLabel="Calendar heat chart: {focused.name} by week and weekday"
			left={{ categories: WEEKDAYS }}
		/>
	{/key}
{:else if habits.length > 0}
	<ScrollChart
		columns={dates.length}
		columnWidth={GRID_COLUMN}
		height={Math.max(2, habits.length) * ROW_HEIGHT + PLOT_MARGIN.top + PLOT_MARGIN.bottom}
		definition={buildStrips}
		ariaLabel="Heat chart: every habit by day"
		left={{ categories: habits.map((h) => h.name), width: 76 }}
	/>
{/if}

<div
	class="heat-legend"
	aria-hidden="true"
>
	{#if legend}
		<span>{focused?.type === 'mood' ? 'Bad' : 'Less'}</span>
		{#each legend.low as c, i (i)}<span
				class="heat-legend__cell"
				style:background={c}
			></span>{/each}
		{#if legend.mid}<span
				class="heat-legend__cell"
				style:background={legend.mid}
			></span>{/if}
		{#if !legend.mid}<span
				class="heat-legend__cell"
				style:background={chartPalette().heatEmpty}
			></span>{/if}
		{#each legend.high as c, i (i)}<span
				class="heat-legend__cell"
				style:background={c}
			></span>{/each}
		<span>{focused?.type === 'mood' ? 'Good' : 'More'}</span>
		<span class="heat-legend__out"
			><span class="heat-legend__cell heat-legend__cell--out"></span> outside range</span
		>
	{:else}
		<span>Darker = more. Each habit is shaded against its own busiest day.</span>
	{/if}
</div>

<style>
	.heat-focus {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		scrollbar-width: none;
		margin-block-end: var(--space-3);
		padding-block-end: 2px;
	}

	.heat-focus::-webkit-scrollbar {
		display: none;
	}

	.heat-focus__btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		padding: 4px var(--space-3);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.heat-focus__btn--on {
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	.heat-focus__dot {
		inline-size: 8px;
		block-size: 8px;
		border-radius: var(--radius-full);
	}

	.heat-legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 3px;
		margin-block-start: var(--space-3);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.heat-legend > span:first-child {
		margin-inline-end: 4px;
	}

	.heat-legend__cell {
		display: inline-block;
		inline-size: 12px;
		block-size: 12px;
		border-radius: 2px;
	}

	.heat-legend__cell--out {
		border: 1px solid var(--color-border-strong);
		vertical-align: middle;
	}

	.heat-legend__out {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-inline-start: var(--space-3);
	}
</style>
