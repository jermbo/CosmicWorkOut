import type { Item, Program, Session, ItemLastUsed, ActivityLog, Habit, HabitLog, HealthReading } from './types';
import type { GoalPlan } from '$lib/goalPlans/types';
import { db, clearWorkoutData, putAllRecords, initDB } from './database';

const BACKUP_FORMAT = 'cosmic-workout-backup';
const BACKUP_VERSION = 1;

/** localStorage keys included in a backup. Transient keys (activeSession, habitDay) are excluded. */
const BACKUP_LOCAL_KEYS = ['cwout:prefs', 'cwout:activeProgramIds', 'cwout:lastActivityType'] as const;

interface BackupDb {
	items: Item[];
	programs: Program[];
	sessions: Session[];
	itemLastUsed: ItemLastUsed[];
	activities: ActivityLog[];
	habits: Habit[];
	habitLogs: HabitLog[];
	healthReadings: HealthReading[];
	/** Absent in pre-v1.9.0 backups. */
	goalPlans?: GoalPlan[];
}

export interface BackupEnvelope {
	format: typeof BACKUP_FORMAT;
	version: number;
	exportedAt: string;
	db: BackupDb;
	localStorage: Record<string, unknown>;
}

/** Read a localStorage value, parsing JSON when possible, else keeping the raw string. */
function readLocal(key: string): unknown {
	const raw = localStorage.getItem(key);
	if (raw === null) return undefined;
	try {
		return JSON.parse(raw);
	} catch {
		return raw;
	}
}

function writeLocal(key: string, value: unknown): void {
	if (value === undefined || value === null) return;
	if (typeof value === 'string') {
		localStorage.setItem(key, value);
	} else {
		localStorage.setItem(key, JSON.stringify(value));
	}
}

/** Build a complete, versioned snapshot of all durable on-device data. */
export async function exportBackup(): Promise<BackupEnvelope> {
	const [items, programs, sessions, itemLastUsed, activities, habits, habitLogs, healthReadings, goalPlans] =
		await Promise.all([
			db.items.getAll(),
			db.programs.getAll(),
			db.sessions.getAll(),
			db.itemLastUsed.getAll(),
			db.activities.getAll(),
			db.habits.getAll(),
			db.habitLogs.getAll(),
			db.healthReadings.getAll(),
			db.goalPlans.getAll(),
		]);

	const local: Record<string, unknown> = {};
	for (const key of BACKUP_LOCAL_KEYS) {
		const value = readLocal(key);
		if (value !== undefined) local[key] = value;
	}

	return {
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		exportedAt: new Date().toISOString(),
		db: { items, programs, sessions, itemLastUsed, activities, habits, habitLogs, healthReadings, goalPlans },
		localStorage: local,
	};
}

/** Download the current backup as a dated JSON file. */
export async function downloadBackup(): Promise<void> {
	const envelope = await exportBackup();
	const json = JSON.stringify(envelope, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const today = new Date().toISOString().slice(0, 10);
	const a = document.createElement('a');
	a.href = url;
	a.download = `cosmic-workout-backup-${today}.json`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

export class BackupValidationError extends Error {}

/** Parse and validate a backup file's contents. Throws BackupValidationError on bad input. */
export function parseBackup(text: string): BackupEnvelope {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new BackupValidationError('This file is not valid JSON.');
	}

	if (typeof parsed !== 'object' || parsed === null) {
		throw new BackupValidationError('This file is not a CosmicWorkOut backup.');
	}

	const env = parsed as Partial<BackupEnvelope>;
	if (env.format !== BACKUP_FORMAT) {
		throw new BackupValidationError('This file is not a CosmicWorkOut backup.');
	}
	if (typeof env.version !== 'number') {
		throw new BackupValidationError('This backup is missing a version and cannot be restored.');
	}
	if (env.version > BACKUP_VERSION) {
		throw new BackupValidationError('This backup was made by a newer version of the app. Please update first.');
	}
	if (typeof env.db !== 'object' || env.db === null) {
		throw new BackupValidationError('This backup is missing its data and cannot be restored.');
	}

	return env as BackupEnvelope;
}

const DB_STORES: (keyof BackupDb)[] = [
	'items',
	'programs',
	'sessions',
	'itemLastUsed',
	'activities',
	'habits',
	'habitLogs',
	'healthReadings',
	'goalPlans',
];

/**
 * Replace all on-device workout data with the contents of a validated backup.
 * Wipes IndexedDB, writes imported records, restores localStorage, then re-upserts
 * built-ins. Does not reload — the caller decides when to refresh.
 */
export async function importBackup(envelope: BackupEnvelope): Promise<void> {
	await clearWorkoutData();

	for (const store of DB_STORES) {
		const records = (envelope.db[store] ?? []) as unknown[];
		if (records.length > 0) await putAllRecords(store, records);
	}

	// Clear transient keys so restored data isn't mixed with this device's session.
	localStorage.removeItem('cwout:activeSession');
	localStorage.removeItem('cwout:habitDay');
	localStorage.removeItem('cwout:activeProgramId');

	for (const key of BACKUP_LOCAL_KEYS) {
		if (key in envelope.localStorage) writeLocal(key, envelope.localStorage[key]);
	}

	await initDB();
}
