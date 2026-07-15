import type { GoalPlan } from './types';

/**
 * Auto-name a new plan instance: "<Focus> Goal NN", numbered per focus exercise
 * (Barbell Bench Press Goal 01, … Goal 02). The user can rename before activation.
 */
export function autoPlanName(focusName: string, focusItemId: string, existingPlans: GoalPlan[]): string {
	const count = existingPlans.filter((p) => p.focusItemId === focusItemId).length;
	return `${focusName} Goal ${String(count + 1).padStart(2, '0')}`;
}
