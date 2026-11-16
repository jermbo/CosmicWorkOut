import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Session } from '../db/types.ts';
import { planGoalReached } from './goalReached.ts';

const plan = { focusItemId: 'bench', goal: { weight: 185, reps: 5 } };

function session(
	sets: [weight: number | string, reps: number][],
	itemId = 'bench',
): Pick<Session, 'items'> {
	return {
		items: [
			{
				itemId,
				sets: sets.map(([weight, reps], i) => ({
					setNumber: i + 1,
					weight,
					reps,
					completedAt: '2026-11-16T10:00:00.000Z',
				})),
			},
		],
	};
}

test('the goal weight × reps reaches the goal', () => {
	assert.equal(planGoalReached(session([[185, 5]]), plan), true);
});

test('more weight than the goal reaches it', () => {
	assert.equal(planGoalReached(session([[190, 5]]), plan), true);
});

test('the goal weight with fewer reps does not', () => {
	assert.equal(planGoalReached(session([[185, 4]]), plan), false);
});

test('one set at the goal among lighter ones is enough', () => {
	assert.equal(
		planGoalReached(
			session([
				[165, 5],
				[175, 5],
				[185, 5],
			]),
			plan,
		),
		true,
	);
});

test('the goal on another lift does not count', () => {
	assert.equal(planGoalReached(session([[185, 5]], 'squat'), plan), false);
});

test('a plan with no goal, or no plan, is never reached', () => {
	assert.equal(planGoalReached(session([[185, 5]]), null), false);
	assert.equal(
		planGoalReached(session([[185, 5]]), { focusItemId: 'bench', goal: { weight: 0, reps: 0 } }),
		false,
	);
});

test('a weight logged as text does not reach it', () => {
	assert.equal(planGoalReached(session([['BW', 20]]), plan), false);
});
