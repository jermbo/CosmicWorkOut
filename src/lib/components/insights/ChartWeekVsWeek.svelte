<!--
	US-044 #5 This week vs last week: totals Monday→today against the same weekdays
	last week. Always about the current week, so it ignores the range picker.
	Neutral arrows — like baselines, more isn't assumed to be better.
-->
<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { formatValue, visibleMetrics } from '$lib/baselines/logic';
	import { todayIso } from '$lib/date';
	import {
		WEEKDAY_LABELS,
		compareWeeks,
		habitDailyValues,
		metricDailyTotals,
		type WeekComparison,
	} from '$lib/insights/logic';

	type Row = { id: string; label: string; cmp: WeekComparison; format: (v: number) => string };

	let today = todayIso();

	let rows = $derived.by<Row[]>(() => {
		const list: Row[] = [];
		if (prefsStore.baselinesEnabled) {
			for (const b of baselineStore.activeBaselines) {
				for (const m of visibleMetrics(b)) {
					list.push({
						id: `b:${b.id}:${m.id}`,
						label: `${b.name} · ${m.name}`,
						cmp: compareWeeks(metricDailyTotals(baselineStore.logs, b.id, m.id), today),
						format: (v) => formatValue(m, v),
					});
				}
			}
		}
		if (prefsStore.habitsEnabled) {
			for (const h of habitStore.trackableHabits) {
				if (h.type === 'boolean') continue;
				list.push({
					id: `h:${h.id}`,
					label: h.name,
					cmp: compareWeeks(habitDailyValues(h, habitStore.logs), today),
					format: (v) => (h.type === 'minutes' ? `${v} min` : `${v}${h.unit ? ` ${h.unit}` : ''}`),
				});
			}
		}
		if (prefsStore.practiceEnabled) {
			const volume = new SvelteMap<string, number>();
			for (const s of programStore.sessions) {
				volume.set(s.date, (volume.get(s.date) ?? 0) + s.totalVolume);
			}
			list.push({
				id: 'volume',
				label: 'Workout volume',
				cmp: compareWeeks(volume, today),
				format: (v) => `${v.toLocaleString()} lb`,
			});
		}
		return list;
	});

	let span = $derived(rows[0]?.cmp.span ?? 7);
	let spanLabel = $derived(
		span === 1 ? 'Monday' : `${WEEKDAY_LABELS[0]}–${WEEKDAY_LABELS[span - 1]}`,
	);

	const ARROWS = { up: '↑', down: '↓', same: '=' } as const;
	const TREND_WORDS = { up: 'more than', down: 'less than', same: 'same as' } as const;
</script>

{#if rows.length === 0}
	<p class="insight-empty">Log baselines, habits, or workouts to compare weeks.</p>
{:else}
	<p class="insight-note wvw-span">Comparing {spanLabel} this week with {spanLabel} last week.</p>
	<table class="wvw">
		<thead>
			<tr>
				<th scope="col">What</th>
				<th scope="col">This week</th>
				<th scope="col">Last week</th>
				<th scope="col"><span class="sr-only">Change</span></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.id)}
				<tr>
					<th scope="row">{row.label}</th>
					<td>{row.format(row.cmp.thisWeek)}</td>
					<td>{row.format(row.cmp.lastWeek)}</td>
					<td
						class="wvw__trend"
						aria-label="{TREND_WORDS[row.cmp.trend]} last week"
					>
						{ARROWS[row.cmp.trend]}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	.wvw-span {
		margin-block: 0 var(--space-3);
	}

	.wvw {
		inline-size: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	.wvw th,
	.wvw td {
		padding: var(--space-2) var(--space-1);
		border-block-end: 1px solid var(--color-border);
		text-align: end;
		white-space: nowrap;
	}

	.wvw thead th {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.wvw tbody th {
		text-align: start;
		font-weight: 600;
		white-space: normal;
		color: var(--color-text-primary);
	}

	.wvw td {
		font-family: var(--font-mono);
		color: var(--color-text-primary);
	}

	.wvw__trend {
		inline-size: 24px;
		text-align: center !important;
		color: var(--color-text-secondary) !important;
	}

	.wvw tbody tr:last-child th,
	.wvw tbody tr:last-child td {
		border-block-end: none;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}
</style>
