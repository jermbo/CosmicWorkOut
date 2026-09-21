import type { Habit } from '$lib/db/types';

/*
 * Habit colors (v1.10.0, US-042). Pure — tested in src/lib/habitColors.test.ts.
 * Each habit has one base color; Mood also has a color for bad days.
 */

/** Preset swatches offered in the picker, and the order defaults are handed out in. */
export const HABIT_COLOR_PALETTE = [
	'#60c6ff',
	'#f59e0b',
	'#b286fd',
	'#34d399',
	'#f472b6',
	'#b2f042',
	'#818cf8',
	'#fb923c',
	'#2dd4bf',
	'#e879f9',
	'#facc15',
	'#94a3b8',
] as const;

/** Spoken names for swatches (screen readers). */
export const COLOR_NAMES: Record<string, string> = {
	'#60c6ff': 'Sky',
	'#f59e0b': 'Amber',
	'#b286fd': 'Lavender',
	'#34d399': 'Mint',
	'#f472b6': 'Pink',
	'#b2f042': 'Lime',
	'#818cf8': 'Indigo',
	'#fb923c': 'Orange',
	'#2dd4bf': 'Teal',
	'#e879f9': 'Orchid',
	'#facc15': 'Yellow',
	'#94a3b8': 'Slate',
};

export const MOOD_DEFAULT_GOOD = '#34d399';
export const MOOD_DEFAULT_BAD = '#fb923c';

/**
 * First palette color no other habit uses, so the first several habits are
 * distinct; once all are taken, cycle by position.
 */
export function nextDefaultColor(taken: readonly (string | undefined)[], position: number): string {
	const used = new Set(taken.filter(Boolean).map((c) => c!.toLowerCase()));
	const free = HABIT_COLOR_PALETTE.find((c) => !used.has(c));
	return free ?? HABIT_COLOR_PALETTE[position % HABIT_COLOR_PALETTE.length];
}

/**
 * Give every habit without a color a default, in sort order. Returns only the
 * habits that changed (to persist), leaving already-colored habits untouched.
 */
export function withDefaultColors(habits: readonly Habit[]): Habit[] {
	const sorted = [...habits].sort((a, b) => a.sortOrder - b.sortOrder);
	const taken: string[] = sorted.flatMap((h) => (h.color ? [h.color] : []));
	const changed: Habit[] = [];
	sorted.forEach((habit, i) => {
		if (habit.type === 'mood') {
			if (habit.color && habit.negativeColor) return;
			changed.push({
				...habit,
				color: habit.color ?? MOOD_DEFAULT_GOOD,
				negativeColor: habit.negativeColor ?? MOOD_DEFAULT_BAD,
			});
			return;
		}
		if (habit.color) return;
		const color = nextDefaultColor(taken, i);
		taken.push(color);
		changed.push({ ...habit, color });
	});
	return changed;
}

/** The color to paint a habit with, even before defaults have been saved. */
export function habitColor(habit: Pick<Habit, 'color' | 'type' | 'sortOrder'>): string {
	if (habit.color) return habit.color;
	if (habit.type === 'mood') return MOOD_DEFAULT_GOOD;
	return HABIT_COLOR_PALETTE[Math.max(0, habit.sortOrder) % HABIT_COLOR_PALETTE.length];
}

export function moodBadColor(habit: Pick<Habit, 'negativeColor'>): string {
	return habit.negativeColor ?? MOOD_DEFAULT_BAD;
}
