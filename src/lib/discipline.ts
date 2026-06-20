import type { Discipline, Routine, RoutineItem, Metric } from '$lib/db/types';

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
