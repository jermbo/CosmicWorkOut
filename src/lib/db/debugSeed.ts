import type {
	Session,
	ActivityLog,
	HabitLog,
	LoggedItem,
	LoggedSet,
	ActivityType,
	ActivityIntensity,
} from './types';

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Workouts ───────────────────────────────────────────────────────────────────

type WorkoutKey = 'A' | 'B' | 'C' | 'D';

const ITEM_UNITS: Record<string, string> = {
	goblet: 'lb', rdl: 'lb', split: 'lb', 'band-walk': 'band', medball: 'lb', copenhagen: 'bodyweight',
	'db-bench': 'lb', 'cs-row': 'lb', 'push-press': 'lb', 'face-pull': 'band', pogo: 'bodyweight', pallof: 'band',
	'trap-dl': 'lb', 'sled-push': 'lb', farmer: 'lb', woodchop: 'lb',
	'box-jump': 'bodyweight', 'broad-jump': 'bodyweight', 'pull-up': 'bodyweight',
	'db-ohp': 'lb', 'sl-rdl': 'lb', 'kb-swing': 'lb', 'box-squat': 'lb',
	landmine: 'lb', 'band-pull': 'band', 'step-up': 'lb', 'good-morn': 'lb',
	'side-plank': 'bodyweight', 'mb-rainbow': 'lb', 'mb-chest': 'lb', suitcase: 'lb',
};

const BASE_WEIGHTS: Record<string, number> = {
	goblet: 45, rdl: 115, split: 35, medball: 15,
	'db-bench': 45, 'cs-row': 55, 'push-press': 75,
	'trap-dl': 175, 'sled-push': 135, farmer: 60, woodchop: 40,
	'db-ohp': 40, 'sl-rdl': 30, 'kb-swing': 35, 'box-squat': 95,
	landmine: 45, 'step-up': 25, 'good-morn': 65,
	'mb-rainbow': 15, 'mb-chest': 15, suitcase: 50,
};

function lbWeight(itemId: string): number {
	const base = BASE_WEIGHTS[itemId] ?? 50;
	return Math.max(5, base + pick([-10, -5, 0, 0, 5, 10]));
}

const WORKOUTS: Record<WorkoutKey, Array<{ itemId: string; sets: number; reps: number }>> = {
	// Lower + Lateral Power
	A: [
		{ itemId: 'goblet',     sets: 4, reps: 8  },
		{ itemId: 'rdl',        sets: 3, reps: 10 },
		{ itemId: 'split',      sets: 3, reps: 10 },
		{ itemId: 'band-walk',  sets: 3, reps: 15 },
		{ itemId: 'medball',    sets: 3, reps: 6  },
		{ itemId: 'copenhagen', sets: 3, reps: 30 },
	],
	// Upper + Reactive
	B: [
		{ itemId: 'db-bench',   sets: 4, reps: 8  },
		{ itemId: 'cs-row',     sets: 4, reps: 10 },
		{ itemId: 'push-press', sets: 3, reps: 8  },
		{ itemId: 'face-pull',  sets: 3, reps: 15 },
		{ itemId: 'band-pull',  sets: 3, reps: 20 },
		{ itemId: 'pogo',       sets: 3, reps: 20 },
		{ itemId: 'pallof',     sets: 3, reps: 12 },
	],
	// Full Body + Conditioning
	C: [
		{ itemId: 'trap-dl',    sets: 4, reps: 6  },
		{ itemId: 'push-press', sets: 3, reps: 8  },
		{ itemId: 'sled-push',  sets: 4, reps: 20 },
		{ itemId: 'farmer',     sets: 3, reps: 40 },
		{ itemId: 'woodchop',   sets: 3, reps: 12 },
		{ itemId: 'suitcase',   sets: 3, reps: 30 },
	],
	// Power + Mobility
	D: [
		{ itemId: 'box-jump',   sets: 4, reps: 5  },
		{ itemId: 'broad-jump', sets: 3, reps: 5  },
		{ itemId: 'pull-up',    sets: 4, reps: 6  },
		{ itemId: 'db-ohp',     sets: 3, reps: 10 },
		{ itemId: 'sl-rdl',     sets: 3, reps: 8  },
		{ itemId: 'kb-swing',   sets: 4, reps: 15 },
		{ itemId: 'side-plank', sets: 3, reps: 30 },
	],
};

const ROUTINE_META: Record<WorkoutKey, { id: string; name: string; estMin: number }> = {
	A: { id: 'w1-lower',        name: 'Lower + Lateral Power',   estMin: 45 },
	B: { id: 'w1-upper',        name: 'Upper + Reactive',         estMin: 40 },
	C: { id: 'w1-conditioning', name: 'Full Body + Conditioning', estMin: 55 },
	D: { id: 'w2-lower',        name: 'Power + Mobility',         estMin: 50 },
};

