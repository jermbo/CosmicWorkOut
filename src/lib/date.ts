// Date helpers. All "calendar date" strings are YYYY-MM-DD in the user's LOCAL
// timezone. Using toISOString() here would be a bug: it returns the UTC date,
// which rolls over to the next day in the evening for negative-offset users.

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const MONTHS_SHORT = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
] as const;

export const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
] as const;

/** Local calendar date for a Date, formatted YYYY-MM-DD. */
export function toLocalIso(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/** Today's local calendar date, formatted YYYY-MM-DD. */
export function todayIso(): string {
	return toLocalIso(new Date());
}

/** Parse a YYYY-MM-DD string as a local Date at midnight. */
export function fromIso(iso: string): Date {
	return new Date(`${iso}T00:00:00`);
}

/** Add (or subtract) days to a YYYY-MM-DD string, returning YYYY-MM-DD. */
export function addDays(iso: string, days: number): string {
	const date = fromIso(iso);
	date.setDate(date.getDate() + days);
	return toLocalIso(date);
}

/** e.g. "Jun 17" */
export function formatShortDate(iso: string): string {
	const date = fromIso(iso);
	return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/** e.g. "June 17, 2026" */
export function formatLongDate(iso: string): string {
	const date = fromIso(iso);
	return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** e.g. "Sun, Jun 17" or "Sun · Jun 17" */
export function formatWeekdayShortDate(iso: string, separator = ', '): string {
	const date = fromIso(iso);
	return `${DAYS_SHORT[date.getDay()]}${separator}${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/** Monday of the week containing iso, as YYYY-MM-DD. */
export function mondayOf(iso: string): string {
	const date = fromIso(iso);
	const day = date.getDay();
	date.setDate(date.getDate() - ((day + 6) % 7));
	return toLocalIso(date);
}

/** e.g. "Jun 10 – 16" or "Jun 30 – Jul 6" */
export function formatWeekRange(weekStartIso: string): string {
	const start = fromIso(weekStartIso);
	const end = fromIso(weekStartIso);
	end.setDate(end.getDate() + 6);

	const startLabel = `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}`;
	const endLabel =
		start.getMonth() === end.getMonth()
			? String(end.getDate())
			: `${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;

	return `${startLabel} – ${endLabel}`;
}
