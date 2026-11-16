/*
 * When a habit log brings the star (v1.13.0, US-068 3, 4a). Pure: tested in
 * celebrate.test.ts.
 */
import type { Habit } from '../db/types.ts';

/**
 * True when this log takes a habit from not done to done for the day: under its daily
 * goal to at or over it. A habit with no goal (or a goal of 0), and a Yes / No habit,
 * is done with its first log, as on its card (`isHabitComplete`). A log under the goal,
 * a log that was already done, and Mood never bring the star.
 */
export function reachesDailyGoal(
	habit: Pick<Habit, 'type' | 'dailyGoal'>,
	before: number,
	after: number,
): boolean {
	if (habit.type === 'mood') return false;
	const goal = habit.dailyGoal && habit.dailyGoal > 0 ? habit.dailyGoal : 1;
	return before < goal && after >= goal;
}
