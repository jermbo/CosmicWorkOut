import type { Habit, HabitLog, HabitType } from '$lib/db/types';

export const HABIT_TYPES: { value: HabitType; label: string; desc: string }[] = [
	{ value: 'times', label: 'Times', desc: 'Tap to increment — no unit (e.g. coffee, supplements)' },
	{ value: 'minutes', label: 'Minutes', desc: 'Numeric duration input (e.g. meditation)' },
	{ value: 'count', label: 'Count', desc: 'Counter with a custom unit label (e.g. glasses, pages)' },
	{ value: 'boolean', label: 'Yes / No', desc: 'Simple toggle — done or not done' },
	{ value: 'mood', label: 'Mood', desc: 'Track how you feel on a - 5 to +5 scale' },
];

export const HABIT_PRESETS: { name: string; type: HabitType; unit: string }[] = [
	{ name: 'Meditation', type: 'minutes', unit: '' },
	{ name: 'Writing', type: 'count', unit: 'words' },
	{ name: 'Reading', type: 'count', unit: 'pages' },
	{ name: 'Water', type: 'count', unit: 'glasses' },
	{ name: 'Coffee', type: 'times', unit: '' },
	{ name: 'Alcohol', type: 'boolean', unit: '' },
	{ name: 'Mood', type: 'mood', unit: '' },
];

export function habitTypeLabel(type: HabitType): string {
	return HABIT_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** Whether a habit counts as "done" given its log — the single source of truth. */
export function isHabitComplete(habit: Habit, log: HabitLog | undefined): boolean {
	if (!log) return false;
	if (habit.type === 'boolean') return log.value === 1;
	if (habit.type === 'mood') return true;
	if (habit.dailyGoal) return log.value >= habit.dailyGoal;
	return log.value > 0;
}

/** Completion progress for a habit given its log, 0–100. */
export function habitProgressPct(habit: Habit, log: HabitLog | undefined): number {
	if (habit.type === 'boolean') return log?.value === 1 ? 100 : 0;
	if (habit.type === 'mood') return log !== undefined ? 100 : 0;
	const value = log?.value ?? 0;
	if (habit.dailyGoal) return Math.min(100, (value / habit.dailyGoal) * 100);
	return value > 0 ? 100 : 0;
}
