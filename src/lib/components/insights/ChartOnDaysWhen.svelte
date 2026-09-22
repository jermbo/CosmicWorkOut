<!-- US-044 #4 "On days when…": an outcome's average on days a condition held vs didn't. -->
<script lang="ts">
	import { barX, defineChart, ruleX } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { Chart } from '@tanstack/charts/svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { habitColor } from '$lib/habitColors';
	import {
		MIN_GROUP_DAYS,
		baselineLoggedDates,
		habitDailyValues,
		splitByCondition,
	} from '$lib/insights/logic';
	import { niceAxis } from '$lib/charts/scale';
	import { chartGrid, chartTooltip, withAlpha } from '$lib/charts/theme';

	let { dates }: { dates: string[] } = $props();

	type Outcome = {
		id: string;
		label: string;
		color: string;
		values: () => Map<string, number>;
		mood: boolean;
	};
	type Condition = { id: string; label: string; dates: () => Set<string> };

	let outcomes = $derived<Outcome[]>(
		habitStore.activeHabits
			.filter((h) => h.type !== 'boolean')
			.map((h) => ({
				id: h.id,
				label: h.type === 'mood' ? 'Mood' : h.name,
				color: habitColor(h),
				values: () => habitDailyValues(h, habitStore.logs),
				mood: h.type === 'mood',
			})),
	);

	let outcomeId = $state('');
	let outcome = $derived(outcomes.find((o) => o.id === outcomeId) ?? outcomes[0] ?? null);

	let conditions = $derived.by<Condition[]>(() => {
		const list: Condition[] = [];
		if (prefsStore.practiceEnabled) {
			list.push({
				id: 'workout',
				label: 'I logged a workout',
				dates: () => new Set(programStore.sessions.map((s) => s.date)),
			});
		}
		if (prefsStore.activityLogEnabled) {
			list.push({
				id: 'activity',
				label: 'I logged an activity',
				dates: () => new Set(activityStore.activities.map((a) => a.date)),
			});
		}
		if (prefsStore.baselinesEnabled && baselineStore.activeBaselines.length > 0) {
			list.push({
				id: 'any-baseline',
				label: 'I logged any baseline',
				dates: () => new Set(baselineStore.logs.map((l) => l.date)),
			});
			for (const b of baselineStore.activeBaselines) {
				list.push({
					id: `b:${b.id}`,
					label: `I did ${b.name}`,
					dates: () => baselineLoggedDates(baselineStore.logs, b.id),
				});
			}
		}
		for (const h of habitStore.activeHabits) {
			if (h.type === 'mood' || h.id === outcome?.id) continue;
			list.push({
				id: `h:${h.id}`,
				label: `I logged ${h.name}`,
				dates: () => new Set(habitDailyValues(h, habitStore.logs).keys()),
			});
		}
		return list;
	});

	let conditionId = $state('');
	let condition = $derived(conditions.find((c) => c.id === conditionId) ?? conditions[0] ?? null);

	let split = $derived(
		outcome && condition ? splitByCondition(outcome.values(), condition.dates(), dates) : null,
	);

	type Bar = { group: string; average: number; days: number };

	let bars = $derived.by<Bar[]>(() => {
		if (!split) return [];
		const rows: Bar[] = [];
		if (split.whenTrue.average !== null)
			rows.push({ group: 'Yes', average: split.whenTrue.average, days: split.whenTrue.days });
		if (split.whenFalse.average !== null)
			rows.push({ group: 'No', average: split.whenFalse.average, days: split.whenFalse.days });
		return rows;
	});

	let axis = $derived(
		outcome?.mood
			? niceAxis([], { min: -5, max: 5, count: 4 })
			: niceAxis(
					bars.map((b) => b.average),
					{ includeZero: true },
				),
	);

	function fmt(v: number): string {
		if (outcome?.mood && v > 0) return `+${v}`;
		return String(v);
	}

	let definition = $derived.by(() => {
		const color = outcome?.color ?? '#888888';
		return defineChart({
			marks: [
				ruleX(axis.ticks, { stroke: chartGrid() }),
				barX(bars, {
					x: 'average',
					y: 'group',
					fill: withAlpha(color, 0.75),
					stroke: color,
					strokeWidth: 1,
					radius: 4,
					maxThickness: 28,
				}),
			],
			scales: {
				x: {
					scale: scaleLinear().domain(axis.domain),
					axis: { ticks: { values: axis.ticks, format: fmt, size: 0 } },
				},
				y: {
					scale: scaleBand<string>().domain(['Yes', 'No']).padding(0.25),
					axis: { ticks: { size: 0 } },
				},
			},
			tooltip: chartTooltip<Bar>(
				(b) => (b.group === 'Yes' ? `Days ${condition?.label ?? ''}` : 'Other days'),
				(p) => ({
					label: `avg of ${p.datum.days} day${p.datum.days === 1 ? '' : 's'}`,
					value: fmt(p.datum.average),
				}),
			),
		});
	});
</script>

{#if !outcome || !condition}
	<p class="insight-empty">
		Track mood or a habit with a number, plus one other thing, to compare.
	</p>
{:else}
	<div class="odw-pickers">
		<label class="insight-select">
			<span>Show</span>
			<select
				value={outcome.id}
				onchange={(e) => (outcomeId = e.currentTarget.value)}
			>
				{#each outcomes as o (o.id)}
					<option value={o.id}>{o.label}</option>
				{/each}
			</select>
		</label>
		<label class="insight-select">
			<span>On days</span>
			<select
				value={condition.id}
				onchange={(e) => (conditionId = e.currentTarget.value)}
			>
				{#each conditions as c (c.id)}
					<option value={c.id}>{c.label}</option>
				{/each}
			</select>
		</label>
	</div>

	{#if split && !split.enough}
		<p class="insight-note">
			Not enough data yet — each side needs at least {MIN_GROUP_DAYS} days with {outcome.label} logged
			(now {split.whenTrue.days} and {split.whenFalse.days}). Try a longer range.
		</p>
	{:else if split}
		<div class="odw-chart">
			<Chart
				{definition}
				height={140}
				ariaLabel="Bar chart: average {outcome.label} on days {condition.label} versus other days"
			/>
		</div>
		<p class="insight-note">
			Yes = days {condition.label.toLowerCase()} ({split.whenTrue.days} days, avg {fmt(
				split.whenTrue.average ?? 0,
			)}). No = other days ({split.whenFalse.days} days, avg {fmt(split.whenFalse.average ?? 0)}).
		</p>
	{/if}
{/if}

<style>
	.odw-pickers {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
	}

	.odw-chart {
		color: var(--color-text-secondary);
	}
</style>
