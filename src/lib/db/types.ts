export type WeightUnit = 'lb' | 'kg' | 'band' | 'bodyweight';
export type CompletionFeel = 'full' | 'subtle';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Roundness = 'sharp' | 'default' | 'soft';
export type ExerciseCat = 'Hinge' | 'Squat' | 'Push' | 'Pull' | 'Lateral' | 'Rotational' | 'Power' | 'Carry';

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
	color?: 'lime' | 'lavender' | 'red';
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
}
