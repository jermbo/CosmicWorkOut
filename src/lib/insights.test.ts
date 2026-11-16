// Pure-function tests for Insights aggregation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	bestDay,
	compareWeeks,
	mondayOf,
	weekdayIndex,
	metricDailyTotals,
	habitDailyValues,
} from './insights/logic.ts';
import {
	heatLevel,
	moodLevel,
	habitHeatRow,
	calendarSlots,
	HEAT_EMPTY,
	HEAT_NEUTRAL,
} from './insights/heat.ts';
import type { BaselineLog, Habit, HabitLog } from '$lib/db/types';

test('bestDay picks the highest positive day, latest on ties', () => {
	const rows = [
		{ date: '2026-09-10', value: 20 },
		{ date: '2026-09-12', value: 35 },
		{ date: '2026-09-14', value: 35 },
		{ date: '2026-09-15', value: 0 },
	];
	assert.deepEqual(bestDay(rows), { date: '2026-09-14', value: 35 });
});

test('bestDay is null when nothing was logged', () => {
	assert.equal(bestDay([{ date: '2026-09-10', value: 0 }]), null);
	assert.equal(bestDay([]), null);
});

// ── Heat chart (US-041) ──────────────────────────────────────

function habit(extra: Partial<Habit>): Habit {
	return {
		id: 'h',
		name: 'Water',
		unit: 'cups',
		type: 'count',
		active: true,
		sortOrder: 0,
		createdAt: '',
		color: '#60c6ff',
		...extra,
	};
}
const hlog = (date: string, value: number, habitId = 'h'): HabitLog => ({
	id: `${habitId}:${date}`,
	habitId,
	date,
	value,
});

test('heatLevel steps in tenths of the busiest day', () => {
	assert.equal(heatLevel(5, 10), 5);
	assert.equal(heatLevel(10, 10), 10);
	assert.equal(heatLevel(0.1, 10), 1);
	assert.equal(heatLevel(0, 10), 0);
});

test('moodLevel maps ±1…±5 to 20%…100%', () => {
	assert.equal(moodLevel(4), 8);
	assert.equal(moodLevel(-4), 8);
	assert.equal(moodLevel(5), 10);
});

test('number habits shade against their own max; unlogged days are empty', () => {
	const dates = ['2026-09-01', '2026-09-02', '2026-09-03'];
	const row = habitHeatRow(habit({}), [hlog('2026-09-01', 5), hlog('2026-09-02', 10)], dates);
	assert.deepEqual(
		row.map((c) => c.level),
		[5, 10, 0],
	);
	assert.equal(row[1].fill, 'rgba(96, 198, 255, 1)');
	assert.equal(row[2].fill, HEAT_EMPTY);
	assert.equal(row[2].value, undefined);
});

test('two habits each hit full color on their own max', () => {
	const dates = ['2026-09-01'];
	const water = habitHeatRow(habit({}), [hlog('2026-09-01', 10)], dates);
	const coffee = habitHeatRow(
		habit({ id: 'c', name: 'Coffee', color: '#f59e0b' }),
		[hlog('2026-09-01', 3, 'c')],
		dates,
	);
	assert.equal(water[0].level, 10);
	assert.equal(coffee[0].level, 10);
});

test('yes/no habits are full or empty', () => {
	const dates = ['2026-09-01', '2026-09-02'];
	const row = habitHeatRow(habit({ type: 'boolean' }), [hlog('2026-09-01', 1)], dates);
	assert.deepEqual(
		row.map((c) => c.level),
		[10, 0],
	);
});

test('mood uses two colors at the same darkness, and 0 is neutral', () => {
	const dates = ['2026-09-01', '2026-09-02', '2026-09-03'];
	const mood = habit({ type: 'mood', color: '#34d399', negativeColor: '#fb923c' });
	const row = habitHeatRow(
		mood,
		[hlog('2026-09-01', 4), hlog('2026-09-02', -4), hlog('2026-09-03', 0)],
		dates,
	);
	assert.equal(row[0].kind, 'positive');
	assert.equal(row[1].kind, 'negative');
	assert.equal(row[0].level, row[1].level);
	assert.notEqual(row[0].fill, row[1].fill);
	assert.equal(row[2].fill, HEAT_NEUTRAL);
});

test('calendarSlots pads to whole Monday–Sunday weeks', () => {
	// 2026-09-02 is a Wednesday.
	const { weeks, slots } = calendarSlots(['2026-09-02', '2026-09-03']);
	assert.deepEqual(weeks, ['2026-08-31']);
	assert.equal(slots.length, 7);
	assert.deepEqual(
		slots.filter((s) => s.inRange).map((s) => s.weekday),
		[2, 3],
	);
	assert.equal(slots[0].date, '2026-08-31');
	assert.equal(slots[6].weekday, 6);
});

// ── Week helpers and This Week vs Last Week (US-044) ─────────

test('mondayOf and weekdayIndex use Monday-first weeks', () => {
	// 2026-09-20 is a Sunday; 2026-09-21 a Monday.
	assert.equal(weekdayIndex('2026-09-20'), 6);
	assert.equal(weekdayIndex('2026-09-21'), 0);
	assert.equal(mondayOf('2026-09-20'), '2026-09-14');
});

test('compareWeeks uses the same weekdays so far', () => {
	// Wednesday 2026-09-23: Mon–Wed vs last Mon–Wed; last Thursday is ignored.
	const values = new Map([
		['2026-09-21', 10],
		['2026-09-23', 10],
		['2026-09-14', 5],
		['2026-09-17', 50],
	]);
	const cmp = compareWeeks(values, '2026-09-23');
	assert.deepEqual(cmp, { thisWeek: 20, lastWeek: 5, trend: 'up', span: 3 });
});

test('metricDailyTotals sums per day and skips blank metrics', () => {
	const logs: BaselineLog[] = [
		{ id: '1', baselineId: 'b', date: 'd1', recordedAt: '', values: { m: 10 } },
		{ id: '2', baselineId: 'b', date: 'd1', recordedAt: '', values: { m: 5 } },
		{ id: '3', baselineId: 'b', date: 'd2', recordedAt: '', values: { other: 1 } },
	];
	const totals = metricDailyTotals(logs, 'b', 'm');
	assert.equal(totals.get('d1'), 15);
	assert.equal(totals.has('d2'), false);
});

test('habitDailyValues keeps mood zeros but drops other zeros', () => {
	const mood = habit({ id: 'mood', type: 'mood' });
	const water = habit({ id: 'h' });
	const logs = [hlog('d1', 0, 'mood'), hlog('d1', 0), hlog('d2', 3)];
	assert.equal(habitDailyValues(mood, logs).get('d1'), 0);
	assert.equal(habitDailyValues(water, logs).has('d1'), false);
	assert.equal(habitDailyValues(water, logs).get('d2'), 3);
});
