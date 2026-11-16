// The restore write path, run against an in-memory fake of IndexedDB that can fail at
// any step. A bad restore is the one failure the user cannot recover from: these prove
// live data is only touched after staging succeeds, and that a short write is caught.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	BACKUP_FORMAT,
	BACKUP_VERSION,
	BackupValidationError,
	DB_STORES,
	STORE_KEY_PATH,
} from './backupPayload.ts';
import type { BackupDb, BackupEnvelope } from './backupPayload.ts';
import { prepareFullRestore, prepareWindowRestore, stageAndCommit } from './restore.ts';
import type { RestoreTarget } from './restore.ts';

type Rows = Map<string, Map<unknown, unknown>>;
type Fault = { db: 'staging' | 'live'; store: string; kind: 'throw' | 'dropOne'; times: number };

function emptyRows(): Rows {
	return new Map(DB_STORES.map((s) => [s, new Map()]));
}

function put(rows: Rows, store: string, records: unknown[]): void {
	const key = STORE_KEY_PATH[store as keyof typeof STORE_KEY_PATH];
	for (const r of records) rows.get(store)!.set((r as Record<string, unknown>)[key], r);
}

/** A fake device: live rows, a staging copy, a log of calls, and faults to inject. */
function fakeDevice(liveRows: Partial<BackupDb> = {}, faults: Fault[] = []) {
	const live = emptyRows();
	for (const [store, records] of Object.entries(liveRows)) put(live, store, records as unknown[]);
	let staging: Rows | null = null;
	const calls: string[] = [];

	function write(db: 'staging' | 'live', rows: Rows, store: string, records: unknown[]) {
		const fault = faults.find((f) => f.db === db && f.store === store && f.times > 0);
		if (fault) {
			fault.times--;
			if (fault.kind === 'throw') throw new Error(`disk full in ${store}`);
			records = records.slice(1); // Write "succeeds" but a row goes missing.
		}
		put(rows, store, records);
	}

	const target: RestoreTarget = {
		async openStaging() {
			calls.push('openStaging');
			staging = emptyRows();
			const rows = staging;
			return {
				write: async (store, records) => write('staging', rows, store, records),
				count: async (store) => rows.get(store)!.size,
				close: () => calls.push('closeStaging'),
			};
		},
		async deleteStaging() {
			calls.push('deleteStaging');
			staging = null;
		},
		async clearLive() {
			calls.push('clearLive');
			for (const store of live.values()) store.clear();
		},
		async writeLive(store, records) {
			write('live', live, store, records);
		},
		async countLive(store) {
			return live.get(store)!.size;
		},
	};

	return {
		target,
		calls,
		liveIds: (store: string) => [...live.get(store)!.keys()],
		hasStaging: () => staging !== null,
	};
}

function backup(db: Partial<BackupDb> = {}, extra: Partial<BackupEnvelope> = {}): BackupEnvelope {
	return {
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		exportedAt: '2026-11-16T12:00:00.000Z',
		db: {
			items: [],
			programs: [],
			sessions: [
				{ id: 's1', date: '2026-11-01' },
				{ id: 's2', date: '2026-11-02' },
			],
			itemLastUsed: [],
			activities: [],
			activityTypes: [{ id: 't1', name: 'Cardio', createdAt: '2026-11-01' }],
			habits: [{ id: 'h1' }],
			habitLogs: [],
			healthReadings: [],
			goalPlans: [],
			baselines: [],
			baselineLogs: [],
			...db,
		} as unknown as BackupDb,
		localStorage: {},
		...extra,
	};
}

const onDevice = {
	sessions: [{ id: 'old-session', date: '2026-01-01' }],
	habits: [{ id: 'old-habit' }],
} as unknown as Partial<BackupDb>;

const prepare = (env: BackupEnvelope) => prepareFullRestore(env, () => 'new-id', '2026-11-16');

// ── Full restore ──────────────────────────────────────────────────────

test('a restore replaces live data with exactly the backup, then deletes staging', async () => {
	const device = fakeDevice(onDevice);
	await stageAndCommit(prepare(backup()), device.target);

	assert.deepEqual(device.liveIds('sessions'), ['s1', 's2']);
	assert.deepEqual(device.liveIds('habits'), ['h1']);
	assert.equal(device.hasStaging(), false);
	// Staging is written and closed before live data is cleared.
	assert.deepEqual(device.calls, ['openStaging', 'closeStaging', 'clearLive', 'deleteStaging']);
});

