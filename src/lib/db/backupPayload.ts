import type {
	Item,
	Program,
	Session,
	ItemLastUsed,
	ActivityLog,
	Habit,
	HabitLog,
	HealthReading,
	Baseline,
	BaselineLog,
} from './types';
import type { GoalPlan } from '$lib/goalPlans/types';

/**
 * The pure half of backup/restore: the envelope shape, its validation, and the
 * payload checks that run before any data is written.
 *
 * Kept free of IndexedDB and localStorage on purpose — this is the code path that
 * decides whether a user's data survives a device transfer, so it has to be
 * testable without a browser. The transaction plumbing lives in `backup.ts`.
 */

export const BACKUP_FORMAT = 'cosmic-workout-backup';
export const BACKUP_VERSION = 1;

/** localStorage keys included in a backup. Transient keys (activeSession, habitDay) are excluded. */
export const BACKUP_LOCAL_KEYS = [
	'cwout:prefs',
	'cwout:activeProgramIds',
	'cwout:lastActivityType',
] as const;

export interface BackupDb {
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
	/** Absent in pre-v1.9.0 backups. */
	baselines?: Baseline[];
	/** Absent in pre-v1.9.0 backups. */
	baselineLogs?: BaselineLog[];
}

export interface BackupEnvelope {
	format: typeof BACKUP_FORMAT;
	version: number;
	exportedAt: string;
	db: BackupDb;
	localStorage: Record<string, unknown>;
}

export const DB_STORES: (keyof BackupDb)[] = [
	'items',
	'programs',
	'sessions',
	'itemLastUsed',
	'activities',
	'habits',
	'habitLogs',
	'healthReadings',
	'goalPlans',
	'baselines',
	'baselineLogs',
];

export const STORE_KEY_PATH: Record<keyof BackupDb, string> = {
	items: 'id',
	programs: 'id',
	sessions: 'id',
	itemLastUsed: 'itemId',
	activities: 'id',
	habits: 'id',
	habitLogs: 'id',
	healthReadings: 'id',
	goalPlans: 'id',
	baselines: 'id',
	baselineLogs: 'id',
};

export type StoreCounts = Record<keyof BackupDb, number>;

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
		throw new BackupValidationError(
			'This backup was made by a newer version of the app. Please update first.',
		);
	}
	if (typeof env.db !== 'object' || env.db === null) {
		throw new BackupValidationError('This backup is missing its data and cannot be restored.');
	}

	return env as BackupEnvelope;
}

export function expectedCounts(plain: BackupEnvelope): StoreCounts {
	const counts = {} as StoreCounts;
	for (const store of DB_STORES) {
		counts[store] = plain.db[store]?.length ?? 0;
	}
	return counts;
}

export function assertCountsMatch(expected: StoreCounts, actual: StoreCounts, phase: string): void {
	for (const store of DB_STORES) {
		if (actual[store] !== expected[store]) {
			throw new Error(
				`Restore ${phase} count mismatch for "${store}": expected ${expected[store]}, got ${actual[store]}.`,
			);
		}
	}
}

/**
 * Strip Svelte `$state` proxies (and anything else non-cloneable) by round-tripping
 * through JSON. IndexedDB uses structured clone, which throws on a Proxy.
 */
export function toPlainEnvelope(envelope: BackupEnvelope): BackupEnvelope {
	return JSON.parse(JSON.stringify(envelope)) as BackupEnvelope;
}

/**
 * Reject a payload whose stores are present but not arrays — writing one would
 * throw mid-transaction, after live data had already been cleared.
 */
export function assertStoresAreArrays(plain: BackupEnvelope): void {
	for (const store of DB_STORES) {
		const records = plain.db[store];
		if (records !== undefined && !Array.isArray(records)) {
			throw new BackupValidationError(
				`This backup's "${store}" data is malformed and cannot be restored.`,
			);
		}
	}
}

/** The backup's localStorage map, or an empty one when it is missing or malformed. */
export function localEntriesOf(plain: BackupEnvelope): Record<string, unknown> {
	const entries = plain.localStorage;
	if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return {};
	return entries;
}
