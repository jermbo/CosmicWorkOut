/*
 * The user's own list of activity types (v1.13.0, US-061 / US-063). Pure: no stores,
 * no DOM — tested in activityTypes.test.ts. The store and the database call these.
 */
import type { ActivityLog, ActivityType } from '#lib/db/types';

/** A new list, and a list reset by clearing the Activity log. Other is not a type. */
export const STARTER_TYPE_NAMES = ['Stretching', 'Cardio'] as const;

/** Stable ids for the starter types, so a reset gives the same ids each time. */
export function starterTypes(now: string): ActivityType[] {
	return STARTER_TYPE_NAMES.map((name) => ({
		id: `activity-type-${name.toLowerCase()}`,
		name,
		createdAt: now,
	}));
}

/** Names that differ only in capital letters or end spaces are one type. */
export function nameKey(name: string): string {
	return name.trim().toLowerCase();
}

export function findTypeByName(
	types: readonly ActivityType[],
	name: string,
): ActivityType | undefined {
	const key = nameKey(name);
	if (!key) return undefined;
	return types.find((t) => nameKey(t.name) === key);
}

export type FindOrAddResult = {
	type: ActivityType;
	/** The list after the call: a new type added, or a hidden match shown again. */
	types: ActivityType[];
	/** The record to write, when the list changed; null when it did not. */
	changed: ActivityType | null;
};

/**
 * Find a type by name, in any mix of capital letters, or add it. A hidden match is
 * shown again (US-063 2d). The name is trimmed; the caller makes sure it is not empty.
 */
export function findOrAddType(
	types: readonly ActivityType[],
	name: string,
	makeId: () => string,
	now: string,
): FindOrAddResult {
	const match = findTypeByName(types, name);
	if (match && !match.hidden) return { type: match, types: [...types], changed: null };
	if (match) {
		const shown: ActivityType = { ...match, hidden: false };
		return {
			type: shown,
			types: types.map((t) => (t.id === match.id ? shown : t)),
			changed: shown,
		};
	}
	const added: ActivityType = { id: makeId(), name: name.trim(), createdAt: now };
	return { type: added, types: [...types, added], changed: added };
}

/** The name an entry from before v1.13.0 was shown with. An unnamed Other is "Other". */
export function legacyTypeName(activity: Pick<ActivityLog, 'type' | 'customType'>): string {
	if (!activity.type || activity.type === 'Other') return activity.customType?.trim() || 'Other';
	return activity.type;
}

export type UpgradeResult = {
	/** The whole list after the upgrade. */
	types: ActivityType[];
	/** Types the upgrade added, to write. */
	addedTypes: ActivityType[];
	/** Entries that got a type id, to write. */
	changedActivities: ActivityLog[];
};

/**
 * Give each entry with no type id the id of its type, adding each missing name to the
 * list once (US-061 2). Runs at the upgrade, after a restore of an older backup, and
 * on any entry that comes in without a type id. Entries are taken oldest first, so a
 * name keeps the spelling of its first entry. No entry is dropped.
 */
export function assignTypeIds(
	types: readonly ActivityType[],
	activities: readonly ActivityLog[],
	makeId: () => string,
	now: string,
): UpgradeResult {
	const known = new Set(types.map((t) => t.id));
	let list = [...types];
	const addedTypes: ActivityType[] = [];
	const changedActivities: ActivityLog[] = [];

	const pending = activities
		.filter((a) => !a.typeId || !known.has(a.typeId))
		.sort(
			(a, b) =>
				(a.createdAt ?? '').localeCompare(b.createdAt ?? '') || a.date.localeCompare(b.date),
		);

	for (const activity of pending) {
		const name = legacyTypeName(activity);
		const match = findTypeByName(list, name);
		let type = match;
		if (!type) {
			type = { id: makeId(), name: name.trim(), createdAt: now };
			list = [...list, type];
			addedTypes.push(type);
		}
		changedActivities.push({ ...activity, typeId: type.id });
	}

	return { types: list, addedTypes, changedActivities };
}

/**
 * The picker order (US-061 3a): visible types, the most used first, then by name.
 * Other is not in the list; the sheet adds it last.
 */
