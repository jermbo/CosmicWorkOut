import type { Program, Routine, RoutineColor, Week } from '../types';
import { STRENGTH_DISCIPLINE_ID, singleSection } from '$lib/discipline';

type ExerciseSlot = { itemId: string; sets: number; reps: string };

type RoutineTemplate = {
	letter: 'A' | 'B' | 'C';
	name: string;
	focus: string;
	color: RoutineColor;
	estMin: number;
	exercises: ExerciseSlot[];
};

type CourseConfig = {
	id: string;
	name: string;
	description: string;
	durationWeeks: number;
	routines: [RoutineTemplate, RoutineTemplate, RoutineTemplate];
};

const COURSES: CourseConfig[] = [
	{
		id: 'st-beginner-101',
		name: 'Beginner 101',
		description:
			'Machine and bodyweight basics — learn form on leg press, pulldowns, and cable work. Three gym sessions per week for four weeks.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Machine Full Body',
				focus: 'Leg press · Pulldown · Pec deck',
				color: 'lime',
				estMin: 45,
				exercises: [
					{ itemId: 'st-leg-press', sets: 4, reps: '10' },
					{ itemId: 'st-lat-pulldown-wide', sets: 3, reps: '10' },
					{ itemId: 'st-pec-deck', sets: 3, reps: '12' },
					{ itemId: 'st-leg-curl', sets: 3, reps: '12' },
					{ itemId: 'st-seated-cable-row', sets: 3, reps: '10' },
					{ itemId: 'st-plank', sets: 3, reps: '45 s' },
				],
			},
			{
				letter: 'B',
				name: 'Bodyweight & Cables',
				focus: 'Goblet squat · Push-ups · Rows',
				color: 'lavender',
				estMin: 40,
				exercises: [
					{ itemId: 'st-goblet-squat', sets: 3, reps: '12' },
					{ itemId: 'st-push-ups', sets: 3, reps: '12' },
					{ itemId: 'st-lat-pulldown-close', sets: 3, reps: '10' },
					{ itemId: 'st-db-curl', sets: 3, reps: '12' },
					{ itemId: 'st-tricep-rope-pushdown', sets: 3, reps: '12' },
					{ itemId: 'st-side-plank', sets: 3, reps: '30 s ea' },
				],
			},
			{
				letter: 'C',
				name: 'Isolation Focus',
				focus: 'Extensions · Flies · Core',
				color: 'red',
				estMin: 42,
				exercises: [
					{ itemId: 'st-leg-extension', sets: 3, reps: '12' },
					{ itemId: 'st-machine-row', sets: 3, reps: '10' },
					{ itemId: 'st-cable-chest-fly', sets: 3, reps: '12' },
					{ itemId: 'st-reverse-fly-machine', sets: 3, reps: '12' },
					{ itemId: 'st-leg-curl', sets: 3, reps: '12' },
					{ itemId: 'st-cable-crunch', sets: 3, reps: '15' },
				],
			},
		],
	},
	{
		id: 'st-beginner-102',
		name: 'Beginner 102',
		description:
			'Dumbbell fundamentals — presses, rows, curls, and unilateral leg work. Build on Beginner 101.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'DB Push & Pull',
				focus: 'Bench · Rows · Arms',
				color: 'lime',
				estMin: 45,
				exercises: [
					{ itemId: 'st-goblet-squat', sets: 3, reps: '10' },
					{ itemId: 'st-db-bench-press', sets: 4, reps: '8' },
					{ itemId: 'st-seated-cable-row', sets: 3, reps: '10' },
					{ itemId: 'st-db-curl', sets: 3, reps: '10' },
					{ itemId: 'st-db-tricep-extension', sets: 3, reps: '10' },
					{ itemId: 'st-plank', sets: 3, reps: '45 s' },
				],
			},
			{
				letter: 'B',
				name: 'Unilateral Legs',
				focus: 'Split squats · Incline press',
				color: 'lavender',
				estMin: 45,
				exercises: [
					{ itemId: 'st-bulgarian-split-squat', sets: 3, reps: '10 ea' },
					{ itemId: 'st-incline-db-bench', sets: 3, reps: '10' },
					{ itemId: 'st-hammer-curl', sets: 3, reps: '10' },
					{ itemId: 'st-tricep-kickback', sets: 3, reps: '12 ea' },
					{ itemId: 'st-standing-calf-raise', sets: 3, reps: '12' },
					{ itemId: 'st-side-plank', sets: 3, reps: '30 s ea' },
				],
			},
			{
				letter: 'C',
				name: 'Full Body DB',
				focus: 'Pullover · Arnold press · Lunges',
				color: 'red',
				estMin: 48,
				exercises: [
					{ itemId: 'st-db-pullover', sets: 3, reps: '12' },
					{ itemId: 'st-arnold-press', sets: 3, reps: '10' },
					{ itemId: 'st-concentration-curl', sets: 3, reps: '10 ea' },
					{ itemId: 'st-tricep-dip', sets: 3, reps: '10' },
					{ itemId: 'st-reverse-lunge', sets: 3, reps: '10 ea' },
					{ itemId: 'st-cable-crunch', sets: 3, reps: '15' },
				],
			},
		],
	},
	{
		id: 'st-beginner-103',
		name: 'Beginner 103',
		description:
			'Barbell introduction — squat, bench, row, and deadlift patterns. Graduate from dumbbells to the bar.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Barbell Basics',
				focus: 'Squat · Bench · Row',
				color: 'lime',
				estMin: 50,
				exercises: [
					{ itemId: 'st-bb-squat', sets: 4, reps: '8' },
					{ itemId: 'st-bb-bench-press', sets: 4, reps: '8' },
					{ itemId: 'st-bb-bent-over-row', sets: 4, reps: '8' },
					{ itemId: 'st-bb-curl', sets: 3, reps: '10' },
					{ itemId: 'st-tricep-bar-pushdown', sets: 3, reps: '12' },
					{ itemId: 'st-plank', sets: 3, reps: '45 s' },
				],
			},
			{
				letter: 'B',
				name: 'Hinge & Incline',
				focus: 'RDL · Incline bench · Pendlay row',
				color: 'lavender',
				estMin: 50,
				exercises: [
					{ itemId: 'st-rdl', sets: 3, reps: '10' },
					{ itemId: 'st-incline-bb-bench', sets: 4, reps: '8' },
					{ itemId: 'st-pendlay-row', sets: 4, reps: '8' },
					{ itemId: 'st-ez-bar-curl', sets: 3, reps: '10' },
					{ itemId: 'st-db-tricep-extension', sets: 3, reps: '10' },
					{ itemId: 'st-side-plank', sets: 3, reps: '30 s ea' },
				],
			},
			{
				letter: 'C',
				name: 'Pull & Press',
				focus: 'Deadlift · OHP · Chin-ups',
				color: 'red',
				estMin: 55,
				exercises: [
					{ itemId: 'st-bb-deadlift', sets: 4, reps: '5' },
					{ itemId: 'st-bb-ohp', sets: 3, reps: '8' },
					{ itemId: 'st-chin-up', sets: 3, reps: '6' },
					{ itemId: 'st-lateral-raise', sets: 3, reps: '12' },
					{ itemId: 'st-face-pull', sets: 3, reps: '15' },
					{ itemId: 'st-cable-crunch', sets: 3, reps: '15' },
				],
			},
		],
	},
	{
		id: 'st-intermediate-101',
		name: 'Intermediate 101',
		description:
			'Push day specialization — chest, shoulders, and triceps with compounds first, isolation finishers.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Heavy Push',
				focus: 'BB bench · OHP · Triceps',
				color: 'lime',
				estMin: 55,
				exercises: [
					{ itemId: 'st-bb-bench-press', sets: 4, reps: '6' },
					{ itemId: 'st-incline-db-bench', sets: 3, reps: '8' },
					{ itemId: 'st-bb-ohp', sets: 4, reps: '8' },
					{ itemId: 'st-lateral-raise', sets: 3, reps: '12' },
					{ itemId: 'st-tricep-rope-pushdown', sets: 3, reps: '12' },
					{ itemId: 'st-cable-chest-fly', sets: 3, reps: '12' },
				],
			},
			{
				letter: 'B',
				name: 'Volume Push',
				focus: 'DB press · Arnold · Dips',
				color: 'lavender',
				estMin: 50,
				exercises: [
					{ itemId: 'st-db-bench-press', sets: 4, reps: '8' },
					{ itemId: 'st-arnold-press', sets: 3, reps: '10' },
					{ itemId: 'st-front-raise', sets: 3, reps: '12' },
					{ itemId: 'st-tricep-overhead-extension', sets: 3, reps: '12' },
					{ itemId: 'st-pec-deck', sets: 3, reps: '12' },
					{ itemId: 'st-push-ups', sets: 3, reps: '15' },
				],
			},
			{
				letter: 'C',
				name: 'Incline & Delts',
				focus: 'Incline barbell · Rear delts',
				color: 'red',
				estMin: 52,
				exercises: [
					{ itemId: 'st-incline-bb-bench', sets: 4, reps: '8' },
					{ itemId: 'st-db-ohp', sets: 3, reps: '10' },
					{ itemId: 'st-rear-delt-fly-machine', sets: 3, reps: '15' },
					{ itemId: 'st-tricep-dip', sets: 3, reps: '10' },
					{ itemId: 'st-weighted-dips-chest', sets: 3, reps: '8' },
					{ itemId: 'st-face-pull', sets: 3, reps: '15' },
				],
			},
		],
	},
	{
		id: 'st-intermediate-102',
		name: 'Intermediate 102',
		description:
			'Pull day specialization — deadlifts, rows, pull-ups, and arm work. Compounds before curls.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Heavy Pull',
				focus: 'Deadlift · BB row · Pull-ups',
				color: 'lime',
				estMin: 55,
				exercises: [
					{ itemId: 'st-bb-deadlift', sets: 4, reps: '5' },
					{ itemId: 'st-bb-bent-over-row', sets: 4, reps: '8' },
					{ itemId: 'st-wide-pull-up', sets: 3, reps: '6' },
					{ itemId: 'st-bb-curl', sets: 3, reps: '10' },
					{ itemId: 'st-face-pull', sets: 3, reps: '15' },
					{ itemId: 'st-straight-arm-pulldown', sets: 3, reps: '12' },
				],
			},
			{
				letter: 'B',
				name: 'Row Variations',
				focus: 'Weighted pull-up · T-bar · Hammer curl',
				color: 'lavender',
				estMin: 52,
				exercises: [
					{ itemId: 'st-weighted-pull-up', sets: 4, reps: '6' },
					{ itemId: 'st-t-bar-row', sets: 4, reps: '8' },
					{ itemId: 'st-close-pull-up', sets: 3, reps: '6' },
					{ itemId: 'st-hammer-curl', sets: 3, reps: '10' },
					{ itemId: 'st-reverse-fly-machine', sets: 3, reps: '12' },
					{ itemId: 'st-cable-curl', sets: 3, reps: '12' },
				],
			},
			{
				letter: 'C',
				name: 'Hinge & Lats',
				focus: 'RDL · Pendlay · Chin-ups',
				color: 'red',
				estMin: 55,
				exercises: [
					{ itemId: 'st-rdl', sets: 4, reps: '8' },
					{ itemId: 'st-pendlay-row', sets: 4, reps: '8' },
					{ itemId: 'st-lat-pulldown-wide', sets: 3, reps: '10' },
					{ itemId: 'st-preacher-curl', sets: 3, reps: '10' },
					{ itemId: 'st-bent-over-reverse-fly', sets: 3, reps: '12' },
					{ itemId: 'st-chin-up', sets: 3, reps: '8' },
				],
			},
		],
	},
	{
		id: 'st-intermediate-103',
		name: 'Intermediate 103',
		description:
			'Legs and posterior chain — squats, RDLs, hip thrusts, and unilateral work. Finish with calves and core.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Squat & Hinge',
				focus: 'BB squat · RDL · Hip thrust',
				color: 'lime',
				estMin: 55,
				exercises: [
					{ itemId: 'st-bb-squat', sets: 4, reps: '6' },
					{ itemId: 'st-rdl', sets: 4, reps: '8' },
					{ itemId: 'st-bb-hip-thrust', sets: 4, reps: '10' },
					{ itemId: 'st-leg-extension', sets: 3, reps: '12' },
					{ itemId: 'st-leg-curl', sets: 3, reps: '12' },
					{ itemId: 'st-standing-calf-raise', sets: 4, reps: '12' },
				],
			},
			{
				letter: 'B',
				name: 'Unilateral & Front Squat',
				focus: 'Front squat · Lunges · Bulgarian',
				color: 'lavender',
				estMin: 55,
				exercises: [
					{ itemId: 'st-front-squat', sets: 4, reps: '6' },
					{ itemId: 'st-walking-lunge', sets: 3, reps: '12 ea' },
					{ itemId: 'st-bulgarian-split-squat', sets: 3, reps: '10 ea' },
					{ itemId: 'st-leg-press', sets: 3, reps: '10' },
					{ itemId: 'st-seated-calf-raise', sets: 4, reps: '15' },
					{ itemId: 'st-plank', sets: 3, reps: '60 s' },
				],
			},
			{
				letter: 'C',
				name: 'Posterior & Power',
				focus: 'Deadlift · Split squat · Nordic curl',
				color: 'red',
				estMin: 58,
				exercises: [
					{ itemId: 'st-bb-deadlift', sets: 4, reps: '5' },
					{ itemId: 'st-split-squat', sets: 3, reps: '10 ea' },
					{ itemId: 'st-machine-hip-thrust', sets: 4, reps: '10' },
					{ itemId: 'st-nordic-curl', sets: 3, reps: '6' },
					{ itemId: 'st-lunge-twist', sets: 3, reps: '10 ea' },
					{ itemId: 'st-ab-wheel', sets: 3, reps: '8' },
				],
			},
		],
	},
];

function makeRoutine(courseId: string, weekNum: number, template: RoutineTemplate): Routine {
	return {
		id: `${courseId}-w${weekNum}-${template.letter.toLowerCase()}`,
		disciplineId: STRENGTH_DISCIPLINE_ID,
		name: template.name,
		letter: template.letter,
		focus: template.focus,
		color: template.color,
		estMin: template.estMin,
		sections: singleSection(template.exercises),
	};
}

function makeCourseWeeks(course: CourseConfig): Week[] {
	return Array.from({ length: course.durationWeeks }, (_, i) => {
		const weekNum = i + 1;
		return {
			weekNumber: weekNum,
			routines: course.routines.map((r) => makeRoutine(course.id, weekNum, r)),
		};
	});
}

function makeCourse(config: CourseConfig): Program {
	return {
		id: config.id,
		disciplineId: STRENGTH_DISCIPLINE_ID,
		name: config.name,
		description: config.description,
		durationWeeks: config.durationWeeks,
		daysPerWeek: 3,
		weeks: makeCourseWeeks(config),
		createdAt: new Date().toISOString(),
		isBuiltIn: true,
	};
}

export const strengthPrograms: Program[] = COURSES.map(makeCourse);
