import type { Item, Program, Session, ItemLastUsed, ActivityLog, Habit, HabitLog, JournalEntry } from './types';
import { builtInItems, builtInPrograms, builtInHabits } from './seed';
import { toastStore } from '$lib/stores/toast.svelte';

function reportWriteError(error: unknown): void {
	console.error('IndexedDB write failed:', error);
	toastStore.error("Couldn't save your changes. Please try again.");
}

const DB_NAME = 'cosmic-workout';
// v4 (v1.4.0): Discipline model. The strength-only schema is generalized and the
// stores are renamed (exercises→items, exerciseLastUsed→itemLastUsed) with new
// record shapes. Pre-beta, so we WIPE and re-seed rather than migrate — see
// docs/features/v1.4.0/US-015. The upgrade drops every existing store and
// recreates a clean set; initDB() then re-seeds both Disciplines.
const DB_VERSION = 4;

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
	if (dbInstance) {
		return Promise.resolve(dbInstance);
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			// Wipe-and-reseed: drop every existing store so no pre-Discipline records
			// survive, then recreate a clean set. initDB() re-seeds afterward.
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

			const jStore = db.createObjectStore('journals', { keyPath: 'id' });
			jStore.createIndex('by_date', 'date', { unique: true });
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

async function putAllRecords<T>(storeName: string, values: T[]): Promise<void> {
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

export async function resetWorkoutData(): Promise<void> {
	await clearWorkoutData();
	localStorage.removeItem('cwout:activeSession');
	localStorage.removeItem('cwout:activeProgramId'); // legacy single-program key
	localStorage.removeItem('cwout:activeProgramIds'); // per-Discipline active programs
	location.reload();
}

export async function initDB(): Promise<void> {
	// Seed built-in items only on first run (empty store). Re-writing the full
	// catalog on every boot churns IndexedDB storage without changing the data —
	// built-in content updates ride the DB version bump (wipe + re-seed) instead.
	const items = await getAll<Item>('items');
	if (items.length === 0) {
		await putAllRecords('items', builtInItems);
	}

	// Only seed programs on first run
	const programs = await getAll<Program>('programs');
	if (programs.length === 0) {
		await putAllRecords('programs', builtInPrograms);
	}

	// Only seed habits on first run
	const habits = await getAll<Habit>('habits');
	if (habits.length === 0) {
		await putAllRecords('habits', builtInHabits);
	} else {
		// Migrate: apply default goals to built-in habits that are missing them
		const goalMap: Record<string, number> = {
			'habit-meditation': 20,
			'habit-writing': 500,
			'habit-reading': 20,
			'habit-water': 8,
			'habit-coffee': 3,
		};
		const toUpdate = habits.filter((h) => goalMap[h.id] !== undefined && h.dailyGoal === undefined);
		if (toUpdate.length > 0) {
			await putAllRecords(
				'habits',
				toUpdate.map((h) => ({ ...h, dailyGoal: goalMap[h.id] })),
			);
		}
	}
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

	journals: {
		getAll: () => getAll<JournalEntry>('journals'),
		getOne: (id: string) => getOne<JournalEntry>('journals', id),
		put: (entry: JournalEntry) => putRecord('journals', entry),
		remove: (id: string) => removeRecord('journals', id),
	},
};
