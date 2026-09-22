/*
 * Every chart on the Insights page, in page order (v1.10.0, US-043 / US-044).
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
	/** US-044 trial charts carry an "Experimental" label. */
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
		experimental: true,
		wide: true,
	},
	{
		id: 'baseline-growth',
		title: 'Baseline Growth',
		desc: 'Each metric over time against its baseline. Rings mark your best day.',
		features: ['baselines'],
		experimental: true,
		wide: true,
	},
	{
		id: 'show-up-rate',
		title: 'Showing Up',
		desc: 'Share of days you logged each baseline and habit, week by week.',
		features: ['baselines', 'habits'],
		experimental: true,
	},
	{
		id: 'week-vs-week',
		title: 'This Week vs Last Week',
		desc: 'Totals so far this week against the same days last week.',
		features: ['baselines', 'habits', 'practice'],
		experimental: true,
	},
	{
		id: 'day-of-week',
		title: 'Day of Week',
		desc: 'Your average for each weekday.',
		features: ['baselines', 'habits'],
		experimental: true,
	},
	{
		id: 'on-days-when',
		title: 'On Days When…',
		desc: 'Compare a habit or mood on days something happened vs days it didn’t.',
		features: ['habits'],
		experimental: true,
	},
	{
		id: 'time-of-day',
		title: 'Time of Day',
		desc: 'When your baseline entries get logged.',
		features: ['baselines'],
		experimental: true,
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
		id: 'habit-radar',
		title: 'Habit Balance',
		desc: 'Average habit consistency over the selected period.',
		features: ['habits'],
	},
	{
		id: 'health-summary',
		title: 'Health Summary',
		desc: 'Latest weight and 7-day blood pressure.',
		features: ['health'],
		wide: true,
	},
	{
		id: 'weight',
		title: 'Weight Trend',
		desc: 'Body weight over the selected period.',
		features: ['health'],
	},
	{
		id: 'blood-pressure',
		title: 'Blood Pressure',
		desc: 'Daily average systolic and diastolic.',
		features: ['health'],
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
