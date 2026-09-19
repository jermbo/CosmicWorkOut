/** Every Overview summary card, in the order a fresh install shows them. */
export const HOME_CARD_IDS = ['habits', 'practice', 'activity', 'baselines', 'health'] as const;

export type HomeCardId = (typeof HOME_CARD_IDS)[number];

export const HOME_CARD_LABELS: Record<HomeCardId, string> = {
	habits: 'Habits',
	practice: 'Practice',
	activity: 'Activity log',
	baselines: 'Baselines',
	health: 'Health',
};

export const DEFAULT_HOME_CARD_ORDER: HomeCardId[] = [...HOME_CARD_IDS];

function isHomeCardId(value: unknown): value is HomeCardId {
	return typeof value === 'string' && (HOME_CARD_IDS as readonly string[]).includes(value);
}

/**
 * Turn a stored order into a complete, duplicate-free list.
 *
 * The stored value comes from localStorage, so it can be stale, hand-edited, or from
 * a build with a different card set. Unknown and repeated ids are dropped, and any
 * card the stored order doesn't mention is appended in default order — that last part
 * is what makes a newly added card show up for existing users instead of vanishing.
 */
export function resolveHomeCardOrder(stored: unknown): HomeCardId[] {
	const order: HomeCardId[] = [];
	if (Array.isArray(stored)) {
		for (const value of stored) {
			if (isHomeCardId(value) && !order.includes(value)) order.push(value);
		}
	}
	for (const id of DEFAULT_HOME_CARD_ORDER) {
		if (!order.includes(id)) order.push(id);
	}
	return order;
}

/** Move `draggedId` to `targetId`'s position, keeping every other card's relative order. */
export function reorderHomeCards(
	order: HomeCardId[],
	draggedId: HomeCardId,
	targetId: HomeCardId,
): HomeCardId[] {
	const from = order.indexOf(draggedId);
	const to = order.indexOf(targetId);
	if (from < 0 || to < 0 || from === to) return [...order];
	const next = [...order];
	next.splice(from, 1);
	next.splice(to, 0, draggedId);
	return next;
}
