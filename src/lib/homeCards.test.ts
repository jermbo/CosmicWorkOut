// Pure-function tests for Overview card ordering. No framework — runs on Node's
// built-in test runner with type stripping: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOME_CARD_IDS, DEFAULT_HOME_CARD_ORDER, resolveHomeCardOrder } from './homeCards.ts';

test('a missing or unusable stored order falls back to the default', () => {
	assert.deepEqual(resolveHomeCardOrder(undefined), DEFAULT_HOME_CARD_ORDER);
	assert.deepEqual(resolveHomeCardOrder(null), DEFAULT_HOME_CARD_ORDER);
	assert.deepEqual(resolveHomeCardOrder('habits'), DEFAULT_HOME_CARD_ORDER);
	assert.deepEqual(resolveHomeCardOrder({}), DEFAULT_HOME_CARD_ORDER);
	assert.deepEqual(resolveHomeCardOrder([]), DEFAULT_HOME_CARD_ORDER);
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
