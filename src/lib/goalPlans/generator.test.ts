// Pure-function tests for the goal plan generator. No framework — runs on Node's
// built-in test runner with type stripping: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	WEEKS_PER_BLOCK,
	MAX_BLOCKS,
	roundToIncrement,
	buildBlock,
	nextBaseline,
	generateBlocks,
	totalPlanWeeks,
	estimateMonths,
	focusTargetForWeek,
	blockForWeek,
	supportingWeightForWeek,
	effectivePlanWeek,
	isPlanFinished,
	countOffsetForRepeat,
} from './generator.ts';
import { autoPlanName } from './naming.ts';
import type { GoalPlan } from './types.ts';

test('buildBlock follows build → build → peak → deload from the baseline', () => {
	// Spec example: 150x10 → 160x8 → 170x6 → deload 150x10 (increment 5, +2 increments/week)
	const block = buildBlock(1, { weight: 150, reps: 10 }, 5);
	assert.equal(block.weeks.length, WEEKS_PER_BLOCK);
	assert.deepEqual(
		block.weeks.map((w) => [w.weight, w.reps, w.phase]),
		[
			[150, 10, 'build'],
			[160, 8, 'build'],
			[170, 6, 'peak'],
			[150, 10, 'deload'],
		],
	);
	assert.deepEqual(
		block.weeks.map((w) => w.planWeek),
		[1, 2, 3, 4],
	);
});

test('deload week matches week 1 exactly (AC 3a)', () => {
	const block = buildBlock(2, { weight: 172.5, reps: 8 }, 2.5);
	const [wk1, , , wk4] = block.weeks;
	assert.equal(wk4.weight, wk1.weight);
	assert.equal(wk4.reps, wk1.reps);
	assert.equal(wk4.phase, 'deload');
});

test('reps never drop below 1 for low-rep starting points', () => {
	const block = buildBlock(1, { weight: 400, reps: 3 }, 5);
	assert.deepEqual(
		block.weeks.map((w) => w.reps),
		[3, 1, 1, 3],
	);
});

test('next block starts at the previous peak weight with week-1 reps (AC 3b)', () => {
	const block1 = buildBlock(1, { weight: 150, reps: 10 }, 5);
	const baseline2 = nextBaseline(block1);
	assert.deepEqual(baseline2, { weight: 170, reps: 10 });

	const block2 = buildBlock(2, baseline2, 5);
	assert.deepEqual(
		block2.weeks.map((w) => [w.weight, w.reps]),
		[
			[170, 10],
			[180, 8],
			[190, 6],
			[170, 10],
		],
	);
	assert.deepEqual(
		block2.weeks.map((w) => w.planWeek),
		[5, 6, 7, 8],
	);
});

test('generateBlocks chains until a peak reaches the goal weight', () => {
	// 150x10 → goal 200x5, inc 5: peaks 170, 190, 210 → 3 blocks
	const blocks = generateBlocks({ weight: 150, reps: 10 }, { weight: 200, reps: 5 }, 5);
	assert.equal(blocks.length, 3);
	const lastPeak = blocks[2].weeks.find((w) => w.phase === 'peak');
	assert.ok(lastPeak && lastPeak.weight >= 200);
	assert.equal(totalPlanWeeks(blocks), 12);
});

test('a farther starting point needs more blocks (AC 2c)', () => {
	const far = generateBlocks({ weight: 125, reps: 10 }, { weight: 250, reps: 5 }, 5);
	const near = generateBlocks({ weight: 200, reps: 10 }, { weight: 250, reps: 5 }, 5);
	assert.ok(far.length > near.length);
	assert.ok(estimateMonths(far) > estimateMonths(near));
});

test('generateBlocks always yields at least one block and respects the cap', () => {
	const already = generateBlocks({ weight: 300, reps: 5 }, { weight: 200, reps: 5 }, 5);
	assert.equal(already.length, 1);

	const huge = generateBlocks({ weight: 45, reps: 10 }, { weight: 10000, reps: 1 }, 5);
	assert.equal(huge.length, MAX_BLOCKS);
});

