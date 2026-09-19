import { fromIso } from '$lib/date';

export function isoWeekKey(date: Date): string {
	const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const day = utc.getUTCDay() || 7;
	utc.setUTCDate(utc.getUTCDate() + 4 - day);
	const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((utc.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
	return `${utc.getUTCFullYear()}-W${week}`;
}

export function weekCounts(sessionDates: string[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const date of sessionDates) {
		const key = isoWeekKey(fromIso(date));
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return counts;
}

export function computeWeekStreak(
	sessionDates: string[],
	daysPerWeek: number,
	today: Date = new Date(),
): number {
	if (sessionDates.length === 0 || daysPerWeek <= 0) return 0;

	const counts = weekCounts(sessionDates);
	const check = new Date(today);
	let streak = 0;

	if ((counts.get(isoWeekKey(check)) ?? 0) >= daysPerWeek) {
		streak++;
	}
	check.setDate(check.getDate() - 7);

	while ((counts.get(isoWeekKey(check)) ?? 0) >= daysPerWeek) {
		streak++;
		check.setDate(check.getDate() - 7);
	}

	return streak;
}

export function computeCombinedStreak(
	dateSets: string[][],
	threshold = 1,
	today: Date = new Date(),
): number {
	const union = new Set<string>();
	for (const dates of dateSets) {
		for (const d of dates) union.add(d);
	}
	return computeWeekStreak([...union], threshold, today);
}
