import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

/**
 * Bounce to Overview while a feature flag is off. Covers both a direct URL to a
 * hidden route and the flag being switched off while the user sits on the page.
 *
 * Call from a component's script so the effect is owned by that component. Pass a
 * getter, not a boolean, or the check is read once and never re-evaluated.
 */
export function redirectWhenDisabled(isEnabled: () => boolean): void {
	$effect(() => {
		if (!isEnabled()) goto(resolve('/'));
	});
}
