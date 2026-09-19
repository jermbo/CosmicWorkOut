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
import { db, clearWorkoutData, putAllRecords, countRecords, initDB } from './database';

const BACKUP_FORMAT = 'cosmic-workout-backup';
const BACKUP_VERSION = 1;

/** Temporary IndexedDB used to prove a backup is writable before touching live data. */
const STAGING_DB_NAME = 'cosmic-workout-restore';
const STAGING_DB_VERSION = 1;

/** localStorage keys included in a backup. Transient keys (activeSession, habitDay) are excluded. */
const BACKUP_LOCAL_KEYS = [
	'cwout:prefs',
	'cwout:activeProgramIds',
	'cwout:lastActivityType',
] as const;

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

const STORE_KEY_PATH: Record<keyof BackupDb, string> = {
	items: 'id',
	programs: 'id',
	sessions: 'id',
	itemLastUsed: 'itemId',
	activities: 'id',
	habits: 'id',
	habitLogs: 'id',
	healthReadings: 'id',
	goalPlans: 'id',
};

type StoreCounts = Record<keyof BackupDb, number>;

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

function expectedCounts(plain: BackupEnvelope): StoreCounts {
	const counts = {} as StoreCounts;
	for (const store of DB_STORES) {
		counts[store] = plain.db[store]?.length ?? 0;
	}
	return counts;
}

function assertCountsMatch(expected: StoreCounts, actual: StoreCounts, phase: string): void {
	for (const store of DB_STORES) {
		if (actual[store] !== expected[store]) {
			throw new Error(
				`Restore ${phase} count mismatch for "${store}": expected ${expected[store]}, got ${actual[store]}.`,
			);
		}
	}
}

/** Build a complete, versioned snapshot of all durable on-device data. */
export async function exportBackup(): Promise<BackupEnvelope> {
	const [
		items,
		programs,
		sessions,
		itemLastUsed,
		activities,
		habits,
		habitLogs,
		healthReadings,
		goalPlans,
	] = await Promise.all([
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

	const envelope: BackupEnvelope = {
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		exportedAt: new Date().toISOString(),
		db: {
			items,
			programs,
			sessions,
			itemLastUsed,
			activities,
			habits,
			habitLogs,
			healthReadings,
			goalPlans,
		},
		localStorage: local,
	};

	// Confirm the snapshot is JSON-safe and complete before the user walks away with the file.
	const roundTrip = JSON.parse(JSON.stringify(envelope)) as BackupEnvelope;
	assertCountsMatch(expectedCounts(envelope), expectedCounts(roundTrip), 'export');

	return envelope;
}

export type BackupExportResult = { method: 'share' | 'download' | 'cancelled' };

function backupFileName(): string {
	const today = new Date().toISOString().slice(0, 10);
	return `cosmic-workout-backup-${today}.json`;
}

function triggerDownload(blob: Blob, fileName: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

function isAbortError(err: unknown): boolean {
	return (
		(err instanceof DOMException && err.name === 'AbortError') ||
		(err instanceof Error && err.name === 'AbortError')
	);
}

/** True only when this browser can share a File via the system sheet (not merely navigator.share). */
function canShareBackupFile(file: File): boolean {
	if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
	if (typeof navigator.canShare !== 'function') return false;
	try {
		// Files only — adding title/text breaks share on some Android browsers (incl. Brave).
		return navigator.canShare({ files: [file] });
	} catch (err) {
		console.warn('[backup-export] canShare threw; using download', err);
		return false;
	}
}

/**
 * Export the current backup. On phones that support file sharing, opens the system
 * share sheet (Save to Files, Mail, AirDrop). Otherwise downloads the JSON file.
 * If share is offered but fails (common on Brave), falls back to download.
 */
export async function downloadBackup(): Promise<BackupExportResult> {
	const envelope = await exportBackup();
	const json = JSON.stringify(envelope, null, 2);
	const fileName = backupFileName();
	const blob = new Blob([json], { type: 'application/json' });
	const file = new File([blob], fileName, { type: 'application/json' });

	if (canShareBackupFile(file)) {
		try {
			await navigator.share({ files: [file] });
			return { method: 'share' };
		} catch (err) {
			if (isAbortError(err)) return { method: 'cancelled' };
			// Brave (desktop + Android) often reports canShare(files) then rejects share().
			console.warn('[backup-export] share failed; falling back to download', err);
		}
	}

	triggerDownload(blob, fileName);
	return { method: 'download' };
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
		throw new BackupValidationError(
			'This backup was made by a newer version of the app. Please update first.',
		);
	}
	if (typeof env.db !== 'object' || env.db === null) {
		throw new BackupValidationError('This backup is missing its data and cannot be restored.');
	}

	return env as BackupEnvelope;
}

function openStagingDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(STAGING_DB_NAME, STAGING_DB_VERSION);
		request.onupgradeneeded = () => {
			const staging = request.result;
			for (const store of DB_STORES) {
				if (!staging.objectStoreNames.contains(store)) {
					staging.createObjectStore(store, { keyPath: STORE_KEY_PATH[store] });
				}
			}
		};
		request.onsuccess = () => {
			const staging = request.result;
			staging.onversionchange = () => staging.close();
			resolve(staging);
		};
		request.onerror = () => reject(request.error);
	});
}

function deleteStagingDb(): Promise<void> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.deleteDatabase(STAGING_DB_NAME);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
		// Don't reject on blocked — onsuccess still fires once other connections close.
		request.onblocked = () => console.warn('[backup-restore] staging delete blocked, waiting…');
	});
}

