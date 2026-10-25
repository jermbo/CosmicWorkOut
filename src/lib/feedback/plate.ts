/*
 * The session's blue plate handoff (v1.12.0). Pure — tested in src/lib/feedback.test.ts.
 *
 * One Training-blue plate sits behind the live exercise. When the live exercise
 * changes, the plate lifts off the page, stretches to cover both cards, lets go
 * of the old one, and sets down on the new one.
 */

export interface Box {
	top: number;
	height: number;
}

/** Total run time, and when the plate covers both cards (the moment to swap who is live). */
export const PLATE_MS = 820;
export const PLATE_SWAP_AT = 0.5;
/** Waits for the DONE stamp to land before the plate moves. */
export const PLATE_DELAY_MS = 380;
/** How far the plate lifts off the page, in px. */
export const PLATE_LIFT = 4;

export function plateKeyframes(
	from: Box,
	to: Box,
	shadow: { rest: string; lifted: string },
): Keyframe[] {
	const spanTop = Math.min(from.top, to.top);
	const spanBottom = Math.max(from.top + from.height, to.top + to.height);
	const px = (n: number) => `${n}px`;
	const lifted = `${-PLATE_LIFT}px ${-PLATE_LIFT}px`;
	return [
		{ top: px(from.top), height: px(from.height), translate: '0 0', boxShadow: shadow.rest },
		{
			offset: 0.18,
			top: px(from.top),
			height: px(from.height),
			translate: lifted,
			boxShadow: shadow.lifted,
		},
		{
			offset: PLATE_SWAP_AT,
			top: px(spanTop),
			height: px(spanBottom - spanTop),
			translate: lifted,
			boxShadow: shadow.lifted,
		},
		{
			offset: 0.8,
			top: px(to.top),
			height: px(to.height),
			translate: lifted,
			boxShadow: shadow.lifted,
		},
		{ top: px(to.top), height: px(to.height), translate: '0 0', boxShadow: shadow.rest },
	];
}

/** Extra wait before the plate moves when the list has to scroll first. */
export const PLATE_SCROLL_MS = 320;

/**
 * Where to scroll the exercise list so the handoff happens on screen, or null if
 * it already is. Shows both cards when they fit together; otherwise makes sure
 * the next card is fully visible (its top, if it's taller than the screen).
 * `margin` leaves room for the lifted plate's shadow.
 */
export function handoffScrollTop(
	from: Box,
	to: Box,
	view: { scrollTop: number; height: number },
	margin = 24,
): number | null {
	const viewBottom = view.scrollTop + view.height;
	const spanTop = Math.min(from.top, to.top) - margin;
	const spanBottom = Math.max(from.top + from.height, to.top + to.height) + margin;
	const fits = (top: number, bottom: number) => bottom - top <= view.height;

	let target: number | null = null;
	const reveal = (top: number, bottom: number) => {
		if (top < view.scrollTop) target = top;
		else if (bottom > viewBottom) target = bottom - view.height;
	};

	if (fits(spanTop, spanBottom)) {
		reveal(spanTop, spanBottom);
	} else {
		const toTop = to.top - margin;
		const toBottom = to.top + to.height + margin;
		if (fits(toTop, toBottom)) reveal(toTop, toBottom);
		else target = toTop;
	}

	if (target === null) return null;
	const clamped = Math.max(0, Math.round(target));
	return Math.abs(clamped - view.scrollTop) < 2 ? null : clamped;
}
