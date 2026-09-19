import type {
	Item,
	Program,
	Session,
	ItemLastUsed,
	ActivityLog,
	Habit,
	HabitLog,
	HealthReading,
} from './types';
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

/** Every IndexedDB object store — keep in sync with onupgradeneeded. */
export const ALL_STORE_NAMES = [
	'items',
	'programs',
	'sessions',
	'itemLastUsed',
	'activities',
	'habits',
	'habitLogs',
	'healthReadings',
	'goalPlans',
] as const;

let dbInstance: IDBDatabase | null = null;
/** In-flight open — prevents leaked connections when callers race before dbInstance is set. */
let opening: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
	if (dbInstance) return Promise.resolve(dbInstance);
	if (opening) return opening;

	opening = new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const req = event.target as IDBOpenDBRequest;
			const db = req.result;
			const tx = req.transaction!;

			// Idempotent, non-destructive migration: create only stores/indexes that
			// don't already exist so bumping DB_VERSION never wipes user data.
			// Future schema changes append new ensureStore/ensureIndex calls (and
			// data transforms keyed on event.oldVersion when needed).
			const ensureStore = (name: string, opts: IDBObjectStoreParameters): IDBObjectStore =>
				db.objectStoreNames.contains(name)
					? tx.objectStore(name)
					: db.createObjectStore(name, opts);

			const ensureIndex = (store: IDBObjectStore, name: string, keyPath: string): void => {
				if (!store.indexNames.contains(name)) store.createIndex(name, keyPath);
			};

			ensureStore('items', { keyPath: 'id' });

			ensureStore('programs', { keyPath: 'id' });

			const sessionStore = ensureStore('sessions', { keyPath: 'id' });
			ensureIndex(sessionStore, 'by_date', 'date');

			ensureStore('itemLastUsed', { keyPath: 'itemId' });

			const actStore = ensureStore('activities', { keyPath: 'id' });
			ensureIndex(actStore, 'by_date', 'date');

			ensureStore('habits', { keyPath: 'id' });

			const hlStore = ensureStore('habitLogs', { keyPath: 'id' });
			ensureIndex(hlStore, 'by_date', 'date');
			ensureIndex(hlStore, 'by_habit', 'habitId');

			const hrStore = ensureStore('healthReadings', { keyPath: 'id' });
			ensureIndex(hrStore, 'by_date', 'date');
			ensureIndex(hrStore, 'by_metric', 'metricId');

			const gpStore = ensureStore('goalPlans', { keyPath: 'id' });
			ensureIndex(gpStore, 'by_status', 'status');
		};

		request.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			db.onversionchange = () => {
				db.close();
				if (dbInstance === db) dbInstance = null;
			};
			dbInstance = db;
			opening = null;
			resolve(db);
		};

		request.onerror = (event) => {
			opening = null;
			reject((event.target as IDBOpenDBRequest).error);
		};
	});

	return opening;
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

export async function putAllRecords<T>(
	storeName: string,
	values: T[],
	opts?: { silent?: boolean },
): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		let settled = false;
		tx.oncomplete = () => resolve();
		tx.onerror = () => {
			if (settled) return;
			settled = true;
			if (!opts?.silent) reportWriteError(tx.error);
			else console.error('[idb] write failed:', storeName, tx.error);
			reject(tx.error);
		};
		for (let i = 0; i < values.length; i++) {
			try {
				store.put(values[i]);
			} catch (err) {
				settled = true;
				const row = values[i] as { id?: unknown; itemId?: unknown };
				const key = row?.id ?? row?.itemId ?? i;
				const message = `IndexedDB put failed in "${storeName}" (index ${i}, key ${String(key)}): ${err instanceof Error ? err.message : String(err)}`;
				console.error(`[idb] ${message}`, values[i]);
				try {
					tx.abort();
				} catch {
					/* already failing */
				}
				reject(new Error(message, { cause: err }));
				return;
			}
		}
	});
}

/** Count records in a live store without loading them. */
export async function countRecords(storeName: string): Promise<number> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readonly');
		const request = tx.objectStore(storeName).count();
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
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

/**
 * Wipe every object store without deleting the database.
 * Prefer this over `deleteDatabase` — an open connection (this tab) blocks deletion
 * and was causing backup restore to fail with a generic mid-write error.
 */
export async function clearWorkoutData(): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction([...ALL_STORE_NAMES], 'readwrite');
		for (const name of ALL_STORE_NAMES) {
			tx.objectStore(name).clear();
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => {
			reportWriteError(tx.error);
			reject(tx.error);
		};
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
	const [programs, plans] = await Promise.all([
		getAll<{ id: string; isBuiltIn: boolean }>('programs'),
		getAll<{ programId: string }>('goalPlans'),
	]);
	const goalProgramIds = new Set(plans.map((p) => p.programId));
	const customIds = programs
		.filter((r) => !r.isBuiltIn && !goalProgramIds.has(r.id))
		.map((r) => r.id);
	if (customIds.length > 0) {
		const db = await openDB();
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction('programs', 'readwrite');
			const store = tx.objectStore('programs');
			for (const id of customIds) store.delete(id);
			tx.oncomplete = () => resolve();
			tx.onerror = () => {
				reportWriteError(tx.error);
				reject(tx.error);
			};
		});
	}
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
	const plans = await getAll<{ programId: string }>('goalPlans');
	const programIds = plans.map((p) => p.programId);
	const db = await openDB();
	await new Promise<void>((resolve, reject) => {
		const storeNames = programIds.length > 0 ? ['goalPlans', 'programs'] : ['goalPlans'];
		const tx = db.transaction(storeNames, 'readwrite');
		tx.objectStore('goalPlans').clear();
		if (programIds.length > 0) {
			const programs = tx.objectStore('programs');
			for (const id of programIds) programs.delete(id);
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => {
			reportWriteError(tx.error);
			reject(tx.error);
		};
	});
	// Drop backing programs from the active list if they were running.
	try {
		const raw = localStorage.getItem('cwout:activeProgramIds');
		const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
		if (Array.isArray(ids) && programIds.length > 0) {
			const drop = new Set(programIds);
			localStorage.setItem(
				'cwout:activeProgramIds',
				JSON.stringify(ids.filter((id) => !drop.has(id))),
			);
		}
	} catch {
		/* ignore */
	}
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
