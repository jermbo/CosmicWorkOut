import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reachesDailyGoal } from './celebrate.ts';

const water = { type: 'count' as const, dailyGoal: 4 };

test('the log that reaches the goal brings the star', () => {
	assert.equal(reachesDailyGoal(water, 3, 4), true);
});

test('a log under the goal does not', () => {
	assert.equal(reachesDailyGoal(water, 1, 2), false);
});

test('a log past a goal already reached does not', () => {
	assert.equal(reachesDailyGoal(water, 4, 5), false);
});

test('a jump over the goal in one log does', () => {
	assert.equal(reachesDailyGoal({ type: 'minutes', dailyGoal: 20 }, 5, 30), true);
});

test('Mood and a habit with no goal never do', () => {
	assert.equal(reachesDailyGoal({ type: 'mood', dailyGoal: 1 }, 0, 3), false);
	assert.equal(reachesDailyGoal({ type: 'times', dailyGoal: undefined }, 0, 1), false);
});
