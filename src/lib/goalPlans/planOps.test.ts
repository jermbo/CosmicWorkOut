// Pure-function tests for plan ops used by the goal plan store.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateBlocks } from './generator.ts';
import { prescribedTargetsForWeek } from './prescribed.ts';
import { buildGoalProgram } from './buildProgram.ts';
import { targetLabel, unitLabel } from './format.ts';
import type { GoalPlan, GoalTemplateRoutine } from './types.ts';

const ROUTINES: GoalTemplateRoutine[] = [
	{
		letter: 'A',
		name: 'Heavy',
		focus: 'Bench',
		estMin: 45,
		slots: [
			{ itemId: 'bench', sets: 4, reps: '8' },
			{ itemId: 'row', sets: 3, reps: '10' },
		],
	},
	{
		letter: 'B',
		name: 'Volume',
		focus: 'Bench',
		estMin: 40,
		slots: [{ itemId: 'bench', sets: 3, reps: '10' }],
	},
	{
		letter: 'C',
		name: 'Assist',
		focus: 'Bench',
		estMin: 35,
		slots: [{ itemId: 'bench', sets: 3, reps: '12' }],
	},
];

function samplePlan(overrides: Partial<GoalPlan> = {}): GoalPlan {
	const blocks = generateBlocks({ weight: 150, reps: 10 }, { weight: 170, reps: 5 }, 5);
	return {
		id: 'plan-1',
		disciplineId: 'strength',
		programId: 'prog-1',
		templateId: 'gp-priority',
		name: 'Bench Goal 01',
		focusItemId: 'bench',
		goal: { weight: 170, reps: 5 },
		start: { weight: 150, reps: 10 },
		focusIncrement: 5,
		blocks,
		supporting: [{ itemId: 'row', startWeight: 100, weightIncrement: 5 }],
		daysPerWeek: 3,
		status: 'active',
		countOffset: 0,
		repeatEvents: [],
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

test('prescribedTargetsForWeek puts the focus wave target and supporting increment', () => {
	const plan = samplePlan();
	const week1 = prescribedTargetsForWeek(plan, 1);
	assert.deepEqual(week1.get('bench'), { weight: 150, reps: 10 });
	assert.deepEqual(week1.get('row'), { weight: 100 });

	const week2 = prescribedTargetsForWeek(plan, 2);
	assert.deepEqual(week2.get('bench'), { weight: 160, reps: 8 });
	assert.deepEqual(week2.get('row'), { weight: 105 });
});

test('buildGoalProgram scaffolds A/B/C across every plan week', () => {
	const program = buildGoalProgram({
		name: 'Bench Goal 01',
		goal: { weight: 250, reps: 5 },
		routines: ROUTINES,
		daysPerWeek: 3,
		durationWeeks: 8,
		programId: 'prog-fixed',
		createdAt: '2026-01-01T00:00:00.000Z',
		makeRoutineId: (week, i) => `w${week}-r${i}`,
	});

	assert.equal(program.id, 'prog-fixed');
	assert.equal(program.durationWeeks, 8);
	assert.equal(program.weeks.length, 8);
	assert.equal(program.weeks[0].routines.length, 3);
	assert.equal(program.weeks[0].routines[0].id, 'w1-r0');
	assert.equal(program.weeks[7].routines[2].id, 'w8-r2');
	assert.equal(program.weeks[0].routines[0].sections[0].items[0].itemId, 'bench');
	assert.match(program.description, /250 x 5/);
});

test('format helpers label units and targets', () => {
	assert.equal(unitLabel('kg'), 'kg');
	assert.equal(unitLabel('lb'), 'lb');
	assert.equal(unitLabel(undefined), 'lb');
	assert.equal(targetLabel({ weight: 250, reps: 5 }, 'lb'), '250 lb x 5');
});
