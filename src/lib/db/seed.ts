import type { Program, Habit } from './types';
import { strengthItems } from './seeds/strength-items';
import { strengthPrograms } from './seeds/strength-programs';

/** Default built-in habits — seeded on first run; migrated on boot for existing installs. */
export const builtInHabits: Habit[] = [
	{
		id: 'habit-water',
		name: 'Water',
		unit: 'cups',
		type: 'count',
		dailyGoal: 4,
		active: true,
		sortOrder: 0,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-coffee',
		name: 'Coffee',
		unit: 'cups',
		type: 'count',
		dailyGoal: 2,
		active: true,
		sortOrder: 1,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-meditation',
		name: 'Meditation',
		unit: '',
		type: 'minutes',
		dailyGoal: 20,
		active: true,
		sortOrder: 2,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-writing',
		name: 'Writing',
		unit: 'words',
		type: 'count',
		dailyGoal: 500,
		active: true,
		sortOrder: 3,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-reading',
		name: 'Reading',
		unit: '',
		type: 'minutes',
		dailyGoal: 30,
		active: true,
		sortOrder: 4,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'habit-mood',
		name: 'Mood',
		unit: '',
		type: 'mood',
		dailyGoal: undefined,
		active: true,
		sortOrder: 5,
		createdAt: new Date().toISOString(),
	},
];

export const builtInItems = [...strengthItems];

export const builtInPrograms: Program[] = [...strengthPrograms];
