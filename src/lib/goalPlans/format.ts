import type { GoalPlan, GoalTarget } from './types.ts';

/** Display unit for a focus lift — defaults to lb when unknown. */
export function unitLabel(unit: string | undefined): 'kg' | 'lb' {
	return unit === 'kg' ? 'kg' : 'lb';
}

export function targetLabel(t: GoalTarget, unit: string): string {
	return `${t.weight} ${unit} x ${t.reps}`;
}

/** Short date range for a plan instance in list rows. */
export function planDates(plan: GoalPlan): string {
	const started = new Date(plan.createdAt).toLocaleDateString(undefined, {
		month: 'short',
		year: 'numeric',
	});
	if (plan.status === 'completed' && plan.completedAt) {
		const ended = new Date(plan.completedAt).toLocaleDateString(undefined, {
			month: 'short',
			year: 'numeric',
		});
		return `${started} - ${ended}`;
	}
	return `Started ${started}`;
}
