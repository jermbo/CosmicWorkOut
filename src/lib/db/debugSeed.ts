import type {
	Session,
	ActivityLog,
	HabitLog,
	LoggedItem,
	LoggedSet,
	ActivityType,
	ActivityIntensity,
	HealthReading,
	Baseline,
	BaselineLog,
} from './types';

function rInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function toDateStr(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function shiftDays(base: Date, n: number): Date {
	const d = new Date(base);
	d.setDate(d.getDate() + n);
	return d;
}

type WorkoutKey = 'A' | 'B' | 'C';

const ITEM_UNITS: Record<string, string> = {
	'st-leg-press': 'lb',
	'st-lat-pulldown-wide': 'lb',
	'st-pec-deck': 'lb',
	'st-leg-curl': 'lb',
	'st-seated-cable-row': 'lb',
	'st-plank': 'bodyweight',
	'st-goblet-squat': 'lb',
	'st-push-ups': 'bodyweight',
	'st-lat-pulldown-close': 'lb',
	'st-db-curl': 'lb',
	'st-tricep-rope-pushdown': 'lb',
	'st-side-plank': 'bodyweight',
	'st-leg-extension': 'lb',
	'st-machine-row': 'lb',
	'st-cable-chest-fly': 'lb',
	'st-reverse-fly-machine': 'lb',
	'st-cable-crunch': 'lb',
};

const BASE_WEIGHTS: Record<string, number> = {
	'st-leg-press': 180,
	'st-lat-pulldown-wide': 100,
	'st-pec-deck': 80,
	'st-leg-curl': 70,
	'st-seated-cable-row': 90,
	'st-goblet-squat': 40,
	'st-lat-pulldown-close': 95,
	'st-db-curl': 25,
	'st-tricep-rope-pushdown': 50,
	'st-leg-extension': 80,
	'st-machine-row': 85,
	'st-cable-chest-fly': 40,
	'st-reverse-fly-machine': 50,
	'st-cable-crunch': 60,
};

function lbWeight(itemId: string): number {
	const base = BASE_WEIGHTS[itemId] ?? 50;
	return Math.max(5, base + pick([-10, -5, 0, 0, 5, 10]));
}

const WORKOUTS: Record<WorkoutKey, Array<{ itemId: string; sets: number; reps: number }>> = {
	A: [
		{ itemId: 'st-leg-press', sets: 4, reps: 10 },
		{ itemId: 'st-lat-pulldown-wide', sets: 3, reps: 10 },
		{ itemId: 'st-pec-deck', sets: 3, reps: 12 },
		{ itemId: 'st-leg-curl', sets: 3, reps: 12 },
		{ itemId: 'st-seated-cable-row', sets: 3, reps: 10 },
		{ itemId: 'st-plank', sets: 3, reps: 45 },
	],
	B: [
		{ itemId: 'st-goblet-squat', sets: 3, reps: 12 },
		{ itemId: 'st-push-ups', sets: 3, reps: 12 },
		{ itemId: 'st-lat-pulldown-close', sets: 3, reps: 10 },
		{ itemId: 'st-db-curl', sets: 3, reps: 12 },
		{ itemId: 'st-tricep-rope-pushdown', sets: 3, reps: 12 },
		{ itemId: 'st-side-plank', sets: 3, reps: 30 },
	],
	C: [
		{ itemId: 'st-leg-extension', sets: 3, reps: 12 },
		{ itemId: 'st-machine-row', sets: 3, reps: 10 },
		{ itemId: 'st-cable-chest-fly', sets: 3, reps: 12 },
		{ itemId: 'st-reverse-fly-machine', sets: 3, reps: 12 },
		{ itemId: 'st-leg-curl', sets: 3, reps: 12 },
		{ itemId: 'st-cable-crunch', sets: 3, reps: 15 },
	],
};

const ROUTINE_META: Record<WorkoutKey, { id: string; name: string; estMin: number }> = {
	A: { id: 'st-beginner-101-w1-a', name: 'Machine Full Body', estMin: 45 },
	B: { id: 'st-beginner-101-w1-b', name: 'Bodyweight & Cables', estMin: 40 },
	C: { id: 'st-beginner-101-w1-c', name: 'Isolation Focus', estMin: 42 },
};

const DISCIPLINE_ID = 'strength';
const PROGRAM_ID = 'st-beginner-101';

function startingWeight(unit: string, itemId: string): number {
	if (unit === 'lb') return lbWeight(itemId);
	return 0;
}

function actualRepsFor(unit: string, reps: number): number {
	if (unit === 'lb') return Math.max(1, reps + rInt(-2, 2));
	return reps;
}

function buildSession(date: Date, type: WorkoutKey, idx: number): Session {
	const meta = ROUTINE_META[type];
	const startedAt = new Date(date);
	startedAt.setHours(rInt(5, 19), pick([0, 15, 30, 45]), 0, 0);

	const durationSeconds = (meta.estMin + rInt(-10, 20)) * 60;
	const finishedAt = new Date(startedAt.getTime() + durationSeconds * 1000);

	let totalVolume = 0;
	let totalSets = 0;
	let setTime = new Date(startedAt);

	const items: LoggedItem[] = WORKOUTS[type].map(({ itemId, sets, reps }) => {
		const unit = ITEM_UNITS[itemId] ?? 'lb';
		const weight: number | string = startingWeight(unit, itemId);
		const loggedSets: LoggedSet[] = [];

		for (let s = 1; s <= sets; s++) {
			setTime = new Date(setTime.getTime() + rInt(90, 210) * 1000);
			const actualReps = actualRepsFor(unit, reps);
			if (unit === 'lb') totalVolume += (weight as number) * actualReps;
			totalSets++;
			loggedSets.push({
				setNumber: s,
				weight,
				reps: actualReps,
				completedAt: setTime.toISOString(),
			});
		}

		setTime = new Date(setTime.getTime() + rInt(60, 120) * 1000);
		return { itemId, sets: loggedSets };
	});

	return {
		id: `seed-session-${idx}`,
		disciplineId: DISCIPLINE_ID,
		date: toDateStr(date),
		routineId: meta.id,
		programId: PROGRAM_ID,
		startedAt: startedAt.toISOString(),
		finishedAt: finishedAt.toISOString(),
		durationSeconds,
		totalVolume,
		totalSets,
		items,
	};
}

const ACTIVITY_DURATION: Partial<Record<ActivityType, [number, number]>> = {
	Walk: [25, 60],
	Run: [20, 50],
	Bike: [30, 75],
	Swim: [25, 45],
	Hike: [60, 120],
	Pickleball: [60, 90],
	Tennis: [45, 90],
	Basketball: [45, 75],
	Yoga: [30, 60],
	Stretching: [15, 30],
	Cardio: [20, 45],
};

const EASY_ACTIVITIES: ActivityType[] = ['Yoga', 'Stretching', 'Walk'];
const ALL_ACTIVITIES: ActivityType[] = [
	'Walk',
	'Walk',
	'Run',
	'Run',
	'Bike',
	'Swim',
	'Hike',
	'Pickleball',
	'Pickleball',
	'Tennis',
	'Basketball',
	'Yoga',
	'Stretching',
	'Cardio',
];

function pickActivityType(light: boolean): ActivityType {
	if (light) return pick(EASY_ACTIVITIES);
	return pick(ALL_ACTIVITIES);
}

function intensityFor(type: ActivityType, light: boolean): ActivityIntensity {
	if (EASY_ACTIVITIES.includes(type)) return 'Easy';
	if (light) return pick<ActivityIntensity>(['Easy', 'Moderate']);
	return pick<ActivityIntensity>(['Easy', 'Moderate', 'Moderate', 'Hard']);
}

function buildActivity(date: Date, idx: number, light = false): ActivityLog {
	const type = pickActivityType(light);
	const [minD, maxD] = ACTIVITY_DURATION[type] ?? [30, 60];
	const intensity = intensityFor(type, light);
	return {
		id: `seed-activity-${idx}`,
		date: toDateStr(date),
		type,
		durationMinutes: rInt(minD, maxD),
		intensity,
		createdAt: date.toISOString(),
	};
}

const HABIT_IDS = [
	'habit-water',
	'habit-coffee',
	'habit-meditation',
	'habit-writing',
	'habit-reading',
	'habit-mood',
] as const;

function chance(probability: number): boolean {
	return Math.random() < probability;
}

function clampMood(value: number): number {
	return Math.max(-5, Math.min(5, value));
}

function meditationValue(workoutDay: boolean): number {
	if (workoutDay) return rInt(15, 35);
	if (chance(0.45)) return rInt(0, 15);
	return rInt(10, 30);
}

function waterValue(workoutDay: boolean): number {
	if (workoutDay) return rInt(6, 12);
	if (chance(0.4)) return rInt(2, 6);
	return rInt(5, 10);
}

function moodValue(workoutDay: boolean): number {
	if (workoutDay) return clampMood(rInt(-1, 5));
	return clampMood(rInt(-4, 4));
}

function habitValue(habitId: string, workoutDay: boolean): number {
	switch (habitId) {
		case 'habit-meditation':
			return meditationValue(workoutDay);
		case 'habit-writing':
			if (chance(0.35)) return rInt(0, 350);
			return rInt(200, 1000);
		case 'habit-reading':
			if (chance(0.35)) return rInt(0, 15);
			return rInt(15, 60);
		case 'habit-water':
			return waterValue(workoutDay);
		case 'habit-coffee':
			return pick([0, 1, 1, 2, 2, 3, 3, 3, 4]);
		case 'habit-mood':
			return moodValue(workoutDay);
		default:
			return 0;
	}
}

/** ~6 months of history for stress-testing charts and insights. */
const SEED_DAYS = 180;

/** Tue / Thu / Sat each week (~3×/week), deterministic across the window. */
function buildWorkoutOffsets(days: number): number[] {
	const offsets: number[] = [];
	for (let week = 0; week * 7 < days; week++) {
		for (const d of [1, 3, 5]) {
			const offset = week * 7 + d;
			if (offset < days) offsets.push(offset);
		}
	}
	return offsets;
}

/** Most non-workout days get an activity; skip every 5th rest day for gaps. */
function buildActivityOffsets(days: number, workoutSet: Set<number>): number[] {
	const offsets: number[] = [];
	let restIdx = 0;
	for (let i = 0; i < days; i++) {
		if (workoutSet.has(i)) continue;
		if (restIdx % 5 !== 4) offsets.push(i);
		restIdx++;
	}
	return offsets;
}

/** Light second activity on every ~5th workout day. */
function buildDualActivityOffsets(workoutOffsets: number[]): Set<number> {
	return new Set(workoutOffsets.filter((_, i) => i % 5 === 2));
}

function adjustedLogRate(habitId: string, logRate: number): number {
	if (habitId === 'habit-mood') return logRate * 0.85;
	return logRate;
}

function dayLogRate(isWorkoutDay: boolean): number {
	if (isWorkoutDay) return 0.95;
	return 0.82;
}

function round1(n: number): number {
	return Math.round(n * 10) / 10;
}

/** Weight readings: a gentle downward trend with daily noise, logged most days. */
function buildWeightReading(date: Date, dayIndex: number): HealthReading | null {
	if (!chance(0.78)) return null;
	const trend = 165 - (dayIndex / (SEED_DAYS - 1)) * 10; // ~165 → ~155 over the window
	const value = round1(trend + (Math.random() * 1.6 - 0.8));
	const recordedAt = new Date(date);
	recordedAt.setHours(7, rInt(0, 45), 0, 0);
	return {
		id: `seed-health-weight-${toDateStr(date)}`,
		metricId: 'weight',
		date: toDateStr(date),
		recordedAt: recordedAt.toISOString(),
		values: { value },
	};
}

/** Blood pressure: logged on most days, occasionally twice (morning + evening). */
function buildBpReadings(date: Date): HealthReading[] {
	if (!chance(0.6)) return [];
	const readings: HealthReading[] = [];
	const times = chance(0.3) ? [8, 20] : [pick([8, 9, 20, 21])];
	times.forEach((hour, i) => {
		const recordedAt = new Date(date);
		recordedAt.setHours(hour, rInt(0, 55), 0, 0);
		const systolic = rInt(116, 130);
		const diastolic = rInt(74, 84);
		const values: HealthReading['values'] = { systolic, diastolic };
		if (chance(0.7)) (values as { pulse?: number }).pulse = rInt(58, 78);
		readings.push({
			id: `seed-health-bp-${toDateStr(date)}-${i}`,
			metricId: 'bloodPressure',
			date: toDateStr(date),
			recordedAt: recordedAt.toISOString(),
			values,
		});
	});
	return readings;
}

/**
 * Baselines have no built-in seed, so the debug data ships its own definitions:
 * a four-metric "Daily 10" and a distance + duration bike ride.
 */
const seedBaselines: Baseline[] = [
	{
		id: 'seed-baseline-daily10',
		name: 'Daily 10',
		metrics: [
			{ id: 'seed-bl-d10-push', name: 'Pushups', measure: 'count', baseline: 10, label: 'reps' },
			{
				id: 'seed-bl-d10-jj',
				name: 'Jumping jacks',
				measure: 'count',
				baseline: 10,
				label: 'reps',
			},
			{ id: 'seed-bl-d10-walk', name: 'Walk', measure: 'duration', baseline: 10 },
			{ id: 'seed-bl-d10-lunge', name: 'Lunges', measure: 'count', baseline: 10, label: 'reps' },
		],
		sortOrder: 0,
		active: true,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'seed-baseline-bike',
		name: 'Bike ride',
		metrics: [
			{ id: 'seed-bl-bike-dist', name: 'Distance', measure: 'distance', baseline: 5, unit: 'mi' },
			{ id: 'seed-bl-bike-time', name: 'Time', measure: 'duration', baseline: 30 },
		],
		sortOrder: 1,
		active: true,
		createdAt: new Date().toISOString(),
	},
];

/** A day's entries for one baseline — usually one, sometimes split across the day. */
function buildBaselineLogs(baseline: Baseline, date: Date, dayIndex: number): BaselineLog[] {
	if (!chance(0.75)) return [];
	const entryCount = chance(0.4) ? 2 : 1;
	const logs: BaselineLog[] = [];
	for (let i = 0; i < entryCount; i++) {
		const recordedAt = new Date(date);
		recordedAt.setHours(pick([8, 12, 17, 21]), rInt(0, 55), 0, 0);
		const values: Record<string, number> = {};
		for (const metric of baseline.metrics) {
			// Drift upward over the seeded window so charts show growth, then split
			// the day's amount across however many entries this day has.
			const growth = 1 + (dayIndex / SEED_DAYS) * 0.5;
			const dayAmount = metric.baseline * growth * (rInt(70, 130) / 100);
			values[metric.id] = Math.round((dayAmount / entryCount) * 100) / 100;
		}
		logs.push({
			id: `seed-baseline-log-${baseline.id}-${toDateStr(date)}-${i}`,
			baselineId: baseline.id,
			date: toDateStr(date),
			recordedAt: recordedAt.toISOString(),
			values,
		});
	}
	return logs;
}

export function generateDebugSeedData(): {
	sessions: Session[];
	activities: ActivityLog[];
	habitLogs: HabitLog[];
	healthReadings: HealthReading[];
	baselines: Baseline[];
	baselineLogs: BaselineLog[];
} {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const start = shiftDays(today, -(SEED_DAYS - 1));

	const workoutOffsets = buildWorkoutOffsets(SEED_DAYS);
	const workoutOffsetSet = new Set(workoutOffsets);
	const activityOffsets = buildActivityOffsets(SEED_DAYS, workoutOffsetSet);
	const dualActivityOffsets = buildDualActivityOffsets(workoutOffsets);
	const workoutKeys: WorkoutKey[] = ['A', 'B', 'C'];

	const sessions: Session[] = workoutOffsets.map((offset, i) =>
		buildSession(shiftDays(start, offset), workoutKeys[i % 3], i),
	);

	let actIdx = 0;
	const activities: ActivityLog[] = [];
	for (const offset of activityOffsets) {
		activities.push(buildActivity(shiftDays(start, offset), actIdx++));
	}
	for (const offset of dualActivityOffsets) {
		activities.push(buildActivity(shiftDays(start, offset), actIdx++, true));
	}

	const habitLogs: HabitLog[] = [];
	for (let i = 0; i < SEED_DAYS; i++) {
		const date = shiftDays(start, i);
		const isWorkoutDay = workoutOffsetSet.has(i);
		const logRate = dayLogRate(isWorkoutDay);

		for (const habitId of HABIT_IDS) {
			const adjustedRate = adjustedLogRate(habitId, logRate);
			if (Math.random() < adjustedRate) {
				habitLogs.push({
					// Must match the live id scheme (`${habitId}:${date}`) from habits.svelte.ts's
					// logValue() — otherwise editing a seeded day creates a second row instead of
					// overwriting the seed, and reads silently keep returning the stale seed value.
					id: `${habitId}:${toDateStr(date)}`,
					habitId,
					date: toDateStr(date),
					value: habitValue(habitId, isWorkoutDay),
				});
			}
		}
	}

	const healthReadings: HealthReading[] = [];
	for (let i = 0; i < SEED_DAYS; i++) {
		const date = shiftDays(start, i);
		const weight = buildWeightReading(date, i);
		if (weight) healthReadings.push(weight);
		healthReadings.push(...buildBpReadings(date));
	}

	const baselineLogs: BaselineLog[] = [];
	for (let i = 0; i < SEED_DAYS; i++) {
		const date = shiftDays(start, i);
		for (const baseline of seedBaselines) {
			baselineLogs.push(...buildBaselineLogs(baseline, date, i));
		}
	}

	return {
		sessions,
		activities,
		habitLogs,
		healthReadings,
		baselines: seedBaselines,
		baselineLogs,
	};
}
