import type { Item } from '$lib/db/types';
import { STRENGTH_CATS } from '$lib/db/types';

/**
 * Per-discipline configuration for `LibrarySheet`. The sheet owns the chrome —
 * search, filter chips, expandable rows, edit/delete — and reads everything
 * discipline-specific from here, so a new movement type needs a builder below
 * rather than another copy of the sheet.
 */

/** One row of filter chips above the list. */
export type LibraryFilterGroup = {
	ariaLabel: string;
	/** Value of the chip that clears this filter. */
	anyValue: string;
	anyLabel: string;
	/** Selected when the sheet opens; defaults to `anyValue`. */
	initial?: string;
	options: { value: string; label: string }[];
	/** Renders smaller chips — a secondary filter reads as subordinate to the first. */
	small?: boolean;
	/** Clicking the selected chip clears it back to `anyValue`. */
	clearOnReselect?: boolean;
	matches: (item: Item, value: string) => boolean;
};

/** How one item renders as a row. */
export type LibraryRow = {
	/** Dot and tag colour; the app accent when omitted. */
	color?: string;
	/** Second line under the name. */
	subtitle: string;
	/** Right-hand category tag. */
	tag: string;
	/** Extra right-hand readout, e.g. strength's sets×reps. */
	meta?: string;
};

type LibraryBase = {
	title: string;
	searchPlaceholder: string;
	searchLabel: string;
	addLabel: string;
	emptyText: string;
	/** Display-capitalises chips and subtitles whose source text is lowercase. */
	capitalize?: boolean;
	/** Narrows the item store to the rows this library shows. */
	accepts: (item: Item) => boolean;
	search: (item: Item, query: string) => boolean;
	filters: LibraryFilterGroup[];
	row: (item: Item) => LibraryRow;
};

export type LibraryConfig = LibraryBase;

const CAT_COLORS: Record<string, string> = {
	Chest: 'var(--color-red)',
	Back: 'var(--color-sky)',
	Shoulders: 'var(--color-lavender)',
	Biceps: 'var(--color-lime)',
	Triceps: 'var(--color-lime)',
	Legs: 'var(--color-lime)',
	Core: 'var(--color-red)',
	'Full Body': 'var(--color-lavender)',
};

/** Strength items, grouped by muscle category and colour-coded to match. */
export function strengthLibrary(): LibraryConfig {
	return {
		title: 'Exercise Library',
		searchPlaceholder: 'Search exercises or muscles…',
		searchLabel: 'Search exercises',
		addLabel: 'Add custom exercise',
		emptyText: 'No exercises match.',
		// `cat` and `muscles` are strength-only and both required by the form, so
		// their presence is what marks an item as belonging to this library.
		accepts: (ex) => !!ex.cat && !!ex.muscles,
		search: (ex, q) =>
			ex.name.toLowerCase().includes(q) ||
			(ex.muscles ?? '').toLowerCase().includes(q) ||
			(ex.cat ?? '').toLowerCase().includes(q),
		filters: [
			{
				ariaLabel: 'Filter by category',
				anyValue: 'All',
				anyLabel: 'All',
				options: STRENGTH_CATS.map((cat) => ({ value: cat, label: cat })),
				matches: (ex, value) => ex.cat === value,
			},
		],
		row: (ex) => ({
			color: CAT_COLORS[ex.cat ?? ''] ?? 'var(--color-accent)',
			subtitle: ex.muscles ?? '',
			tag: ex.cat ?? '',
			meta: `${ex.defaultSets}×${ex.defaultReps}`,
		}),
	};
}
