import type { GoalTarget, ProgressionBlock, SupportingBaseline, WaveWeek, WavePhase } from './types';

export const WEEKS_PER_BLOCK = 4;

/** Safety cap so a huge start→goal gap can't generate an unbounded plan. */
export const MAX_BLOCKS = 12;

/** Build weeks jump by two increments (e.g. 150 → 160 → 170 with a 5 lb increment). */
const INCREMENTS_PER_BUILD_WEEK = 2;

/** Reps drop this much per build week (10 → 8 → 6), never below 1. */
const REPS_DROP_PER_BUILD_WEEK = 2;

const BLOCK_PHASES: WavePhase[] = ['build', 'build', 'peak', 'deload'];

export function roundToIncrement(weight: number, increment: number): number {
	if (increment <= 0) return weight;
	return Math.round(weight / increment) * increment;
}

/** One 4-week wave for the focus exercise, starting from a baseline weight × reps. */
export function buildBlock(blockNumber: number, baseline: GoalTarget, increment: number): ProgressionBlock {
	const startWeek = (blockNumber - 1) * WEEKS_PER_BLOCK;
	const step = increment * INCREMENTS_PER_BUILD_WEEK;

	const weeks: WaveWeek[] = BLOCK_PHASES.map((phase, i) => {
		const buildSteps = phase === 'deload' ? 0 : i;
		return {
			planWeek: startWeek + i + 1,
			blockWeek: i + 1,
			phase,
			weight: roundToIncrement(baseline.weight + buildSteps * step, increment),
			reps: Math.max(baseline.reps - buildSteps * REPS_DROP_PER_BUILD_WEEK, 1),
		};
	});

	return { blockNumber, baseline: { ...baseline }, weeks };
}

/** The next block starts where this block peaked, at the original (higher) rep count. */
export function nextBaseline(block: ProgressionBlock): GoalTarget {
	const peak = block.weeks.find((w) => w.phase === 'peak') ?? block.weeks[block.weeks.length - 1];
	return { weight: peak.weight, reps: block.baseline.reps };
}

/**
 * Chain 4-week blocks from the starting point until a block's peak week reaches the
 * goal weight (the final deload then sits just under the goal). Always at least one
 * block; capped at MAX_BLOCKS.
 */
export function generateBlocks(start: GoalTarget, goal: GoalTarget, increment: number): ProgressionBlock[] {
	const inc = increment > 0 ? increment : 5;
	const blocks: ProgressionBlock[] = [];
	let baseline: GoalTarget = { weight: start.weight, reps: start.reps };

	for (let n = 1; n <= MAX_BLOCKS; n++) {
		const block = buildBlock(n, baseline, inc);
		blocks.push(block);
		const peak = block.weeks.find((w) => w.phase === 'peak');
		if (peak && peak.weight >= goal.weight) break;
		baseline = nextBaseline(block);
	}

	return blocks;
}

export function totalPlanWeeks(blocks: ProgressionBlock[]): number {
	return blocks.length * WEEKS_PER_BLOCK;
}

/**
 * Rough calendar estimate for the UI ("~4 months"). Weeks advance by session count,
 * so this assumes the user roughly keeps the daysPerWeek pace.
 */
export function estimateMonths(blocks: ProgressionBlock[]): number {
	return Math.max(1, Math.round(totalPlanWeeks(blocks) / 4.345));
}

/** Focus target for a plan week; null once the plan week is past the last block. */
export function focusTargetForWeek(blocks: ProgressionBlock[], planWeek: number): WaveWeek | null {
	if (planWeek < 1) return null;
	const block = blocks[Math.floor((planWeek - 1) / WEEKS_PER_BLOCK)];
	return block?.weeks[(planWeek - 1) % WEEKS_PER_BLOCK] ?? null;
}

export function blockForWeek(blocks: ProgressionBlock[], planWeek: number): ProgressionBlock | null {
	return blocks[Math.floor((planWeek - 1) / WEEKS_PER_BLOCK)] ?? null;
}

/** Supporting exercises climb by their increment every plan week — no deload wave. */
export function supportingWeightForWeek(baseline: SupportingBaseline, planWeek: number): number {
	return baseline.startWeight + (Math.max(planWeek, 1) - 1) * baseline.weightIncrement;
}

/**
 * The plan week targets are read from. Same count-driven formula as course programs,
 * shifted by the repeat offset and capped at the last plan week.
 */
export function effectivePlanWeek(
	completedCount: number,
	countOffset: number,
	daysPerWeek: number,
	totalWeeks: number,
): number {
	const effective = Math.max(completedCount - countOffset, 0);
	return Math.min(Math.floor(effective / daysPerWeek) + 1, totalWeeks);
}

/** True once every week of every block has been trained through. */
export function isPlanFinished(
	completedCount: number,
	countOffset: number,
	daysPerWeek: number,
	totalWeeks: number,
): boolean {
	return completedCount - countOffset >= totalWeeks * daysPerWeek;
}

/**
 * Offset that rewinds the effective week to week 1 of the given block. Session
 * history and the raw completed count are untouched; the timeline just extends.
 */
export function countOffsetForRepeat(completedCount: number, blockNumber: number, daysPerWeek: number): number {
	const blockStartWeek = (blockNumber - 1) * WEEKS_PER_BLOCK + 1;
	return completedCount - (blockStartWeek - 1) * daysPerWeek;
}
