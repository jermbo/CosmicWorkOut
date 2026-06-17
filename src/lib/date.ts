// Date helpers. All "calendar date" strings are YYYY-MM-DD in the user's LOCAL
// timezone. Using toISOString() here would be a bug: it returns the UTC date,
// which rolls over to the next day in the evening for negative-offset users.

const fmtShortMonthDay = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const fmtLongDate = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
const fmtMonthLong = new Intl.DateTimeFormat(undefined, { month: 'long' });
const fmtMonthDayLong = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' });
const fmtMonthYear = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const fmtWeekdayShort = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const fmtWeekdayShortMonthDay = new Intl.DateTimeFormat(undefined, {
	weekday: 'short',
	month: 'short',
	day: 'numeric',
});
const fmtWeekRange = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const fmtWeekdayNarrow = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });

// Jan 1 2024 is a Monday — stable reference for Monday-first weekday headers.
const MONDAY_REF = new Date(2024, 0, 1);

function mondayPlusDays(days: number): Date {
	const date = new Date(MONDAY_REF);
	date.setDate(MONDAY_REF.getDate() + days);
	return date;
}

function partValue(
	fmt: Intl.DateTimeFormat,
	date: Date,
	type: Intl.DateTimeFormatPartTypes,
): string {
	return fmt.formatToParts(date).find((p) => p.type === type)?.value ?? '';
}

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
	return fmtShortMonthDay.format(fromIso(iso));
}

/** e.g. "June 17, 2026" */
export function formatLongDate(iso: string): string {
	return fmtLongDate.format(fromIso(iso));
}

/** e.g. "June" */
export function formatMonthLong(date: Date): string {
	return fmtMonthLong.format(date);
}

/** e.g. "June 2026" */
export function formatMonthYear(date: Date): string {
	return fmtMonthYear.format(date);
}

/** e.g. "June 17" — day is the calendar day within date's month/year. */
export function formatMonthDayLong(date: Date, day: number): string {
	return fmtMonthDayLong.format(new Date(date.getFullYear(), date.getMonth(), day));
}

/** e.g. "Tue" */
export function formatWeekdayShort(date: Date): string {
	return fmtWeekdayShort.format(date);
}

/** Two-letter weekday label, e.g. "TU" */
export function formatWeekdayAbbrev(date: Date): string {
	return fmtWeekdayShort.format(date).slice(0, 2).toUpperCase();
}

/** e.g. "T" or "M" */
export function formatWeekdayNarrow(date: Date): string {
	return fmtWeekdayNarrow.format(date);
}

/** Monday-first weekday column headers. chars: 1 = narrow, 2 = two-letter short. */
export function weekdayHeadersMondayFirst(chars: 1 | 2 = 2): readonly string[] {
	const fmt = new Intl.DateTimeFormat(undefined, {
		weekday: chars === 1 ? 'narrow' : 'short',
	});
	const labels = Array.from({ length: 7 }, (_, i) => fmt.format(mondayPlusDays(i)));
	return chars === 2 ? labels.map((label) => label.slice(0, 2)) : labels;
}

/** e.g. "Sun, Jun 17" or "Sun · Jun 17" */
export function formatWeekdayShortDate(iso: string, separator = ', '): string {
	const date = fromIso(iso);
	const weekday = partValue(fmtWeekdayShortMonthDay, date, 'weekday');
	const month = partValue(fmtWeekdayShortMonthDay, date, 'month');
	const day = partValue(fmtWeekdayShortMonthDay, date, 'day');
	return `${weekday}${separator}${month} ${day}`;
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
	return fmtWeekRange.formatRange(start, end);
}

export type CalendarCell = { date: string | null; dayNum: number | null };

/** YYYY-MM month key for a date's calendar month. */
export function monthIsoKey(date: Date): string {
	return toLocalIso(new Date(date.getFullYear(), date.getMonth(), 1)).slice(0, 7);
}

/** Number of days in date's calendar month. */
export function daysInMonth(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** Monday-first calendar grid cells for a month, with leading blanks. */
export function monthCalendarCells(year: number, month: number): CalendarCell[] {
	const firstDayMon = (new Date(year, month, 1).getDay() + 6) % 7;
	const totalDays = new Date(year, month + 1, 0).getDate();

	const cells: CalendarCell[] = [];
	for (let i = 0; i < firstDayMon; i++) cells.push({ date: null, dayNum: null });
	for (let d = 1; d <= totalDays; d++) {
		cells.push({ date: toLocalIso(new Date(year, month, d)), dayNum: d });
	}
	return cells;
}
