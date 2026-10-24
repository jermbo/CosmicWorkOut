/*
 * Feedback vocabulary (v1.12.0). Pure — tested in src/lib/feedback.test.ts.
 *
 * One small set of named moments drives both haptics and sound, so a tap
 * always feels and sounds like the same kind of thing everywhere in the app.
 */

export type FeedbackKind = 'tap' | 'select' | 'tick' | 'success' | 'win' | 'warn';

export const FEEDBACK_KINDS: readonly FeedbackKind[] = [
	'tap',
	'select',
	'tick',
	'success',
	'win',
	'warn',
];

/**
 * Vibration API patterns, in ms (vibrate, pause, vibrate, …). Kept short:
 * phones round anything under ~5 ms to nothing, and long buzzes feel cheap.
 */
export const VIBRATION: Record<FeedbackKind, number[]> = {
	tap: [10],
	select: [6],
	tick: [4],
	success: [14, 40, 22],
	win: [20, 50, 20, 50, 45],
	warn: [30, 60, 30],
};

/** One synthesized blip: a pitch (Hz), length (ms) and start offset (ms). */
export interface Tone {
	freq: number;
	ms: number;
	at: number;
}

/** Short mechanical clicks and clunks — square-ish tones with a fast decay. */
export const TONES: Record<FeedbackKind, Tone[]> = {
	tap: [{ freq: 220, ms: 30, at: 0 }],
	select: [{ freq: 330, ms: 22, at: 0 }],
	tick: [{ freq: 440, ms: 14, at: 0 }],
	success: [
		{ freq: 392, ms: 50, at: 0 },
		{ freq: 587, ms: 80, at: 60 },
	],
	win: [
		{ freq: 392, ms: 60, at: 0 },
		{ freq: 523, ms: 60, at: 80 },
		{ freq: 784, ms: 140, at: 160 },
	],
	warn: [
		{ freq: 196, ms: 70, at: 0 },
		{ freq: 147, ms: 110, at: 90 },
	],
};

/** Elements the global press handler treats as tappable. */
export const PRESSABLE_SELECTOR =
	'button, a[href], label, summary, [role="button"], [role="tab"], [role="radio"], [role="option"], [role="switch"], [role="checkbox"]';

/**
 * Which feedback a plain tap on an element gives, from its markup alone.
 * An explicit `data-feedback` wins (`none` silences it); choosing one of several
 * (radio, tab, toggle, nav link) is `select`; anything else is `tap`.
 */
export function feedbackFor(attrs: {
	feedback?: string | null;
	role?: string | null;
	ariaPressed?: string | null;
	ariaCurrent?: string | null;
	inNav?: boolean;
	isCheckable?: boolean;
}): FeedbackKind | null {
	if (attrs.feedback === 'none') return null;
	if (attrs.feedback && (FEEDBACK_KINDS as readonly string[]).includes(attrs.feedback)) {
		return attrs.feedback as FeedbackKind;
	}
	const role = attrs.role ?? '';
	if (['tab', 'radio', 'option', 'switch', 'checkbox'].includes(role)) return 'select';
	if (attrs.ariaPressed != null || attrs.inNav || attrs.isCheckable) return 'select';
	return 'tap';
}

/**
 * Hold-to-repeat timing: wait, then fire faster and faster down to a floor.
 * Returns the delay before repeat number `n` (0-based).
 */
export function repeatDelay(n: number): number {
	if (n === 0) return 420;
	return Math.max(45, Math.round(180 * Math.pow(0.82, n - 1)));
}

/** First two px lengths of a computed `box-shadow` — its x / y offset. */
export function shadowOffset(boxShadow: string): { x: number; y: number } | null {
	if (!boxShadow || boxShadow === 'none') return null;
	const px = boxShadow.match(/-?\d+(\.\d+)?px/g);
	if (!px || px.length < 2) return null;
	const x = parseFloat(px[0]);
	const y = parseFloat(px[1]);
	if (x === 0 && y === 0) return null;
	return { x, y };
}
