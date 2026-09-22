export type WeightUnit = 'lb' | 'kg' | 'band' | 'bodyweight';
export type RoutineColor = 'lime' | 'lavender' | 'red';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Roundness = 'sharp' | 'default' | 'soft';
/** `system` follows the device's light / dark setting (v1.11.0). */
export type Theme = 'dark' | 'light' | 'system';
export const STRENGTH_CATS = [
	'Chest',
	'Back',
	'Shoulders',
	'Biceps',
	'Triceps',
	'Legs',
	'Core',
	'Full Body',
] as const;
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
	theme: Theme;
	density: Density;
	roundness: Roundness;
	weightUnit: 'lb' | 'kg';
	/** Overview card order, by card id. Partial or stale values are repaired on read. */
	homeCardOrder: string[];
	habitsEnabled: boolean;
	activityLogEnabled: boolean;
	practiceEnabled: boolean;
	healthMetricsEnabled: boolean;
	baselinesEnabled: boolean;
	/** Insights chart ids the user has hidden (v1.10.0, US-043). Unknown ids are ignored. */
	hiddenCharts: string[];
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
	/** Base color for charts (v1.10.0, US-042). Filled with a default on load when missing. */
	color?: string;
	/** Mood only: color for bad days (−1…−5). `color` is used for good days. */
	negativeColor?: string;
}

export interface HabitLog {
	id: string;
	habitId: string;
	date: string;
	value: number;
}

export type HealthMetricId = 'weight' | 'bloodPressure';

export interface WeightValues {
	value: number;
}

export interface BloodPressureValues {
	systolic: number;
	diastolic: number;
	pulse?: number;
}

export interface HealthReading {
	id: string;
	metricId: HealthMetricId;
	date: string; // ISO date YYYY-MM-DD — global logging date
	recordedAt: string; // ISO datetime — orders multiple readings per day
	values: WeightValues | BloodPressureValues;
}

/**
 * How a baseline metric is measured (v1.10.0, US-037). Duration values are stored in
 * minutes; Distance values in the metric's own unit; Count values as a plain number.
 */
export type BaselineMeasure = 'duration' | 'distance' | 'count';

export type DistanceUnit = 'mi' | 'km' | 'm' | 'yd';

export interface BaselineMetric {
	id: string;
	/** What is being measured, e.g. "Pushups", "Walk". */
	name: string;
	/** Fixed at creation so logged history keeps its meaning. */
	measure: BaselineMeasure;
	/** The floor — the embarrassingly low amount the day is compared against. */
	baseline: number;
	/** Distance only. */
	unit?: DistanceUnit;
	/** Count only — user-typed, e.g. "reps", "words", "pages". */
	label?: string;
	/** Removed from the baseline; its logged values are kept but no longer shown. */
	removed?: boolean;
}

export interface Baseline {
	id: string;
	name: string;
	/** One or more metrics, in display order. No upper limit. */
	metrics: BaselineMetric[];
	sortOrder: number;
	active: boolean;
	createdAt: string;
}

export interface BaselineLog {
	id: string;
	baselineId: string;
	date: string; // ISO date YYYY-MM-DD — global logging date
	recordedAt: string; // ISO datetime — orders multiple entries per day
	values: Record<string, number>; // metricId → amount for this entry
}