function putAllOnDb<T>(idb: IDBDatabase, storeName: string, values: T[]): Promise<void> {
	if (values.length === 0) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const tx = idb.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		for (let i = 0; i < values.length; i++) {
			try {
				store.put(values[i]);
			} catch (err) {
				try {
					tx.abort();
				} catch {
					/* already failing */
				}
				reject(
					new Error(
						`Staging put failed in "${storeName}" (index ${i}): ${err instanceof Error ? err.message : String(err)}`,
						{ cause: err },
					),
				);
				return;
			}
		}
	});
}

function countOnDb(idb: IDBDatabase, storeName: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const tx = idb.transaction(storeName, 'readonly');
		const request = tx.objectStore(storeName).count();
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function writeAndVerifyStaging(plain: BackupEnvelope, expected: StoreCounts): Promise<void> {
	await deleteStagingDb().catch(() => {
		/* nothing to delete */
	});

	const staging = await openStagingDb();
	try {
		for (const store of DB_STORES) {
			const records = (plain.db[store] ?? []) as unknown[];
			console.info(`[backup-restore] staging ${records.length} → ${store}`);
			await putAllOnDb(staging, store, records);
		}

		const staged = {} as StoreCounts;
		for (const store of DB_STORES) {
			staged[store] = await countOnDb(staging, store);
		}
		assertCountsMatch(expected, staged, 'staging');
		console.info('[backup-restore] staging verified', staged);
	} finally {
		staging.close();
	}
}

async function countLiveStores(): Promise<StoreCounts> {
	const live = {} as StoreCounts;
	for (const store of DB_STORES) {
		live[store] = await countRecords(store);
	}
	return live;
}

async function commitLiveFromPlain(plain: BackupEnvelope, expected: StoreCounts): Promise<void> {
	await clearWorkoutData();
	console.info('[backup-restore] live stores cleared');

	for (const store of DB_STORES) {
		const records = (plain.db[store] ?? []) as unknown[];
		if (records.length === 0) continue;
		console.info(`[backup-restore] writing ${records.length} → ${store}`);
		await putAllRecords(store, records, { silent: true });
	}

	const live = await countLiveStores();
	assertCountsMatch(expected, live, 'live');
	console.info('[backup-restore] live verified', live);
}

/**
 * Replace all on-device workout data with the contents of a validated backup.
 *
 * Safety model for device transfer:
 * 1. Flatten + validate (live data untouched)
 * 2. Write the full backup into a staging IndexedDB and verify counts
 * 3. Only then clear live stores and write the same payload
 * 4. Verify live counts; delete staging
 *
 * If anything fails before step 3, existing on-device data is unchanged.
 * Does not reload — the caller decides when to refresh.
 */
export async function importBackup(envelope: BackupEnvelope): Promise<void> {
	// Svelte $state (and other Proxies) cannot be structured-cloned into IndexedDB.
	const plain = JSON.parse(JSON.stringify(envelope)) as BackupEnvelope;
	const expected = expectedCounts(plain);

	console.info('[backup-restore] starting', {
		exportedAt: plain.exportedAt,
		version: plain.version,
		stores: expected,
	});

	for (const store of DB_STORES) {
		const records = plain.db[store];
		if (records !== undefined && !Array.isArray(records)) {
			throw new BackupValidationError(
				`This backup's "${store}" data is malformed and cannot be restored.`,
			);
		}
	}

	try {
		structuredClone(plain.db);
	} catch (err) {
		console.error('[backup-restore] preflight structuredClone failed', err);
		throw new BackupValidationError(
			'This backup contains data that cannot be stored in IndexedDB.',
		);
	}

	const localEntries =
		plain.localStorage && typeof plain.localStorage === 'object' ? plain.localStorage : {};

	// Phase A — prove the backup is writable without touching live data.
	try {
		await writeAndVerifyStaging(plain, expected);
	} catch (err) {
		await deleteStagingDb().catch(() => {
			/* best-effort cleanup */
		});
		console.error('[backup-restore] staging failed — live data untouched', err);
		if (err instanceof BackupValidationError) throw err;
		throw new BackupValidationError(
			err instanceof Error
				? `Could not prepare the restore (${err.message}). Your existing data is unchanged.`
				: 'Could not prepare the restore. Your existing data is unchanged.',
		);
	}

	// Phase B — replace live data. Staging already proved the payload is writable.
	try {
		await commitLiveFromPlain(plain, expected);
	} catch (err) {
		console.error('[backup-restore] live commit failed — retrying once from prepared payload', err);
		try {
			await commitLiveFromPlain(plain, expected);
		} catch (retryErr) {
			console.error('[backup-restore] live retry failed', retryErr);
			// Leave staging in place so a re-import or DevTools inspection still has a full copy.
			throw new Error(
				'Restore failed while replacing on-device data. Re-import the same backup file — do not delete it. Your original backup file is still the source of truth.',
				{ cause: retryErr },
			);
		}
	}

	await deleteStagingDb().catch((err) => {
		console.warn('[backup-restore] could not delete staging DB (harmless)', err);
	});

	localStorage.removeItem('cwout:activeSession');
	localStorage.removeItem('cwout:habitDay');
	localStorage.removeItem('cwout:activeProgramId');

	for (const key of BACKUP_LOCAL_KEYS) {
		if (key in localEntries) writeLocal(key, localEntries[key]);
	}

	await initDB();
	console.info('[backup-restore] complete');
}
