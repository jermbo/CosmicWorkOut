// Week-boundary tests for the streak math. The audit flagged ISO week bucketing near
// year ends as unverified — these pin it down. Dates are local calendar days.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isoWeekKey, computeWeekStreak } from './streak.ts';

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

test('computeWeekStreak counts straight through a year boundary', () => {
	const dates = ['2026-12-15', '2026-12-22', '2026-12-29', '2027-01-05'];
	assert.equal(computeWeekStreak(dates, 1, day('2027-01-06')), 4);
});

test('computeWeekStreak still counts last week when this week has no session yet', () => {
	assert.equal(computeWeekStreak(['2026-09-14', '2026-09-07'], 1, day('2026-09-21')), 2);
});

test('computeWeekStreak stops at a week below the threshold', () => {
	const dates = ['2026-09-15', '2026-09-16', '2026-09-08', '2026-08-25', '2026-08-26'];
	assert.equal(computeWeekStreak(dates, 2, day('2026-09-17')), 1);
});
