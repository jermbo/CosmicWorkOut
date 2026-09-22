// Pure-function tests for habit color defaults (US-042).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	HABIT_COLOR_PALETTE,
	MOOD_DEFAULT_BAD,
	MOOD_DEFAULT_GOOD,
	habitColor,
	nextDefaultColor,
	withDefaultColors,
} from './habitColors.ts';
import type { Habit } from '$lib/db/types';

function habit(id: string, sortOrder: number, extra: Partial<Habit> = {}): Habit {
	return {
		id,
		name: id,
		unit: '',
		type: 'count',
		active: true,
		sortOrder,
		createdAt: '2026-01-01T00:00:00.000Z',
		...extra,
	};
}

test('defaults hand out distinct palette colors in sort order', () => {
	const habits = [habit('a', 0), habit('b', 1), habit('c', 2), habit('d', 3), habit('e', 4)];
	const changed = withDefaultColors(habits);
	const colors = changed.map((h) => h.color);
	assert.equal(new Set(colors).size, 5);
	assert.deepEqual(colors, HABIT_COLOR_PALETTE.slice(0, 5));
});

test('habits that already have a color are left alone and their color is skipped', () => {
	const habits = [habit('a', 0, { color: HABIT_COLOR_PALETTE[0] }), habit('b', 1)];
	const changed = withDefaultColors(habits);
	assert.equal(changed.length, 1);
	assert.equal(changed[0].id, 'b');
	assert.equal(changed[0].color, HABIT_COLOR_PALETTE[1]);
});

test('mood gets good and bad defaults', () => {
	const [mood] = withDefaultColors([habit('m', 0, { type: 'mood' })]);
	assert.equal(mood.color, MOOD_DEFAULT_GOOD);
	assert.equal(mood.negativeColor, MOOD_DEFAULT_BAD);
});

test('nothing to change returns an empty list', () => {
	assert.deepEqual(withDefaultColors([habit('a', 0, { color: '#123456' })]), []);
});

test('nextDefaultColor cycles once the palette is used up', () => {
	assert.equal(nextDefaultColor([...HABIT_COLOR_PALETTE], 1), HABIT_COLOR_PALETTE[1]);
});

test('habitColor falls back before defaults are saved', () => {
	assert.equal(habitColor({ type: 'count', sortOrder: 2 }), HABIT_COLOR_PALETTE[2]);
	assert.equal(habitColor({ type: 'count', sortOrder: 2, color: '#abcdef' }), '#abcdef');
});
