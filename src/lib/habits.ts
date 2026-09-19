import type { Habit, HabitLog, HabitType } from '$lib/db/types';
import { MOOD_SCALE } from '$lib/db/types';
import { formatCount, formatMinutes } from '$lib/format';

export const MOOD_HABIT_ID = 'habit-mood';

export const HABIT_TYPES: { value: HabitType; label: string; desc: string }[] = [
	{
		value: 'times',
		label: 'Times',
		desc: 'Tap to increment — no unit (e.g. coffee, supplements)',
	},
	{
		value: 'minutes',
		label: 'Minutes',
		desc: 'Numeric duration input (e.g. meditation)',
	},
	{
		value: 'count',
		label: 'Count',
		desc: 'Counter with a custom unit label (e.g. glasses, pages)',
	},
	{
		value: 'boolean',
		label: 'Yes / No',
		desc: 'Simple toggle — done or not done',
	},
	{
		value: 'mood',
		label: 'Mood',
		desc: 'Track how you feel on a - 5 to +5 scale',
	},
];

export const HABIT_PRESETS: { name: string; type: HabitType; unit: string }[] = [
	{ name: 'Water', type: 'count', unit: 'cups' },
	{ name: 'Coffee', type: 'count', unit: 'cups' },
	{ name: 'Meditation', type: 'minutes', unit: '' },
	{ name: 'Writing', type: 'count', unit: 'words' },
	{ name: 'Reading', type: 'minutes', unit: '' },
];

/** Mood is always on — not user-created and not deactivatable. */
export function isProtectedHabit(habit: Habit): boolean {
	return habit.type === 'mood';
}

export const CREATABLE_HABIT_TYPES = HABIT_TYPES.filter((t) => t.value !== 'mood');

export function habitTypeLabel(type: HabitType): string {
	return HABIT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function formatHabitLogValue(habit: Habit, value: number): string {
	if (habit.type === 'boolean') return formatHabitBooleanValue(value);
	if (habit.type === 'mood') return formatMoodValue(value);
	if (habit.type === 'minutes') return formatMinutes(value);
	return formatCount(value, habit.unit || undefined);
}

export function formatHabitBooleanValue(value: number): string {
	if (value === 1) return 'Yes';
	return 'No';
}

export function formatHabitProgressLabel(habit: Habit, value: number): string {
	if (habit.type === 'boolean') {
		if (value) return 'Done';
		return habit.unit || 'No';
	}
	if (habit.dailyGoal) {
		return `${formatCount(value, habit.unit || undefined)} / ${formatCount(habit.dailyGoal, habit.unit || undefined)}`;
	}
	if (habit.type === 'minutes') return formatMinutes(value);
	return formatCount(value, habit.unit || undefined);
}

export function formatMoodValue(value: number): string {
	return MOOD_SCALE.find((m) => m.value === value)?.label ?? '—';
}

export function isHabitComplete(habit: Habit, log: HabitLog | undefined): boolean {
	if (!log) return false;
	if (habit.type === 'boolean') return log.value === 1;
	if (habit.type === 'mood') return true;
	if (habit.dailyGoal) return log.value >= habit.dailyGoal;
	return log.value > 0;
}

export function habitProgressPct(habit: Habit, log: HabitLog | undefined): number {
	if (habit.type === 'boolean') {
		if (log?.value === 1) return 100;
		return 0;
	}
	if (habit.type === 'mood') {
		if (log !== undefined) return 100;
		return 0;
	}
	const value = log?.value ?? 0;
	if (habit.dailyGoal) return Math.min(100, (value / habit.dailyGoal) * 100);
	if (value > 0) return 100;
	return 0;
}
