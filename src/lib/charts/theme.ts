import { tooltip } from '@tanstack/charts/tooltip';
import { portal } from '@tanstack/charts/tooltip/portal';
import type { ChartPoint, ChartTooltipContent } from '@tanstack/charts';

export { withAlpha } from './color';

/** Fixed pixel width of one day (or week) column. ~7 fit on a phone. */
export const COLUMN_WIDTH = 48;

/** Plot margins shared by the scrolling plot and its pinned value rails. */
export const PLOT_MARGIN = { top: 12, bottom: 28, left: 0, right: 0 } as const;

/** Dark-only tokens (see app.css); read once so charts don't touch the DOM per build. */
export const CHART_GRID = '#2a2a2a';
export const CHART_MUTED = '#888888';
export const CHART_TEXT = '#ffffff';

/** Series colors used across Insights when nothing more specific applies. */
export const SERIES_COLORS = [
	'#b2f042',
	'#60c6ff',
	'#f472b6',
	'#f59e0b',
	'#b286fd',
	'#34d399',
	'#e55733',
	'#818cf8',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2026-09-21` → `9/21` for axis ticks. */
export function shortDate(iso: string): string {
	const [, m, d] = iso.split('-');
	return `${parseInt(m)}/${parseInt(d)}`;
}

/** `2026-09-21` → `Sep 21` for tooltips. */
export function longDate(iso: string): string {
	const [, m, d] = iso.split('-');
	return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}`;
}

export interface TooltipRowSpec<TDatum> {
	label: string | ((datum: TDatum) => string);
	value: (datum: TDatum) => string;
	color?: string;
}

/**
 * Tooltip config: portalled so it escapes the horizontal scroller, placed beside
 * the pointer, titled by a date, with one row per focused point.
 */
export function chartTooltip<TDatum>(
	title: (datum: TDatum) => string,
	row: (point: ChartPoint<TDatum>) => { label: string; value: string; color?: string },
) {
	return {
		use: tooltip,
		portal,
		// Beside the pointer, not the point: in a scrolled chart the nearest point can
		// sit just past the visible edge, which put the tooltip outside the chart.
		anchor: 'pointer' as const,
		className: 'cw-chart-tooltip',
		content: (points: readonly ChartPoint<TDatum>[]): ChartTooltipContent => {
			const first = points[0];
			return {
				title: first ? title(first.datum) : undefined,
				rows: points.map((p) => {
					const r = row(p);
					return { label: r.label, value: r.value, color: r.color ?? p.color };
				}),
			};
		},
	};
}
