import type { Habit, HabitLog } from '$lib/db/types';
import { withAlpha } from '../charts/color.ts';
import { habitColor, moodBadColor } from '../habitColors.ts';

/*
 * All-habits heat chart shading (v1.10.0, US-041). Pure — tested in
 * src/lib/insights.test.ts.
 *
 * GitHub-contributions style: the more you did, the darker the square, in 10%
 * opacity steps. Each habit is shaded against its own busiest day in the range.
 */

/** Painted when a day has nothing logged — distinct from the lightest 10% step. */
export const HEAT_EMPTY = '#232323';
/** Mood logged as exactly 0 — "logged, neutral". */
export const HEAT_NEUTRAL = '#3a3a3a';

export type HeatKind = 'empty' | 'level' | 'neutral' | 'positive' | 'negative';

export interface HeatCell {
	habitId: string;
	habitName: string;
	date: string;
	/** Undefined when nothing was logged. */
	value: number | undefined;
	kind: HeatKind;
	/** 0 (empty) … 10 (full color). */
	level: number;
	fill: string;
}

/** Number of 10% steps for a value against the range max. Any positive value is ≥ 1. */
export function heatLevel(value: number, max: number): number {
	if (!(value > 0) || !(max > 0)) return 0;
	return Math.min(10, Math.max(1, Math.ceil((value / max) * 10)));
}

/** Mood ±1…±5 → 2…10 steps (20% … 100%). */
export function moodLevel(value: number): number {
	return Math.min(10, Math.ceil(Math.abs(value) * 2));
}

/** One habit's cells across the dates, shaded against that habit's own max. */
export function habitHeatRow(
	habit: Habit,
	logs: readonly HabitLog[],
	dates: readonly string[],
): HeatCell[] {
	const inRange = new Set(dates);
	const byDate = new Map<string, number>();
	for (const log of logs) {
		if (log.habitId === habit.id && inRange.has(log.date)) byDate.set(log.date, log.value);
	}
	const base = habitColor(habit);
	const max = Math.max(0, ...byDate.values());

	return dates.map((date) => {
		const value = byDate.get(date);
		const cell = { habitId: habit.id, habitName: habit.name, date, value };
		if (value === undefined) return { ...cell, kind: 'empty', level: 0, fill: HEAT_EMPTY };

		if (habit.type === 'mood') {
			if (value === 0) return { ...cell, kind: 'neutral', level: 0, fill: HEAT_NEUTRAL };
			const level = moodLevel(value);
			const color = value > 0 ? base : moodBadColor(habit);
			return {
				...cell,
				kind: value > 0 ? 'positive' : 'negative',
				level,
				fill: withAlpha(color, level / 10),
			};
		}

		if (habit.type === 'boolean') {
			if (value > 0) return { ...cell, kind: 'level', level: 10, fill: withAlpha(base, 1) };
			return { ...cell, kind: 'empty', level: 0, fill: HEAT_EMPTY };
		}

		const level = heatLevel(value, max);
		if (level === 0) return { ...cell, kind: 'empty', level: 0, fill: HEAT_EMPTY };
		return { ...cell, kind: 'level', level, fill: withAlpha(base, level / 10) };
	});
}

/** Readable value for a tooltip: "8 cups", "Done", "Mood +3", "Not logged". */
export function heatValueLabel(habit: Habit, value: number | undefined): string {
	if (value === undefined) return 'Not logged';
	if (habit.type === 'boolean') return value > 0 ? 'Done' : 'Not done';
	if (habit.type === 'mood') return value > 0 ? `+${value}` : String(value);
	if (habit.type === 'minutes') return `${value} min`;
	return habit.unit ? `${value} ${habit.unit}` : String(value);
}

export interface CalendarSlot {
	date: string;
	/** Monday of the slot's week — the column. */
	week: string;
	/** 0 = Monday … 6 = Sunday — the row. */
	weekday: number;
	inRange: boolean;
}

function isoOf(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

/**
 * Weeks × weekdays covering the range, padded to whole Monday–Sunday weeks. Days
 * before the start or after the end are `inRange: false`, so the chart can draw
 * them differently from days with nothing logged.
 */
export function calendarSlots(dates: readonly string[]): {
	weeks: string[];
	slots: CalendarSlot[];
} {
	if (dates.length === 0) return { weeks: [], slots: [] };
	const inRange = new Set(dates);
	const first = new Date(dates[0] + 'T00:00:00');
	const last = new Date(dates[dates.length - 1] + 'T00:00:00');
	const start = new Date(first);
	start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
	const end = new Date(last);
	end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));

	const weeks: string[] = [];
	const slots: CalendarSlot[] = [];
	for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		const weekday = (d.getDay() + 6) % 7;
		const date = isoOf(d);
		if (weekday === 0) weeks.push(date);
		slots.push({ date, week: weeks[weeks.length - 1], weekday, inRange: inRange.has(date) });
	}
	return { weeks, slots };
}
