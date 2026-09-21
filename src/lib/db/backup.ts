import { db, clearWorkoutData, putAllRecords, countRecords, initDB } from './database';
import {
	BACKUP_FORMAT,
	BACKUP_VERSION,
	BACKUP_LOCAL_KEYS,
	DB_STORES,
	STORE_KEY_PATH,
	BackupValidationError,
	assertCountsMatch,
	assertStoresAreArrays,
	dropLegacyBaselines,
	expectedCounts,
	localEntriesOf,
	toPlainEnvelope,
} from './backupPayload';
import type { BackupEnvelope, StoreCounts } from './backupPayload';

export { BackupValidationError, assertBackupSize, parseBackup } from './backupPayload';
export type { BackupEnvelope } from './backupPayload';

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
	const plain = toPlainEnvelope(envelope);
	if (dropLegacyBaselines(plain)) {
		console.info('[backup-restore] dropped pre-v1.10.0 baselines from the backup');
	}
	const expected = expectedCounts(plain);

	console.info('[backup-restore] starting', {
		exportedAt: plain.exportedAt,
		version: plain.version,
		stores: expected,
	});

	assertStoresAreArrays(plain);

	try {
		structuredClone(plain.db);
	} catch (err) {
		console.error('[backup-restore] preflight structuredClone failed', err);
		throw new BackupValidationError(
			'This backup contains data that cannot be stored in IndexedDB.',
		);
	}

	const localEntries = localEntriesOf(plain);

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
