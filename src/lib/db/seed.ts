import type { Item, Program, Week, Routine, RoutineSection, Habit } from './types';
import { STRENGTH_DISCIPLINE_ID, BELLYDANCE_DISCIPLINE_ID, singleSection } from '$lib/discipline';

export const builtInHabits: Habit[] = [
	{
		id: 'habit-meditation',
		name: 'Meditation',
		unit: '',
		type: 'minutes',
		dailyGoal: 20,
		active: true,
		sortOrder: 0,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-writing',
		name: 'Writing',
		unit: 'words',
		type: 'count',
		dailyGoal: 500,
		active: true,
		sortOrder: 1,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-reading',
		name: 'Reading',
		unit: 'pages',
		type: 'count',
		dailyGoal: 20,
		active: true,
		sortOrder: 2,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-water',
		name: 'Water',
		unit: 'cups',
		type: 'count',
		dailyGoal: 8,
		active: true,
		sortOrder: 3,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-coffee',
		name: 'Coffee',
		unit: 'cups',
		type: 'count',
		dailyGoal: 3,
		active: true,
		sortOrder: 4,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-alcohol',
		name: 'Alcohol',
		unit: '',
		type: 'boolean',
		dailyGoal: undefined,
		active: true,
		sortOrder: 5,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-mood',
		name: 'Mood',
		unit: '',
		type: 'mood',
		dailyGoal: undefined,
		active: true,
		sortOrder: 6,
		createdAt: new Date().toISOString(),
	},
];

