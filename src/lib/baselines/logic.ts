import type {
	Baseline,
	BaselineLog,
	BaselineMeasure,
	BaselineMetric,
	DistanceUnit,
} from '$lib/db/types';

/*
 * Baselines v1.10.0 (US-037 / US-038):
 * - 1 to n metrics, each a Duration, Distance, or Count.
 * - Logging anything marks the baseline done for the day. Values never fail a day.
 * - Each metric is compared to its baseline as a plain signed difference.
 */

export const BASELINE_MEASURES: { value: BaselineMeasure; label: string; desc: string }[] = [
	{ value: 'duration', label: 'Duration', desc: 'Time — meditation, stretching, reading' },
	{ value: 'distance', label: 'Distance', desc: 'How far — walk, bike, run, swim' },
	{ value: 'count', label: 'Count', desc: 'A number of things — reps, words, pages' },
];

export const DISTANCE_UNITS: { value: DistanceUnit; label: string }[] = [
	{ value: 'mi', label: 'mi' },
	{ value: 'km', label: 'km' },
	{ value: 'm', label: 'm' },
	{ value: 'yd', label: 'yd' },
];

/** A metric as edited in the form — no id until saved. */
export interface BaselineMetricDraft {
	/** Present when editing an existing metric. */
	id?: string;
	name: string;
	measure: BaselineMeasure;
	baseline: number;
	unit?: DistanceUnit;
	label?: string;
}

export const BASELINE_PRESETS: { name: string; metrics: BaselineMetricDraft[] }[] = [
	{
		name: 'Daily 10',
		metrics: [
			{ name: 'Pushups', measure: 'count', baseline: 10, label: 'reps' },
			{ name: 'Jumping jacks', measure: 'count', baseline: 10, label: 'reps' },
			{ name: 'Walk', measure: 'duration', baseline: 10 },
			{ name: 'Lunges', measure: 'count', baseline: 10, label: 'reps' },
		],
	},
	{
		name: 'Bike ride',
		metrics: [
			{ name: 'Distance', measure: 'distance', baseline: 5, unit: 'mi' },
			{ name: 'Time', measure: 'duration', baseline: 30 },
		],
	},
	{
		name: 'Reading',
		metrics: [
			{ name: 'Time', measure: 'duration', baseline: 30 },
			{ name: 'Pages', measure: 'count', baseline: 20, label: 'pages' },
		],
	},
	{ name: 'Meditation', metrics: [{ name: 'Time', measure: 'duration', baseline: 10 }] },
	{
		name: 'Writing',
		metrics: [{ name: 'Words', measure: 'count', baseline: 250, label: 'words' }],
	},
	{
		name: 'Phone locked away',
		metrics: [{ name: 'Time', measure: 'duration', baseline: 30 }],
	},
];

/**
 * Summing user-typed decimals (0.6 + 0.7) drifts in binary floating point, and the
 * raw result would be rendered straight into the UI. Four places is well past any
 * precision a hand-entered baseline value carries.
 */
export function roundTotal(value: number): number {
	return Math.round(value * 1e4) / 1e4;
}

/** Metrics still shown on the baseline (removed ones keep their logs, hidden). */
export function visibleMetrics(baseline: Baseline): BaselineMetric[] {
	return baseline.metrics.filter((m) => !m.removed);
}

/** A stored baseline from before v1.10.0 — has a direction, or metrics without a measure. */
export function isLegacyBaseline(value: unknown): boolean {
	if (typeof value !== 'object' || value === null) return true;
	const b = value as { direction?: unknown; metrics?: unknown };
	if ('direction' in b) return true;
	if (!Array.isArray(b.metrics)) return true;
	return b.metrics.some(
		(m) =>
			typeof m !== 'object' ||
			m === null ||
			typeof (m as { measure?: unknown }).measure !== 'string',
	);
}

// ── Duration text ─────────────────────────────────────────────

/**
 * Minutes → readable time. 28 → "28 min", 7.5 → "7:30", 65 → "1 h 5 min".
 * Fractional minutes use m:ss so a runner's pace reads naturally.
 */