const DISCIPLINE_ID = 'strength';
const PROGRAM_ID = 'strength-foundation';

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
		const weight: number | string = unit === 'lb' ? lbWeight(itemId) : 0;
		const loggedSets: LoggedSet[] = [];

		for (let s = 1; s <= sets; s++) {
			setTime = new Date(setTime.getTime() + rInt(90, 210) * 1000);
			const actualReps = unit === 'lb' ? Math.max(1, reps + rInt(-2, 2)) : reps;
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

// ── Activities ─────────────────────────────────────────────────────────────────

const ACTIVITY_DURATION: Partial<Record<ActivityType, [number, number]>> = {
	Walk:       [25, 60 ],
	Run:        [20, 50 ],
	Bike:       [30, 75 ],
	Swim:       [25, 45 ],
	Hike:       [60, 120],
	Pickleball: [60, 90 ],
	Tennis:     [45, 90 ],
	Basketball: [45, 75 ],
	Yoga:       [30, 60 ],
	Stretching: [15, 30 ],
	Cardio:     [20, 45 ],
};

const EASY_ACTIVITIES: ActivityType[] = ['Yoga', 'Stretching', 'Walk'];
const ALL_ACTIVITIES: ActivityType[] = [
	'Walk', 'Walk', 'Run', 'Run',
	'Bike', 'Swim', 'Hike',
	'Pickleball', 'Pickleball', 'Tennis', 'Basketball',
	'Yoga', 'Stretching', 'Cardio',
];

function buildActivity(date: Date, idx: number, light = false): ActivityLog {
	const type = light ? pick(EASY_ACTIVITIES) : pick(ALL_ACTIVITIES);
	const [minD, maxD] = ACTIVITY_DURATION[type] ?? [30, 60];
	const intensity: ActivityIntensity = EASY_ACTIVITIES.includes(type)
		? 'Easy'
		: light
			? pick<ActivityIntensity>(['Easy', 'Moderate'])
			: pick<ActivityIntensity>(['Easy', 'Moderate', 'Moderate', 'Hard']);
	return {
		id: `seed-activity-${idx}`,
		date: toDateStr(date),
		type,
		durationMinutes: rInt(minD, maxD),
		intensity,
		createdAt: date.toISOString(),
	};
}

// ── Habits ─────────────────────────────────────────────────────────────────────

const HABIT_IDS = [
	'habit-meditation',
	'habit-writing',
	'habit-reading',
	'habit-water',
	'habit-coffee',
	'habit-alcohol',
	'habit-mood',
] as const;

function habitValue(habitId: string, workoutDay: boolean): number {
	switch (habitId) {
		case 'habit-meditation':
			return workoutDay ? rInt(15, 35) : Math.random() < 0.45 ? rInt(0, 15) : rInt(10, 30);
		case 'habit-writing':
			return Math.random() < 0.35 ? rInt(0, 350) : rInt(200, 1000);
		case 'habit-reading':
			return Math.random() < 0.35 ? rInt(0, 12) : rInt(8, 40);
		case 'habit-water':
			return workoutDay ? rInt(6, 12) : Math.random() < 0.4 ? rInt(2, 6) : rInt(5, 10);
		case 'habit-coffee':
			return pick([0, 1, 1, 2, 2, 3, 3, 3, 4]);
		case 'habit-alcohol':
			return Math.random() < 0.18 ? 1 : 0;
		case 'habit-mood':
			return workoutDay
				? Math.max(-5, Math.min(5, rInt(-1, 5)))
				: Math.max(-5, Math.min(5, rInt(-4, 4)));
		default:
			return 0;
	}
}

// ── Schedule ───────────────────────────────────────────────────────────────────
//
// Fixed offsets from day 0 (= today − 45) for predictable edge-case coverage:
//   Week 1 (days  0- 6): 3 sessions — baseline
//   Week 2 (days  7-13): 3 sessions
//   Week 3 (days 14-20): 4 sessions — heavy week
//   Week 4 (days 21-27): 1 session  — rest/recovery (streak break for graphs)
//   Week 5 (days 28-34): 3 sessions
//   Week 6 (days 35-41): 3 sessions
//   Partial (days 42-44): 2 sessions

const WORKOUT_OFFSETS = [1, 3, 5, 8, 10, 12, 15, 17, 19, 20, 25, 29, 31, 33, 36, 38, 41, 43, 44];
const WORKOUT_SEQUENCE: WorkoutKey[] = WORKOUT_OFFSETS.map((_, i) => (['A', 'B', 'C', 'D'] as WorkoutKey[])[i % 4]);

// Workout days that also get a short light activity (morning session + evening walk)
const DUAL_ACTIVITY_OFFSETS = new Set([3, 12, 19, 31, 41]);

// Non-workout days that get an activity
const ACTIVITY_OFFSETS = [
	0, 2, 4, 6, 7, 9, 11, 13, 14, 16, 18, 21, 22, 23, 24, 26, 27,
	28, 30, 32, 34, 35, 37, 39, 40, 42,
];

// ── Main export ────────────────────────────────────────────────────────────────

export function generateDebugSeedData(): {
	sessions: Session[];
	activities: ActivityLog[];
	habitLogs: HabitLog[];
} {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const start = shiftDays(today, -45);

	const workoutOffsetSet = new Set(WORKOUT_OFFSETS);
	const activityOffsetSet = new Set(ACTIVITY_OFFSETS);

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
		const logRate = isWorkoutDay ? 0.95 : 0.82;

		for (const habitId of HABIT_IDS) {
			const adjustedRate =
				habitId === 'habit-alcohol' || habitId === 'habit-mood' ? logRate * 0.85 : logRate;
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

	return { sessions, activities, habitLogs };
}
