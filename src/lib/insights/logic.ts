/*
 * Pure aggregation behind the Insights charts (v1.10.0). No stores, no DOM —
 * tested in src/lib/insights.test.ts.
 */
import type { BaselineLog, Habit, HabitLog } from '#lib/db/types';

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
