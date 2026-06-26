import type { ActivityLog, ActivityType, ActivityIntensity } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import { todayIso } from '$lib/date';
import { SvelteMap } from 'svelte/reactivity';

const LAST_TYPE_KEY = 'cwout:lastActivityType';

class ActivityStore {
	activities = $state<ActivityLog[]>([]);
	loaded = $state(false);
	lastUsedType = $state<ActivityType>((localStorage.getItem(LAST_TYPE_KEY) as ActivityType | null) ?? 'Run');

	todayStr(): string {
		return todayIso();
	}

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

	async load(): Promise<void> {
		this.activities = await db.activities.getAll();
		this.loaded = true;
	}

	async add(data: {
		date: string;
		type: ActivityType;
		customType?: string;
		durationMinutes: number;
		intensity: ActivityIntensity;
	}): Promise<ActivityLog> {
		const entry: ActivityLog = {
			id: generateId(),
			...data,
			createdAt: new Date().toISOString(),
		};
		await db.activities.put(entry);
		this.activities = [...this.activities, entry];
		this.lastUsedType = data.type;
		localStorage.setItem(LAST_TYPE_KEY, data.type);
		return entry;
	}

	async update(activity: ActivityLog): Promise<void> {
		await db.activities.put(activity);
		this.activities = this.activities.map((a) => {
			if (a.id === activity.id) return activity;
			return a;
		});
	}

	async remove(id: string): Promise<void> {
		await db.activities.remove(id);
		this.activities = this.activities.filter((a) => a.id !== id);
	}
}

export const activityStore = new ActivityStore();
