import type {
	Discipline,
	Routine,
	RoutineItem,
	RoutineSection,
	Metric,
	Program,
} from '$lib/db/types';

export const STRENGTH_DISCIPLINE_ID = 'strength';

/**
 * Strength is the only registered Discipline today (Belly Dance removed in v1.10.0,
 * US-051 — nobody used it, and it fits better as its own app). The model stays
 * general: a future movement type is still config here, not a rewrite.
 */
export const disciplines: Discipline[] = [
	{
		id: STRENGTH_DISCIPLINE_ID,
		label: 'Strength',
		color: 'lime',
		icon: 'dumbbell',
		sections: [{ key: 'exercises', label: 'Exercises', metric: 'setsReps' }],
	},
];

export function disciplineById(id: string): Discipline | undefined {
	return disciplines.find((d) => d.id === id);
}

export function sectionMetric(disciplineId: string, sectionKey: string): Metric {
	const section = disciplineById(disciplineId)?.sections.find((s) => s.key === sectionKey);
	return section?.metric ?? 'setsReps';
}

export function flattenItems(routine: Routine): RoutineItem[] {
	return routine.sections.flatMap((s) => s.items);
}

export function singleSection(items: RoutineItem[]): Routine['sections'] {
	return [{ key: 'exercises', items }];
}

function isBookendSection(disciplineId: string, sectionKey: string): boolean {
	return (
		disciplineById(disciplineId)?.sections.find((s) => s.key === sectionKey)?.isBookend === true
	);
}

export function routineALetter(program: Program): Routine | undefined {
	return program.weeks.flatMap((w) => w.routines).find((r) => r.letter === 'A');
}

export function effectiveSectionItems(
	program: Program,
	routine: Routine,
	sectionKey: string,
): RoutineItem[] {
	const own = routine.sections.find((s) => s.key === sectionKey);
	if (!isBookendSection(routine.disciplineId, sectionKey)) return own?.items ?? [];
	if (routine.letter === 'A' || own?.overridesBookends) return own?.items ?? [];
	const source = routineALetter(program);
	return source?.sections.find((s) => s.key === sectionKey)?.items ?? [];
}

export function isBookendInherited(routine: Routine, sectionKey: string): boolean {
	if (!isBookendSection(routine.disciplineId, sectionKey) || routine.letter === 'A') return false;
	const own = routine.sections.find((s) => s.key === sectionKey);
	return own?.overridesBookends !== true;
}

export function effectiveSections(
	program: Program,
	routine: Routine,
): Array<{ key: string; metric: Metric; label: string; items: RoutineItem[] }> {
	const disc = disciplineById(routine.disciplineId);
	if (!disc) return [];
	return disc.sections.map((s) => ({
		key: s.key,
		metric: s.metric,
		label: s.label,
		items: effectiveSectionItems(program, routine, s.key),
	}));
}

export function emptySections(disciplineId: string): RoutineSection[] {
	return (disciplineById(disciplineId)?.sections ?? []).map((s) => ({
		key: s.key,
		items: [],
	}));
}
