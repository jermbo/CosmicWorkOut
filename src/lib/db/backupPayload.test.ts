// Pure-function tests for the backup/restore payload path. No framework — runs on
// Node's built-in test runner with type stripping: `npm test`.
//
// This is the one failure in the app the user cannot recover from: a bad restore
// clears live IndexedDB and there is no server copy. Everything here guards the
// checks that run *before* `clearWorkoutData()`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	BACKUP_FORMAT,
	BACKUP_LOCAL_KEYS,
	BACKUP_VERSION,
	BackupValidationError,
	DB_STORES,
	STORE_KEY_PATH,
	assertCountsMatch,
	assertStoresAreArrays,
	dropLegacyBaselines,
	expectedCounts,
	localEntriesOf,
	parseBackup,
	toPlainEnvelope,
} from './backupPayload.ts';
import type { BackupEnvelope } from './backupPayload.ts';
import type { Habit, Item, Session } from './types.ts';

const item: Item = {
	id: 'ex-bench',
	disciplineId: 'strength',
	name: 'Bench Press',
	cue: 'Elbows tucked',
	section: 'exercises',
	metric: 'setsReps',
	muscles: 'Chest, Triceps',
	cat: 'Chest',
	unit: 'lb',
	defaultSets: 3,
	defaultReps: '8-10',
	isBuiltIn: true,
};

const session: Session = {
	id: 's-1',
	disciplineId: 'strength',
	date: '2026-09-01',
	routineId: 'r-a',
	programId: 'p-1',
	startedAt: '2026-09-01T10:00:00.000Z',
	finishedAt: '2026-09-01T10:45:00.000Z',
	durationSeconds: 2700,
	totalVolume: 4500,
	totalSets: 9,
	items: [
		{
			itemId: 'ex-bench',
			sets: [{ setNumber: 1, weight: 135, reps: 8, completedAt: '2026-09-01T10:10:00.000Z' }],
		},
	],
};

const habit: Habit = {
	id: 'h-water',
	name: 'Water',
	unit: 'glasses',
	type: 'count',
	dailyGoal: 8,
	active: true,
	sortOrder: 0,
	createdAt: '2026-08-01T00:00:00.000Z',
};

/**
 * A hand-edited, truncated or foreign file reaches the restore path as arbitrary
 * JSON, so the malformed cases below are built as plain values and widened once.
 */
function asEnvelope(value: unknown): BackupEnvelope {
	return value as BackupEnvelope;
}

function envelope(overrides: Partial<BackupEnvelope> = {}): BackupEnvelope {
	return {
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		exportedAt: '2026-09-19T12:00:00.000Z',
		db: {
			items: [item],
			programs: [],
			sessions: [session],
			itemLastUsed: [{ itemId: 'ex-bench', weight: 135, reps: 8 }],
			activities: [],
			habits: [habit],
			habitLogs: [{ id: 'h-water:2026-09-01', habitId: 'h-water', date: '2026-09-01', value: 6 }],
			healthReadings: [],
			goalPlans: [],
			baselines: [],
			baselineLogs: [],
		},
		localStorage: { 'cwout:prefs': { theme: 'dark' }, 'cwout:activeProgramIds': ['p-1'] },
		...overrides,
	};
}

// ── Store registry ────────────────────────────────────────────────────

test('every backed-up store declares a key path', () => {
	for (const store of DB_STORES) {
		assert.ok(STORE_KEY_PATH[store], `missing key path for "${store}"`);
	}
	assert.deepEqual(Object.keys(STORE_KEY_PATH).sort(), [...DB_STORES].sort());
});

test('transient localStorage keys are not backed up', () => {
	const keys: readonly string[] = BACKUP_LOCAL_KEYS;
	assert.ok(!keys.includes('cwout:activeSession'));
	assert.ok(!keys.includes('cwout:habitDay'));
});

// ── parseBackup ───────────────────────────────────────────────────────

