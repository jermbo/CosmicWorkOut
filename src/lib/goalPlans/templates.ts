import type { Item } from '$lib/db/types';
import type { GoalPlanTemplate, GoalTemplateRoutine, GoalTemplateSlot } from './types';

/** Synthetic template id for plans built from an empty A/B/C scaffold. */
export const SCRATCH_TEMPLATE_ID = 'gp-scratch';

/** Focus appears on every day with supporting accessories around it. */
export const PRIORITY_TEMPLATE_ID = 'gp-priority';

/** Just the focus lift on each day — add accessories yourself. */
export const FOCUS_ONLY_TEMPLATE_ID = 'gp-focus-only';

/** Popular focus lifts shown as quick picks in the wizard. */
export const FOCUS_QUICK_PICK_IDS = [
	'st-bb-bench-press',
	'st-db-bench-press',
	'st-bb-squat',
	'st-bb-deadlift',
	'st-db-ohp',
	'st-leg-press',
	'st-bb-bent-over-row',
	'st-lat-pulldown-wide',
] as const;

type Accel = GoalTemplateSlot;

function slot(itemId: string, sets: number, reps: string): Accel {
	return { itemId, sets, reps };
}

function focusSlot(focus: Item): Accel {
	return {
		itemId: focus.id,
		sets: focus.defaultSets ?? 4,
		reps: focus.defaultReps ?? '8',
	};
}

/**
 * Support work for a focus lift — three accessory packs (Days A/B/C), never competing
 * main compounds (e.g. no squat/deadlift on a bench plan).
 */
function accessoryPacks(focus: Item): Accel[][] {
	const cat = focus.cat ?? '';

	if (cat === 'Chest' || focus.id.includes('bench')) {
		return [
			[
				slot('st-incline-db-bench', 3, '10'),
				slot('st-pec-deck', 3, '12'),
				slot('st-tricep-rope-pushdown', 3, '12'),
			],
			[
				slot('st-db-ohp', 3, '10'),
				slot('st-lateral-raise', 3, '12'),
				slot('st-face-pull', 3, '15'),
			],
			[
				slot('st-bb-bent-over-row', 3, '10'),
				slot('st-tricep-rope-pushdown', 3, '12'),
				slot('st-plank', 3, '45 s'),
			],
		];
	}

	if (
		cat === 'Legs' ||
		focus.id.includes('squat') ||
		focus.id === 'st-leg-press' ||
		focus.id === 'st-rdl'
	) {
		return [
			[
				slot('st-leg-press', 3, '10'),
				slot('st-leg-curl', 3, '12'),
				slot('st-standing-calf-raise', 3, '12'),
			],
			[
				slot('st-rdl', 3, '10'),
				slot('st-leg-extension', 3, '12'),
				slot('st-side-plank', 3, '30 s ea'),
			],
			[
				slot('st-leg-curl', 3, '12'),
				slot('st-standing-calf-raise', 3, '12'),
				slot('st-plank', 3, '45 s'),
			],
		];
	}

	if (
		cat === 'Back' ||
		focus.id.includes('deadlift') ||
		focus.id.includes('row') ||
		focus.id.includes('pulldown')
	) {
		return [
			[
				slot('st-lat-pulldown-wide', 3, '10'),
				slot('st-face-pull', 3, '15'),
				slot('st-db-curl', 3, '12'),
			],
			[
				slot('st-seated-cable-row', 3, '10'),
				slot('st-bb-bent-over-row', 3, '10'),
				slot('st-plank', 3, '45 s'),
			],
			[
				slot('st-lat-pulldown-wide', 3, '10'),
				slot('st-face-pull', 3, '15'),
				slot('st-cable-crunch', 3, '15'),
			],
		];
	}

	if (cat === 'Shoulders' || focus.id.includes('ohp')) {
		return [
			[
				slot('st-lateral-raise', 3, '12'),
				slot('st-face-pull', 3, '15'),
				slot('st-tricep-rope-pushdown', 3, '12'),
			],
			[
				slot('st-db-ohp', 3, '10'),
				slot('st-bb-bent-over-row', 3, '10'),
				slot('st-plank', 3, '45 s'),
			],
			[
				slot('st-lateral-raise', 3, '12'),
				slot('st-face-pull', 3, '15'),
				slot('st-db-curl', 3, '12'),
			],
		];
	}

	// Generic: light full-body support that won't steal the spotlight from the focus.
	return [
		[slot('st-face-pull', 3, '15'), slot('st-plank', 3, '45 s'), slot('st-lateral-raise', 3, '12')],
		[
			slot('st-bb-bent-over-row', 3, '10'),
			slot('st-tricep-rope-pushdown', 3, '12'),
			slot('st-plank', 3, '45 s'),
		],
		[
			slot('st-face-pull', 3, '15'),
			slot('st-db-curl', 3, '12'),
			slot('st-standing-calf-raise', 3, '12'),
		],
	];
}

