// Pure-function tests for Overview card ordering. No framework — runs on Node's
// built-in test runner with type stripping: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	HOME_CARD_IDS,
	DEFAULT_HOME_CARD_ORDER,
	resolveHomeCardOrder,
	reorderHomeCards,
} from './homeCards.ts';

test('a missing or unusable stored order falls back to the default', () => {
	assert.deepEqual(resolveHomeCardOrder(undefined), DEFAULT_HOME_CARD_ORDER);
	assert.deepEqual(resolveHomeCardOrder(null), DEFAULT_HOME_CARD_ORDER);
	assert.deepEqual(resolveHomeCardOrder('habits'), DEFAULT_HOME_CARD_ORDER);
	assert.deepEqual(resolveHomeCardOrder({}), DEFAULT_HOME_CARD_ORDER);
	assert.deepEqual(resolveHomeCardOrder([]), DEFAULT_HOME_CARD_ORDER);
});

test('a full stored order is preserved exactly', () => {
	const stored = ['activity', 'health', 'habits', 'baselines', 'practice'];
	assert.deepEqual(resolveHomeCardOrder(stored), stored);
});

test('cards absent from the stored order are appended in default order', () => {
	// What an existing user's localStorage looks like after a new card ships.
	assert.deepEqual(resolveHomeCardOrder(['activity', 'habits']), [
		'activity',
		'habits',
		'practice',
		'baselines',
		'health',
	]);
});

test('unknown ids are dropped', () => {
	const resolved = resolveHomeCardOrder(['activity', 'nutrition', 'habits']);
	assert.deepEqual(resolved, ['activity', 'habits', 'practice', 'baselines', 'health']);
});

test('duplicate ids are collapsed to the first occurrence', () => {
	const resolved = resolveHomeCardOrder(['health', 'habits', 'health']);
	assert.deepEqual(resolved, ['health', 'habits', 'practice', 'activity', 'baselines']);
});

test('non-string entries do not break resolution', () => {
	assert.deepEqual(resolveHomeCardOrder(['activity', 3, null, { id: 'habits' }, 'health']), [
		'activity',
		'health',
		'habits',
		'practice',
		'baselines',
	]);
});

test('resolution always returns every card exactly once', () => {
	for (const stored of [undefined, [], ['health'], ['x', 'y'], ['habits', 'habits']]) {
		const resolved = resolveHomeCardOrder(stored);
		assert.equal(resolved.length, HOME_CARD_IDS.length);
		assert.equal(new Set(resolved).size, HOME_CARD_IDS.length);
	}
});

test('reorder moves a card down to the target position', () => {
	const order = [...DEFAULT_HOME_CARD_ORDER];
	assert.deepEqual(reorderHomeCards(order, 'habits', 'activity'), [
		'practice',
		'activity',
		'habits',
		'baselines',
		'health',
	]);
});

test('reorder moves a card up to the target position', () => {
	const order = [...DEFAULT_HOME_CARD_ORDER];
	assert.deepEqual(reorderHomeCards(order, 'health', 'habits'), [
		'health',
		'habits',
		'practice',
		'activity',
		'baselines',
	]);
});

test('reorder onto itself is a no-op copy', () => {
	const order = [...DEFAULT_HOME_CARD_ORDER];
	const next = reorderHomeCards(order, 'habits', 'habits');
	assert.deepEqual(next, order);
	assert.notEqual(next, order);
});

test('reorder never mutates the input', () => {
	const order = [...DEFAULT_HOME_CARD_ORDER];
	reorderHomeCards(order, 'habits', 'health');
	assert.deepEqual(order, DEFAULT_HOME_CARD_ORDER);
});

test('reorder keeps every card exactly once', () => {
	const next = reorderHomeCards([...DEFAULT_HOME_CARD_ORDER], 'baselines', 'habits');
	assert.equal(new Set(next).size, HOME_CARD_IDS.length);
});
