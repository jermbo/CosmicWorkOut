export type WeightUnit = 'lb' | 'kg' | 'band' | 'bodyweight';
export type RoutineColor = 'lime' | 'lavender' | 'red';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Roundness = 'sharp' | 'default' | 'soft';
export const STRENGTH_CATS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body'] as const;
export type ItemCat = (typeof STRENGTH_CATS)[number];
export type ExerciseType = 'compound' | 'isolation' | 'dynamic' | 'isometric';
export type CatalogDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ActivityType =
	| 'Run'
	| 'Walk'
	| 'Bike'
	| 'Swim'
	| 'Hike'
	| 'Pickleball'
	| 'Tennis'
	| 'Basketball'
	| 'Yoga'
	| 'Stretching'
	| 'Cardio'
	| 'Other';
export type ActivityIntensity = 'Easy' | 'Moderate' | 'Hard';
export type HabitType = 'times' | 'minutes' | 'count' | 'boolean' | 'mood';

export const MOOD_SCALE = [
	{ value: 5, label: 'Happy' },
	{ value: 4, label: 'Excited' },
	{ value: 3, label: 'Focused' },
	{ value: 2, label: 'Energized' },
	{ value: 1, label: 'Content' },
	{ value: 0, label: 'Normal' },
	{ value: -1, label: 'Tired' },
	{ value: -2, label: 'Agitated' },
	{ value: -3, label: 'Sad' },
	{ value: -4, label: 'Angry' },
	{ value: -5, label: 'Stressed' },
] as const;

export type Metric = 'setsReps' | 'measure' | 'check';

export interface Section {
	key: string;
	label: string;
	metric: Metric;
	isBookend?: boolean;
}

export interface Discipline {
	id: string;
	label: string;
	color?: string;
	icon?: string;
	sections: Section[];
}

export interface Item {
	id: string;
	disciplineId: string;
	name: string;
	cue: string;
	section: string;
	metric: Metric;
	focus?: string[];
	danceCat?: string;
	movementType?: DanceMovementType;
	difficulty?: CatalogDifficulty;
	muscles?: string;
	cat?: ItemCat;
	exerciseType?: ExerciseType;
	equipment?: string[];
	unit?: WeightUnit;
	defaultSets?: number;
	defaultReps?: string;
	weightIncrement?: number;
	isBuiltIn: boolean;
}

export type DanceMovementType = 'sharp' | 'smooth' | 'variable';
export type DanceDifficulty = CatalogDifficulty;

export const FOCUS_TAGS = [
	'hips',
	'core',
	'abdomen',
	'pelvis',
	'arms',
	'chest',
	'shoulders',
	'legs',
	'feet',
	'head',
	'full-body',
	'posture',
] as const;
export type FocusTag = (typeof FOCUS_TAGS)[number];

export interface RoutineItem {
	itemId: string;
	sets?: number;
	reps?: string;
	notes?: string;
}

export interface RoutineSection {
	key: string;
	items: RoutineItem[];
	overridesBookends?: boolean;
}

export interface Routine {
	id: string;
	disciplineId: string;
	name: string;
	letter?: string;
	focus?: string;
	color?: RoutineColor;
	estMin?: number;
	sections: RoutineSection[];
}

export interface Week {
	weekNumber: number;
	routines: Routine[];
}

export interface Program {
	id: string;
	disciplineId: string;
	name: string;
	description: string;
	durationWeeks: number;
	daysPerWeek: number;
	weeks: Week[];
	createdAt: string;
	isBuiltIn: boolean;
}

export interface LoggedSet {
	setNumber: number;
	weight: number | string;
	reps: number;
	completedAt: string;
}

export interface LoggedItem {
	itemId: string;
	sets: LoggedSet[];
	checked?: boolean;
	value?: number;
	measureMode?: 'duration' | 'reps';
	skipped?: boolean;
}

export interface Session {
	id: string;
	disciplineId: string;
	date: string;
	routineId: string;
	programId: string;
	startedAt: string;
	finishedAt: string;
	durationSeconds: number;
	totalVolume: number;
	totalSets: number;
	items: LoggedItem[];
}

export interface ItemLastUsed {
	itemId: string;
	weight: number | string;
	reps: number;
}

export interface UserPrefs {
	accentColor: string;
	density: Density;
	roundness: Roundness;
	weightUnit: 'lb' | 'kg';
}

export interface ActiveSet {
	setNumber: number;
	targetReps: string;
	weight: number | string;
	reps: number;
	completed: boolean;
	completedAt: string | null;
}

export interface ActiveItem {
	itemId: string;
	unit: WeightUnit;
	sets: ActiveSet[];
	metric?: Metric;
	section?: string;
	checked?: boolean;
	value?: number | null;
	measureMode?: 'duration' | 'reps';
	skipped?: boolean;
}

export interface ActiveSession {
	id: string;
	disciplineId: string;
	date: string;
	routineId: string;
	routineName: string;
	programId: string;
	startedAt: string;
	items: ActiveItem[];
	isEditing?: boolean;
	originalFinishedAt?: string;
	originalDurationSeconds?: number;
}

export interface ActivityLog {
	id: string;
	date: string;
	type: ActivityType;
	customType?: string;
	durationMinutes: number;
	intensity: ActivityIntensity;
	createdAt: string;
}

export interface Habit {
	id: string;
	name: string;
	unit: string;
	type: HabitType;
	dailyGoal?: number;
	active: boolean;
	sortOrder: number;
	createdAt: string;
}

export interface HabitLog {
	id: string;
	habitId: string;
	date: string;
	value: number;
}