export function pickerOrder(
	types: readonly ActivityType[],
	activities: readonly Pick<ActivityLog, 'typeId'>[],
): ActivityType[] {
	const counts = new Map<string, number>();
	for (const a of activities) counts.set(a.typeId, (counts.get(a.typeId) ?? 0) + 1);
	return types
		.filter((t) => !t.hidden)
		.sort(
			(a, b) =>
				(counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) ||
				a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
		);
}

/** The whole list for Settings › Activity: by name, hidden ones included. */
export function sortByName(types: readonly ActivityType[]): ActivityType[] {
	return [...types].sort((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
	);
}

export type RenameResult =
	| { kind: 'invalid' }
	| { kind: 'renamed'; type: ActivityType }
	| {
			kind: 'merged';
			/** The type that stays, with all the entries. */
			into: ActivityType;
			/** The id of the type that goes away. */
			removedId: string;
			/** Entries moved to `into`, to write. */
			movedActivities: ActivityLog[];
	  };

/**
 * Rename a type (US-063 3). Every entry points by id, so a rename changes the name on
 * every past entry at once. A name that another type has, in any mix of capital
 * letters, joins the two types into that one, with all their entries. An empty name
 * is not possible.
 */
export function renameType(
	types: readonly ActivityType[],
	activities: readonly ActivityLog[],
	id: string,
	newName: string,
): RenameResult {
	const name = newName.trim();
	const type = types.find((t) => t.id === id);
	if (!name || !type) return { kind: 'invalid' };

	const other = types.find((t) => t.id !== id && nameKey(t.name) === nameKey(name));
	if (!other) return { kind: 'renamed', type: { ...type, name } };

	return {
		kind: 'merged',
		// The joined type is shown if either was, so no entry drops out of sight.
		into: { ...other, hidden: Boolean(other.hidden && type.hidden) },
		removedId: id,
		movedActivities: activities
			.filter((a) => a.typeId === id)
			.map((a) => ({ ...a, typeId: other.id })),
	};
}

/** Counts by type for Activity Mix (US-061 4, US-063 2a): hidden types are left out. */
export function countByType(
	types: readonly ActivityType[],
	activities: readonly Pick<ActivityLog, 'typeId' | 'date'>[],
	dates: ReadonlySet<string>,
): { id: string; name: string; count: number }[] {
	const byId = new Map(types.map((t) => [t.id, t]));
	const counts = new Map<string, number>();
	for (const a of activities) {
		if (!dates.has(a.date)) continue;
		const type = byId.get(a.typeId);
		if (!type || type.hidden) continue;
		counts.set(type.id, (counts.get(type.id) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([id, count]) => ({ id, name: byId.get(id)!.name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export type DedupeResult = {
	/** Types that stay, changed or not. */
	types: ActivityType[];
	/** Ids of types joined into another, to remove. */
	removedIds: string[];
	/** Types that changed (shown again by a join), to write. */
	changedTypes: ActivityType[];
	/** Entries moved to the type that stays, to write. */
	movedActivities: ActivityLog[];
};

/**
 * Join types that share a name, in any mix of capital letters, into the oldest one.
 * Two devices can each add "Mowing" with their own id; a QR window backup from one
 * then brings a second Mowing to the other. Runs on each start, after the upgrade.
 */
export function mergeDuplicateNames(
	types: readonly ActivityType[],
	activities: readonly ActivityLog[],
): DedupeResult {
	const keep = new Map<string, ActivityType>();
	const redirect = new Map<string, string>();
	const ordered = [...types].sort(
		(a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
	);
	const changed = new Map<string, ActivityType>();
	for (const type of ordered) {
		const key = nameKey(type.name);
		const first = keep.get(key);
		if (!first) {
			keep.set(key, type);
			continue;
		}
		redirect.set(type.id, first.id);
		if (first.hidden && !type.hidden) {
			const shown = { ...first, hidden: false };
			keep.set(key, shown);
			changed.set(shown.id, shown);
		}
	}
	const movedActivities = activities
		.filter((a) => redirect.has(a.typeId))
		.map((a) => ({ ...a, typeId: redirect.get(a.typeId)! }));
	return {
		types: types.filter((t) => !redirect.has(t.id)).map((t) => changed.get(t.id) ?? t),
		removedIds: [...redirect.keys()],
		changedTypes: [...changed.values()],
		movedActivities,
	};
}
