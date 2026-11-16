import { computeStreak, habitStreakDates, STREAK_TRACKERS } from '#lib/streak';
import type { Streak, StreakInfo, StreakTracker } from '#lib/streak';
import { programStore } from './program.svelte';
import { habitStore } from './habits.svelte';
import { activityStore } from './activities.svelte';
import { healthStore } from './health.svelte';
import { baselineStore } from './baselines.svelte';
import { prefsStore } from './prefs.svelte';

export type TrackerStreak = StreakInfo & Streak;

/**
 * One streak for each tracker (US-065), counted from the records that exist. Nothing is
 * stored. A streak shows only while its tracker toggle is on.
 */
class StreakStore {
	/** Bumped when the day changes, so "today" in the counts moves with it. */
	private today = $state(new Date());

	private dates = $derived<Record<StreakTracker, Iterable<string>>>({
		practice: programStore.sessions.map((s) => s.date),
		habits: habitStreakDates(
			habitStore.logs,
			new Set(habitStore.habits.filter((h) => h.type === 'mood').map((h) => h.id)),
		),
		activity: activityStore.activities.map((a) => a.date),
		health: healthStore.readings.map((r) => r.date),
		baselines: baselineStore.logs.map((l) => l.date),
	});

	private enabled = $derived<Record<StreakTracker, boolean>>({
		practice: prefsStore.practiceEnabled,
		habits: prefsStore.habitsEnabled,
		activity: prefsStore.activityLogEnabled,
		health: prefsStore.healthMetricsEnabled,
		baselines: prefsStore.baselinesEnabled,
	});

	/** Every streak of a tracker that is on, in badge order. */
	visible = $derived<TrackerStreak[]>(
		STREAK_TRACKERS.filter((info) => this.enabled[info.tracker]).map((info) => ({
			...info,
			...computeStreak(this.dates[info.tracker], info.unit, this.today),
		})),
	);

	/** The longest streak that is going, for the daily welcome (US-067). */
	longest = $derived<TrackerStreak | null>(
		this.visible.reduce<TrackerStreak | null>(
			(best, s) => (s.count > 0 && (!best || s.count > best.count) ? s : best),
			null,
		),
	);

	refreshToday(): void {
		this.today = new Date();
	}
}

export const streakStore = new StreakStore();
