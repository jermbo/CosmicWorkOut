/**
 * Pure axis math shared by every chart. Kept framework- and library-free so the
 * pinned value rail and the scrolling plot compute the exact same domain and ticks.
 */

export interface NiceAxis {
	domain: [number, number];
	ticks: number[];
}

/**
 * A pinned rail beside a scrolling plot: either numeric ticks (`axis`) or evenly
 * spaced category names (`categories`, e.g. habit rows in a heat chart).
 */
export interface AxisRail {
	axis?: NiceAxis;
	categories?: readonly string[];
	format?: (value: number) => string;
	/** Short unit shown above the rail, e.g. "lb". */
	unit?: string;
	/** Rail width in px (default 36). */
	width?: number;
}

export interface NiceAxisOptions {
	/** Preferred tick count; the result may differ by one or two. */
	count?: number;
	/** Force the domain to include zero (bars, totals). */
	includeZero?: boolean;
	/** Fixed bounds win over the data (e.g. mood is always −5…+5). */
	min?: number;
	max?: number;
}

const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

/** Step between "nice" ticks (1, 2, 5 × 10^n) for a span and target count. */
export function niceStep(span: number, count: number): number {
	if (!(span > 0) || count < 1) return 1;
	const raw = span / count;
	const power = Math.floor(Math.log10(raw));
	const base = 10 ** power;
	const error = raw / base;
	let factor = 1;
	if (error >= E10) factor = 10;
	else if (error >= E5) factor = 5;
	else if (error >= E2) factor = 2;
	return factor * base;
}

/** Round away float noise such as 0.30000000000000004. */
function clean(value: number): number {
	return Number.parseFloat(value.toPrecision(12));
}

/**
 * Domain and tick values covering every finite value, rounded out to nice steps.
 * An empty or flat series still yields a usable, non-degenerate axis.
 */
export function niceAxis(values: readonly number[], options: NiceAxisOptions = {}): NiceAxis {
	const count = options.count ?? 4;
	const finite = values.filter((v) => Number.isFinite(v));

	let lo = finite.length > 0 ? Math.min(...finite) : 0;
	let hi = finite.length > 0 ? Math.max(...finite) : 1;
	if (options.includeZero) {
		lo = Math.min(lo, 0);
		hi = Math.max(hi, 0);
	}
	if (options.min !== undefined) lo = options.min;
	if (options.max !== undefined) hi = options.max;
	if (lo === hi) {
		if (lo === 0) hi = 1;
		else if (lo > 0) lo = options.includeZero ? 0 : lo - Math.abs(lo) * 0.1;
		else hi = hi + Math.abs(hi) * 0.1;
		if (lo === hi) hi = lo + 1;
	}

	const step = niceStep(hi - lo, count);
	const niceLo = options.min !== undefined ? lo : Math.floor(lo / step) * step;
	const niceHi = options.max !== undefined ? hi : Math.ceil(hi / step) * step;

	const ticks: number[] = [];
	const first = Math.ceil(niceLo / step) * step;
	for (let v = first; v <= niceHi + step * 1e-9; v += step) {
		ticks.push(clean(v));
	}
	return { domain: [clean(niceLo), clean(niceHi)], ticks };
}

/** Vertical pixel offset of a value inside a plot of the given height (top = max). */
export function valueToOffset(value: number, domain: [number, number], plotHeight: number): number {
	const [lo, hi] = domain;
	if (hi === lo) return plotHeight;
	return (1 - (value - lo) / (hi - lo)) * plotHeight;
}

/** Compact tick label: 1200 → "1.2k", 0.5 → "0.5". */
export function formatTick(value: number): string {
	const abs = Math.abs(value);
	if (abs >= 1_000_000) return `${clean(value / 1_000_000)}M`;
	if (abs >= 10_000) return `${clean(value / 1000)}k`;
	if (abs >= 1000 && value % 100 === 0) return `${clean(value / 1000)}k`;
	return String(clean(value));
}