test('parses a well-formed backup', () => {
	const parsed = parseBackup(JSON.stringify(envelope()));
	assert.equal(parsed.format, BACKUP_FORMAT);
	assert.equal(parsed.db.sessions.length, 1);
	assert.equal(parsed.db.items[0].name, 'Bench Press');
});

test('rejects a file that is not JSON', () => {
	assert.throws(() => parseBackup('not json at all'), {
		name: 'Error',
		message: 'This file is not valid JSON.',
	});
	assert.throws(() => parseBackup('not json at all'), BackupValidationError);
});

test('rejects JSON that is not an object', () => {
	for (const text of ['null', '42', '"a string"', '[1, 2, 3]']) {
		assert.throws(() => parseBackup(text), BackupValidationError, `accepted ${text}`);
	}
});

test('rejects a JSON file from another app', () => {
	const foreign = JSON.stringify({ format: 'some-other-app', version: 1, db: {} });
	assert.throws(() => parseBackup(foreign), {
		message: 'This file is not a CosmicWorkOut backup.',
	});
});

test('rejects a backup with no version', () => {
	const noVersion = JSON.stringify({ ...envelope(), version: undefined });
	assert.throws(() => parseBackup(noVersion), {
		message: 'This backup is missing a version and cannot be restored.',
	});
});

test('rejects a backup from a newer app version', () => {
	const future = JSON.stringify(envelope({ version: BACKUP_VERSION + 1 }));
	assert.throws(() => parseBackup(future), {
		message: 'This backup was made by a newer version of the app. Please update first.',
	});
});

test('rejects a backup with no db', () => {
	for (const db of [undefined, null, 'nope']) {
		const text = JSON.stringify({ ...envelope(), db });
		assert.throws(() => parseBackup(text), {
			message: 'This backup is missing its data and cannot be restored.',
		});
	}
});

test('accepts a pre-v1.9.0 backup with no goal plans or baselines', () => {
	const old = envelope();
	delete old.db.goalPlans;
	delete old.db.baselines;
	delete old.db.baselineLogs;

	const parsed = parseBackup(JSON.stringify(old));
	const counts = expectedCounts(parsed);
	assert.equal(counts.goalPlans, 0);
	assert.equal(counts.baselines, 0);
	assert.equal(counts.baselineLogs, 0);
	assert.equal(counts.sessions, 1);
});

test('drops v1.9.0-shaped baselines and their logs, keeps everything else', () => {
	const old = envelope();
	old.db.baselines = [
		{
			id: 'b1',
			name: 'Walking',
			direction: 'up',
			metrics: [{ id: 'm1', label: 'minutes', target: 30 }],
			sortOrder: 0,
			active: true,
			createdAt: '2026-01-01T00:00:00.000Z',
		},
	] as unknown as typeof old.db.baselines;
	old.db.baselineLogs = [
		{ id: 'l1', baselineId: 'b1', date: '2026-01-02', recordedAt: '', values: { m1: 30 } },
	];

	assert.equal(dropLegacyBaselines(old), true);
	const counts = expectedCounts(old);
	assert.equal(counts.baselines, 0);
	assert.equal(counts.baselineLogs, 0);
	assert.equal(counts.sessions, 1);
});

test('keeps v1.10.0-shaped baselines', () => {
	const current = envelope();
	current.db.baselines = [
		{
			id: 'b1',
			name: 'Daily 10',
			metrics: [{ id: 'm1', name: 'Pushups', measure: 'count', baseline: 10, label: 'reps' }],
			sortOrder: 0,
			active: true,
			createdAt: '2026-01-01T00:00:00.000Z',
		},
	];
	assert.equal(dropLegacyBaselines(current), false);
	assert.equal(expectedCounts(current).baselines, 1);
});

// ── Counts ────────────────────────────────────────────────────────────

