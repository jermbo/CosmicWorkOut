import type { GoalPlan } from './types.ts';
import { focusTargetForWeek, supportingWeightForWeek } from './generator.ts';

/** A prescribed weekly target passed into the session prefill seam. */
export interface PrescribedTarget {
	weight: number;
	reps?: number;
}

/**
 * This week's prescribed target per item — the focus follows its wave week,
 * everything else gets the light weekly increment. Items without a numeric
 * weight are simply absent from the map.
 */
export function prescribedTargetsForWeek(
	plan: Pick<GoalPlan, 'focusItemId' | 'blocks' | 'supporting'>,
	planWeek: number,
): Map<string, PrescribedTarget> {
	const targets = new Map<string, PrescribedTarget>();

	const focus = focusTargetForWeek(plan.blocks, planWeek);
	if (focus) {
		targets.set(plan.focusItemId, { weight: focus.weight, reps: focus.reps });
	}

	for (const baseline of plan.supporting) {
		targets.set(baseline.itemId, { weight: supportingWeightForWeek(baseline, planWeek) });
	}

	return targets;
}
