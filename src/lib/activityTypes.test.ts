import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ActivityLog, ActivityType } from '#lib/db/types';
import {
	assignTypeIds,
	findOrAddType,
	mergeDuplicateNames,
	renameType,
	starterTypes,
} from './activityTypes.ts';

const NOW = '2026-11-16T08:00:00.000Z';

function ids(): () => string {
	let n = 0;
	return () => `t${++n}`;
}

function old(
	id: string,
	type: ActivityLog['type'],
	customType?: string,
	createdAt = `2026-01-0${id.length}T00:00:00Z`,
): ActivityLog {
	return {
		id,
		date: '2026-01-01',
		typeId: '',
		type,
		customType,
		durationMinutes: 30,
		intensity: 'Easy',
		createdAt,
	};
}

function entry(id: string, typeId: string, date = '2026-01-01'): ActivityLog {
	return { id, date, typeId, durationMinutes: 30, intensity: 'Easy', createdAt: NOW };
}

test('the upgrade adds each old type and each Other name once, by its first spelling', () => {
	const activities = [
		old('a', 'Run', undefined, '2026-01-01T00:00:00Z'),
		old('b', 'Run', undefined, '2026-01-02T00:00:00Z'),
		old('c', 'Pickleball', undefined, '2026-01-03T00:00:00Z'),
		old('d', 'Other', 'Mowing', '2026-01-04T00:00:00Z'),
		old('e', 'Other', 'mowing ', '2026-01-05T00:00:00Z'),
	];
	const result = assignTypeIds(starterTypes(NOW), activities, ids(), NOW);
	assert.deepEqual(
		result.types.map((t) => t.name),
		['Stretching', 'Cardio', 'Run', 'Pickleball', 'Mowing'],
	);
	assert.equal(result.changedActivities.length, 5);
	const byName = new Map(result.types.map((t) => [t.id, t.name]));
	assert.deepEqual(
		result.changedActivities.map((a) => [a.id, byName.get(a.typeId)]),
		[
			['a', 'Run'],
			['b', 'Run'],
			['c', 'Pickleball'],
			['d', 'Mowing'],
			['e', 'Mowing'],
		],
	);
	// The old fields stay on each entry.
	assert.equal(result.changedActivities[4].customType, 'mowing ');
});

test('an old Stretching joins the starter type, not a second one', () => {
	const result = assignTypeIds(starterTypes(NOW), [old('a', 'Stretching')], ids(), NOW);
	assert.equal(result.addedTypes.length, 0);
	assert.equal(result.changedActivities[0].typeId, 'activity-type-stretching');
});

test('an Other with no name becomes a type named Other', () => {
	const result = assignTypeIds(starterTypes(NOW), [old('a', 'Other', '  ')], ids(), NOW);
	assert.deepEqual(
		result.addedTypes.map((t) => t.name),
		['Other'],
	);
	assert.equal(result.changedActivities[0].typeId, result.addedTypes[0].id);
});

test('entries that already point to a known type are left alone', () => {
	const types = starterTypes(NOW);
	const result = assignTypeIds(types, [entry('a', types[1].id)], ids(), NOW);
	assert.equal(result.changedActivities.length, 0);
});

test('find or add matches in any mix of capital letters', () => {
	const types: ActivityType[] = [...starterTypes(NOW), { id: 'm', name: 'Mowing', createdAt: NOW }];
	const found = findOrAddType(types, 'MOWING', ids(), NOW);
	assert.equal(found.type.id, 'm');
	assert.equal(found.changed, null);
	assert.equal(found.types.length, 3);
});

test('find or add adds a new trimmed name', () => {
	const added = findOrAddType(starterTypes(NOW), '  Mowing ', ids(), NOW);
	assert.equal(added.type.name, 'Mowing');
	assert.equal(added.types.length, 3);
	assert.equal(added.changed?.id, added.type.id);
});

test('find or add shows a hidden match again', () => {
	const types: ActivityType[] = [{ id: 'm', name: 'Mowing', hidden: true, createdAt: NOW }];
	const found = findOrAddType(types, 'mowing', ids(), NOW);
	assert.equal(found.type.id, 'm');
	assert.equal(found.type.hidden, false);
	assert.equal(found.changed?.hidden, false);
});

test('rename to a name that exists joins the two types with all their entries', () => {
	const types: ActivityType[] = [
		{ id: 'x', name: 'Mowng', createdAt: NOW },
		{ id: 'm', name: 'Mowing', createdAt: NOW },
	];
	const activities = [
		entry('1', 'x'),
		entry('2', 'x'),
		entry('3', 'm'),
		entry('4', 'm'),
		entry('5', 'm'),
	];
	const result = renameType(types, activities, 'x', 'mowing');
	assert.equal(result.kind, 'merged');
	if (result.kind !== 'merged') return;
	assert.equal(result.into.id, 'm');
	assert.equal(result.removedId, 'x');
	assert.deepEqual(
		result.movedActivities.map((a) => [a.id, a.typeId]),
		[
			['1', 'm'],
			['2', 'm'],
		],
	);
});

test('rename to its own name in other capitals is a plain rename', () => {
	const types: ActivityType[] = [{ id: 'x', name: 'mowing', createdAt: NOW }];
	const result = renameType(types, [], 'x', 'Mowing');
	assert.equal(result.kind, 'renamed');
});

test('rename to an empty name is not possible', () => {
	const types: ActivityType[] = [{ id: 'x', name: 'Mowng', createdAt: NOW }];
	assert.equal(renameType(types, [], 'x', '   ').kind, 'invalid');
});

test('types that share a name join into the oldest, with all their entries', () => {
	const types: ActivityType[] = [
		{ id: 'b', name: 'mowing', createdAt: '2026-02-01' },
		{ id: 'a', name: 'Mowing', hidden: true, createdAt: '2026-01-01' },
		{ id: 'c', name: 'Cardio', createdAt: '2026-01-01' },
	];
	const result = mergeDuplicateNames(types, [entry('1', 'b'), entry('2', 'a'), entry('3', 'c')]);
	assert.deepEqual(result.removedIds, ['b']);
	assert.deepEqual(
		result.types.map((t) => [t.id, t.hidden]),
		[
			['a', false],
			['c', undefined],
		],
	);
	assert.deepEqual(
		result.movedActivities.map((a) => [a.id, a.typeId]),
		[['1', 'a']],
	);
});