test('generateBlocks falls back to a sane increment when the item has none', () => {
	const blocks = generateBlocks({ weight: 100, reps: 10 }, { weight: 140, reps: 5 }, 0);
	assert.ok(blocks.length >= 1);
	assert.ok(blocks[0].weeks[1].weight > blocks[0].weeks[0].weight);
});

test('roundToIncrement snaps to the increment grid', () => {
	assert.equal(roundToIncrement(151, 5), 150);
	assert.equal(roundToIncrement(153, 5), 155);
	assert.equal(roundToIncrement(151.3, 2.5), 152.5);
	assert.equal(roundToIncrement(151, 0), 151);
});

test('focusTargetForWeek and blockForWeek map plan weeks into blocks', () => {
	const blocks = generateBlocks({ weight: 150, reps: 10 }, { weight: 200, reps: 5 }, 5);
	assert.equal(focusTargetForWeek(blocks, 1)?.weight, 150);
	assert.equal(focusTargetForWeek(blocks, 7)?.weight, 190); // block 2 peak
	assert.equal(focusTargetForWeek(blocks, 8)?.weight, 170); // block 2 deload
	assert.equal(blockForWeek(blocks, 8)?.blockNumber, 2);
	assert.equal(focusTargetForWeek(blocks, 13), null); // past the last block
	assert.equal(focusTargetForWeek(blocks, 0), null);
});

test('supporting exercises climb every week and never deload (AC 4a/4b)', () => {
	const baseline = {
		itemId: 'st-front-raise',
		startWeight: 15,
		weightIncrement: 2.5,
	};
	const weights = [1, 2, 3, 4, 5].map((wk) => supportingWeightForWeek(baseline, wk));
	assert.deepEqual(weights, [15, 17.5, 20, 22.5, 25]);
	for (let i = 1; i < weights.length; i++) {
		assert.ok(weights[i] > weights[i - 1]);
	}
});

test('effectivePlanWeek advances by session count and caps at the plan end', () => {
	// 3 days/week: sessions 0-2 → week 1, 3-5 → week 2
	assert.equal(effectivePlanWeek(0, 0, 3, 12), 1);
	assert.equal(effectivePlanWeek(2, 0, 3, 12), 1);
	assert.equal(effectivePlanWeek(3, 0, 3, 12), 2);
	assert.equal(effectivePlanWeek(35, 0, 3, 12), 12);
	assert.equal(effectivePlanWeek(99, 0, 3, 12), 12);
});

test('repeat offset rewinds targets to week 1 of the current block (AC 6a)', () => {
	// In block 3 week 2 (plan week 10): 28 sessions done at 3/week
	const completed = 28;
	const offset = countOffsetForRepeat(completed, 3, 3);
	// Effective week returns to block 3's first week…
	assert.equal(effectivePlanWeek(completed, offset, 3, 12), 9);
	// …and week 2+ targets follow the block's original schedule again.
	assert.equal(effectivePlanWeek(completed + 3, offset, 3, 12), 10);
	assert.equal(effectivePlanWeek(completed + 6, offset, 3, 12), 11);
});

test('repeats extend the timeline; the plan finishes later (AC 6c)', () => {
	const daysPerWeek = 3;
	const totalWeeks = 12;
	assert.equal(isPlanFinished(36, 0, daysPerWeek, totalWeeks), true);
	const offset = countOffsetForRepeat(28, 3, daysPerWeek);
	assert.equal(isPlanFinished(36, offset, daysPerWeek, totalWeeks), false);
	assert.equal(isPlanFinished(36 + offset, offset, daysPerWeek, totalWeeks), true);
});

test('autoPlanName numbers instances per focus exercise', () => {
	const planFor = (focusItemId: string) => ({ focusItemId }) as GoalPlan;
	assert.equal(
		autoPlanName('Barbell Bench Press', 'st-bb-bench-press', []),
		'Barbell Bench Press Goal 01',
	);
	assert.equal(
		autoPlanName('Barbell Bench Press', 'st-bb-bench-press', [planFor('st-bb-bench-press')]),
		'Barbell Bench Press Goal 02',
	);
	assert.equal(
		autoPlanName('Barbell Deadlift', 'st-bb-deadlift', [planFor('st-bb-bench-press')]),
		'Barbell Deadlift Goal 01',
	);
});
