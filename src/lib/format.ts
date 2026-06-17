type DurationInput = { hours?: number; minutes?: number; seconds?: number };
type DurationFormatOptions = { style?: 'long' | 'short' | 'narrow' | 'digital' };
type DurationFormatConstructor = new (
	locales?: Intl.LocalesArgument,
	options?: DurationFormatOptions,
) => { format: (duration: DurationInput) => string };

const DurationFormat = (Intl as typeof Intl & { DurationFormat?: DurationFormatConstructor })
	.DurationFormat;

const fmtCompact = new Intl.NumberFormat(undefined, {
	notation: 'compact',
	maximumFractionDigits: 1,
});
const fmtInteger = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const fmtTwoDigits = new Intl.NumberFormat(undefined, {
	minimumIntegerDigits: 2,
	maximumFractionDigits: 0,
});
const fmtMinutes = new Intl.NumberFormat(undefined, {
	style: 'unit',
	unit: 'minute',
	unitDisplay: 'short',
});
const fmtRelativeWeeks = new Intl.RelativeTimeFormat(undefined, { style: 'long' });
const pluralRules = new Intl.PluralRules(undefined);
const fmtDurationLong = DurationFormat ? new DurationFormat(undefined, { style: 'long' }) : null;
const fmtDurationNarrow = DurationFormat ? new DurationFormat(undefined, { style: 'narrow' }) : null;

let minuteUnit: string | undefined;

/** Localized minute unit label, e.g. "min". */
export function minuteUnitLabel(): string {
	if (!minuteUnit) {
		minuteUnit = fmtMinutes.formatToParts(1).find((p) => p.type === 'unit')?.value ?? 'min';
	}
	return minuteUnit;
}

/** Rounded minutes from seconds. compact: "42m", default: "42 min". */
export function formatDuration(seconds: number, compact = false): string {
	const minutes = Math.round(seconds / 60);
	if (compact && fmtDurationNarrow) {
		return fmtDurationNarrow.format({ minutes });
	}
	if (!compact && fmtDurationLong) {
		return fmtDurationLong.format({ minutes });
	}
	return compact ? `${minutes}m` : fmtMinutes.format(minutes);
}

/** Minute count with locale unit, e.g. "42 min". */
export function formatMinutes(minutes: number): string {
	return fmtMinutes.format(minutes);
}

/** Elapsed seconds as MM:SS. */
export function formatElapsed(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${fmtTwoDigits.format(m)}:${fmtTwoDigits.format(s)}`;
}

/** Weeks in the past, e.g. "last week" or "3 weeks ago". Empty when weeks <= 0. */
export function formatWeeksAgo(weeks: number): string {
	if (weeks <= 0) return '';
	return fmtRelativeWeeks.format(-weeks, 'week');
}

/** Integer with optional custom unit label. */
export function formatCount(value: number, unit?: string): string {
	const n = fmtInteger.format(value);
	return unit ? `${n} ${unit}` : n;
}

/** e.g. "1 exercise" / "3 exercises" */
export function formatCountWithWord(count: number, singular: string, plural = `${singular}s`): string {
	const word = pluralRules.select(count) === 'one' ? singular : plural;
	return `${fmtInteger.format(count)} ${word}`;
}

/** Compact weight volume. zero: "dash" shows "—", "zero" shows "0". */
export function formatVolume(volume: number, zero: 'dash' | 'zero' = 'dash'): string {
	if (volume >= 1000) return fmtCompact.format(volume);
	if (volume > 0) return fmtInteger.format(volume);
	return zero === 'zero' ? fmtInteger.format(0) : '—';
}
