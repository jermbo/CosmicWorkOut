export type WeightUnit = 'lb' | 'kg' | 'band' | 'bodyweight';
export type RoutineColor = 'lime' | 'lavender' | 'red';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Roundness = 'sharp' | 'default' | 'soft';
export type ItemCat = 'Hinge' | 'Squat' | 'Push' | 'Pull' | 'Lateral' | 'Rotational' | 'Power' | 'Carry';
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
	{ value: -2, label: 'Lonely' },
	{ value: -3, label: 'Sad' },
	{ value: -4, label: 'Angry' },
	{ value: -5, label: 'Stressed' },
] as const;

// ── Discipline model ──────────────────────────────────────────────
// A Discipline is a data-driven definition of a structured movement practice.
// It declares its ordered sections and the logging metric per section, while
// the engine stays generic. Disciplines are seeded, read-only config (see
// src/lib/discipline.ts) — not stored in IndexedDB and not user-editable.

// How one item is logged within a session — the core flexibility lever.
//   setsReps → sets × reps × weight (volume); measure → duration or reps; check → done/not-done
export type Metric = 'setsReps' | 'measure' | 'check';

export interface Section {
	key: string; // "exercises" | "warm-up" | "conditioning" | "moves" | "cool-down"
	label: string;
	metric: Metric;
	isBookend?: boolean; // warm-up / cool-down inherit from Routine A (US-017)
}

export interface Discipline {
	id: string; // "strength" | "bellydance"
	label: string;
	color?: string;
	icon?: string;
	sections: Section[]; // strength: one section; belly dance: four
}

// ── Generalized structured-practice entities ─────────────────────
// Item (was Exercise), Routine (was Workout), Session (was SessionLog).
// Each carries a disciplineId. Strength fields below remain required because
// every Item that ships in v1.4.0 is a setsReps strength Item; US-016 relaxes
// them when it introduces non-strength (measure/check) Items.

export interface Item {
	id: string;
	disciplineId: string;
	name: string;
	cue: string;
	section: string; // section key within the Discipline (strength: "exercises")
	metric: Metric;
	focus?: string[]; // generalized focus tags (US-016) — e.g. ["hips", "core"]
	// Belly dance catalog metadata (optional, dance items only).
	danceCat?: string;
	movementType?: DanceMovementType;
	difficulty?: DanceDifficulty;
	// setsReps (strength) fields — optional now that measure/check Items (e.g. belly
	// dance) live on the same model and don't carry sets/reps/weight (US-016).
	muscles?: string;
	cat?: ItemCat;
	unit?: WeightUnit;
	defaultSets?: number;
	defaultReps?: string;
	weightIncrement?: number;
	isBuiltIn: boolean;
}

export type DanceMovementType = 'sharp' | 'smooth' | 'variable';
export type DanceDifficulty = 'beginner' | 'intermediate' | 'advanced';

// Focus tags an Item can carry (US-016). Belly dance uses body-part focuses; the
// list is shared across Disciplines and shown as filter chips in the item library.
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
	// Strength carries upfront sets×reps targets; dance (measure/check) items do
	// not prescribe targets — values are entered during the session (US-017 §3c).
	sets?: number;
	reps?: string;
	notes?: string;
}

export interface RoutineSection {
	key: string; // matches a Discipline Section key
	items: RoutineItem[];
	// For bookend sections (warm-up / cool-down) on routines other than A: when
	// absent/false the section inherits Routine A's items; when true the routine
	// owns its own bookend list (US-017 §4). Ignored for non-bookend sections.
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
	sections: RoutineSection[]; // strength: a single "exercises" section
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
	// Non-strength logging results (US-019). check → checked; measure → value with
	// its mode. Absent for setsReps Items. skipped marks a measure item with no value.
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
	// Metric-aware in-session state (US-019). setsReps uses `sets`; check uses
	// `checked`; measure uses `value` + `measureMode` (+ `skipped`). `section` is the
	// routine section key so the session UI can group items.
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
