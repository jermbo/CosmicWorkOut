export type WeightUnit = 'lb' | 'kg' | 'band' | 'bodyweight';
export type WorkoutColor = 'lime' | 'lavender' | 'red';
export type CompletionFeel = 'full' | 'subtle';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Roundness = 'sharp' | 'default' | 'soft';
export type ExerciseCat = 'Hinge' | 'Squat' | 'Push' | 'Pull' | 'Lateral' | 'Rotational' | 'Power' | 'Carry';
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
	{ value: 3, label: 'Focus' },
	{ value: 2, label: 'Energized' },
	{ value: 1, label: 'Content' },
	{ value: 0, label: 'Normal' },
	{ value: -1, label: 'Tired' },
	{ value: -2, label: 'Lonely' },
	{ value: -3, label: 'Sad' },
	{ value: -4, label: 'Angry' },
	{ value: -5, label: 'Stressed' },
] as const;

export interface Exercise {
	id: string;
	name: string;
	cue: string;
	muscles: string;
	cat: ExerciseCat;
	unit: WeightUnit;
	defaultSets: number;
	defaultReps: string;
	weightIncrement?: number;
	isBuiltIn: boolean;
}

export interface WorkoutExercise {
	exerciseId: string;
	sets: number;
	reps: string;
	notes?: string;
}

export interface Workout {
	id: string;
	name: string;
	letter?: string;
	focus?: string;
	color?: WorkoutColor;
	estMin?: number;
	exercises: WorkoutExercise[];
}

export interface Week {
	weekNumber: number;
	workouts: Workout[];
}

export interface Program {
	id: string;
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

export interface LoggedExercise {
	exerciseId: string;
	sets: LoggedSet[];
}

export interface SessionLog {
	id: string;
	date: string;
	workoutId: string;
	programId: string;
	startedAt: string;
	finishedAt: string;
	durationSeconds: number;
	totalVolume: number;
	totalSets: number;
	exercises: LoggedExercise[];
}

export interface ExerciseLastUsed {
	exerciseId: string;
	weight: number | string;
	reps: number;
}

export interface UserPrefs {
	accentColor: string;
	completionFeel: CompletionFeel;
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

export interface ActiveExercise {
	exerciseId: string;
	unit: WeightUnit;
	sets: ActiveSet[];
}

export interface ActiveSession {
	id: string;
	date: string;
	workoutId: string;
	workoutName: string;
	programId: string;
	startedAt: string;
	exercises: ActiveExercise[];
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
