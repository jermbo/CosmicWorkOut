import type { Program, Routine, RoutineColor, RoutineSection, Week } from '../types';
import { BELLYDANCE_DISCIPLINE_ID } from '$lib/discipline';
import { SHARED_COOL_DOWN, SHARED_WARM_UP } from './bellydance-bookends';

function refs(itemIds: string[]): { itemId: string }[] {
	return itemIds.map((itemId) => ({ itemId }));
}

type RoutineTemplate = {
	letter: 'A' | 'B' | 'C';
	name: string;
	focus: string;
	color: RoutineColor;
	estMin: number;
	conditioning: string[];
	moves: string[];
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
		id: 'bd-beginner-101',
		name: 'Beginner 101',
		description:
			'First isolations — hip drops, lifts, and slides plus chest and arm basics. Three sessions per week for four weeks.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Hip Basics',
				focus: 'Hip drops, lifts & slides',
				color: 'lavender',
				estMin: 30,
				conditioning: ['bd-con-core-hold'],
				moves: ['bd-hip-drop', 'bd-hip-lift', 'bd-hip-slide'],
			},
			{
				letter: 'B',
				name: 'Upper Body Intro',
				focus: 'Chest slide, shoulders & snake arms',
				color: 'lime',
				estMin: 30,
				conditioning: ['bd-con-releve-holds'],
				moves: ['bd-chest-slide', 'bd-shoulder-rolls', 'bd-snake-arms'],
			},
			{
				letter: 'C',
				name: 'First Combo',
				focus: 'Linking hip and upper-body isolations',
				color: 'red',
				estMin: 30,
				conditioning: ['bd-con-core-hold', 'bd-con-releve-holds'],
				moves: ['bd-hip-drop', 'bd-chest-lift', 'bd-snake-arms'],
			},
		],
	},
	{
		id: 'bd-beginner-102',
		name: 'Beginner 102',
		description:
			'Circles and travelling — hip and chest circles, grapevine, and the Egyptian walk. Build on Beginner 101.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Circles',
				focus: 'Hip & chest circles',
				color: 'lavender',
				estMin: 30,
				conditioning: ['bd-con-core-hold'],
				moves: ['bd-hip-circle', 'bd-chest-circle', 'bd-hip-drop'],
			},
			{
				letter: 'B',
				name: 'Travelling',
				focus: 'Grapevine & Egyptian walk',
				color: 'lime',
				estMin: 32,
				conditioning: ['bd-con-releve-holds'],
				moves: ['bd-grapevine', 'bd-egyptian-walk', 'bd-hip-slide'],
			},
			{
				letter: 'C',
				name: 'Lifts & Drops',
				focus: 'Chest lifts, drops & shoulder rolls',
				color: 'red',
				estMin: 30,
				conditioning: ['bd-con-plie-holds'],
				moves: ['bd-chest-lift', 'bd-chest-drop', 'bd-shoulder-rolls'],
			},
		],
	},
	{
		id: 'bd-beginner-103',
		name: 'Beginner 103',
		description: 'Shimmies and undulations — hip shimmy, camel, belly pop, and your first horizontal figure eight.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Shimmies',
				focus: 'Hip shimmy fundamentals',
				color: 'lavender',
				estMin: 32,
				conditioning: ['bd-con-releve-holds'],
				moves: ['bd-hip-shimmy', 'bd-hip-drop', 'bd-hip-lift'],
			},
			{
				letter: 'B',
				name: 'Undulations',
				focus: 'Camel, belly pop & snake arms',
				color: 'lime',
				estMin: 32,
				conditioning: ['bd-con-core-hold'],
				moves: ['bd-camel', 'bd-belly-pop', 'bd-snake-arms'],
			},
			{
				letter: 'C',
				name: 'Figure Eights',
				focus: 'Horizontal figure eight & shoulder shimmy',
				color: 'red',
				estMin: 35,
				conditioning: ['bd-con-core-hold'],
				moves: ['bd-figure-8-horizontal', 'bd-hip-shimmy', 'bd-shoulder-shimmy'],
			},
		],
	},
	{
		id: 'bd-intermediate-101',
		name: 'Intermediate 101',
		description:
			'Vertical figure eights and maya, choo-choo shimmies, and the Soheir Zaki hip-drop. For dancers who completed the beginner track.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Vertical 8s',
				focus: 'Vertical figure eight, maya & hip circle',
				color: 'lavender',
				estMin: 35,
				conditioning: ['bd-con-releve-holds'],
				moves: ['bd-figure-8-vertical', 'bd-maya', 'bd-hip-circle'],
			},
			{
				letter: 'B',
				name: 'Sharp Accents',
				focus: 'Choo-choo shimmy, hip twist & tak',
				color: 'lime',
				estMin: 35,
				conditioning: ['bd-con-core-hold'],
				moves: ['bd-choo-choo-shimmy', 'bd-hip-twist', 'bd-hip-tak'],
			},
			{
				letter: 'C',
				name: 'Classic Drop',
				focus: 'Soheir Zaki drop & chest circle',
				color: 'red',
				estMin: 38,
				conditioning: ['bd-con-releve-holds'],
				moves: ['bd-soheir-zaki-drop', 'bd-figure-8-horizontal', 'bd-chest-circle'],
			},
		],
	},
	{
		id: 'bd-intermediate-102',
		name: 'Intermediate 102',
		description: 'Turns and travelling lines — corkscrew and barrel turns, arabesque, and the hip jewel.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Turns',
				focus: 'Corkscrew & barrel turns',
				color: 'lavender',
				estMin: 38,
				conditioning: ['bd-con-releve-holds'],
				moves: ['bd-corkscrew-turn', 'bd-barrel-turn', 'bd-hip-twist'],
			},
			{
				letter: 'B',
				name: 'Travelling Lines',
				focus: 'Arabesque, grapevine & scissor step',
				color: 'lime',
				estMin: 38,
				conditioning: ['bd-con-plie-holds'],
				moves: ['bd-arabesque', 'bd-grapevine', 'bd-scissor-step'],
			},
			{
				letter: 'C',
				name: 'Jewel & Bump',
				focus: 'Hip jewel, bump & shoulder twist',
				color: 'red',
				estMin: 38,
				conditioning: ['bd-con-core-hold'],
				moves: ['bd-hip-jewel', 'bd-hip-bump', 'bd-shoulder-twist'],
			},
		],
	},
	{
		id: 'bd-intermediate-103',
		name: 'Intermediate 103',
		description: 'Flow and performance — floorwork, layering, belly flutters, and travelling combinations.',
		durationWeeks: 4,
		routines: [
			{
				letter: 'A',
				name: 'Floor & Flow',
				focus: 'Floorwork, camel & snake arms',
				color: 'lavender',
				estMin: 40,
				conditioning: ['bd-con-core-hold'],
				moves: ['bd-floorwork', 'bd-camel', 'bd-snake-arms'],
			},
			{
				letter: 'B',
				name: 'Advanced Texture',
				focus: 'Belly flutters, backbend & layering',
				color: 'lime',
				estMin: 40,
				conditioning: ['bd-con-releve-holds'],
				moves: ['bd-belly-flutters', 'bd-backbend', 'bd-layering'],
			},
			{
				letter: 'C',
				name: 'Performance Combo',
				focus: 'Choo-choo, arabesque & maya',
				color: 'red',
				estMin: 42,
				conditioning: ['bd-con-core-hold', 'bd-con-releve-holds'],
				moves: ['bd-choo-choo-shimmy', 'bd-arabesque', 'bd-maya'],
			},
		],
	},
];

