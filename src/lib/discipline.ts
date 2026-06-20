import type { Discipline, Routine, RoutineItem, RoutineSection, Metric, Program } from '$lib/db/types';

// ── Seeded, read-only Discipline configs ─────────────────────────
// Disciplines are config, not user data (not stored in IndexedDB). Each declares
// its ordered sections and the logging metric per section. Adding a future
// structured practice = a new entry here + its seed content — not a new model.

export const STRENGTH_DISCIPLINE_ID = 'strength';
export const BELLYDANCE_DISCIPLINE_ID = 'bellydance';

export const disciplines: Discipline[] = [
	{
		id: STRENGTH_DISCIPLINE_ID,
		label: 'Strength',
		color: 'lime',
		icon: 'dumbbell',
		// A single implicit section — the flat exercise list.
		sections: [{ key: 'exercises', label: 'Exercises', metric: 'setsReps' }],
	},
	{
		id: BELLYDANCE_DISCIPLINE_ID,
		label: 'Belly Dance',
		color: 'lavender',
		icon: 'sparkles',
		// Four sections; warm-up / cool-down are bookends (inherit from Routine A — US-017).
		// Content (items, program, routines) is seeded in US-016 / US-017.
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

/** The logging metric for a section within a Discipline. Defaults to setsReps. */
export function sectionMetric(disciplineId: string, sectionKey: string): Metric {
	const section = disciplineById(disciplineId)?.sections.find((s) => s.key === sectionKey);
	return section?.metric ?? 'setsReps';
}

/** All routine items across every section, in section then item order. */
export function flattenItems(routine: Routine): RoutineItem[] {
	return routine.sections.flatMap((s) => s.items);
}

/** Build a single-section strength routine's `sections` from a flat item list. */
export function singleSection(items: RoutineItem[]): Routine['sections'] {
	return [{ key: 'exercises', items }];
}

// ── Bookend inheritance (US-017) ─────────────────────────────────
// Routine A defines a program's canonical warm-up and cool-down. Routines B/C
// inherit them unless their bookend section sets `overridesBookends`.

function isBookendSection(disciplineId: string, sectionKey: string): boolean {
	return disciplineById(disciplineId)?.sections.find((s) => s.key === sectionKey)?.isBookend === true;
}

/** The canonical Routine A within a program (the bookend source). */
export function routineALetter(program: Program): Routine | undefined {
	return program.weeks.flatMap((w) => w.routines).find((r) => r.letter === 'A');
}

/**
 * The effective items for one section of a routine, resolving bookend inheritance:
 * a bookend section on a non-A routine inherits Routine A's items unless it
 * overrides them. Non-bookend sections always use their own items.
 */
export function effectiveSectionItems(program: Program, routine: Routine, sectionKey: string): RoutineItem[] {
	const own = routine.sections.find((s) => s.key === sectionKey);
	if (!isBookendSection(routine.disciplineId, sectionKey)) return own?.items ?? [];
	if (routine.letter === 'A' || own?.overridesBookends) return own?.items ?? [];
	const source = routineALetter(program);
	return source?.sections.find((s) => s.key === sectionKey)?.items ?? [];
}

/** Whether a routine's bookend section is currently inheriting from Routine A. */
export function isBookendInherited(routine: Routine, sectionKey: string): boolean {
	if (!isBookendSection(routine.disciplineId, sectionKey) || routine.letter === 'A') return false;
	const own = routine.sections.find((s) => s.key === sectionKey);
	return own?.overridesBookends !== true;
}

/**
 * A routine's sections in Discipline order, each with its effective (inheritance-
 * resolved) items. Used to start a session and to render the routine.
 */
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

/** Empty sections matching a Discipline's section list (for new dance routines). */
export function emptySections(disciplineId: string): RoutineSection[] {
	return (disciplineById(disciplineId)?.sections ?? []).map((s) => ({ key: s.key, items: [] }));
}
