// The streak math (US-065): ISO week bucketing near year ends, and one streak for each
// tracker, by day or by week. Dates are local calendar days.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isoWeekKey, computeStreak, habitStreakDates } from './streak.ts';

function day(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, m - 1, d);
}

test('isoWeekKey follows ISO 8601 across year boundaries', () => {
	assert.equal(isoWeekKey(day('2024-12-30')), '2025-W1'); // Monday belongs to next year's W1
	assert.equal(isoWeekKey(day('2025-01-05')), '2025-W1'); // Sunday closes the same week
	assert.equal(isoWeekKey(day('2021-01-03')), '2020-W53'); // Sunday belongs to last year's W53
	assert.equal(isoWeekKey(day('2027-01-01')), '2026-W53');
	assert.equal(isoWeekKey(day('2026-01-01')), '2026-W1');
});

test('isoWeekKey keeps Monday–Sunday together and splits Sunday from the next Monday', () => {
	assert.equal(isoWeekKey(day('2026-09-14')), isoWeekKey(day('2026-09-20')));
	assert.notEqual(isoWeekKey(day('2026-09-20')), isoWeekKey(day('2026-09-21')));
});

test('isoWeekKey ignores the time of day', () => {
	const late = day('2026-09-20');
	late.setHours(23, 59);
	assert.equal(isoWeekKey(late), isoWeekKey(day('2026-09-20')));
});

test('a week streak counts straight through a year boundary', () => {
	const dates = ['2026-12-15', '2026-12-22', '2026-12-29', '2027-01-05'];
	assert.deepEqual(computeStreak(dates, 'week', day('2027-01-06')), {
		count: 4,
		currentCounts: true,
	});
});

test('this week with no record yet does not break a week streak', () => {
	// A weight reading in each of the last 3 weeks, none this week (US-065 AC 1d).
	const dates = ['2026-10-27', '2026-11-04', '2026-11-12'];
	assert.deepEqual(computeStreak(dates, 'week', day('2026-11-16')), {
		count: 3,
		currentCounts: false,
	});
});

test('a week streak breaks at the first full past week with no record', () => {
	// Sessions in the weeks of 12 and 26 October, none in the week of 19 October (AC 1e).
	const dates = ['2026-10-13', '2026-10-27'];
	assert.equal(computeStreak(dates, 'week', day('2026-11-03')).count, 1);
});

test('a day streak counts back from yesterday when today has no record', () => {
	const dates = Array.from({ length: 12 }, (_, i) => `2026-11-${String(4 + i).padStart(2, '0')}`);
	assert.deepEqual(computeStreak(dates, 'day', day('2026-11-16')), {
		count: 12,
		currentCounts: false,
	});
	// A log today adds one (AC 1b).
	assert.deepEqual(computeStreak([...dates, '2026-11-16'], 'day', day('2026-11-16')), {
		count: 13,
		currentCounts: true,
	});
});

test('a day streak breaks at a gap in the past', () => {
	const dates = ['2026-11-15', '2026-11-14', '2026-11-12', '2026-11-11'];
	assert.equal(computeStreak(dates, 'day', day('2026-11-16')).count, 2);
});

test('a day streak runs across a month end', () => {
	const dates = ['2026-10-30', '2026-10-31', '2026-11-01'];
	assert.equal(computeStreak(dates, 'day', day('2026-11-02')).count, 3);
});

test('no records gives 0', () => {
	assert.deepEqual(computeStreak([], 'day', day('2026-11-16')), { count: 0, currentCounts: false });
	assert.deepEqual(computeStreak([], 'week', day('2026-11-16')), {
		count: 0,
		currentCounts: false,
	});
});

test('the time of day of today does not matter', () => {
	const late = day('2026-11-16');
	late.setHours(23, 59);
	assert.equal(computeStreak(['2026-11-15'], 'day', late).count, 1);
});

test('Habits counts a Mood log of any value, and other habits above 0', () => {
	const mood = new Set(['mood']);
	const logs = [
		{ habitId: 'mood', date: '2026-11-13', value: 0 },
		{ habitId: 'mood', date: '2026-11-14', value: -3 },
		{ habitId: 'mood', date: '2026-11-15', value: 2 },
		{ habitId: 'water', date: '2026-11-12', value: 0 },
	];
	const dates = habitStreakDates(logs, mood);
	assert.deepEqual(dates, ['2026-11-13', '2026-11-14', '2026-11-15']);
	// Only Mood logs on the last 3 days reads "H 3D" (AC 1c).
	assert.equal(computeStreak(dates, 'day', day('2026-11-16')).count, 3);
});
