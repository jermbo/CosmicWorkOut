import type { Item, Program, Session, ItemLastUsed, ActivityLog, Habit, HabitLog, HealthReading } from './types';
import type { GoalPlan } from '$lib/goalPlans/types';
import { builtInItems, builtInPrograms, builtInHabits } from './seed';
import { generateDebugSeedData } from './debugSeed';
import { generateGoalPlanSampleData } from '$lib/goalPlans/sampleData';
import { toastStore } from '$lib/stores/toast.svelte';

function reportWriteError(error: unknown): void {
	console.error('IndexedDB write failed:', error);
	toastStore.error("Couldn't save your changes. Please try again.");
}

const DB_NAME = 'cosmic-workout';
const DB_VERSION = 9;

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
	if (dbInstance) {
		return Promise.resolve(dbInstance);
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			for (const name of Array.from(db.objectStoreNames)) {
				db.deleteObjectStore(name);
			}

			db.createObjectStore('items', { keyPath: 'id' });

			db.createObjectStore('programs', { keyPath: 'id' });

			const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
			sessionStore.createIndex('by_date', 'date');

			db.createObjectStore('itemLastUsed', { keyPath: 'itemId' });

			const actStore = db.createObjectStore('activities', { keyPath: 'id' });
			actStore.createIndex('by_date', 'date');

			db.createObjectStore('habits', { keyPath: 'id' });

			const hlStore = db.createObjectStore('habitLogs', { keyPath: 'id' });
			hlStore.createIndex('by_date', 'date');
			hlStore.createIndex('by_habit', 'habitId');

			const hrStore = db.createObjectStore('healthReadings', { keyPath: 'id' });
			hrStore.createIndex('by_date', 'date');
			hrStore.createIndex('by_metric', 'metricId');

			const gpStore = db.createObjectStore('goalPlans', { keyPath: 'id' });
			gpStore.createIndex('by_status', 'status');
		};

		request.onsuccess = (event) => {
			dbInstance = (event.target as IDBOpenDBRequest).result;
			resolve(dbInstance);
		};

		request.onerror = (event) => {
			reject((event.target as IDBOpenDBRequest).error);
		};
	});
}

async function getAll<T>(storeName: string): Promise<T[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readonly');
		const store = tx.objectStore(storeName);
		const request = store.getAll();

		request.onsuccess = () => resolve(request.result as T[]);
		request.onerror = () => reject(request.error);
	});
}

async function getOne<T>(storeName: string, key: string): Promise<T | undefined> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readonly');
		const store = tx.objectStore(storeName);
		const request = store.get(key);

		request.onsuccess = () => resolve(request.result as T | undefined);
		request.onerror = () => reject(request.error);
	});
}

async function putRecord<T>(storeName: string, value: T): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		const request = store.put(value);

		request.onsuccess = () => resolve();
		request.onerror = () => {
			reportWriteError(request.error);
			reject(request.error);
		};
	});
}

export async function putAllRecords<T>(storeName: string, values: T[]): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		tx.oncomplete = () => resolve();
		tx.onerror = () => {
			reportWriteError(tx.error);
			reject(tx.error);
		};
		for (const value of values) {
			store.put(value);
		}
	});
}

async function removeRecord(storeName: string, key: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		const request = store.delete(key);

		request.onsuccess = () => resolve();
		request.onerror = () => {
			reportWriteError(request.error);
			reject(request.error);
		};
	});
}

export async function clearWorkoutData(): Promise<void> {
	if (dbInstance) {
		dbInstance.close();
		dbInstance = null;
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.deleteDatabase(DB_NAME);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
		request.onblocked = () =>
			reject(new Error('Database deletion blocked — close other CosmicWorkOut tabs and try again'));
	});
}

async function clearStores(storeNames: string[]): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeNames, 'readwrite');
		for (const name of storeNames) {
			tx.objectStore(name).clear();
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => {
			reportWriteError(tx.error);
			reject(tx.error);
		};
	});
}

async function clearNonBuiltIn(storeName: string): Promise<void> {
	const all = await getAll<{ id: string; isBuiltIn: boolean }>(storeName);
	const customIds = all.filter((r) => !r.isBuiltIn).map((r) => r.id);
	if (customIds.length === 0) return;

	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		for (const id of customIds) {
			store.delete(id);
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => {
			reportWriteError(tx.error);
			reject(tx.error);
		};
	});
}

export async function loadDebugSeedData(): Promise<void> {
	const { sessions, activities, habitLogs, healthReadings } = generateDebugSeedData();
	await putAllRecords('sessions', sessions);
	await putAllRecords('activities', activities);
	await putAllRecords('habitLogs', habitLogs);
	await putAllRecords('healthReadings', healthReadings);

	const goalSample = generateGoalPlanSampleData();
	await putAllRecords('goalPlans', goalSample.goalPlans);
	await putAllRecords('programs', goalSample.programs);
	await putAllRecords('sessions', goalSample.sessions);
	activateSeededProgram(goalSample.activeProgramId);

	location.reload();
}

