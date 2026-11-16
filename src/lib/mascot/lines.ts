/*
 * What the star says (US-066, US-067), and when it welcomes you. Pure: tested in
 * lines.test.ts.
 */
import type { Streak, StreakInfo } from '../streak.ts';

type BadgeStreak = Pick<StreakInfo, 'code' | 'label' | 'unit'> & Streak;

function units(n: number, unit: StreakInfo['unit']): string {
	const word = unit === 'day' ? 'day' : 'week';
	return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** "H 12D", "T 4W"; a badge at 0 reads "A 0" (US-065 2b, 2d). */
export function badgeText(s: BadgeStreak): string {
	if (s.count === 0) return `${s.code} 0`;
	return `${s.code} ${s.count}${s.unit === 'day' ? 'D' : 'W'}`;
}

/** The badge's name for screen readers: "Habits streak: 12 days". */
export function badgeLabel(s: BadgeStreak): string {
	return `${s.label} streak: ${units(s.count, s.unit)}`;
}

/**
 * The star's line on a badge tap (US-066 1b, 1c, 2b): the tracker, the count, and what
 * makes it grow, or that the current day or week already counts.
 */
export function streakLine(s: BadgeStreak): string {
	const period = s.unit === 'day' ? 'today' : 'this week';
	if (s.count === 0) return `${s.label}: 0. Log one ${period} to start.`;
	if (s.currentCounts) {
		return `${s.label}: ${units(s.count, s.unit)}. ${s.unit === 'day' ? 'Today' : 'This week'} counts.`;
	}
	return `${s.label}: ${units(s.count, s.unit)}! Log one ${period} for ${s.count + 1}.`;
}

/** The daily welcome (US-067 1b): the longest streak that is going, or just hello. */
export function welcomeLine(longest: BadgeStreak | null): string {
	if (!longest || longest.count === 0) return 'Morning!';
	return `Morning! ${longest.label}: ${longest.unit} ${longest.count}`;
}

/** The welcome shows on the first open of each calendar day (US-067 1a, 1d). */
export function shouldWelcome(lastWelcome: string | null, today: string): boolean {
	return lastWelcome !== today;
}
