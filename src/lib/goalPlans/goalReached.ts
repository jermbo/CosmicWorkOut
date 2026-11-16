// When a plan goal counts as reached (v1.13.0, US-068): the session in which the focus
// lift is logged at the goal weight × reps, or more. Pure: tested in goalReached.test.ts.
import type { Session } from '../db/types.ts';
import type { GoalPlan } from './types.ts';

/**
 * True when one set of the plan's focus lift in this session has at least the goal
 * weight and at least the goal reps. A plan with no goal, or no plan, is never reached.
 */
export function planGoalReached(
	session: Pick<Session, 'items'>,
	plan: Pick<GoalPlan, 'focusItemId' | 'goal'> | null | undefined,
): boolean {
	if (!plan?.goal || !(plan.goal.weight > 0) || !(plan.goal.reps > 0)) return false;
	const { weight, reps } = plan.goal;
	return session.items.some(
		(item) =>
			item.itemId === plan.focusItemId &&
			// A weight logged as text, such as "BW", is not a number and never reaches it.
			item.sets.some((set) => (Number(set.weight) || 0) >= weight && (set.reps ?? 0) >= reps),
	);
}