/** Add a seeded program to the active list so it shows up on Practice/Workout. */
function activateSeededProgram(programId: string): void {
	try {
		const raw = localStorage.getItem('cwout:activeProgramIds');
		const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
		if (Array.isArray(ids) && !ids.includes(programId)) {
			localStorage.setItem('cwout:activeProgramIds', JSON.stringify([...ids, programId]));
		}
	} catch {
		localStorage.setItem('cwout:activeProgramIds', JSON.stringify([programId]));
	}
}

export async function clearCustomExercises(): Promise<void> {
	await clearNonBuiltIn('items');
	location.reload();
}

export async function clearCustomPrograms(): Promise<void> {
	await clearNonBuiltIn('programs');
	location.reload();
}

export async function clearWorkoutSessions(): Promise<void> {
	await clearStores(['sessions', 'itemLastUsed']);
	localStorage.removeItem('cwout:activeSession');
	localStorage.removeItem('cwout:activeProgramId');
	localStorage.removeItem('cwout:activeProgramIds');
	location.reload();
}

export async function clearActivityLog(): Promise<void> {
	await clearStores(['activities']);
	location.reload();
}

export async function clearHabitsData(): Promise<void> {
	await clearStores(['habits', 'habitLogs']);
	location.reload();
}

export async function clearHealthData(): Promise<void> {
	await clearStores(['healthReadings']);
	location.reload();
}

export async function clearGoalPlansData(): Promise<void> {
	await clearStores(['goalPlans']);
	location.reload();
}

export async function clearEverything(): Promise<void> {
	await clearWorkoutData();
	localStorage.removeItem('cwout:activeSession');
	localStorage.removeItem('cwout:activeProgramId');
	localStorage.removeItem('cwout:activeProgramIds');
	location.reload();
}

async function upsertBuiltInRecords<T extends { id: string; isBuiltIn: boolean }>(
	storeName: string,
	existing: T[],
	builtIns: T[],
): Promise<void> {
	const byId = new Map(existing.map((r) => [r.id, r]));
	const toWrite = builtIns.filter((b) => {
		const cur = byId.get(b.id);
		return !cur || cur.isBuiltIn;
	});
	if (toWrite.length > 0) {
		await putAllRecords(storeName, toWrite);
	}
}

async function seedHabitsIfEmpty(): Promise<void> {
	const habits = await getAll<Habit>('habits');
	if (habits.length === 0) {
		await putAllRecords('habits', builtInHabits);
	}
}

export async function initDB(): Promise<void> {
	const items = await getAll<Item>('items');
	await upsertBuiltInRecords('items', items, builtInItems);

	const programs = await getAll<Program>('programs');
	await upsertBuiltInRecords('programs', programs, builtInPrograms);

	await seedHabitsIfEmpty();
}

export const db = {
	items: {
		getAll: () => getAll<Item>('items'),
		getOne: (id: string) => getOne<Item>('items', id),
		put: (item: Item) => putRecord('items', item),
		remove: (id: string) => removeRecord('items', id),
	},

	programs: {
		getAll: () => getAll<Program>('programs'),
		getOne: (id: string) => getOne<Program>('programs', id),
		put: (program: Program) => putRecord('programs', program),
		remove: (id: string) => removeRecord('programs', id),
	},

	sessions: {
		getAll: () => getAll<Session>('sessions'),
		getOne: (id: string) => getOne<Session>('sessions', id),
		put: (session: Session) => putRecord('sessions', session),
		delete: (id: string) => removeRecord('sessions', id),
	},

	itemLastUsed: {
		getAll: () => getAll<ItemLastUsed>('itemLastUsed'),
		get: (itemId: string) => getOne<ItemLastUsed>('itemLastUsed', itemId),
		put: (record: ItemLastUsed) => putRecord('itemLastUsed', record),
	},

	activities: {
		getAll: () => getAll<ActivityLog>('activities'),
		put: (activity: ActivityLog) => putRecord('activities', activity),
		remove: (id: string) => removeRecord('activities', id),
	},

	habits: {
		getAll: () => getAll<Habit>('habits'),
		put: (habit: Habit) => putRecord('habits', habit),
		remove: (id: string) => removeRecord('habits', id),
	},

	habitLogs: {
		getAll: () => getAll<HabitLog>('habitLogs'),
		put: (log: HabitLog) => putRecord('habitLogs', log),
		remove: (id: string) => removeRecord('habitLogs', id),
	},

	healthReadings: {
		getAll: () => getAll<HealthReading>('healthReadings'),
		put: (reading: HealthReading) => putRecord('healthReadings', reading),
		remove: (id: string) => removeRecord('healthReadings', id),
	},

	goalPlans: {
		getAll: () => getAll<GoalPlan>('goalPlans'),
		getOne: (id: string) => getOne<GoalPlan>('goalPlans', id),
		put: (plan: GoalPlan) => putRecord('goalPlans', plan),
		remove: (id: string) => removeRecord('goalPlans', id),
	},
};
