/*
 * Date-range helpers shared by Insights and Baselines. Chart rendering lives in
 * src/lib/charts/ (TanStack Charts); nothing here imports a chart library.
 */
import { toLocalIso } from '$lib/date';

export const ACTIVITY_PALETTE = [
	'#60c6ff',
	'#b2f042',
	'#f472b6',
	'#f59e0b',
	'#818cf8',
	'#e55733',
	'#34d399',
	'#b286fd',
	'#4ade80',
	'#fb923c',
	'#e879f9',
	'#94a3b8',
];

export type RangeKey = 'this-week' | 'last-7' | 'mtd' | 'ytd' | 'custom';

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
	{ key: 'this-week', label: 'This week' },
	{ key: 'last-7', label: 'Last 7d' },
	{ key: 'mtd', label: 'MTD' },
	{ key: 'ytd', label: 'YTD' },
	{ key: 'custom', label: 'Custom' },
];

export function getMondayOf(dateStr: string): string {
	const d = new Date(dateStr + 'T00:00:00');
	const dow = d.getDay();
	const offsetToMonday = dowOffsetToMonday(dow);
	d.setDate(d.getDate() + offsetToMonday);
	return toLocalIso(d);
}

function dowOffsetToMonday(dow: number): number {
	if (dow === 0) return -6;
	return 1 - dow;
}

export function buildDatesBetween(start: string, end: string): string[] {
	const dates: string[] = [];
	const d = new Date(start + 'T00:00:00');
	const endD = new Date(end + 'T00:00:00');
	while (d <= endD) {
		dates.push(toLocalIso(d));
		d.setDate(d.getDate() + 1);
	}
	return dates;
}

export function computeRange(
	key: RangeKey,
	cs: string,
	ce: string,
): { start: string; end: string } {
	const today = new Date();
	const todayStr = toLocalIso(today);
	switch (key) {
		case 'this-week':
			return { start: getMondayOf(todayStr), end: todayStr };
		case 'last-7': {
			const d = new Date(today);
			d.setDate(d.getDate() - 6);
			return { start: toLocalIso(d), end: todayStr };
		}
		case 'mtd':
			return {
				start: toLocalIso(new Date(today.getFullYear(), today.getMonth(), 1)),
				end: todayStr,
			};
		case 'ytd':
			return {
				start: toLocalIso(new Date(today.getFullYear(), 0, 1)),
				end: todayStr,
			};
		case 'custom':
			return { start: cs, end: ce };
	}
}
