import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badgeText, shouldWelcome, streakLine, welcomeLine } from './lines.ts';

const habits = (count: number, currentCounts = false) => ({
	code: 'H' as const,
	label: 'Habits',
	unit: 'day' as const,
	count,
	currentCounts,
});
const activity = (count: number, currentCounts = false) => ({
	code: 'A' as const,
	label: 'Activity',
	unit: 'week' as const,
	count,
	currentCounts,
});

test('a badge reads the code, the count, and D or W', () => {
	assert.equal(badgeText(habits(12)), 'H 12D');
	assert.equal(badgeText(activity(2)), 'A 2W');
	assert.equal(badgeText(activity(0)), 'A 0');
});

test('the line says what makes the streak grow', () => {
	assert.equal(streakLine(habits(12)), 'Habits: 12 days! Log one today for 13.');
	assert.equal(streakLine(activity(1)), 'Activity: 1 week! Log one this week for 2.');
});

test('the line says when today or this week already counts', () => {
	assert.equal(streakLine(habits(13, true)), 'Habits: 13 days. Today counts.');
	assert.equal(streakLine(activity(3, true)), 'Activity: 3 weeks. This week counts.');
});

test('at 0 the line says how to start', () => {
	assert.equal(streakLine(activity(0)), 'Activity: 0. Log one this week to start.');
	assert.equal(streakLine(habits(0)), 'Habits: 0. Log one today to start.');
});

test('the welcome names the longest streak that is going', () => {
	assert.equal(welcomeLine(habits(12)), 'Morning! Habits: day 12');
	assert.equal(welcomeLine(activity(3)), 'Morning! Activity: week 3');
	assert.equal(welcomeLine(null), 'Morning!');
	assert.equal(welcomeLine(habits(0)), 'Morning!');
});

test('the welcome shows on the first open of each day only', () => {
	assert.equal(shouldWelcome(null, '2026-11-16'), true);
	assert.equal(shouldWelcome('2026-11-16', '2026-11-16'), false);
	assert.equal(shouldWelcome('2026-11-15', '2026-11-16'), true);
});