test('if staging fails, live data is never touched', async () => {
	const device = fakeDevice(onDevice, [
		{ db: 'staging', store: 'sessions', kind: 'throw', times: 1 },
	]);
	await assert.rejects(stageAndCommit(prepare(backup()), device.target), (err: Error) => {
		assert.ok(err instanceof BackupValidationError);
		assert.match(err.message, /existing data is unchanged/);
		return true;
	});
	assert.ok(!device.calls.includes('clearLive'));
	assert.deepEqual(device.liveIds('sessions'), ['old-session']);
	assert.equal(device.hasStaging(), false, 'staging is cleaned up');
});

test('a row lost while staging is caught before live data is touched', async () => {
	const device = fakeDevice(onDevice, [
		{ db: 'staging', store: 'sessions', kind: 'dropOne', times: 1 },
	]);
	await assert.rejects(stageAndCommit(prepare(backup()), device.target), /count mismatch/);
	assert.ok(!device.calls.includes('clearLive'));
	assert.deepEqual(device.liveIds('sessions'), ['old-session']);
});

test('a live write that fails once is retried and the restore completes', async () => {
	const device = fakeDevice(onDevice, [{ db: 'live', store: 'sessions', kind: 'throw', times: 1 }]);
	await stageAndCommit(prepare(backup()), device.target);
	assert.deepEqual(device.liveIds('sessions'), ['s1', 's2']);
	assert.deepEqual(device.liveIds('habits'), ['h1']);
});

test('a row lost in the live write is caught and retried', async () => {
	const device = fakeDevice(onDevice, [
		{ db: 'live', store: 'sessions', kind: 'dropOne', times: 1 },
	]);
	await stageAndCommit(prepare(backup()), device.target);
	assert.deepEqual(device.liveIds('sessions'), ['s1', 's2']);
});

test('if the live write fails twice, the error says to re-import and staging is kept', async () => {
	const device = fakeDevice(onDevice, [{ db: 'live', store: 'sessions', kind: 'throw', times: 2 }]);
	await assert.rejects(
		stageAndCommit(prepare(backup()), device.target),
		/Re-import the same backup file/,
	);
	assert.equal(device.hasStaging(), true);
});

test('an old backup with no activity type list restores with one built for it', async () => {
	const old = backup({
		activities: [
			{ id: 'a1', date: '2026-09-06', type: 'Other', customType: 'Mowing', createdAt: '' },
		],
	} as unknown as Partial<BackupDb>);
	delete old.db.activityTypes;
	const device = fakeDevice(onDevice);
	await stageAndCommit(prepare(old), device.target);
	assert.deepEqual(device.liveIds('activities'), ['a1']);
	// Stretching and Cardio starters, plus Mowing from the old entry.
	assert.equal(device.liveIds('activityTypes').length, 3);
});

test('a full restore refuses a QR window backup before anything is written', () => {
	const env = backup({}, { scope: { kind: 'window', from: '2026-11-01', to: '2026-11-02' } });
	assert.throws(() => prepare(env), /Receive by QR/);
});

// ── QR window restore ─────────────────────────────────────────────────

const window = { kind: 'window', from: '2026-11-01', to: '2026-11-02' } as const;

test('a window restore replaces dated stores and upserts definitions', () => {
	const plan = prepareWindowRestore(backup({}, { scope: window }));
	assert.equal(plan.from, '2026-11-01');
	assert.equal(plan.to, '2026-11-02');
	assert.equal(plan.replace.sessions.length, 2);
	assert.deepEqual(plan.replace.habitLogs, [], 'an empty dated store still clears its window');
	assert.deepEqual(Object.keys(plan.upsert).sort(), ['activityTypes', 'habits']);
});

test('a dated store missing from a window backup is left alone, not cleared', () => {
	const env = backup({}, { scope: window });
	delete (env.db as Partial<BackupDb>).healthReadings;
	assert.ok(!('healthReadings' in prepareWindowRestore(env).replace));
});

test('a window restore refuses a record dated outside its window', () => {
	const env = backup(
		{ sessions: [{ id: 's9', date: '2026-12-25' }] } as unknown as Partial<BackupDb>,
		{
			scope: window,
		},
	);
	assert.throws(() => prepareWindowRestore(env), BackupValidationError);
});

test('a window restore refuses a full backup', () => {
	assert.throws(() => prepareWindowRestore(backup()), /not a date-range backup/);
});
