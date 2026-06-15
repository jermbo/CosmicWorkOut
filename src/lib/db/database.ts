import type { Exercise, Program, SessionLog, ExerciseLastUsed, ActivityLog, Habit, HabitLog } from './types';
import { builtInExercises, builtInPrograms } from './seed';

const DB_NAME = 'cosmic-workout';
const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
	if (dbInstance) {
		return Promise.resolve(dbInstance);
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains('exercises')) {
				db.createObjectStore('exercises', { keyPath: 'id' });
			}

			if (!db.objectStoreNames.contains('programs')) {
				db.createObjectStore('programs', { keyPath: 'id' });
			}

			if (!db.objectStoreNames.contains('sessions')) {
				const store = db.createObjectStore('sessions', { keyPath: 'id' });
				store.createIndex('by_date', 'date');
			}

			if (!db.objectStoreNames.contains('exerciseLastUsed')) {
				db.createObjectStore('exerciseLastUsed', { keyPath: 'exerciseId' });
			}

			if (!db.objectStoreNames.contains('activities')) {
				const actStore = db.createObjectStore('activities', { keyPath: 'id' });
				actStore.createIndex('by_date', 'date');
			}

			if (!db.objectStoreNames.contains('habits')) {
				db.createObjectStore('habits', { keyPath: 'id' });
			}

			if (!db.objectStoreNames.contains('habitLogs')) {
				const hlStore = db.createObjectStore('habitLogs', { keyPath: 'id' });
				hlStore.createIndex('by_date', 'date');
				hlStore.createIndex('by_habit', 'habitId');
			}
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
		request.onerror = () => reject(request.error);
	});
}

async function putAllRecords<T>(storeName: string, values: T[]): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
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
		request.onerror = () => reject(request.error);
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
	localStorage.removeItem('cwout:activeProgramId');
	location.reload();
}

export async function initDB(): Promise<void> {
	// Upsert all built-in exercises in a single transaction
	await putAllRecords('exercises', builtInExercises);

	// Only seed programs on first run
	const programs = await getAll<Program>('programs');
	if (programs.length === 0) {
		await putAllRecords('programs', builtInPrograms);
	}
}

export const db = {
	exercises: {
		getAll: () => getAll<Exercise>('exercises'),
		getOne: (id: string) => getOne<Exercise>('exercises', id),
		put: (exercise: Exercise) => putRecord('exercises', exercise),
		remove: (id: string) => removeRecord('exercises', id)
	},

	programs: {
		getAll: () => getAll<Program>('programs'),
		getOne: (id: string) => getOne<Program>('programs', id),
		put: (program: Program) => putRecord('programs', program),
		remove: (id: string) => removeRecord('programs', id)
	},

	sessions: {
		getAll: () => getAll<SessionLog>('sessions'),
		getOne: (id: string) => getOne<SessionLog>('sessions', id),
		put: (session: SessionLog) => putRecord('sessions', session),
		delete: (id: string) => removeRecord('sessions', id)
	},

	exerciseLastUsed: {
		get: (exerciseId: string) => getOne<ExerciseLastUsed>('exerciseLastUsed', exerciseId),
		put: (record: ExerciseLastUsed) => putRecord('exerciseLastUsed', record)
	},

	activities: {
		getAll: () => getAll<ActivityLog>('activities'),
		put: (activity: ActivityLog) => putRecord('activities', activity),
		remove: (id: string) => removeRecord('activities', id)
	},

	habits: {
		getAll: () => getAll<Habit>('habits'),
		put: (habit: Habit) => putRecord('habits', habit),
		remove: (id: string) => removeRecord('habits', id)
	},

	habitLogs: {
		getAll: () => getAll<HabitLog>('habitLogs'),
		put: (log: HabitLog) => putRecord('habitLogs', log),
		remove: (id: string) => removeRecord('habitLogs', id)
	}
};
