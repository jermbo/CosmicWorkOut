import type { ActivityLog, ActivityType, ActivityIntensity } from '#lib/db/types';
import { db } from '#lib/db/database';
import { generateId } from '#lib/utils';
import { todayIso } from '#lib/date';
import { mascotStore } from './mascot.svelte';
import {
	findOrAddType,
	findTypeByName,
	pickerOrder,
	renameType,
	sortByName,
} from '#lib/activityTypes';
import { SvelteMap } from 'svelte/reactivity';

/** Holds a type id since v1.13.0 (US-061). An older value is a type name. */
const LAST_TYPE_KEY = 'cwout:lastActivityType';

/** What the log sheet picked: a type from the list, or Other with a typed name. */
export type ActivityTypeChoice = { typeId: string } | { otherName: string };

class ActivityStore {
	activities = $state<ActivityLog[]>([]);
	types = $state<ActivityType[]>([]);
	loaded = $state(false);
	private lastUsedRaw = $state<string | null>(localStorage.getItem(LAST_TYPE_KEY));

	todayStr(): string {
		return todayIso();
	}

	typesById = $derived(new Map(this.types.map((t) => [t.id, t])));

	/** Visible types, the most used first; the sheet adds Other last. */
	pickerTypes = $derived(pickerOrder(this.types, this.activities));

	/** Every type by name, hidden ones included, for Settings › Activity. */
	allTypesByName = $derived(sortByName(this.types));

	/** Entries per type id, for Settings › Activity. */
	countsByType = $derived.by(() => {
		const counts = new SvelteMap<string, number>();
		for (const a of this.activities) counts.set(a.typeId, (counts.get(a.typeId) ?? 0) + 1);
		return counts;
	});

	/** The last type used, as a visible type id; else the first in the picker. */
	lastUsedTypeId = $derived.by(() => {
		const raw = this.lastUsedRaw;
		const visible = this.pickerTypes;
		if (raw) {
			const byId = visible.find((t) => t.id === raw);
			if (byId) return byId.id;
			const byName = findTypeByName(visible, raw);
			if (byName) return byName.id;
		}
		return visible[0]?.id ?? null;
	});

	todayActivities = $derived.by(() => {
		const today = todayIso();
		return this.activities.filter((a) => a.date === today);
	});

	activitiesByDate = $derived.by(() => {
		const map = new SvelteMap<string, ActivityLog[]>();
		for (const a of this.activities) {
			const list = map.get(a.date) ?? [];
			list.push(a);
			map.set(a.date, list);
		}
		return map;
	});

	/** The name of an entry's type. Hidden types still name their entries (US-063 2b). */
	nameOf(activity: Pick<ActivityLog, 'typeId'>): string {
		return this.typesById.get(activity.typeId)?.name ?? 'Other';
	}

	async load(): Promise<void> {
		const [activities, types] = await Promise.all([
			db.activities.getAll(),
			db.activityTypes.getAll(),
		]);
		this.activities = activities;
		this.types = types;
		this.loaded = true;
	}

	/**
	 * Turn the sheet's choice into a type id. Other with a name in the list, in any mix
	 * of capital letters, uses that type (and shows it again if hidden); a new name
	 * joins the list (US-061 3c–d, US-063 2d).
	 */
	private async resolveType(choice: ActivityTypeChoice): Promise<string> {
		if ('typeId' in choice) return choice.typeId;
		const result = findOrAddType(
			this.types,
			choice.otherName,
			generateId,
			new Date().toISOString(),
		);
		if (result.changed) {
			await db.activityTypes.put(result.changed);
			this.types = result.types;
		}
		return result.type.id;
	}

	private rememberType(typeId: string): void {
		this.lastUsedRaw = typeId;
		localStorage.setItem(LAST_TYPE_KEY, typeId);
	}

	async add(data: {
		date: string;
		type: ActivityTypeChoice;
		durationMinutes: number;
		intensity: ActivityIntensity;
	}): Promise<ActivityLog> {
		const typeId = await this.resolveType(data.type);
		const entry: ActivityLog = {
			id: generateId(),
			date: data.date,
			typeId,
			durationMinutes: data.durationMinutes,
			intensity: data.intensity,
			createdAt: new Date().toISOString(),
		};
		await db.activities.put(entry);
		this.activities = [...this.activities, entry];
		this.rememberType(typeId);
		mascotStore.celebrateLog();
		return entry;
	}

	async update(activity: ActivityLog, type: ActivityTypeChoice): Promise<void> {
		const next = { ...activity, typeId: await this.resolveType(type) };
		await db.activities.put(next);
		this.activities = this.activities.map((a) => (a.id === next.id ? next : a));
	}

	async remove(id: string): Promise<void> {
		await db.activities.remove(id);
		this.activities = this.activities.filter((a) => a.id !== id);
	}

	/** Hide or show a type (US-063 2). Its entries stay. */
	async setHidden(id: string, hidden: boolean): Promise<void> {
		const type = this.typesById.get(id);
		if (!type) return;
		const next = { ...type, hidden };
		await db.activityTypes.put(next);
		this.types = this.types.map((t) => (t.id === id ? next : t));
	}

	/**
	 * Rename a type (US-063 3). A name that another type has joins the two into that
	 * one. Returns false when the name is empty.
	 */
	async rename(id: string, name: string): Promise<boolean> {
		const result = renameType(this.types, this.activities, id, name);
		if (result.kind === 'invalid') return false;
		if (result.kind === 'renamed') {
			await db.activityTypes.put(result.type);
			this.types = this.types.map((t) => (t.id === id ? result.type : t));
			return true;
		}
		// Move the entries first, so a failure never leaves entries on a removed type.
		if (result.movedActivities.length > 0) await db.activities.putAll(result.movedActivities);
		await db.activityTypes.put(result.into);
		await db.activityTypes.remove(result.removedId);
		const moved = new Map(result.movedActivities.map((a) => [a.id, a]));
		this.activities = this.activities.map((a) => moved.get(a.id) ?? a);
		this.types = this.types
			.filter((t) => t.id !== result.removedId)
			.map((t) => (t.id === result.into.id ? result.into : t));
		if (this.lastUsedRaw === result.removedId) this.rememberType(result.into.id);
		return true;
	}
}

export const activityStore = new ActivityStore();