function makeRoutine(courseId: string, weekNum: number, template: RoutineTemplate): Routine {
	const sections: RoutineSection[] =
		template.letter === 'A'
			? [
					{ key: 'warm-up', items: refs(SHARED_WARM_UP) },
					{ key: 'conditioning', items: refs(template.conditioning) },
					{ key: 'moves', items: refs(template.moves) },
					{ key: 'cool-down', items: refs(SHARED_COOL_DOWN) },
				]
			: [
					{ key: 'warm-up', items: [] },
					{ key: 'conditioning', items: refs(template.conditioning) },
					{ key: 'moves', items: refs(template.moves) },
					{ key: 'cool-down', items: [] },
				];

	return {
		id: `${courseId}-w${weekNum}-${template.letter.toLowerCase()}`,
		disciplineId: BELLYDANCE_DISCIPLINE_ID,
		name: template.name,
		letter: template.letter,
		focus: template.focus,
		color: template.color,
		estMin: template.estMin,
		sections,
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
		disciplineId: BELLYDANCE_DISCIPLINE_ID,
		name: config.name,
		description: config.description,
		durationWeeks: config.durationWeeks,
		daysPerWeek: 3,
		weeks: makeCourseWeeks(config),
		createdAt: new Date().toISOString(),
		isBuiltIn: true,
	};
}

export const bellyDancePrograms: Program[] = COURSES.map(makeCourse);
