import type { Baseline, BaselineDirection, BaselineLog, BaselineMetric } from '$lib/db/types';

export const MAX_BASELINE_METRICS = 2;

export const BASELINE_DIRECTIONS: {
	value: BaselineDirection;
	label: string;
	desc: string;
}[] = [
	{ value: 'up', label: 'Go up', desc: 'A daily floor to meet or beat.' },
	{ value: 'under', label: 'Stay under', desc: 'A daily ceiling to stay at or below.' },
];

export const BASELINE_PRESETS: {
	name: string;
	direction: BaselineDirection;
	metrics: { label: string; target: number }[];
}[] = [
	{
		name: 'Walking',
		direction: 'up',
		metrics: [
			{ label: 'minutes', target: 30 },
			{ label: 'miles', target: 1.25 },
		],
	},
	{ name: 'Writing', direction: 'up', metrics: [{ label: 'words', target: 250 }] },
	{ name: 'Pushups', direction: 'up', metrics: [{ label: 'reps', target: 10 }] },
	{ name: 'Stretching', direction: 'up', metrics: [{ label: 'minutes', target: 5 }] },
	{ name: 'Phone time', direction: 'under', metrics: [{ label: 'minutes', target: 30 }] },
	{ name: 'Added sugar', direction: 'under', metrics: [{ label: 'grams', target: 25 }] },
];

export function directionLabel(direction: BaselineDirection): string {
	if (direction === 'up') return 'Go up';
	return 'Stay under';
}

/** "at least 30 minutes" / "at most 30 minutes" — used in row meta and a11y copy. */
export function targetLabel(direction: BaselineDirection, metric: BaselineMetric): string {
	let qualifier = 'at least';
	if (direction === 'under') qualifier = 'at most';
	return `${qualifier} ${metric.target} ${metric.label}`.trim();
}

/**
 * Summing user-typed decimals (0.6 + 0.7) drifts in binary floating point, and the
 * raw result would be rendered straight into the UI. Four places is well past any
 * precision a hand-entered baseline value carries.
 */
function roundTotal(value: number): number {
	return Math.round(value * 1e4) / 1e4;
}

/** Sum every entry's value for one metric. A day always aggregates by sum. */
export function sumMetric(logs: BaselineLog[], metricId: string): number {
	return roundTotal(logs.reduce((total, log) => total + (log.values[metricId] ?? 0), 0));
}

/** metricId → summed total across the given entries. */
export function totalsFor(baseline: Baseline, logs: BaselineLog[]): Record<string, number> {
	const totals: Record<string, number> = {};
	for (const metric of baseline.metrics) {
		totals[metric.id] = sumMetric(logs, metric.id);
	}
	return totals;
}

/** A metric clears when a floor is met or beaten, or a ceiling is not exceeded. */
export function isMetricCleared(
	direction: Baseline['direction'],
	metric: BaselineMetric,
	total: number,
): boolean {
	if (direction === 'up') return total >= metric.target;
	return total <= metric.target;
}

/** The day clears only when every metric on the baseline clears. */
export function isCleared(baseline: Baseline, totals: Record<string, number>): boolean {
	return baseline.metrics.every((m) => isMetricCleared(baseline.direction, m, totals[m.id] ?? 0));
}

/**
 * 0–100 fill for a progress bar. For 'under' the bar fills as the total climbs
 * toward the ceiling, so a full bar means "at the limit".
 */
export function metricProgressPct(
	direction: Baseline['direction'],
	metric: BaselineMetric,
	total: number,
): number {
	if (metric.target <= 0) return total > 0 ? 100 : 0;
	return Math.min(100, Math.max(0, (total / metric.target) * 100));
}

/** Daily totals for one metric across an ordered list of ISO dates. */
export function dailySeries(logs: BaselineLog[], metricId: string, dates: string[]): number[] {
	const byDate = new Map<string, number>();
	for (const log of logs) {
		byDate.set(log.date, (byDate.get(log.date) ?? 0) + (log.values[metricId] ?? 0));
	}
	return dates.map((d) => roundTotal(byDate.get(d) ?? 0));
}

/** Entries for a day, oldest first, so the UI list order is stable. */
export function entriesForDate(
	logs: BaselineLog[],
	baselineId: string,
	date: string,
): BaselineLog[] {
	return logs
		.filter((l) => l.baselineId === baselineId && l.date === date)
		.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
}
