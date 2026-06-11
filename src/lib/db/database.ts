import type { Exercise, Program, SessionLog, ExerciseLastUsed } from './types';
import { builtInExercises, builtInPrograms } from './seed';

const DB_NAME = 'cosmic-workout';
const DB_VERSION = 1;

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

export async function initDB(): Promise<void> {
	// Always upsert built-in exercises so new fields (cat, muscles) land on old records
	for (const exercise of builtInExercises) {
		await putRecord('exercises', exercise);
	}

	// Only seed programs on first run
	const programs = await getAll<Program>('programs');
	if (programs.length === 0) {
		for (const program of builtInPrograms) {
			await putRecord('programs', program);
		}
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
		put: (program: Program) => putRecord('programs', program)
	},

	sessions: {
		getAll: () => getAll<SessionLog>('sessions'),
		getOne: (id: string) => getOne<SessionLog>('sessions', id),
		put: (session: SessionLog) => putRecord('sessions', session),

		getByDate: async (date: string): Promise<SessionLog | undefined> => {
			const all = await getAll<SessionLog>('sessions');
			return all.find((s) => s.date === date);
		},

		getForProgram: async (programId: string): Promise<SessionLog[]> => {
			const all = await getAll<SessionLog>('sessions');
			return all.filter((s) => s.programId === programId);
		}
	},

	exerciseLastUsed: {
		get: (exerciseId: string) => getOne<ExerciseLastUsed>('exerciseLastUsed', exerciseId),
		put: (record: ExerciseLastUsed) => putRecord('exerciseLastUsed', record)
	}
};
