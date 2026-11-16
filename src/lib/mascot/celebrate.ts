/*
 * When a habit log brings the star (v1.13.0, US-068 3, 4a). Pure: tested in
 * celebrate.test.ts.
 */
import type { Habit } from '../db/types.ts';

/**
 * True when this log takes a habit from under its daily goal to at or over it. A log
 * under the goal, a log that was already at it, Mood, and a habit with no goal never
 * bring the star.
 */
export function reachesDailyGoal(
	habit: Pick<Habit, 'type' | 'dailyGoal'>,
	before: number,
	after: number,
): boolean {
	if (habit.type === 'mood' || !habit.dailyGoal || habit.dailyGoal <= 0) return false;
	return before < habit.dailyGoal && after >= habit.dailyGoal;
}
