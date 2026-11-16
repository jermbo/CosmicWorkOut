// Pure-function tests for the Health card (v1.13.0, US-060).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bpZone, bpReadingsIn, averageBp } from './bpZones.ts';
import type { HealthReading } from '#lib/db/types';

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
