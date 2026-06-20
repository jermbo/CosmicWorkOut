import {
	Chart,
	CategoryScale,
	LinearScale,
	RadialLinearScale,
	BarController,
	BarElement,
	LineController,
	LineElement,
	PointElement,
	DoughnutController,
	ArcElement,
	RadarController,
	Legend,
	Tooltip,
} from 'chart.js';
import { toLocalIso } from '$lib/date';

Chart.register(
	CategoryScale,
	LinearScale,
	RadialLinearScale,
	BarController,
	BarElement,
	LineController,
	LineElement,
	PointElement,
	DoughnutController,
	ArcElement,
	RadarController,
	Legend,
	Tooltip,
);

// ── Palettes ──────────────────────────────────────────────────────────────────
// Warm/cool alternating so adjacent doughnut slices never clash.
export const ACTIVITY_PALETTE = [
	'#60c6ff', '#b2f042', '#f472b6', '#f59e0b', '#818cf8',
	'#e55733', '#34d399', '#b286fd', '#4ade80', '#fb923c',
	'#e879f9', '#94a3b8',
];

// ── Date range types ──────────────────────────────────────────────────────────
export type RangeKey = 'this-week' | 'last-7' | 'mtd' | 'ytd' | 'custom';

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
	{ key: 'this-week', label: 'This week' },
	{ key: 'last-7',    label: 'Last 7d' },
	{ key: 'mtd',       label: 'MTD' },
	{ key: 'ytd',       label: 'YTD' },
	{ key: 'custom',    label: 'Custom' },
];

// ── Date helpers ──────────────────────────────────────────────────────────────
export function getMondayOf(dateStr: string): string {
	const d = new Date(dateStr + 'T00:00:00');
	const dow = d.getDay();
	d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
	return toLocalIso(d);
}

export function buildDatesBetween(start: string, end: string): string[] {
	const dates: string[] = [];
	const d = new Date(start + 'T00:00:00');
	const endD = new Date(end + 'T00:00:00');
	while (d <= endD) {
		dates.push(toLocalIso(d));
		d.setDate(d.getDate() + 1);
	}
	return dates;
}

export function xLabelsFor(dates: string[]): string[] {
	const step = dates.length <= 14 ? 1 : dates.length <= 90 ? 7 : 30;
	return dates.map((d, i) => (i % step === 0 ? d.slice(5).replace('-', '/') : ''));
}

export function computeRange(
	key: RangeKey,
	cs: string,
	ce: string,
): { start: string; end: string } {
	const today = new Date();
	const todayStr = toLocalIso(today);
	switch (key) {
		case 'this-week':
			return { start: getMondayOf(todayStr), end: todayStr };
		case 'last-7': {
			const d = new Date(today);
			d.setDate(d.getDate() - 6);
			return { start: toLocalIso(d), end: todayStr };
		}
		case 'mtd':
			return { start: toLocalIso(new Date(today.getFullYear(), today.getMonth(), 1)), end: todayStr };
		case 'ytd':
			return { start: toLocalIso(new Date(today.getFullYear(), 0, 1)), end: todayStr };
		case 'custom':
			return { start: cs, end: ce };
	}
}

// ── CSS var reader ────────────────────────────────────────────────────────────
export function cssVar(name: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ── Shared chart theme tokens ─────────────────────────────────────────────────
export function chartTheme() {
	const accent        = cssVar('--color-accent');
	const textPrimary   = cssVar('--color-text-primary');
	const textSecondary = cssVar('--color-text-secondary');
	const borderColor   = cssVar('--color-border');

	const gridOpts = { color: borderColor };
	const tickOpts = {
		color: textSecondary,
		font: { family: 'Inter, sans-serif', size: 11 },
		autoSkip: true,
		maxRotation: 0,
	};
	const legendOpts = { color: textPrimary, font: { family: 'Inter, sans-serif', size: 12 } };

	return { accent, textPrimary, textSecondary, borderColor, gridOpts, tickOpts, legendOpts };
}
