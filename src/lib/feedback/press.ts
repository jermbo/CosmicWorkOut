import { feedback, prefersReducedMotion } from './index';
import { PRESSABLE_SELECTOR, feedbackFor, shadowOffset } from './patterns';

/*
 * One delegated press handler for the whole app (v1.12.0). Every tappable
 * element gets the same physical feel without each component wiring it up:
 *
 *  - Finger down: haptic + sound right away, and the element moves. Anything
 *    with a hard shadow sinks into it; anything flat squishes down a little.
 *  - Finger up: it springs back with a small overshoot.
 *
 * Uses Pointer Events + the Web Animations API on the individual `translate` /
 * `scale` properties, so it composes with any `transform` a component already
 * has. CSS `:active` is unreliable on touch (mobile Safari needs a touch listener
 * before it applies), which is why this isn't done in CSS.
 *
 * Opt out per element with `data-press="none"`; pick the feedback with
 * `data-feedback="tap|select|success|win|warn|none"`.
 */

interface Pressed {
	el: HTMLElement;
	anim: Animation | null;
	down: Keyframe;
	restShadow: string;
	sink: { x: number; y: number } | null;
	x: number;
	y: number;
}

let current: Pressed | null = null;

/** Our own spring-back animations, so a quick re-tap can clear them first. */
const springs = new WeakMap<HTMLElement, Animation>();

const MOVE_CANCEL_PX = 10;

function isTextEntry(el: Element): boolean {
	if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
	if (el instanceof HTMLInputElement) {
		return !['checkbox', 'radio', 'button', 'submit', 'reset'].includes(el.type);
	}
	return false;
}

function pressTarget(target: EventTarget | null): HTMLElement | null {
	if (!(target instanceof Element) || isTextEntry(target)) return null;
	const el = target.closest<HTMLElement>(PRESSABLE_SELECTOR);
	if (!el || el.closest('[data-press="none"]')) return null;
	if (el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true') return null;
	// A label around a text field just focuses it — no press.
	if (el.tagName === 'LABEL') {
		const input = el.querySelector('input, textarea, select');
		if (input && isTextEntry(input)) return null;
	}
	return el;
}

function kindFor(el: HTMLElement) {
	const checkable =
		el.matches('label') && !!el.querySelector('input[type="checkbox"], input[type="radio"]');
	return feedbackFor({
		feedback: el.closest<HTMLElement>('[data-feedback]')?.dataset.feedback,
		role: el.getAttribute('role'),
		ariaPressed: el.getAttribute('aria-pressed'),
		ariaCurrent: el.getAttribute('aria-current'),
		inNav: !!el.closest('nav'),
		isCheckable: checkable,
	});
}

function onDown(e: PointerEvent): void {
	if (e.pointerType === 'mouse' && e.button !== 0) return;
	const el = pressTarget(e.target);
	if (!el) return;

	const kind = kindFor(el);
	if (kind) feedback(kind);

	release();
	if (prefersReducedMotion()) return;

	// A re-tap mid spring-back would read a half-animated shadow — settle it first.
	springs.get(el)?.cancel();
	const restShadow = getComputedStyle(el).boxShadow;
	const sink = shadowOffset(restShadow);
	const down: Keyframe = sink
		? { translate: `${sink.x}px ${sink.y}px`, boxShadow: 'none' }
		: { translate: '0 2px', scale: '0.97' };
	const anim = el.animate([down], { duration: 70, easing: 'ease-out', fill: 'forwards' });
	current = { el, anim, down, restShadow, sink, x: e.clientX, y: e.clientY };
}

/** Spring back from wherever the press got to, with a small overshoot. */
function release(): void {
	if (!current) return;
	const { el, anim, down, restShadow, sink } = current;
	current = null;
	const overshoot: Keyframe = sink
		? { translate: `${-sink.x * 0.2}px ${-sink.y * 0.2}px`, boxShadow: restShadow }
		: { translate: '0 -1px', scale: '1.025' };
	const rest: Keyframe = sink
		? { translate: '0 0', boxShadow: restShadow }
		: { translate: '0 0', scale: '1' };
	const spring = el.animate([down, overshoot, rest], {
		duration: 240,
		easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
	});
	springs.set(el, spring);
	anim?.cancel();
}

function onMove(e: PointerEvent): void {
	if (!current) return;
	// The finger is scrolling, not pressing.
	if (Math.hypot(e.clientX - current.x, e.clientY - current.y) > MOVE_CANCEL_PX) release();
}

/** Attach once from the root layout. Returns a cleanup. */
export function installPress(root: Document = document): () => void {
	const opts = { capture: true, passive: true } as const;
	root.addEventListener('pointerdown', onDown, opts);
	root.addEventListener('pointermove', onMove, opts);
	root.addEventListener('pointerup', release, opts);
	root.addEventListener('pointercancel', release, opts);
	window.addEventListener('blur', release);
	return () => {
		root.removeEventListener('pointerdown', onDown, opts);
		root.removeEventListener('pointermove', onMove, opts);
		root.removeEventListener('pointerup', release, opts);
		root.removeEventListener('pointercancel', release, opts);
		window.removeEventListener('blur', release);
	};
}
