/*
 * Every chart on the Insights page, in page order (v1.10.0, US-043; trimmed to
 * six in v1.13.0, US-059).
 * The page renders from this list, and Settings → Insights uses it for the
 * show / hide switches. A chart appears only when one of its features is on.
 */

export type InsightFeature = 'habits' | 'practice' | 'activity' | 'health' | 'baselines';

export interface InsightChartDef {
	id: string;
	title: string;
	desc: string;
	/** Shown when any of these features is on. */
	features: readonly InsightFeature[];
	/** Shows an "Experimental" label. No chart uses it since v1.13.0 (US-059). */
	experimental?: boolean;
	/** Spans both columns on wide screens. */
	wide?: boolean;
}

export const INSIGHT_CHARTS: readonly InsightChartDef[] = [
	{
		id: 'mood-habits',
		title: 'Mood vs Habits',
		desc: 'Mood compared to daily coffee and water intake.',
		features: ['habits'],
	},
	{
		id: 'all-habits',
		title: 'All Habits',
		desc: 'Every habit by day. Tap a habit to see it by week and weekday.',
		features: ['habits'],
		wide: true,
	},
	{
		id: 'week-vs-week',
		title: 'This Week vs Last Week',
		desc: 'Totals so far this week against the same days last week.',
		features: ['baselines', 'habits', 'practice'],
	},
	{
		id: 'weekly-volume',
		title: 'Weekly Volume',
		desc: 'Total pounds lifted per week.',
		features: ['practice'],
	},
	{
		id: 'activity-mix',
		title: 'Activity Mix',
		desc: 'Breakdown of activities logged in the selected period.',
		features: ['activity'],
	},
	{
		id: 'health-summary',
		title: 'Health Summary',
		desc: 'Weight and blood pressure, with each reading against the standard zones.',
		features: ['health'],
		wide: true,
	},
];

export const FEATURE_LABELS: Record<InsightFeature, string> = {
	habits: 'Habits',
	practice: 'Practice',
	activity: 'Activity log',
	health: 'Health metrics',
	baselines: 'Baselines',
};

/** Is at least one of the chart's features turned on? */
export function chartAvailable(
	chart: InsightChartDef,
	enabled: Readonly<Record<InsightFeature, boolean>>,
): boolean {
	return chart.features.some((f) => enabled[f]);
}

/** "Habits is off" / "Baselines and Habits are off" — why a chart can't show. */
export function unavailableReason(chart: InsightChartDef): string {
	const names = chart.features.map((f) => FEATURE_LABELS[f]);
	if (names.length === 1) return `${names[0]} is off`;
	return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} are off`;
}
