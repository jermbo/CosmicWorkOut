import type { Discipline, Routine, RoutineItem, RoutineSection, Metric, Program } from '$lib/db/types';

export const STRENGTH_DISCIPLINE_ID = 'strength';
export const BELLYDANCE_DISCIPLINE_ID = 'bellydance';

export const disciplines: Discipline[] = [
	{
		id: STRENGTH_DISCIPLINE_ID,
		label: 'Strength',
		color: 'lime',
		icon: 'dumbbell',
		sections: [{ key: 'exercises', label: 'Exercises', metric: 'setsReps' }],
	},
	{
		id: BELLYDANCE_DISCIPLINE_ID,
		label: 'Belly Dance',
		color: 'lavender',
		icon: 'sparkles',
		sections: [
			{ key: 'warm-up', label: 'Warm-up', metric: 'check', isBookend: true },
			{ key: 'conditioning', label: 'Conditioning', metric: 'measure' },
			{ key: 'moves', label: 'Moves', metric: 'measure' },
			{ key: 'cool-down', label: 'Cool-down', metric: 'check', isBookend: true },
		],
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
	return disciplineById(disciplineId)?.sections.find((s) => s.key === sectionKey)?.isBookend === true;
}

export function routineALetter(program: Program): Routine | undefined {
	return program.weeks.flatMap((w) => w.routines).find((r) => r.letter === 'A');
}

export function effectiveSectionItems(program: Program, routine: Routine, sectionKey: string): RoutineItem[] {
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
	return (disciplineById(disciplineId)?.sections ?? []).map((s) => ({ key: s.key, items: [] }));
}
