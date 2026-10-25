import type { Action } from 'svelte/action';
import { feedback } from './index';
import { repeatDelay } from './patterns';

/*
 * Hold a +/- button to keep stepping (v1.12.0). A normal tap still goes through
 * the button's own onclick; holding starts repeating after a short wait and
 * speeds up, with a light tick each step. When a hold repeated at least once,
 * the click that follows the release is swallowed so it doesn't add one more.
 *
 *   <button onclick={add} use:holdRepeat={add}>
 */
export const holdRepeat: Action<HTMLElement, () => void> = (node, step) => {
	let fn = step;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let count = 0;

	function schedule(): void {
		timer = setTimeout(() => {
			if (node.matches(':disabled')) return stop();
			fn();
			feedback('tick');
			count++;
			schedule();
		}, repeatDelay(count));
	}

	function swallowClick(e: Event): void {
		e.stopImmediatePropagation();
		e.preventDefault();
	}

	function stop(): void {
		clearTimeout(timer);
		timer = undefined;
		if (count > 0) {
			node.addEventListener('click', swallowClick, { capture: true, once: true });
			// The click fires right after pointerup; if it never comes, don't eat a later one.
			setTimeout(() => node.removeEventListener('click', swallowClick, { capture: true }), 60);
		}
		count = 0;
	}

	function start(e: PointerEvent): void {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		stop();
		schedule();
	}

	function noMenu(e: Event): void {
		// Long-press on touch would otherwise open the context menu.
		if (timer !== undefined || count > 0) e.preventDefault();
	}

	node.addEventListener('pointerdown', start);
	node.addEventListener('pointerup', stop);
	node.addEventListener('pointerleave', stop);
	node.addEventListener('pointercancel', stop);
	node.addEventListener('contextmenu', noMenu);

	return {
		update(next) {
			fn = next;
		},
		destroy() {
			clearTimeout(timer);
			node.removeEventListener('pointerdown', start);
			node.removeEventListener('pointerup', stop);
			node.removeEventListener('pointerleave', stop);
			node.removeEventListener('pointercancel', stop);
			node.removeEventListener('contextmenu', noMenu);
		},
	};
};
