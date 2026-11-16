// The restore steps, with no IndexedDB in them. `backup.ts` wires these to the real
// databases; tests wire them to an in-memory fake that can fail at any step.
//
// Safety model for a full restore:
// 1. Flatten + validate (live data untouched)
// 2. Write the full backup into a staging database and verify counts
// 3. Only then clear live stores and write the same payload
// 4. Verify live counts (retry once); delete staging
// If anything fails before step 3, existing on-device data is unchanged.
import {
	BackupValidationError,
	DATED_STORES,
	DB_STORES,
	UPSERT_STORES,
	assertCountsMatch,
	assertStoresAreArrays,
	assertWindowRecords,
	dropLegacyBaselines,
	expectedCounts,
	fillActivityTypes,
	scopeOf,
	toPlainEnvelope,
} from './backupPayload.ts';
import type { BackupEnvelope, StoreCounts } from './backupPayload.ts';

/** A fresh, empty staging database, open for one restore. */
export interface StagingDb {
	write(store: string, records: unknown[]): Promise<void>;
	count(store: string): Promise<number>;
	close(): void;
}

/** The storage a restore writes to. */
export interface RestoreTarget {
	/** Delete any old staging database and open an empty one. */
	openStaging(): Promise<StagingDb>;
	deleteStaging(): Promise<void>;
	clearLive(): Promise<void>;
	writeLive(store: string, records: unknown[]): Promise<void>;
	countLive(store: string): Promise<number>;
}

function assertCloneable(plain: BackupEnvelope): void {
	try {
		structuredClone(plain.db);
	} catch (err) {
		console.error('[backup-restore] preflight structuredClone failed', err);
		throw new BackupValidationError(
			'This backup contains data that cannot be stored in IndexedDB.',
		);
	}
}

/** Step 1: everything that can be checked or upgraded before any database is touched. */
export function prepareFullRestore(
	envelope: BackupEnvelope,
	newId: () => string,
	now: string,
): BackupEnvelope {
	const plain = toPlainEnvelope(envelope);
	if (scopeOf(plain).kind === 'window') {
		// Replacing everything with a date window would wipe every day outside it.
		throw new BackupValidationError(
			'This is a partial backup from Send by QR. Receive it with Receive by QR instead.',
		);
	}
	if (dropLegacyBaselines(plain)) {
		console.info('[backup-restore] dropped pre-v1.10.0 baselines from the backup');
	}
	assertStoresAreArrays(plain);
	if (fillActivityTypes(plain, newId, now)) {
		console.info('[backup-restore] built the activity type list from a pre-v1.13.0 backup');
	}
	assertCloneable(plain);
	return plain;
}

function recordsOf(plain: BackupEnvelope, store: (typeof DB_STORES)[number]): unknown[] {
	return (plain.db[store] ?? []) as unknown[];
}

async function stageAndVerify(
	plain: BackupEnvelope,
	expected: StoreCounts,
	target: RestoreTarget,
): Promise<void> {
	const staging = await target.openStaging();
	try {
		for (const store of DB_STORES) {
			const records = recordsOf(plain, store);
			if (records.length > 0) await staging.write(store, records);
		}
		const staged = {} as StoreCounts;
		for (const store of DB_STORES) staged[store] = await staging.count(store);
		assertCountsMatch(expected, staged, 'staging');
	} finally {
		staging.close();
	}
}

async function commitLive(
	plain: BackupEnvelope,
	expected: StoreCounts,
	target: RestoreTarget,
): Promise<void> {
	await target.clearLive();
	for (const store of DB_STORES) {
		const records = recordsOf(plain, store);
		if (records.length > 0) await target.writeLive(store, records);
	}
	const live = {} as StoreCounts;
	for (const store of DB_STORES) live[store] = await target.countLive(store);
	assertCountsMatch(expected, live, 'live');
}

/** Steps 2–4: prove the backup is writable in staging, then replace live data. */
export async function stageAndCommit(plain: BackupEnvelope, target: RestoreTarget): Promise<void> {
	const expected = expectedCounts(plain);

	// Phase A — prove the backup is writable without touching live data.
	try {
		await stageAndVerify(plain, expected, target);
	} catch (err) {
		await target.deleteStaging().catch(() => {
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
		await commitLive(plain, expected, target);
	} catch (err) {
		console.error('[backup-restore] live commit failed — retrying once', err);
		try {
			await commitLive(plain, expected, target);
		} catch (retryErr) {
			// Leave staging in place so a re-import or DevTools inspection still has a full copy.
			throw new Error(
				'Restore failed while replacing on-device data. Re-import the same backup file — do not delete it. Your original backup file is still the source of truth.',
				{ cause: retryErr },
			);
		}
	}

	await target.deleteStaging().catch((err) => {
		console.warn('[backup-restore] could not delete staging DB (harmless)', err);
	});
}

/** What a QR window restore writes: dated stores to replace, definitions to upsert. */
export interface WindowPlan {
	from: string;
	to: string;
	replace: Record<string, unknown[]>;
	upsert: Record<string, unknown[]>;
	plain: BackupEnvelope;
}

/** Check a QR window backup and work out what it replaces, before any write. */
export function prepareWindowRestore(envelope: BackupEnvelope): WindowPlan {
	const plain = toPlainEnvelope(envelope);
	const scope = scopeOf(plain);
	if (scope.kind !== 'window') {
		throw new BackupValidationError('This backup is not a date-range backup.');
	}
	assertStoresAreArrays(plain);
	assertWindowRecords(plain, scope.from, scope.to);
	assertCloneable(plain);

	// A store missing from the payload is left alone rather than cleared.
	const replace: Record<string, unknown[]> = {};
	for (const store of DATED_STORES) {
		const records = plain.db[store];
		if (Array.isArray(records)) replace[store] = records;
	}
	const upsert: Record<string, unknown[]> = {};
	for (const store of UPSERT_STORES) {
		const records = plain.db[store];
		if (Array.isArray(records) && records.length > 0) upsert[store] = records;
	}
	return { from: scope.from, to: scope.to, replace, upsert, plain };
}
