// Pure-function tests for the Health card (v1.13.0, US-060).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	bpZone,
	bpReadingsIn,
	averageBp,
	weightsIn,
	weightChange,
	healthLog,
	timeOfDay,
} from './bpZones.ts';
import type { HealthReading } from '$lib/db/types';

const at = (date: string, hour: number) => {
	const [y, m, d] = date.split('-').map(Number);
	return new Date(y, m - 1, d, hour, 0).toISOString();
};

const bp = (
	date: string,
	hour: number,
	systolic: number,
	diastolic: number,
	pulse?: number,
): HealthReading => ({
	id: `bp-${date}-${hour}`,
	metricId: 'bloodPressure',
	date,
	recordedAt: at(date, hour),
	values: pulse === undefined ? { systolic, diastolic } : { systolic, diastolic, pulse },
});

const weight = (date: string, value: number): HealthReading => ({
	id: `w-${date}`,
	metricId: 'weight',
	date,
	recordedAt: at(date, 7),
	values: { value },
});

test('bpZone follows the AHA categories', () => {
	assert.equal(bpZone(118, 76).id, 'normal');
	assert.equal(bpZone(122, 78).id, 'elevated');
	assert.equal(bpZone(132, 78).id, 'stage1');
	assert.equal(bpZone(142, 78).id, 'stage2');
	assert.equal(bpZone(185, 100).id, 'severe');
	assert.equal(bpZone(150, 125).id, 'severe');
});

test('bpZone takes the higher zone of the two numbers', () => {
	assert.equal(bpZone(128, 84).id, 'stage1');
	assert.equal(bpZone(118, 92).id, 'stage2');
	assert.equal(bpZone(119, 80).id, 'stage1');
});

test('bpZone edges: 120 is Elevated, 130 Stage 1, 140 Stage 2, 180 not yet Severe', () => {
	assert.equal(bpZone(119, 79).id, 'normal');
	assert.equal(bpZone(120, 79).id, 'elevated');
	assert.equal(bpZone(130, 79).id, 'stage1');
	assert.equal(bpZone(140, 79).id, 'stage2');
	assert.equal(bpZone(180, 79).id, 'stage2');
	assert.equal(bpZone(181, 79).id, 'severe');
});

test('bpReadingsIn keeps each reading, in date then time order, inside the range', () => {
	const readings = [
		bp('2026-11-02', 21, 122, 78),
		bp('2026-11-02', 7, 128, 82, 64),
		bp('2026-11-01', 8, 120, 80),
		bp('2026-10-20', 8, 140, 90),
		weight('2026-11-02', 182.4),
	];
	const rows = bpReadingsIn(readings, ['2026-11-01', '2026-11-02']);
	assert.deepEqual(
		rows.map((r) => [r.date, r.time, r.systolic]),
		[
			['2026-11-01', '08:00', 120],
			['2026-11-02', '07:00', 128],
			['2026-11-02', '21:00', 122],
		],
	);
	assert.equal(rows[1].pulse, 64);
	assert.equal(rows[2].pulse, null);
	assert.equal(rows[1].zone.id, 'stage1');
});

test('averageBp averages every reading and names its zone', () => {
	const rows = bpReadingsIn(
		[bp('2026-11-02', 7, 128, 82), bp('2026-11-02', 21, 122, 78)],
		['2026-11-02'],
	);
	const avg = averageBp(rows);
	assert.deepEqual(
		{ s: avg?.systolic, d: avg?.diastolic, z: avg?.zone.label },
		{ s: 125, d: 80, z: 'Stage 1' },
	);
	assert.equal(averageBp([]), null);
});

test('weightChange is the last weight and its change since the first', () => {
	const rows = weightsIn(
		[weight('2026-11-01', 184), weight('2026-11-03', 182.4), weight('2026-10-01', 190)],
		['2026-11-01', '2026-11-02', '2026-11-03'],
	);
	assert.deepEqual(weightChange(rows), { latest: 182.4, change: -1.6 });
	assert.deepEqual(weightChange(rows.slice(0, 1)), { latest: 184, change: null });
	assert.equal(weightChange([]), null);
});

test('healthLog groups by date, newest first, with the weight of each date', () => {
	const dates = ['2026-11-01', '2026-11-02'];
	const readings = [
		bp('2026-11-01', 8, 120, 80),
		bp('2026-11-02', 7, 128, 82),
		bp('2026-11-02', 21, 122, 78),
		weight('2026-11-02', 182.4),
	];
	const log = healthLog(bpReadingsIn(readings, dates), weightsIn(readings, dates));
	assert.deepEqual(
		log.map((d) => d.date),
		['2026-11-02', '2026-11-01'],
	);
	assert.equal(log[0].weight, 182.4);
	assert.equal(log[1].weight, null);
	assert.deepEqual(
		log[0].readings.map((r) => r.time),
		['21:00', '07:00'],
	);
});

test('healthLog keeps a date that has only a weight', () => {
	const log = healthLog([], [{ date: '2026-11-03', value: 181 }]);
	assert.deepEqual(log, [{ date: '2026-11-03', weight: 181, readings: [] }]);
});

test('timeOfDay is empty for a bad value', () => {
	assert.equal(timeOfDay('nope'), '');
});
