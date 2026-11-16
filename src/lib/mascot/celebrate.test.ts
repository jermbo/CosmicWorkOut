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

test('Mood never does', () => {
	assert.equal(reachesDailyGoal({ type: 'mood', dailyGoal: 1 }, 0, 3), false);
});

test('a habit with no goal, or a goal of 0, does on its first log only', () => {
	assert.equal(reachesDailyGoal({ type: 'count', dailyGoal: undefined }, 0, 1), true);
	assert.equal(reachesDailyGoal({ type: 'count', dailyGoal: 0 }, 0, 1), true);
	assert.equal(reachesDailyGoal({ type: 'count', dailyGoal: 0 }, 1, 2), false);
});

test('a Yes / No habit does when it is marked done', () => {
	assert.equal(reachesDailyGoal({ type: 'boolean', dailyGoal: undefined }, 0, 1), true);
	assert.equal(reachesDailyGoal({ type: 'boolean', dailyGoal: undefined }, 1, 0), false);
});