test('counts every store, treating absent ones as empty', () => {
	const counts = expectedCounts(envelope());
	assert.equal(counts.items, 1);
	assert.equal(counts.sessions, 1);
	assert.equal(counts.habits, 1);
	assert.equal(counts.habitLogs, 1);
	assert.equal(counts.programs, 0);
	assert.equal(Object.keys(counts).length, DB_STORES.length);
});

test('matching counts pass verification', () => {
	const counts = expectedCounts(envelope());
	assert.doesNotThrow(() => assertCountsMatch(counts, { ...counts }, 'live'));
});

test('a short write is caught and names the store and phase', () => {
	const expected = expectedCounts(envelope());
	const actual = { ...expected, sessions: 0 };
	assert.throws(() => assertCountsMatch(expected, actual, 'staging'), {
		message: 'Restore staging count mismatch for "sessions": expected 1, got 0.',
	});
});

test('an over-write is caught too — leftover rows mean the store was not cleared', () => {
	const expected = expectedCounts(envelope());
	const actual = { ...expected, items: 2 };
	assert.throws(() => assertCountsMatch(expected, actual, 'live'), {
		message: 'Restore live count mismatch for "items": expected 1, got 2.',
	});
});

// ── Payload preflight (runs before live data is cleared) ──────────────

test('a store that is not an array is rejected before anything is written', () => {
	const valid = envelope();
	const broken = asEnvelope({ ...valid, db: { ...valid.db, sessions: { id: 's-1' } } });
	assert.throws(() => assertStoresAreArrays(broken), {
		message: 'This backup\'s "sessions" data is malformed and cannot be restored.',
	});
	assert.throws(() => assertStoresAreArrays(broken), BackupValidationError);
});

test('absent optional stores are not treated as malformed', () => {
	const old = envelope();
	delete old.db.goalPlans;
	assert.doesNotThrow(() => assertStoresAreArrays(old));
});

test('a null store is rejected — null is not an array', () => {
	const valid = envelope();
	const broken = asEnvelope({ ...valid, db: { ...valid.db, baselines: null } });
	assert.throws(() => assertStoresAreArrays(broken), BackupValidationError);
});

test('toPlainEnvelope strips proxies so IndexedDB can structured-clone the payload', () => {
	const live = envelope();
	// Stand-in for a Svelte $state proxy, which structuredClone throws on.
	const proxied: BackupEnvelope = {
		...live,
		db: { ...live.db, items: new Proxy(live.db.items, {}) },
	};
	assert.throws(() => structuredClone(proxied.db));

	const plain = toPlainEnvelope(proxied);
	assert.doesNotThrow(() => structuredClone(plain.db));
	assert.deepEqual(expectedCounts(plain), expectedCounts(live));
	assert.equal(plain.db.items[0].name, 'Bench Press');
});

test('toPlainEnvelope does not mutate the envelope it was given', () => {
	const live = envelope();
	const before = JSON.stringify(live);
	toPlainEnvelope(live);
	assert.equal(JSON.stringify(live), before);
});

test('localStorage entries survive, and a missing or malformed map yields none', () => {
	assert.deepEqual(localEntriesOf(envelope()), {
		'cwout:prefs': { theme: 'dark' },
		'cwout:activeProgramIds': ['p-1'],
	});

	for (const bad of [undefined, null, 'nope', ['a']]) {
		const broken = asEnvelope({ ...envelope(), localStorage: bad });
		assert.deepEqual(localEntriesOf(broken), {}, `mishandled ${JSON.stringify(bad)}`);
	}
});

// ── End to end ────────────────────────────────────────────────────────

test('export → file → restore preserves every row', () => {
	const exported = envelope();
	const onDisk = JSON.stringify(exported);

	const parsed = parseBackup(onDisk);
	assertStoresAreArrays(parsed);
	const plain = toPlainEnvelope(parsed);

	assertCountsMatch(expectedCounts(exported), expectedCounts(plain), 'live');
	assert.deepEqual(plain.db, exported.db);
	assert.deepEqual(localEntriesOf(plain), exported.localStorage);
});
