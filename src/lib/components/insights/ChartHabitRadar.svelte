<script lang="ts">
	import { defineChart } from '@tanstack/charts';
	import { angleGrid, polar, radialArea, radialGrid, radialLine } from '@tanstack/charts/polar';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { Chart } from '@tanstack/charts/svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { chartGrid, chartTooltip, withAlpha } from '$lib/charts/theme';

	let { dates }: { dates: string[] } = $props();

	type Spoke = { name: string; value: number; key: string };

	let spokes = $derived.by<Spoke[]>(() => {
		const dateSet = new Set(dates);
		const habits = habitStore.trackableHabits;
		const logsByHabit = new Map(habits.map((h) => [h.id, [] as number[]]));
		for (const log of habitStore.logs) {
			if (!dateSet.has(log.date)) continue;
			logsByHabit.get(log.habitId)?.push(log.value);
		}
		return habits.map((h) => {
			const vals = logsByHabit.get(h.id) ?? [];
			const key = h.id;
			if (vals.length === 0) return { name: h.name, value: 0, key };
			const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
			if (h.type === 'boolean') return { name: h.name, value: avg, key };
			if (h.dailyGoal) return { name: h.name, value: Math.min(1, avg / h.dailyGoal), key };
			return { name: h.name, value: avg > 0 ? 1 : 0, key };
		});
	});

	let definition = $derived.by(() => {
		const accent = prefsStore.accentColor;
		// Repeat the first spoke so the default linear path closes the shape.
		const ring =
			spokes.length > 0 ? [...spokes, { ...spokes[0], key: `${spokes[0].key}:close` }] : [];
		return defineChart({
			marks: [
				polar({
					radiusRatio: 0.7,
					scales: {
						angle: { scale: scalePoint<string>().domain(spokes.map((s) => s.name)), wrap: true },
						radius: { scale: scaleLinear().domain([0, 1]) },
					},
					guides: [
						radialGrid({ values: [0.25, 0.5, 0.75, 1], shape: 'polygon', stroke: chartGrid() }),
						angleGrid({ stroke: chartGrid() }),
					],
					marks: [
						radialArea(ring, {
							angle: 'name',
							radius: 'value',
							key: 'key',
							fill: withAlpha(accent, 0.2),
						}),
						radialLine(ring, {
							angle: 'name',
							radius: 'value',
							key: 'key',
							stroke: accent,
							strokeWidth: 2,
						}),
					],
				}),
			],
			scales: { x: null, y: null },
			tooltip: chartTooltip<Spoke>(
				(d) => d.name,
				(p) => ({ label: 'Consistency', value: `${Math.round(p.datum.value * 100)}%` }),
			),
		});
	});
</script>

<div class="habit-radar">
	<Chart
		{definition}
		height={280}
		ariaLabel="Radar chart: average consistency per habit"
	/>
</div>

<style>
	.habit-radar {
		color: var(--color-text-secondary);
	}
</style>
