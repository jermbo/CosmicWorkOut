import type { Program, Habit } from './types';
import { bellyDanceItems } from './seeds/bellydance-items';
import { bellyDancePrograms } from './seeds/bellydance-programs';
import { strengthItems } from './seeds/strength-items';
import { strengthPrograms } from './seeds/strength-programs';

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

export const builtInItems = [...strengthItems, ...bellyDanceItems];

export const builtInPrograms: Program[] = [...strengthPrograms, ...bellyDancePrograms];
