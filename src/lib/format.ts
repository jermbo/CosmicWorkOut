type DurationInput = { hours?: number; minutes?: number; seconds?: number };
type DurationFormatOptions = {
	style?: 'long' | 'short' | 'narrow' | 'digital';
};
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
const fmtInteger = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 0,
});
const fmtTwoDigits = new Intl.NumberFormat(undefined, {
	minimumIntegerDigits: 2,
	maximumFractionDigits: 0,
});
const fmtMinutes = new Intl.NumberFormat(undefined, {
	style: 'unit',
	unit: 'minute',
	unitDisplay: 'short',
});
const fmtRelativeWeeks = new Intl.RelativeTimeFormat(undefined, {
	style: 'long',
});
const pluralRules = new Intl.PluralRules(undefined);

function makeDurationFormat(style: DurationFormatOptions['style']) {
	if (!DurationFormat) {
		return null;
	}
	return new DurationFormat(undefined, { style });
}

const fmtDurationLong = makeDurationFormat('long');
const fmtDurationNarrow = makeDurationFormat('narrow');

let minuteUnit: string | undefined;

export function minuteUnitLabel(): string {
	if (!minuteUnit) {
		minuteUnit = fmtMinutes.formatToParts(1).find((p) => p.type === 'unit')?.value ?? 'min';
	}
	return minuteUnit;
}

export function formatDuration(seconds: number, compact = false): string {
	const minutes = Math.round(seconds / 60);
	if (compact && fmtDurationNarrow) {
		return fmtDurationNarrow.format({ minutes });
	}
	if (!compact && fmtDurationLong) {
		return fmtDurationLong.format({ minutes });
	}
	if (compact) {
		return `${minutes}m`;
	}
	return fmtMinutes.format(minutes);
}

export function formatMinutes(minutes: number): string {
	return fmtMinutes.format(minutes);
}

export function formatElapsed(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${fmtTwoDigits.format(m)}:${fmtTwoDigits.format(s)}`;
}

export function formatWeeksAgo(weeks: number): string {
	if (weeks <= 0) return '';
	return fmtRelativeWeeks.format(-weeks, 'week');
}

export function formatCount(value: number, unit?: string): string {
	const n = fmtInteger.format(value);
	if (unit) {
		return `${n} ${unit}`;
	}
	return n;
}

export function formatCountWithWord(
	count: number,
	singular: string,
	plural = `${singular}s`,
): string {
	const isSingular = pluralRules.select(count) === 'one';
	if (isSingular) {
		return `${fmtInteger.format(count)} ${singular}`;
	}
	return `${fmtInteger.format(count)} ${plural}`;
}

export function formatVolume(volume: number, zero: 'dash' | 'zero' = 'dash'): string {
	if (volume >= 1000) return fmtCompact.format(volume);
	if (volume > 0) return fmtInteger.format(volume);
	if (zero === 'zero') return fmtInteger.format(0);
	return '—';
}
