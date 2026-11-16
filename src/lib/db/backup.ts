import {
	db,
	clearWorkoutData,
	putAllRecords,
	countRecords,
	countByDateRange,
	replaceDateRange,
	initDB,
} from './database';
import { generateId } from '$lib/utils';
import {
	BACKUP_FORMAT,
	BACKUP_VERSION,
	BACKUP_LOCAL_KEYS,
	DB_STORES,
	STORE_KEY_PATH,
	DATED_STORES,
	WINDOW_LOCAL_KEYS,
	assertCountsMatch,
	expectedCounts,
	localEntriesOf,
	scopeEnvelope,
} from './backupPayload';
import type { BackupEnvelope, BackupScope, DatedStore } from './backupPayload';
import { prepareFullRestore, prepareWindowRestore, stageAndCommit } from './restore';
import type { RestoreTarget } from './restore';

export { BackupValidationError, assertBackupSize, parseBackup } from './backupPayload';
export type { BackupEnvelope, BackupScope } from './backupPayload';

/** Temporary IndexedDB used to prove a backup is writable before touching live data. */
const STAGING_DB_NAME = 'cosmic-workout-restore';
const STAGING_DB_VERSION = 1;

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
	const [
		items,
		programs,
		sessions,
		itemLastUsed,
		activities,
		activityTypes,
		habits,
		habitLogs,
		healthReadings,
		goalPlans,
		baselines,
		baselineLogs,
	] = await Promise.all([
		db.items.getAll(),
		db.programs.getAll(),
		db.sessions.getAll(),
		db.itemLastUsed.getAll(),
		db.activities.getAll(),
		db.activityTypes.getAll(),
		db.habits.getAll(),
		db.habitLogs.getAll(),
		db.healthReadings.getAll(),
		db.goalPlans.getAll(),
		db.baselines.getAll(),
		db.baselineLogs.getAll(),
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
			activityTypes,
			habits,
			habitLogs,
			healthReadings,
			goalPlans,
			baselines,
			baselineLogs,
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

/** The real databases a restore writes to. The steps themselves live in `restore.ts`. */
const indexedDbTarget: RestoreTarget = {
	async openStaging() {
		await deleteStagingDb().catch(() => {
			/* nothing to delete */
		});
		const staging = await openStagingDb();
		return {
			write: (store, records) => putAllOnDb(staging, store, records),
			count: (store) => countOnDb(staging, store),
			close: () => staging.close(),
		};
	},
	deleteStaging: deleteStagingDb,
	clearLive: clearWorkoutData,
	writeLive: (store, records) => putAllRecords(store, records, { silent: true }),
	countLive: countRecords,
};

/**
 * Replace all on-device workout data with the contents of a validated backup.
 * If anything fails before live stores are cleared, existing data is unchanged —
 * see `restore.ts` for the steps. Does not reload — the caller decides when to refresh.
 */
export async function importBackup(envelope: BackupEnvelope): Promise<void> {
	const plain = prepareFullRestore(envelope, generateId, new Date().toISOString());
	console.info('[backup-restore] starting', {
		exportedAt: plain.exportedAt,
		version: plain.version,
		stores: expectedCounts(plain),
	});

	await stageAndCommit(plain, indexedDbTarget);

	localStorage.removeItem('cwout:activeSession');
	localStorage.removeItem('cwout:habitDay');
	localStorage.removeItem('cwout:activeProgramId');

	const localEntries = localEntriesOf(plain);
	for (const key of BACKUP_LOCAL_KEYS) {
		if (key in localEntries) writeLocal(key, localEntries[key]);
	}

	await initDB();
	console.info('[backup-restore] complete');
}

// --- QR backup (US-057 / US-058) ----------------------------------------------

/** Build the envelope a QR backup sends for the chosen scope. */
export async function exportQrBackup(scope: BackupScope): Promise<BackupEnvelope> {
	return scopeEnvelope(await exportBackup(), scope);
}

/** How many of this device's records a window backup would replace, per dated store. */
export async function countWindowOnDevice(
	from: string,
	to: string,
): Promise<Record<DatedStore, number>> {
	return (await countByDateRange(DATED_STORES, from, to)) as Record<DatedStore, number>;
}

/**
 * Apply a QR window backup: this device's records dated inside the window are replaced
 * by the backup's; definitions and weight memory are upserted, never deleted; prefs and
 * any in-progress session stay. One transaction — a failure leaves the device unchanged.
 * Does not reload — the caller decides when to refresh.
 */
export async function importWindowBackup(envelope: BackupEnvelope): Promise<void> {
	const { from, to, replace, upsert, plain } = prepareWindowRestore(envelope);
	console.info('[qr-receive] applying window', { from, to }, expectedCounts(plain));
	await replaceDateRange(from, to, replace, upsert);

	const localEntries = localEntriesOf(plain);
	for (const key of WINDOW_LOCAL_KEYS) {
		if (key in localEntries) writeLocal(key, localEntries[key]);
	}
	console.info('[qr-receive] window applied');
}
