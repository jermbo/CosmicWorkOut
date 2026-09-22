/*
 * Pure aggregation behind the Insights charts (v1.10.0). No stores, no DOM —
 * tested in src/lib/insights.test.ts.
 */
import type { BaselineLog, Habit, HabitLog } from '$lib/db/types';

/** The row with the highest positive value; ties go to the most recent. */
export function bestDay<T extends { date: string; value: number }>(rows: readonly T[]): T | null {
	let best: T | null = null;
	for (const row of rows) {
		if (row.value <= 0) continue;
		if (!best || row.value > best.value || (row.value === best.value && row.date > best.date)) {
			best = row;
		}
	}
	return best;
}

// ── Dates ─────────────────────────────────────────────────────

function parseIso(iso: string): Date {
	return new Date(iso + 'T00:00:00');
}

function toIso(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(iso: string): number {
	return (parseIso(iso).getDay() + 6) % 7;
}

export function mondayOf(iso: string): string {
	const d = parseIso(iso);
	d.setDate(d.getDate() - weekdayIndex(iso));
	return toIso(d);
}

export function addDays(iso: string, days: number): string {
	const d = parseIso(iso);
	d.setDate(d.getDate() + days);
	return toIso(d);
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

// ── Showing-up rate (US-044 #2) ───────────────────────────────

export interface WeekRate {
	/** Monday of the week. */
	week: string;
	/** Days of this week inside the range. */
	days: number;
	logged: number;
	/** 0–100. */
	pct: number;
}

/** Percent of in-range days per week that have a log. */
export function showUpRate(loggedDates: ReadonlySet<string>, dates: readonly string[]): WeekRate[] {
	const byWeek = new Map<string, WeekRate>();
	for (const date of dates) {
		const week = mondayOf(date);
		const row = byWeek.get(week) ?? { week, days: 0, logged: 0, pct: 0 };
		row.days += 1;
		if (loggedDates.has(date)) row.logged += 1;
		byWeek.set(week, row);
	}
	return [...byWeek.values()].map((r) => ({ ...r, pct: Math.round((r.logged / r.days) * 100) }));
}

// ── Day-of-week pattern (US-044 #3) ───────────────────────────

export interface WeekdayAverage {
	weekday: (typeof WEEKDAY_LABELS)[number];
	/** Null when that weekday has no data in the range — shown empty, not zero. */
	average: number | null;
	days: number;
}

/** Average value per weekday over days that have a value. */
export function weekdayAverages(
	values: ReadonlyMap<string, number>,
	dates: readonly string[],
): WeekdayAverage[] {
	const sums = Array.from({ length: 7 }, () => ({ total: 0, days: 0 }));
	for (const date of dates) {
		const v = values.get(date);
		if (v === undefined) continue;
		const s = sums[weekdayIndex(date)];
		s.total += v;
		s.days += 1;
	}
	return sums.map((s, i) => ({
		weekday: WEEKDAY_LABELS[i],
		average: s.days === 0 ? null : Math.round((s.total / s.days) * 100) / 100,
		days: s.days,
	}));
}

// ── "On days when…" (US-044 #4) ───────────────────────────────

export const MIN_GROUP_DAYS = 3;

export interface ConditionSplit {
	whenTrue: { average: number | null; days: number };
	whenFalse: { average: number | null; days: number };
	/** False when either group has fewer than MIN_GROUP_DAYS days. */
	enough: boolean;
}

/**
 * Average of the outcome on days the condition held vs days it didn't. Only days
 * where the outcome was logged count toward either group.
 */
export function splitByCondition(
	outcome: ReadonlyMap<string, number>,
	condition: ReadonlySet<string>,
	dates: readonly string[],
): ConditionSplit {
	const t = { total: 0, days: 0 };
	const f = { total: 0, days: 0 };
	for (const date of dates) {
		const v = outcome.get(date);
		if (v === undefined) continue;
		const g = condition.has(date) ? t : f;
		g.total += v;
		g.days += 1;
	}
	const avg = (g: { total: number; days: number }) =>
		g.days === 0 ? null : Math.round((g.total / g.days) * 100) / 100;
	return {
		whenTrue: { average: avg(t), days: t.days },
		whenFalse: { average: avg(f), days: f.days },
		enough: t.days >= MIN_GROUP_DAYS && f.days >= MIN_GROUP_DAYS,
	};
}

// ── This week vs last week (US-044 #5) ────────────────────────

export interface WeekComparison {
	thisWeek: number;
	lastWeek: number;
	trend: 'up' | 'down' | 'same';
	/** Weekdays compared, e.g. Mon–Wed on a Wednesday. */
	span: number;
}

/**
 * Totals for Monday…today against the same weekdays of last week, so an
 * unfinished week is compared fairly.
 */
export function compareWeeks(values: ReadonlyMap<string, number>, today: string): WeekComparison {
	const monday = mondayOf(today);
	const span = weekdayIndex(today) + 1;
	let thisWeek = 0;
	let lastWeek = 0;
	for (let i = 0; i < span; i++) {
		thisWeek += values.get(addDays(monday, i)) ?? 0;
		lastWeek += values.get(addDays(monday, i - 7)) ?? 0;
	}
	thisWeek = Math.round(thisWeek * 100) / 100;
	lastWeek = Math.round(lastWeek * 100) / 100;
	const trend = thisWeek > lastWeek ? 'up' : thisWeek < lastWeek ? 'down' : 'same';
	return { thisWeek, lastWeek, trend, span };
}

// ── Time of day (US-044 #6) ───────────────────────────────────

/** Entries per hour of day (0–23) from ISO datetimes, in local time. */
export function hourHistogram(recordedAt: readonly string[]): number[] {
	const hours = new Array<number>(24).fill(0);
	for (const iso of recordedAt) {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) continue;
		hours[d.getHours()] += 1;
	}
	return hours;
}

/** 0 → "12a", 13 → "1p". */
export function hourLabel(hour: number): string {
	const h = hour % 12 === 0 ? 12 : hour % 12;
	return `${h}${hour < 12 ? 'a' : 'p'}`;
}

// ── Daily values from stored logs ─────────────────────────────

/**
 * date → day total for one baseline metric, only on days an entry recorded that
 * metric (a blank metric is "not logged", not zero).
 */
export function metricDailyTotals(
	logs: readonly BaselineLog[],
	baselineId: string,
	metricId: string,
): Map<string, number> {
	const totals = new Map<string, number>();
	for (const log of logs) {
		if (log.baselineId !== baselineId) continue;
		const v = log.values[metricId];
		if (typeof v !== 'number') continue;
		totals.set(log.date, Math.round(((totals.get(log.date) ?? 0) + v) * 1e4) / 1e4);
	}
	return totals;
}

/** Dates with any entry for the baseline — the days it was done. */
export function baselineLoggedDates(logs: readonly BaselineLog[], baselineId: string): Set<string> {
	return new Set(logs.filter((l) => l.baselineId === baselineId).map((l) => l.date));
}

/**
 * date → value for a habit on days it was actually logged. Mood counts any log
 * (0 is a real mood); other habits need a value above zero (a toggled-off
 * yes/no or a counter set back to 0 is not a log).
 */
export function habitDailyValues(habit: Habit, logs: readonly HabitLog[]): Map<string, number> {
	const values = new Map<string, number>();
	for (const log of logs) {
		if (log.habitId !== habit.id) continue;
		if (habit.type !== 'mood' && !(log.value > 0)) continue;
		values.set(log.date, log.value);
	}
	return values;
}
