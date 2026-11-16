/*
 * One streak for each tracker (v1.13.0, US-065). Pure: the records' dates and today
 * go in, the count comes out. Tested in streak.test.ts. Dates are local calendar days.
 */
import { fromIso, toLocalIso } from './date.ts';

export function isoWeekKey(date: Date): string {
	const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const day = utc.getUTCDay() || 7;
	utc.setUTCDate(utc.getUTCDate() + 4 - day);
	const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((utc.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
	return `${utc.getUTCFullYear()}-W${week}`;
}

/** Workout, Activity and Health count ISO weeks; Habits and Baselines count days. */
export type StreakUnit = 'day' | 'week';

export type StreakTracker = 'practice' | 'habits' | 'activity' | 'health' | 'baselines';

export type StreakInfo = {
	tracker: StreakTracker;
	/** The tracker's letter, as on its Overview card. */
	code: 'T' | 'H' | 'A' | 'P' | 'B';
	/** The tracker's name in the star's lines. */
	label: string;
	unit: StreakUnit;
	/** The `--field-*` colour of the tracker. */
	field: 'train' | 'habit' | 'active' | 'health' | 'base';
};

/** The badges, in the order the Overview header shows them. */
export const STREAK_TRACKERS: readonly StreakInfo[] = [
	{ tracker: 'practice', code: 'T', label: 'Workout', unit: 'week', field: 'train' },
	{ tracker: 'habits', code: 'H', label: 'Habits', unit: 'day', field: 'habit' },
	{ tracker: 'activity', code: 'A', label: 'Activity', unit: 'week', field: 'active' },
	{ tracker: 'health', code: 'P', label: 'Health', unit: 'week', field: 'health' },
	{ tracker: 'baselines', code: 'B', label: 'Baselines', unit: 'day', field: 'base' },
];

export type Streak = {
	count: number;
	/** True when today, or this week, already has a record. */
	currentCounts: boolean;
};

function periodKey(date: Date, unit: StreakUnit): string {
	return unit === 'week' ? isoWeekKey(date) : toLocalIso(date);
}

function stepBack(date: Date, unit: StreakUnit): void {
	date.setDate(date.getDate() - (unit === 'week' ? 7 : 1));
}

/**
 * Count the periods in a row with at least one record, back from today. The current
 * day or week only adds: with no record yet, the count starts at the last full one.
 * The streak breaks at the first full past period with no record.
 */
export function computeStreak(
	dates: Iterable<string>,
	unit: StreakUnit,
	today: Date = new Date(),
): Streak {
	const keys = new Set<string>();
	for (const date of dates) keys.add(periodKey(fromIso(date), unit));

	const check = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const currentCounts = keys.has(periodKey(check, unit));
	let count = currentCounts ? 1 : 0;
	stepBack(check, unit);
	while (keys.has(periodKey(check, unit))) {
		count++;
		stepBack(check, unit);
	}
	return { count, currentCounts };
}

/**
 * The dates on which a habit log counts for the Habits streak: any Mood log (its scale
 * holds 0 and below), and any other habit's log above 0 (a log toggled back to 0 stays
 * stored, so it must not count).
 */
export function habitStreakDates(
	logs: Iterable<{ habitId: string; date: string; value: number }>,
	moodHabitIds: ReadonlySet<string>,
): string[] {
	const dates: string[] = [];
	for (const log of logs) {
		if (moodHabitIds.has(log.habitId) || log.value > 0) dates.push(log.date);
	}
	return dates;
}
