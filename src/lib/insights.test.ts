// Pure-function tests for Insights aggregation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	compareWeeks,
	mondayOf,
	weekdayIndex,
	metricDailyTotals,
	habitDailyValues,
} from './insights/logic.ts';
import type { BaselineLog, Habit, HabitLog } from '#lib/db/types';

// ── Fixtures ─────────────────────────────────────────────────

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