export function formatDuration(minutes: number): string {
	const totalSeconds = Math.round(Math.abs(minutes) * 60);
	const sign = minutes < 0 ? '−' : '';
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	if (h > 0) {
		if (s > 0) return `${sign}${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
		return m > 0 ? `${sign}${h} h ${m} min` : `${sign}${h} h`;
	}
	if (s > 0) return `${sign}${m}:${String(s).padStart(2, '0')}`;
	return `${sign}${m} min`;
}

/**
 * Parse a duration typed by the user into minutes.
 * "30" → 30 · "7.5" → 7.5 · "7:30" (m:ss) → 7.5 · "1:05:00" (h:mm:ss) → 65.
 * Returns null for anything else.
 */
export function parseDuration(text: string): number | null {
	const t = text.trim();
	if (t === '') return null;
	if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
	const parts = t.split(':');
	if (parts.length < 2 || parts.length > 3) return null;
	if (!parts.every((p) => /^\d+$/.test(p))) return null;
	const nums = parts.map(Number);
	if (nums.slice(1).some((n) => n >= 60)) return null;
	if (nums.length === 2) return roundTotal(nums[0] + nums[1] / 60);
	return roundTotal(nums[0] * 60 + nums[1] + nums[2] / 60);
}

/** Minutes → the text a duration input starts with ("30" or "7:30"). */
export function durationInputText(minutes: number): string {
	if (Number.isInteger(minutes)) return String(minutes);
	const totalSeconds = Math.round(minutes * 60);
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Values and units ──────────────────────────────────────────

/** Short unit for a metric: "min", "mi", "reps". */
export function metricUnit(metric: Pick<BaselineMetric, 'measure' | 'unit' | 'label'>): string {
	if (metric.measure === 'duration') return 'min';
	if (metric.measure === 'distance') return metric.unit ?? 'mi';
	return metric.label?.trim() ?? '';
}

/** A value with its unit: "28 min", "5.5 mi", "30 reps". */
export function formatValue(
	metric: Pick<BaselineMetric, 'measure' | 'unit' | 'label'>,
	value: number,
): string {
	if (metric.measure === 'duration') return formatDuration(value);
	return `${roundTotal(value)} ${metricUnit(metric)}`.trim();
}

/** "Pushups · 10 reps" — the baseline as a sentence fragment. */
export function baselineSummary(metric: BaselineMetric): string {
	return `${metric.name} · ${formatValue(metric, metric.baseline)}`;
}

/** Day total minus the baseline. Positive = more than the floor. */
export function differenceFromBaseline(metric: BaselineMetric, total: number): number {
	return roundTotal(total - metric.baseline);
}

/**
 * Signed, neutral comparison text: "+20", "−2 min", "0".
 * Uses a real minus sign so + and − read with equal weight.
 */
export function formatDifference(metric: BaselineMetric, diff: number): string {
	if (diff === 0) return '0';
	const sign = diff > 0 ? '+' : '−';
	if (metric.measure === 'duration') {
		return `${sign}${formatDuration(Math.abs(diff))}`;
	}
	const unit = metric.measure === 'distance' ? ` ${metricUnit(metric)}` : '';
	return `${sign}${roundTotal(Math.abs(diff))}${unit}`;
}

// ── Aggregation ───────────────────────────────────────────────

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

/** Did any entry record a value for this metric? Blank metrics show as "not logged". */
export function isMetricLogged(logs: BaselineLog[], metricId: string): boolean {
	return logs.some((l) => typeof l.values[metricId] === 'number');
}

/** Logging anything marks the baseline done for that day. */
export function isDone(logs: BaselineLog[]): boolean {
	return logs.length > 0;
}

/** Daily totals for one metric across an ordered list of ISO dates. Missing days are 0. */
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

/**
 * Merge edited drafts into a baseline's metrics.
 * - Drafts with an id update that metric (its measure never changes).
 * - Drafts without an id become new metrics, via `newId`.
 * - Existing metrics missing from the drafts are marked removed (logs kept).
 * Order follows the drafts; removed metrics trail behind.
 */
export function mergeMetrics(
	existing: BaselineMetric[],
	drafts: BaselineMetricDraft[],
	newId: () => string,
): BaselineMetric[] {
	const byId = new Map(existing.map((m) => [m.id, m]));
	const kept = new Set<string>();
	const merged: BaselineMetric[] = drafts.map((d) => {
		const prior = d.id ? byId.get(d.id) : undefined;
		const measure = prior?.measure ?? d.measure;
		const metric: BaselineMetric = {
			id: prior?.id ?? newId(),
			name: d.name.trim(),
			measure,
			baseline: d.baseline,
		};
		if (measure === 'distance') metric.unit = d.unit ?? prior?.unit ?? 'mi';
		if (measure === 'count') metric.label = (d.label ?? prior?.label ?? '').trim();
		if (prior) kept.add(prior.id);
		return metric;
	});
	const removed = existing.filter((m) => !kept.has(m.id)).map((m) => ({ ...m, removed: true }));
	return [...merged, ...removed];
}
