import { prefsStore } from './prefs.svelte';

/**
 * Asks the star to come to the bottom bar and celebrate (US-068 3, 5). MascotPeek,
 * in the layout, watches `peeks`. With Mascot motion off there is no celebration
 * (US-068 4b); the component itself skips it under reduced motion.
 */
class MascotStore {
	/** Goes up by one for each moment that brings the star. */
	peeks = $state(0);

	/** A habit reached its daily goal, or a habit with no goal got its first log. */
	celebrateHabitGoal(): void {
		this.celebrate();
	}

	/** A new log in Activity, Health, or Baselines (US-068 5). Edits do not count. */
	celebrateLog(): void {
		this.celebrate();
	}

	private celebrate(): void {
		if (!prefsStore.mascotMotion) return;
		this.peeks++;
	}
}

export const mascotStore = new MascotStore();
