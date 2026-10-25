import { tooltip } from '@tanstack/charts/tooltip';
import { portal } from '@tanstack/charts/tooltip/portal';
import type { ChartPoint, ChartTooltipContent } from '@tanstack/charts';

export { withAlpha } from './color';

/** Fixed pixel width of one day (or week) column. ~7 fit on a phone. */
export const COLUMN_WIDTH = 48;

/** Plot margins shared by the scrolling plot and its pinned value rails. */
export const PLOT_MARGIN = { top: 12, bottom: 28, left: 0, right: 0 } as const;

/**
 * Chart colors that can't be CSS variables — SVG presentation attributes don't resolve
 * `var()`. The app is dark only (v1.12.0), so there is one palette. These hex values
 * match the `--field-*` tokens in app.css. Axis text uses `currentColor`.
 */
export const FIELD = {
	train: '#4ebdf7',
	habit: '#f8907f',
	base: '#be9df7',
	health: '#eed059',
	active: '#5aca94',
	red: '#ff6557',
	paper: '#f2f0ea',
} as const;

/** The accent (Training field) as a hex, for charts. */
export const CHART_ACCENT = FIELD.train;

const PALETTE = {
	grid: '#262625',
	outline: '#0a0a0a',
	heatEmpty: '#1c1c1b',
	heatNeutral: '#3a3936',
} as const;

export function chartPalette() {
	return PALETTE;
}

export function chartGrid(): string {
	return PALETTE.grid;
}

/** Series colors used across Insights when nothing more specific applies. */
export const SERIES_COLORS = [
	FIELD.train,
	FIELD.health,
	FIELD.habit,
	FIELD.active,
	FIELD.base,
	'#e5a14b',
	'#e88fcb',
	FIELD.paper,
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
 * the pointer, titled by a date, with one row per focused point. `row` may return
 * null to leave a point out — marker marks would otherwise repeat a line's value.
 */
export function chartTooltip<TDatum>(
	title: (datum: TDatum) => string,
	row: (point: ChartPoint<TDatum>) => { label: string; value: string; color?: string } | null,
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
				rows: points.flatMap((p) => {
					const r = row(p);
					if (!r) return [];
					return [{ label: r.label, value: r.value, color: r.color ?? p.color }];
				}),
			};
		},
	};
}