// Strength exercise data — the setsReps fields. The Discipline/section/metric
// fields are injected below so every built-in Item is a Strength Item.
const strengthExercises: Omit<Item, 'disciplineId' | 'section' | 'metric'>[] = [
	// ── HINGE ──────────────────────────────────────────────────────
	{
		id: 'rdl',
		cat: 'Hinge',
		name: 'Romanian Deadlift',
		muscles: 'Hamstrings · Glutes',
		cue: 'Hinge — feel the hamstrings load',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '10',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'trap-dl',
		cat: 'Hinge',
		name: 'Trap-Bar Deadlift',
		muscles: 'Posterior chain',
		cue: 'Drive through the floor, stay tall',
		unit: 'lb',
		defaultSets: 4,
		defaultReps: '6',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'kb-swing',
		cat: 'Hinge',
		name: 'Kettlebell Swing',
		muscles: 'Glutes · Hamstrings',
		cue: 'Hip snap — not a squat',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '15',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'good-morn',
		cat: 'Hinge',
		name: 'Good Morning',
		muscles: 'Hamstrings · Erectors',
		cue: 'Bar stays loaded, spine neutral',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '12',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	// ── SQUAT ──────────────────────────────────────────────────────
	{
		id: 'goblet',
		cat: 'Squat',
		name: 'Goblet Squat',
		muscles: 'Quads · Glutes',
		cue: 'Sit tall between the heels',
		unit: 'lb',
		defaultSets: 4,
		defaultReps: '8',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'split',
		cat: 'Squat',
		name: 'Bulgarian Split Squat',
		muscles: 'Quads · Glutes · Balance',
		cue: 'Single-leg stability for the court',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '10 ea',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'box-squat',
		cat: 'Squat',
		name: 'Box Squat',
		muscles: 'Quads · Glutes',
		cue: 'Pause on the box, explode up',
		unit: 'lb',
		defaultSets: 4,
		defaultReps: '6',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'step-up',
		cat: 'Squat',
		name: 'Step-Up',
		muscles: 'Quads · Glutes · Balance',
		cue: 'Drive through the heel, no push off',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '10 ea',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	// ── PUSH ───────────────────────────────────────────────────────
	{
		id: 'db-bench',
		cat: 'Push',
		name: 'DB Bench Press',
		muscles: 'Chest · Triceps · Front delt',
		cue: 'Controlled on the way down',
		unit: 'lb',
		defaultSets: 4,
		defaultReps: '8',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'push-press',
		cat: 'Push',
		name: 'Push Press',
		muscles: 'Shoulders · Triceps',
		cue: 'Leg drive into lockout overhead',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '8',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'landmine',
		cat: 'Push',
		name: 'Landmine Press',
		muscles: 'Shoulders · Serratus',
		cue: 'Arc up and away, core tight',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '10 ea',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'db-ohp',
		cat: 'Push',
		name: 'DB Shoulder Press',
		muscles: 'Shoulders · Triceps',
		cue: 'Neutral grip, packed shoulders',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '10',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	// ── PULL ───────────────────────────────────────────────────────
	{
		id: 'cs-row',
		cat: 'Pull',
		name: 'Chest-Supported Row',
		muscles: 'Upper back · Biceps',
		cue: 'Pull elbows back past the pad',
		unit: 'lb',
		defaultSets: 4,
		defaultReps: '10',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'pull-up',
		cat: 'Pull',
		name: 'Pull-Up',
		muscles: 'Lats · Biceps',
		cue: 'Full hang to chin over bar',
		unit: 'bodyweight',
		defaultSets: 3,
		defaultReps: '6',
		isBuiltIn: true,
	},
	{
		id: 'face-pull',
		cat: 'Pull',
		name: 'Face Pull',
		muscles: 'Rear delt · Rotator cuff',
		cue: 'High elbows, external rotation at end',
		unit: 'band',
		defaultSets: 3,
		defaultReps: '15',
		isBuiltIn: true,
	},
	{
		id: 'band-pull',
		cat: 'Pull',
		name: 'Band Pull-Apart',
		muscles: 'Rear delt · Mid trap',
		cue: 'Straight arms, squeeze at end',
		unit: 'band',
		defaultSets: 3,
		defaultReps: '20',
		isBuiltIn: true,
	},
	// ── LATERAL ────────────────────────────────────────────────────
	{
		id: 'band-walk',
		cat: 'Lateral',
		name: 'Lateral Band Walk',
		muscles: 'Glute med · Hip abductors',
		cue: 'Low, slow, glutes burning',
		unit: 'band',
		defaultSets: 3,
		defaultReps: '15 ea',
		isBuiltIn: true,
	},
	{
		id: 'copenhagen',
		cat: 'Lateral',
		name: 'Copenhagen Plank',
		muscles: 'Adductors · Core',
		cue: 'Adductor armor — hold steady',
		unit: 'bodyweight',
		defaultSets: 3,
		defaultReps: '30 s',
		isBuiltIn: true,
	},
	{
		id: 'side-plank',
		cat: 'Lateral',
		name: 'Side Plank',
		muscles: 'Obliques · Glute med',
		cue: 'Hips up, body straight',
		unit: 'bodyweight',
		defaultSets: 3,
		defaultReps: '30 s',
		isBuiltIn: true,
	},
	{
		id: 'sl-rdl',
		cat: 'Lateral',
		name: 'Single-Leg RDL',
		muscles: 'Hamstrings · Balance',
		cue: "Slow and controlled, don't rush",
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '8 ea',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	// ── ROTATIONAL ─────────────────────────────────────────────────
	{
		id: 'medball',
		cat: 'Rotational',
		name: 'Med-Ball Rotational Slam',
		muscles: 'Obliques · Hips · Core',
		cue: 'Explode through the hips',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '6 ea',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'pallof',
		cat: 'Rotational',
		name: 'Pallof Press',
		muscles: 'Anti-rotation core',
		cue: 'Press and hold — resist the pull',
		unit: 'band',
		defaultSets: 3,
		defaultReps: '12',
		isBuiltIn: true,
	},
	{
		id: 'woodchop',
		cat: 'Rotational',
		name: 'Cable Woodchop',
		muscles: 'Obliques · Shoulders',
		cue: 'Rotate from the hips, not the arms',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '12 ea',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'mb-rainbow',
		cat: 'Rotational',
		name: 'Med-Ball Rainbow',
		muscles: 'Full rotational chain',
		cue: 'Arc overhead, control the landing',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '8 ea',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	// ── POWER ──────────────────────────────────────────────────────
	{
		id: 'pogo',
		cat: 'Power',
		name: 'Reactive Pogo Hops',
		muscles: 'Calves · Achilles',
		cue: 'Stiff ankles, fast contacts',
		unit: 'bodyweight',
		defaultSets: 3,
		defaultReps: '20',
		isBuiltIn: true,
	},
	{
		id: 'box-jump',
		cat: 'Power',
		name: 'Box Jump',
		muscles: 'Quads · Glutes · Power',
		cue: 'Full extension at takeoff',
		unit: 'bodyweight',
		defaultSets: 4,
		defaultReps: '5',
		isBuiltIn: true,
	},
	{
		id: 'broad-jump',
		cat: 'Power',
		name: 'Broad Jump',
		muscles: 'Full lower body power',
		cue: 'Stick the landing, absorb well',
		unit: 'bodyweight',
		defaultSets: 4,
		defaultReps: '5',
		isBuiltIn: true,
	},
	{
		id: 'mb-chest',
		cat: 'Power',
		name: 'Med-Ball Chest Pass',
		muscles: 'Chest · Triceps · Core',
		cue: 'Explosive — like a fast punch',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '8',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	// ── CARRY ──────────────────────────────────────────────────────
	{
		id: 'farmer',
		cat: 'Carry',
		name: 'Farmer Carry',
		muscles: 'Grip · Traps · Core',
		cue: 'Tall spine, controlled breathing',
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '40m',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'suitcase',
		cat: 'Carry',
		name: 'Suitcase Carry',
		muscles: 'Anti-lateral core · Grip',
		cue: "Don't let the loaded side pull you down",
		unit: 'lb',
		defaultSets: 3,
		defaultReps: '30m ea',
		weightIncrement: 5,
		isBuiltIn: true,
	},
	{
		id: 'sled-push',
		cat: 'Carry',
		name: 'Sled Push',
		muscles: 'Full body conditioning',
		cue: 'Low and hard, eyes down',
		unit: 'lb',
		defaultSets: 4,
		defaultReps: '20m',
		weightIncrement: 5,
		isBuiltIn: true,
	},
];

// Strength Items are logged with the setsReps metric.
const strengthItems: Item[] = strengthExercises.map((e) => ({
	...e,
	disciplineId: STRENGTH_DISCIPLINE_ID,
	section: 'exercises',
	metric: 'setsReps',
}));

// ── Belly Dance starter catalog (US-016) ─────────────────────────
// Minimal seed (~12) covering all four sections. Metric follows the section:
// warm-up / cool-down → check (done/not-done); conditioning / moves → measure
// (duration or reps, entered at session time). Built from the section/focus tags.
const bellyDanceSeed: Array<{
	id: string;
	name: string;
	cue: string;
	section: string;
	focus: string[];
}> = [
	// ── WARM-UP (check) ──────────────────────────────────────────────
	{ id: 'bd-neck-rolls', name: 'Neck & Shoulder Rolls', cue: 'Slow, loosen the upper body', section: 'warm-up', focus: ['shoulders', 'posture'] },
	{ id: 'bd-hip-circles', name: 'Hip Circles', cue: 'Big, smooth circles from the hips', section: 'warm-up', focus: ['hips'] },
	{ id: 'bd-rib-slides', name: 'Rib Cage Slides', cue: 'Isolate the ribs side to side', section: 'warm-up', focus: ['core', 'posture'] },
	// ── CONDITIONING (measure) ───────────────────────────────────────
	{ id: 'bd-hip-drops', name: 'Hip Drops', cue: 'Sharp drop, controlled lift', section: 'conditioning', focus: ['hips'] },
	{ id: 'bd-core-hold', name: 'Dancer Core Hold', cue: 'Long spine, engaged center', section: 'conditioning', focus: ['core'] },
	{ id: 'bd-releve', name: 'Relevé Holds', cue: 'Rise tall, steady balance', section: 'conditioning', focus: ['legs', 'posture'] },
	// ── MOVES (measure) ──────────────────────────────────────────────
	{ id: 'bd-hip-shimmy', name: 'Hip Shimmy', cue: 'Relax the knees, let it travel', section: 'moves', focus: ['hips'] },
	{ id: 'bd-shoulder-shimmy', name: 'Shoulder Shimmy', cue: 'Loose shoulders, quiet head', section: 'moves', focus: ['shoulders'] },
	{ id: 'bd-figure-eight', name: 'Hip Figure Eight', cue: 'Trace a smooth horizontal 8', section: 'moves', focus: ['hips'] },
	{ id: 'bd-snake-arms', name: 'Snake Arms', cue: 'Lead with the elbow, then wrist', section: 'moves', focus: ['arms'] },
	{ id: 'bd-undulation', name: 'Body Undulation', cue: 'Roll through chest, ribs, hips', section: 'moves', focus: ['core', 'full-body'] },
	// ── COOL-DOWN (check) ────────────────────────────────────────────
	{ id: 'bd-side-stretch', name: 'Side Body Stretch', cue: 'Lengthen one side, then the other', section: 'cool-down', focus: ['full-body'] },
	{ id: 'bd-breath', name: 'Deep Breathing', cue: 'Slow breaths, soften the shoulders', section: 'cool-down', focus: ['posture'] },
];

const bellyDanceItems: Item[] = bellyDanceSeed.map((b) => ({
	id: b.id,
	disciplineId: BELLYDANCE_DISCIPLINE_ID,
	name: b.name,
	cue: b.cue,
	section: b.section,
	metric: b.section === 'warm-up' || b.section === 'cool-down' ? 'check' : 'measure',
	focus: b.focus,
	isBuiltIn: true,
}));

export const builtInItems: Item[] = [...strengthItems, ...bellyDanceItems];

function makeRoutineA(weekNum: number): Routine {
	return {
		id: `w${weekNum}-lower`,
		disciplineId: STRENGTH_DISCIPLINE_ID,
		name: 'Lower + Lateral Power',
		letter: 'A',
		focus: 'Legs · Lateral · Rotational',
		color: 'lime',
		estMin: 45,
		sections: singleSection([
			{ itemId: 'goblet', sets: 4, reps: '8' },
			{ itemId: 'rdl', sets: 3, reps: '10' },
			{ itemId: 'split', sets: 3, reps: '10 ea' },
			{ itemId: 'band-walk', sets: 3, reps: '15 ea' },
			{ itemId: 'medball', sets: 3, reps: '6 ea' },
			{ itemId: 'copenhagen', sets: 3, reps: '30 s' },
		]),
	};
}

function makeRoutineB(weekNum: number): Routine {
	return {
		id: `w${weekNum}-upper`,
		disciplineId: STRENGTH_DISCIPLINE_ID,
		name: 'Upper + Reactive',
		letter: 'B',
		focus: 'Push · Pull · Power',
		color: 'lavender',
		estMin: 40,
		sections: singleSection([
			{ itemId: 'db-bench', sets: 4, reps: '8' },
			{ itemId: 'cs-row', sets: 4, reps: '10' },
			{ itemId: 'push-press', sets: 3, reps: '8' },
			{ itemId: 'face-pull', sets: 3, reps: '15' },
			{ itemId: 'pogo', sets: 3, reps: '20' },
			{ itemId: 'pallof', sets: 3, reps: '12' },
		]),
	};
}

function makeRoutineC(weekNum: number): Routine {
	return {
		id: `w${weekNum}-conditioning`,
		disciplineId: STRENGTH_DISCIPLINE_ID,
		name: 'Full + Conditioning',
		letter: 'C',
		focus: 'Posterior chain · Carry · Power',
		color: 'red',
		estMin: 50,
		sections: singleSection([
			{ itemId: 'trap-dl', sets: 4, reps: '6' },
			{ itemId: 'push-press', sets: 3, reps: '8' },
			{ itemId: 'sled-push', sets: 4, reps: '20m' },
			{ itemId: 'farmer', sets: 3, reps: '40m' },
			{ itemId: 'woodchop', sets: 3, reps: '12 ea' },
		]),
	};
}

function makeWeek(weekNum: number): Week {
	return {
		weekNumber: weekNum,
		routines: [makeRoutineA(weekNum), makeRoutineB(weekNum), makeRoutineC(weekNum)],
	};
}

// ── Belly Dance Foundations program (US-017) ─────────────────────
// 3 rotating routines, each with four sections. Routine A defines the canonical
// warm-up + cool-down; B and C leave their bookend sections empty and inherit A
// (no `overridesBookends` flag). Routine items carry no upfront targets.
function refs(itemIds: string[]): { itemId: string }[] {
	return itemIds.map((itemId) => ({ itemId }));
}

function makeDanceRoutineA(weekNum: number): Routine {
	const sections: RoutineSection[] = [
		{ key: 'warm-up', items: refs(['bd-neck-rolls', 'bd-hip-circles', 'bd-rib-slides']) },
		{ key: 'conditioning', items: refs(['bd-hip-drops', 'bd-core-hold']) },
		{ key: 'moves', items: refs(['bd-hip-shimmy', 'bd-figure-eight', 'bd-snake-arms']) },
		{ key: 'cool-down', items: refs(['bd-side-stretch', 'bd-breath']) },
	];
	return {
		id: `bd-w${weekNum}-a`,
		disciplineId: BELLYDANCE_DISCIPLINE_ID,
		name: 'Hips & Isolations',
		letter: 'A',
		focus: 'Hip isolations & shimmies',
		color: 'lavender',
		estMin: 30,
		sections,
	};
}

function makeDanceRoutineB(weekNum: number): Routine {
	const sections: RoutineSection[] = [
		{ key: 'warm-up', items: [] }, // inherits Routine A
		{ key: 'conditioning', items: refs(['bd-releve', 'bd-core-hold']) },
		{ key: 'moves', items: refs(['bd-shoulder-shimmy', 'bd-undulation', 'bd-snake-arms']) },
		{ key: 'cool-down', items: [] }, // inherits Routine A
	];
	return {
		id: `bd-w${weekNum}-b`,
		disciplineId: BELLYDANCE_DISCIPLINE_ID,
		name: 'Arms & Upper Body',
		letter: 'B',
		focus: 'Shoulders, arms & undulations',
		color: 'lime',
		estMin: 30,
		sections,
	};
}

function makeDanceRoutineC(weekNum: number): Routine {
	const sections: RoutineSection[] = [
		{ key: 'warm-up', items: [] }, // inherits Routine A
		{ key: 'conditioning', items: refs(['bd-hip-drops', 'bd-releve']) },
		{ key: 'moves', items: refs(['bd-hip-shimmy', 'bd-figure-eight', 'bd-undulation']) },
		{ key: 'cool-down', items: [] }, // inherits Routine A
	];
	return {
		id: `bd-w${weekNum}-c`,
		disciplineId: BELLYDANCE_DISCIPLINE_ID,
		name: 'Flow & Combinations',
		letter: 'C',
		focus: 'Travelling steps & combinations',
		color: 'red',
		estMin: 35,
		sections,
	};
}

function makeDanceWeek(weekNum: number): Week {
	return {
		weekNumber: weekNum,
		routines: [makeDanceRoutineA(weekNum), makeDanceRoutineB(weekNum), makeDanceRoutineC(weekNum)],
	};
}

export const builtInPrograms: Program[] = [
	{
		id: 'strength-foundation',
		disciplineId: STRENGTH_DISCIPLINE_ID,
		name: 'Strength Foundation',
		description:
			'A 12-week full-body strength program. Alternates lower body, upper push, and upper pull sessions across 3 days per week.',
		durationWeeks: 12,
		daysPerWeek: 3,
		weeks: Array.from({ length: 12 }, (_, i) => makeWeek(i + 1)),
		createdAt: new Date().toISOString(),
		isBuiltIn: true,
	},
	{
		id: 'bellydance-foundations',
		disciplineId: BELLYDANCE_DISCIPLINE_ID,
		name: 'Belly Dance Foundations',
		description:
			'A 12-week introduction to belly dance. Three rotating practices share a warm-up and cool-down while building hip, arm, and flow vocabulary across 3 days per week.',
		durationWeeks: 12,
		daysPerWeek: 3,
		weeks: Array.from({ length: 12 }, (_, i) => makeDanceWeek(i + 1)),
		createdAt: new Date().toISOString(),
		isBuiltIn: true,
	},
];
