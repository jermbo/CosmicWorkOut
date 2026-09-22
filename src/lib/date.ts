const fmtShortMonthDay = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
});
const fmtMonthLong = new Intl.DateTimeFormat(undefined, { month: 'long' });
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

/** Clock time from an ISO datetime — orders multiple same-day entries for the reader. */
export function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatMonthLong(date: Date): string {
	return fmtMonthLong.format(date);
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
