import type { Program } from '$lib/db/types';
import { flattenItems } from '$lib/discipline';
import type { GoalTemplateRoutine } from './types';

/** Synthetic template id for a plan built from an empty A/B/C scaffold. */
export const SCRATCH_TEMPLATE_ID = 'scratch';

/** Empty 3-day scaffold used by "Start from scratch" (v1.10.0, US-052). */
export function blankGoalRoutines(): GoalTemplateRoutine[] {
	return [
		{ letter: 'A', name: 'Day A', focus: '', estMin: 45, slots: [] },
		{ letter: 'B', name: 'Day B', focus: '', estMin: 45, slots: [] },
		{ letter: 'C', name: 'Day C', focus: '', estMin: 45, slots: [] },
	];
}

/** Week 1 of a built-in program, as editable routine drafts (v1.10.0, US-052). */
export function routinesFromTemplate(program: Program): GoalTemplateRoutine[] {
	const week1 = program.weeks[0];
	if (!week1) return blankGoalRoutines();
	return week1.routines.map((r) => ({
		letter: (r.letter as 'A' | 'B' | 'C') ?? 'A',
		name: r.name,
		focus: r.focus ?? '',
		estMin: r.estMin ?? 45,
		slots: flattenItems(r).map((it) => ({
			itemId: it.itemId,
			sets: it.sets ?? 3,
			reps: it.reps ?? '10',
		})),
	}));
}
