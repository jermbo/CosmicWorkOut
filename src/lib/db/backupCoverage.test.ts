// Coverage guards for backups: nothing the app stores may be left out of a backup by
// accident. Reads the source, so a new IndexedDB store or `cwout:` key added without a
// backup decision fails here instead of being discovered after a restore.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
	BACKUP_FORMAT,
	BACKUP_LOCAL_KEYS,
	BACKUP_VERSION,
	DB_STORES,
	DEVICE_ONLY_KEYS,
	STORE_LABELS,
	UPSERT_STORES,
	missingStores,
	restoreWarnings,
	scopeEnvelope,
} from './backupPayload.ts';
import type { BackupDb, BackupEnvelope } from './backupPayload.ts';

const SRC = join(import.meta.dirname, '..', '..');

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return sourceFiles(path);
		return /\.(ts|svelte)$/.test(name) && !name.endsWith('.test.ts') ? [path] : [];
	});
}

// ── Every store and key has a backup decision ─────────────────────────

test('every IndexedDB store the app creates is backed up', () => {
	const database = readFileSync(join(SRC, 'lib/db/database.ts'), 'utf8');
	const created = [...database.matchAll(/ensureStore\('(\w+)'/g)].map((m) => m[1]);
	assert.ok(created.length > 0, 'found no ensureStore calls — has database.ts changed shape?');
	assert.deepEqual([...created].sort(), [...DB_STORES].sort());
});

test('every cwout: storage key is either backed up or marked device-only', () => {
	const decided = new Set<string>([...BACKUP_LOCAL_KEYS, ...DEVICE_ONLY_KEYS]);
	const used = new Set<string>();
	for (const file of sourceFiles(SRC)) {
		for (const m of readFileSync(file, 'utf8').matchAll(/['"`](cwout:[A-Za-z]+)['"`]/g)) {
			used.add(m[1]);
		}
	}
	const undecided = [...used].filter((key) => !decided.has(key));
	assert.deepEqual(undecided, [], 'add each key to BACKUP_LOCAL_KEYS or DEVICE_ONLY_KEYS');
	for (const key of BACKUP_LOCAL_KEYS) {
		assert.ok(!(DEVICE_ONLY_KEYS as readonly string[]).includes(key), `${key} is in both lists`);
	}
});

test('every store has a label for restore warnings', () => {
	assert.deepEqual(Object.keys(STORE_LABELS).sort(), [...DB_STORES].sort());
});

// ── QR scopes never drop user data ────────────────────────────────────

/** One record in every store, plus a built-in item and program. */
function everyStore(): BackupEnvelope {
	const db = {
		items: [
			{ id: 'built-in', isBuiltIn: true },
			{ id: 'custom', isBuiltIn: false },
		],
		programs: [
			{ id: 'built-in-p', isBuiltIn: true },
			{ id: 'custom-p', isBuiltIn: false },
		],
		sessions: [{ id: 's', date: '2026-10-01' }],
		itemLastUsed: [{ itemId: 'custom', weight: 100, reps: 8 }],
		activities: [{ id: 'a', date: '2026-10-01' }],
		habits: [{ id: 'h' }],
		habitLogs: [{ id: 'h:2026-10-01', habitId: 'h', date: '2026-10-01', value: 1 }],
		healthReadings: [{ id: 'r', date: '2026-10-01' }],
		goalPlans: [{ id: 'g' }],
		baselines: [{ id: 'b', metrics: [] }],
		baselineLogs: [{ id: 'bl', baselineId: 'b', date: '2026-10-01' }],
	} as unknown as BackupDb;
	return {
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		exportedAt: '2026-10-24T12:00:00.000Z',
		db,
		localStorage: {},
	};
}

test('the fixture really has a record in every store', () => {
	const env = everyStore();
	for (const store of DB_STORES) assert.ok(env.db[store]?.length, store);
});

test('a QR Everything backup keeps every record except built-ins', () => {
	const full = everyStore();
	const sent = scopeEnvelope(full, { kind: 'full' });
	for (const store of DB_STORES) {
		const expected = (full.db[store] ?? []).filter(
			(r) => !(r as { isBuiltIn?: boolean }).isBuiltIn,
		);
		assert.deepEqual(sent.db[store], expected, store);
	}
});

test('a QR window keeps every definition and every record dated inside it', () => {
	const full = everyStore();
	const sent = scopeEnvelope(full, { kind: 'window', from: '2026-10-01', to: '2026-10-01' });
	for (const store of DB_STORES) {
		const expected = (full.db[store] ?? []).filter(
			(r) => !(r as { isBuiltIn?: boolean }).isBuiltIn,
		);
		assert.deepEqual(sent.db[store], expected, store);
	}
	const outside = scopeEnvelope(full, { kind: 'window', from: '2026-10-02', to: '2026-10-24' });
	for (const store of UPSERT_STORES) {
		assert.ok((outside.db[store]?.length ?? 0) > 0, `${store} must travel with any window`);
	}
	assert.equal(outside.db.sessions.length, 0);
});

// ── Restore warnings ──────────────────────────────────────────────────

test('a current backup restores with no warnings', () => {
	assert.deepEqual(missingStores(everyStore()), []);
	assert.deepEqual(restoreWarnings(everyStore()), []);
});

test('a backup made before baselines existed warns that restoring removes them', () => {
	// Shape of a real file exported 2026-09-19, mid-v1.9.0: plan goals but no baselines.
	const env = everyStore();
	delete env.db.baselines;
	delete env.db.baselineLogs;
	assert.deepEqual(missingStores(env), ['baselines', 'baselineLogs']);
	const [warning] = restoreWarnings(env);
	assert.match(warning, /baselines, baseline entries/);
	assert.match(warning, /removes any on this device/);
});

test('a backup with pre-v1.10.0 baselines warns that they are skipped', () => {
	const env = everyStore();
	env.db.baselines = [
		{ id: 'old', direction: 'up', metrics: [] },
	] as unknown as BackupDb['baselines'];
	assert.match(restoreWarnings(env).join(' '), /pre-v1\.10\.0/);
});
