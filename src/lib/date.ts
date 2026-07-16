const fmtShortMonthDay = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
});
const fmtLongDate = new Intl.DateTimeFormat(undefined, {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
});
const fmtMonthLong = new Intl.DateTimeFormat(undefined, { month: 'long' });
const fmtMonthDayLong = new Intl.DateTimeFormat(undefined, {
	month: 'long',
	day: 'numeric',
});
const fmtMonthYear = new Intl.DateTimeFormat(undefined, {
	month: 'long',
	year: 'numeric',
});
const fmtWeekdayShort = new Intl.DateTimeFormat(undefined, {
	weekday: 'short',
});
const fmtWeekdayShortMonthDay = new Intl.DateTimeFormat(undefined, {
	weekday: 'short',
	month: 'short',
	day: 'numeric',
});
const fmtWeekRange = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
});
const fmtWeekdayNarrow = new Intl.DateTimeFormat(undefined, {
	weekday: 'narrow',
});

const MONDAY_REFERENCE = new Date(2024, 0, 1);

function mondayPlusDays(days: number): Date {
	const date = new Date(MONDAY_REFERENCE);
	date.setDate(MONDAY_REFERENCE.getDate() + days);
	return date;
}

function partValue(
	fmt: Intl.DateTimeFormat,
	date: Date,
	type: Intl.DateTimeFormatPartTypes,
): string {
	return fmt.formatToParts(date).find((p) => p.type === type)?.value ?? '';
}

export function toLocalIso(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function todayIso(): string {
	return toLocalIso(new Date());
}

export function fromIso(iso: string): Date {
	return new Date(`${iso}T00:00:00`);
}

export function addDays(iso: string, days: number): string {
	const date = fromIso(iso);
	date.setDate(date.getDate() + days);
	return toLocalIso(date);
}

export function formatShortDate(iso: string): string {
	return fmtShortMonthDay.format(fromIso(iso));
}

export function formatLongDate(iso: string): string {
	return fmtLongDate.format(fromIso(iso));
}

export function formatMonthLong(date: Date): string {
	return fmtMonthLong.format(date);
}

export function formatMonthYear(date: Date): string {
	return fmtMonthYear.format(date);
}

export function formatMonthDayLong(date: Date, day: number): string {
	return fmtMonthDayLong.format(new Date(date.getFullYear(), date.getMonth(), day));
}

export function formatWeekdayShort(date: Date): string {
	return fmtWeekdayShort.format(date);
}

export function formatWeekdayAbbrev(date: Date): string {
	return fmtWeekdayShort.format(date).slice(0, 2).toUpperCase();
}

export function formatWeekdayNarrow(date: Date): string {
	return fmtWeekdayNarrow.format(date);
}

export function weekdayHeadersMondayFirst(chars: 1 | 2 = 2): readonly string[] {
	let weekday: 'narrow' | 'short' = 'short';
	if (chars === 1) weekday = 'narrow';
	const fmt = new Intl.DateTimeFormat(undefined, { weekday });
	const labels = Array.from({ length: 7 }, (_, i) => fmt.format(mondayPlusDays(i)));
	if (chars === 2) {
		return labels.map((label) => label.slice(0, 2));
	}
	return labels;
}

export function formatWeekdayShortDate(iso: string, separator = ', '): string {
	const date = fromIso(iso);
	const weekday = partValue(fmtWeekdayShortMonthDay, date, 'weekday');
	const month = partValue(fmtWeekdayShortMonthDay, date, 'month');
	const day = partValue(fmtWeekdayShortMonthDay, date, 'day');
	return `${weekday}${separator}${month} ${day}`;
}

export function mondayOf(iso: string): string {
	const date = fromIso(iso);
	const day = date.getDay();
	date.setDate(date.getDate() - ((day + 6) % 7));
	return toLocalIso(date);
}

export function formatWeekRange(weekStartIso: string): string {
	const start = fromIso(weekStartIso);
	const end = fromIso(weekStartIso);
	end.setDate(end.getDate() + 6);
	return fmtWeekRange.formatRange(start, end);
}

export type CalendarCell = { date: string | null; dayNum: number | null };

export function monthIsoKey(date: Date): string {
	return toLocalIso(new Date(date.getFullYear(), date.getMonth(), 1)).slice(0, 7);
}

export function daysInMonth(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

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
