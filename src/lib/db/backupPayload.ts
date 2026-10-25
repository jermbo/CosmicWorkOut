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
import { isLegacyBaseline } from '../baselines/logic.ts';

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

/**
 * Storage keys deliberately left out of every backup. A test fails when the app uses a
 * `cwout:` key that is in neither list, so a new key can't be forgotten silently.
 */
export const DEVICE_ONLY_KEYS = [
	'cwout:activeSession', // in-progress workout — crash recovery for this device only
	'cwout:habitDay', // vestigial; rewritten on load
	'cwout:activeProgramId', // legacy single active program, replaced by activeProgramIds
	'cwout:lastQrBackupAt', // when this device last sent a QR backup
	'cwout:qrSendOptions', // this device's QR density and speed
	'cwout:qrReceived', // sessionStorage flag for one toast after reload
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

/**
 * What a backup covers. File backups are always `full` (and carry no `scope` field).
 * A QR backup (US-057) may be a `window`: only records dated `from`–`to`, inclusive.
 */
export type BackupScope = { kind: 'full' } | { kind: 'window'; from: string; to: string };

export interface BackupEnvelope {
	format: typeof BACKUP_FORMAT;
	version: number;
	exportedAt: string;
	/** Absent on file backups, which are always full. */
	scope?: BackupScope;
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

/**
 * Largest file restore will read. Real backups are well under 1 MB even with years of logs;
 * the cap stops a wrong or huge file from freezing the tab in `file.text()`.
 */
export const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

/** Throws BackupValidationError when a file is too large to be a backup. Call before reading it. */
export function assertBackupSize(bytes: number): void {
	if (bytes > MAX_BACKUP_BYTES) {
		throw new BackupValidationError('This file is too large to be a CosmicWorkOut backup.');
	}
}

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

/**
 * Baselines were reshaped in v1.10.0 and v1.9.0 baseline data was test-only, so a
 * backup carrying the old shape restores without its baselines rather than writing
 * records the app can no longer read. Everything else in the backup is untouched.
 * Returns true when baselines were dropped.
 */
export function dropLegacyBaselines(plain: BackupEnvelope): boolean {
	if (!hasLegacyBaselines(plain)) return false;
	plain.db.baselines = [];
	plain.db.baselineLogs = [];
	return true;
}

/** True when the backup's baselines use the pre-v1.10.0 shape and will be skipped on restore. */
export function hasLegacyBaselines(plain: BackupEnvelope): boolean {
	const defs = plain.db.baselines;
	return Array.isArray(defs) && defs.some(isLegacyBaseline);
}

/** What each store holds, in words, for restore warnings. */
export const STORE_LABELS: Record<keyof BackupDb, string> = {
	items: 'custom exercises',
	programs: 'programs',
	sessions: 'workout sessions',
	itemLastUsed: 'weight memory',
	activities: 'activities',
	habits: 'habits',
	habitLogs: 'habit logs',
	healthReadings: 'health readings',
	goalPlans: 'plan goals',
	baselines: 'baselines',
	baselineLogs: 'baseline entries',
};

/**
 * Stores a backup doesn't carry at all — it was made before they existed (a v1.8.0 file
 * has no plan goals or baselines). Restore replaces everything, so these end up empty.
 */
export function missingStores(plain: BackupEnvelope): (keyof BackupDb)[] {
	return DB_STORES.filter((store) => plain.db[store] === undefined);
}

/**
 * Plain-language warnings for the restore confirm: data on this device the backup can't
 * replace and will therefore remove. Empty when the backup covers everything.
 */
export function restoreWarnings(plain: BackupEnvelope): string[] {
	const warnings: string[] = [];
	const missing = missingStores(plain);
	if (missing.length > 0) {
		const list = missing.map((store) => STORE_LABELS[store]).join(', ');
		warnings.push(
			`This backup was made by an older version and has no ${list}. Restoring removes any on this device.`,
		);
	}
	if (hasLegacyBaselines(plain)) {
		warnings.push(
			'Its baselines use the pre-v1.10.0 format and are skipped, along with their entries.',
		);
	}
	return warnings;
}

// --- QR backup scopes (US-057 / US-058) ---------------------------------------

/** Stores whose records carry a `date` (and a `by_date` index). A window replaces these by date. */
export const DATED_STORES = [
	'sessions',
	'habitLogs',
	'activities',
	'healthReadings',
	'baselineLogs',
] as const satisfies readonly (keyof BackupDb)[];
export type DatedStore = (typeof DATED_STORES)[number];

/** Stores a window backup adds to or updates, and never deletes from. */
export const UPSERT_STORES = [
	'items',
	'programs',
	'habits',
	'goalPlans',
	'baselines',
	'itemLastUsed',
] as const satisfies readonly (keyof BackupDb)[];

/** localStorage keys a window backup applies. Prefs stay per-device. */
export const WINDOW_LOCAL_KEYS = ['cwout:activeProgramIds', 'cwout:lastActivityType'] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function inWindow(date: unknown, from: string, to: string): boolean {
	return typeof date === 'string' && date >= from && date <= to;
}

/**
 * Cut a full export down to what a QR backup sends. Built-in items and programs are
 * always dropped — every device rebuilds them on boot (`initDB`). A window keeps only
 * records dated inside it, plus every definition, and leaves prefs out.
 */
export function scopeEnvelope(full: BackupEnvelope, scope: BackupScope): BackupEnvelope {
	const db: BackupDb = {
		...full.db,
		items: full.db.items.filter((item) => !item.isBuiltIn),
		programs: full.db.programs.filter((program) => !program.isBuiltIn),
	};
	let local = full.localStorage;

	if (scope.kind === 'window') {
		const dated = db as unknown as Record<DatedStore, { date?: unknown }[] | undefined>;
		for (const store of DATED_STORES) {
			dated[store] = (dated[store] ?? []).filter((r) => inWindow(r.date, scope.from, scope.to));
		}
		local = {};
		for (const key of WINDOW_LOCAL_KEYS) {
			if (key in full.localStorage) local[key] = full.localStorage[key];
		}
	}

	return { ...full, scope, db, localStorage: local };
}

/** The envelope's scope — `full` when absent. Throws BackupValidationError when malformed. */
export function scopeOf(env: BackupEnvelope): BackupScope {
	const scope: unknown = env.scope;
	if (scope === undefined) return { kind: 'full' };
	if (typeof scope === 'object' && scope !== null) {
		const s = scope as Record<string, unknown>;
		if (s.kind === 'full') return { kind: 'full' };
		if (
			s.kind === 'window' &&
			typeof s.from === 'string' &&
			typeof s.to === 'string' &&
			ISO_DATE.test(s.from) &&
			ISO_DATE.test(s.to) &&
			s.from <= s.to
		) {
			return { kind: 'window', from: s.from, to: s.to };
		}
	}
	throw new BackupValidationError('This backup has an unknown scope and cannot be restored.');
}

/**
 * Every dated record in a window backup must fall inside the window. One that doesn't
 * would be written without the matching record on this device ever being cleared.
 */
export function assertWindowRecords(plain: BackupEnvelope, from: string, to: string): void {
	for (const store of DATED_STORES) {
		const records = (plain.db[store] ?? []) as { date?: unknown }[];
		for (const record of records) {
			if (typeof record !== 'object' || record === null || !inWindow(record.date, from, to)) {
				throw new BackupValidationError(
					`This backup has "${store}" records outside its date range and cannot be restored.`,
				);
			}
		}
	}
}

/** Number of records per dated store in a backup. */
export function datedCounts(plain: BackupEnvelope): Record<DatedStore, number> {
	const counts = {} as Record<DatedStore, number>;
	for (const store of DATED_STORES) counts[store] = plain.db[store]?.length ?? 0;
	return counts;
}