function filterFocusFromAccessories(packs: Accel[][], focusId: string): Accel[][] {
	return packs.map((pack) => pack.filter((s) => s.itemId !== focusId));
}

/** Focus on all three days + accessories that support that lift (not other max-effort compounds). */
export function buildPriorityRoutines(focus: Item): GoalTemplateRoutine[] {
	const main = focusSlot(focus);
	const packs = filterFocusFromAccessories(accessoryPacks(focus), focus.id);
	const short = focus.name.replace(/Barbell |Dumbbell /g, '');

	return [
		{
			letter: 'A',
			name: `${short} — Heavy`,
			focus: `${short} · primary`,
			estMin: 50,
			slots: [main, ...packs[0]],
		},
		{
			letter: 'B',
			name: `${short} — Volume`,
			focus: `${short} · support`,
			estMin: 45,
			slots: [{ ...main, sets: Math.max(3, (main.sets ?? 4) - 1) }, ...packs[1]],
		},
		{
			letter: 'C',
			name: `${short} — Assist`,
			focus: `${short} · assist`,
			estMin: 45,
			slots: [{ ...main, sets: 3, reps: '10' }, ...packs[2]],
		},
	];
}

/** Focus lift alone on each day — user adds accessories next. */
export function buildFocusOnlyRoutines(focus: Item): GoalTemplateRoutine[] {
	const main = focusSlot(focus);
	const short = focus.name.replace(/Barbell |Dumbbell /g, '');
	return [
		{
			letter: 'A',
			name: `${short} A`,
			focus: short,
			estMin: 35,
			slots: [{ ...main }],
		},
		{
			letter: 'B',
			name: `${short} B`,
			focus: short,
			estMin: 35,
			slots: [{ ...main, sets: 3 }],
		},
		{
			letter: 'C',
			name: `${short} C`,
			focus: short,
			estMin: 35,
			slots: [{ ...main, sets: 3, reps: '10' }],
		},
	];
}

/** Empty 3-day scaffold used by "Start from scratch". */
export function blankGoalRoutines(): GoalTemplateRoutine[] {
	return [
		{ letter: 'A', name: 'Day A', focus: '', estMin: 45, slots: [] },
		{ letter: 'B', name: 'Day B', focus: '', estMin: 45, slots: [] },
		{ letter: 'C', name: 'Day C', focus: '', estMin: 45, slots: [] },
	];
}

/** Seed the focus onto a blank scaffold so it's present before accessories. */
export function blankRoutinesWithFocus(focus: Item): GoalTemplateRoutine[] {
	const main = focusSlot(focus);
	return [
		{
			letter: 'A',
			name: 'Day A',
			focus: focus.name,
			estMin: 45,
			slots: [{ ...main }],
		},
		{ letter: 'B', name: 'Day B', focus: focus.name, estMin: 45, slots: [] },
		{ letter: 'C', name: 'Day C', focus: focus.name, estMin: 45, slots: [] },
	];
}

/**
 * Static catalog is unused for setup — routines are built from the chosen focus.
 * Kept so older plan records with template ids still resolve a label if needed.
 */
export const goalPlanTemplates: GoalPlanTemplate[] = [];

export function goalPlanTemplateById(id: string): GoalPlanTemplate | undefined {
	return goalPlanTemplates.find((t) => t.id === id);
}

export function setupLabel(templateId: string): string {
	if (templateId === PRIORITY_TEMPLATE_ID) return 'Priority week';
	if (templateId === FOCUS_ONLY_TEMPLATE_ID) return 'Focus only';
	if (templateId === SCRATCH_TEMPLATE_ID) return 'From scratch';
	return templateId;
}
