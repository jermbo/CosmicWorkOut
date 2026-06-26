import type {
	Session,
	ActivityLog,
	HabitLog,
	LoggedItem,
	LoggedSet,
	ActivityType,
	ActivityIntensity,
	HealthReading,
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
			loggedSets.push({ setNumber: s, weight, reps: actualReps, completedAt: setTime.toISOString() });
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

const WORKOUT_OFFSETS = [1, 3, 5, 8, 10, 12, 15, 17, 19, 20, 25, 29, 31, 33, 36, 38, 41, 43, 44];
const WORKOUT_SEQUENCE: WorkoutKey[] = WORKOUT_OFFSETS.map((_, i) => (['A', 'B', 'C'] as WorkoutKey[])[i % 3]);

const DUAL_ACTIVITY_OFFSETS = new Set([3, 12, 19, 31, 41]);

const ACTIVITY_OFFSETS = [
	0, 2, 4, 6, 7, 9, 11, 13, 14, 16, 18, 21, 22, 23, 24, 26, 27, 28, 30, 32, 34, 35, 37, 39, 40, 42,
];

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
	const trend = 165 - (dayIndex / 44) * 7; // ~165 → ~158 over the window
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

export function generateDebugSeedData(): {
	sessions: Session[];
	activities: ActivityLog[];
	habitLogs: HabitLog[];
	healthReadings: HealthReading[];
} {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const start = shiftDays(today, -45);

	const workoutOffsetSet = new Set(WORKOUT_OFFSETS);

	const sessions: Session[] = WORKOUT_OFFSETS.map((offset, i) =>
		buildSession(shiftDays(start, offset), WORKOUT_SEQUENCE[i], i),
	);

	let actIdx = 0;
	const activities: ActivityLog[] = [];
	for (const offset of ACTIVITY_OFFSETS) {
		if (!workoutOffsetSet.has(offset)) {
			activities.push(buildActivity(shiftDays(start, offset), actIdx++));
		}
	}
	for (const offset of DUAL_ACTIVITY_OFFSETS) {
		activities.push(buildActivity(shiftDays(start, offset), actIdx++, true));
	}

	const habitLogs: HabitLog[] = [];
	for (let i = 0; i < 45; i++) {
		const date = shiftDays(start, i);
		const isWorkoutDay = workoutOffsetSet.has(i);
		const logRate = dayLogRate(isWorkoutDay);

		for (const habitId of HABIT_IDS) {
			const adjustedRate = adjustedLogRate(habitId, logRate);
			if (Math.random() < adjustedRate) {
				habitLogs.push({
					id: `seed-hl-${habitId}-${toDateStr(date)}`,
					habitId,
					date: toDateStr(date),
					value: habitValue(habitId, isWorkoutDay),
				});
			}
		}
	}

	const healthReadings: HealthReading[] = [];
	for (let i = 0; i < 45; i++) {
		const date = shiftDays(start, i);
		const weight = buildWeightReading(date, i);
		if (weight) healthReadings.push(weight);
		healthReadings.push(...buildBpReadings(date));
	}

	return { sessions, activities, habitLogs, healthReadings };
}
