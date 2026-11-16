import { prefsStore } from './prefs.svelte';

/**
 * Asks the star to come up above the bottom bar (US-068 3). MascotPeek, in the layout,
 * watches `peeks`. With Mascot motion off there is no celebration (US-068 4b); the
 * component itself skips it under reduced motion.
 */
class MascotStore {
	/** Goes up by one for each habit that reaches its daily goal. */
	peeks = $state(0);

	celebrateHabitGoal(): void {
		if (!prefsStore.mascotMotion) return;
		this.peeks++;
	}
}

export const mascotStore = new MascotStore();
