import type { GoalPlanTemplate, GoalTemplateRoutine } from './types';

/** Synthetic template id for plans built from an empty A/B/C scaffold. */
export const SCRATCH_TEMPLATE_ID = 'gp-scratch';

/** Empty 3-day scaffold used by "Start from scratch". */
export function blankGoalRoutines(): GoalTemplateRoutine[] {
	return [
		{ letter: 'A', name: 'Day A', focus: '', estMin: 45, slots: [] },
		{ letter: 'B', name: 'Day B', focus: '', estMin: 45, slots: [] },
		{ letter: 'C', name: 'Day C', focus: '', estMin: 45, slots: [] },
	];
}

/** Deep-clone a built-in template's routines so the wizard can edit freely. */
export function cloneTemplateRoutines(template: GoalPlanTemplate): GoalTemplateRoutine[] {
	return structuredClone(template.routines);
}

/**
 * Built-in starter templates (US-033). Each scaffolds routines A/B/C with built-in
 * strength items; the user can trim/add and pick any weighted exercise as the
 * focus before generating. Pro-authored templates come later.
 */
export const goalPlanTemplates: GoalPlanTemplate[] = [
	{
		id: 'gp-big-three',
		name: 'Big Three Split',
		description: 'Bench, squat, and deadlift days — the classic setup for chasing a barbell-lift goal.',
		daysPerWeek: 3,
		routines: [
			{
				letter: 'A',
				name: 'Bench Day',
				focus: 'Bench · Incline · Triceps',
				estMin: 50,
				slots: [
					{ itemId: 'st-bb-bench-press', sets: 4, reps: '8' },
					{ itemId: 'st-incline-db-bench', sets: 3, reps: '10' },
					{ itemId: 'st-pec-deck', sets: 3, reps: '12' },
					{ itemId: 'st-tricep-rope-pushdown', sets: 3, reps: '12' },
					{ itemId: 'st-plank', sets: 3, reps: '45 s' },
				],
			},
			{
				letter: 'B',
				name: 'Squat Day',
				focus: 'Squat · Leg press · Calves',
				estMin: 50,
				slots: [
					{ itemId: 'st-bb-squat', sets: 4, reps: '8' },
					{ itemId: 'st-leg-press', sets: 3, reps: '10' },
					{ itemId: 'st-leg-curl', sets: 3, reps: '12' },
					{ itemId: 'st-standing-calf-raise', sets: 3, reps: '12' },
					{ itemId: 'st-side-plank', sets: 3, reps: '30 s ea' },
				],
			},
			{
				letter: 'C',
				name: 'Deadlift Day',
				focus: 'Deadlift · Rows · Back',
				estMin: 50,
				slots: [
					{ itemId: 'st-bb-deadlift', sets: 4, reps: '6' },
					{ itemId: 'st-bb-bent-over-row', sets: 3, reps: '10' },
					{ itemId: 'st-lat-pulldown-wide', sets: 3, reps: '10' },
					{ itemId: 'st-db-curl', sets: 3, reps: '12' },
					{ itemId: 'st-face-pull', sets: 3, reps: '15' },
				],
			},
		],
	},
	{
		id: 'gp-push-pull-legs',
		name: 'Push / Pull / Legs',
		description: 'Dumbbell and cable split — a friendlier setup when your goal lift is a dumbbell or machine movement.',
		daysPerWeek: 3,
		routines: [
			{
				letter: 'A',
				name: 'Push',
				focus: 'Presses · Shoulders · Triceps',
				estMin: 45,
				slots: [
					{ itemId: 'st-db-bench-press', sets: 4, reps: '8' },
					{ itemId: 'st-db-ohp', sets: 3, reps: '10' },
					{ itemId: 'st-lateral-raise', sets: 3, reps: '12' },
					{ itemId: 'st-tricep-rope-pushdown', sets: 3, reps: '12' },
					{ itemId: 'st-plank', sets: 3, reps: '45 s' },
				],
			},
			{
				letter: 'B',
				name: 'Pull',
				focus: 'Pulldowns · Rows · Biceps',
				estMin: 45,
				slots: [
					{ itemId: 'st-lat-pulldown-wide', sets: 3, reps: '10' },
					{ itemId: 'st-seated-cable-row', sets: 3, reps: '10' },
					{ itemId: 'st-db-curl', sets: 3, reps: '12' },
					{ itemId: 'st-face-pull', sets: 3, reps: '15' },
					{ itemId: 'st-cable-crunch', sets: 3, reps: '15' },
				],
			},
			{
				letter: 'C',
				name: 'Legs',
				focus: 'Squats · Hinges · Calves',
				estMin: 45,
				slots: [
					{ itemId: 'st-goblet-squat', sets: 3, reps: '12' },
					{ itemId: 'st-rdl', sets: 3, reps: '10' },
					{ itemId: 'st-leg-extension', sets: 3, reps: '12' },
					{ itemId: 'st-leg-curl', sets: 3, reps: '12' },
					{ itemId: 'st-standing-calf-raise', sets: 3, reps: '12' },
				],
			},
		],
	},
];

export function goalPlanTemplateById(id: string): GoalPlanTemplate | undefined {
	return goalPlanTemplates.find((t) => t.id === id);
}
