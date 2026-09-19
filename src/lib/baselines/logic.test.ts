// Pure-function tests for baseline aggregation. No framework — runs on Node's
// built-in test runner with type stripping: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	sumMetric,
	totalsFor,
	isMetricCleared,
	isCleared,
	metricProgressPct,
	dailySeries,
	entriesForDate,
} from './logic.ts';
import type { Baseline, BaselineLog } from '$lib/db/types';

const walking: Baseline = {
	id: 'b-walk',
	name: 'Walking',
	direction: 'up',
	metrics: [
		{ id: 'm-min', label: 'minutes', target: 30 },
		{ id: 'm-mi', label: 'miles', target: 1.25 },
	],
	sortOrder: 0,
	active: true,
	createdAt: '2026-01-01T00:00:00.000Z',
};

const phone: Baseline = {
	id: 'b-phone',
	name: 'Phone time',
	direction: 'under',
	metrics: [{ id: 'm-min', label: 'minutes', target: 30 }],
	sortOrder: 1,
	active: true,
	createdAt: '2026-01-01T00:00:00.000Z',
};

function log(
	id: string,
	baselineId: string,
	date: string,
	recordedAt: string,
	values: Record<string, number>,
): BaselineLog {
	return { id, baselineId, date, recordedAt, values };
}

const walkLogs: BaselineLog[] = [
	log('l1', 'b-walk', '2026-03-02', '2026-03-02T09:00:00.000Z', { 'm-min': 15, 'm-mi': 0.6 }),
	log('l2', 'b-walk', '2026-03-02', '2026-03-02T18:00:00.000Z', { 'm-min': 15, 'm-mi': 0.7 }),
	log('l3', 'b-walk', '2026-03-04', '2026-03-04T12:00:00.000Z', { 'm-min': 40, 'm-mi': 2 }),
];

test('sumMetric adds every entry for the metric', () => {
	assert.equal(sumMetric(walkLogs, 'm-min'), 70);
	assert.equal(sumMetric(walkLogs, 'm-mi'), 3.3);
});

test('sumMetric ignores entries missing the metric', () => {
	const mixed = [...walkLogs, log('l4', 'b-walk', '2026-03-05', '2026-03-05T08:00:00.000Z', {})];
	assert.equal(sumMetric(mixed, 'm-min'), 70);
});

test('totalsFor covers every configured metric', () => {
	const day = walkLogs.filter((l) => l.date === '2026-03-02');
	assert.deepEqual(totalsFor(walking, day), { 'm-min': 30, 'm-mi': 1.3 });
});

test('totalsFor reports zero for a metric with no entries', () => {
	assert.deepEqual(totalsFor(walking, []), { 'm-min': 0, 'm-mi': 0 });
});

test('up clears at or above target, under clears at or below', () => {
	const floor = { id: 'm', label: 'minutes', target: 30 };
	assert.equal(isMetricCleared('up', floor, 29), false);
	assert.equal(isMetricCleared('up', floor, 30), true);
	assert.equal(isMetricCleared('up', floor, 31), true);
	assert.equal(isMetricCleared('under', floor, 29), true);
	assert.equal(isMetricCleared('under', floor, 30), true);
	assert.equal(isMetricCleared('under', floor, 31), false);
});

test('a two-metric day needs both metrics to clear', () => {
	assert.equal(isCleared(walking, { 'm-min': 30, 'm-mi': 1.3 }), true);
	assert.equal(isCleared(walking, { 'm-min': 30, 'm-mi': 1 }), false);
});

test('an unlogged ceiling day counts as cleared', () => {
	assert.equal(isCleared(phone, totalsFor(phone, [])), true);
});

test('progress pct clamps to 0-100', () => {
	const floor = { id: 'm', label: 'minutes', target: 30 };
	assert.equal(metricProgressPct('up', floor, 0), 0);
	assert.equal(metricProgressPct('up', floor, 15), 50);
	assert.equal(metricProgressPct('up', floor, 60), 100);
	assert.equal(metricProgressPct('under', floor, 45), 100);
});

test('progress pct handles a zero target', () => {
	const zero = { id: 'm', label: 'minutes', target: 0 };
	assert.equal(metricProgressPct('under', zero, 0), 0);
	assert.equal(metricProgressPct('under', zero, 5), 100);
});

test('totals round away binary float drift', () => {
	const drifty = [
		log('d1', 'b-walk', '2026-03-09', '2026-03-09T09:00:00.000Z', { 'm-mi': 0.6 }),
		log('d2', 'b-walk', '2026-03-09', '2026-03-09T10:00:00.000Z', { 'm-mi': 0.7 }),
		log('d3', 'b-walk', '2026-03-09', '2026-03-09T11:00:00.000Z', { 'm-mi': 0.1 }),
	];
	assert.equal(sumMetric(drifty, 'm-mi'), 1.4);
	assert.deepEqual(dailySeries(drifty, 'm-mi', ['2026-03-09']), [1.4]);
});

test('dailySeries fills unlogged days with zero', () => {
	const dates = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04'];
	assert.deepEqual(dailySeries(walkLogs, 'm-min', dates), [0, 30, 0, 40]);
});

test('entriesForDate returns one baseline and date, oldest first', () => {
	const noise = [
		...walkLogs,
		log('l9', 'b-phone', '2026-03-02', '2026-03-02T07:00:00.000Z', { 'm-min': 5 }),
	];
	const entries = entriesForDate(noise, 'b-walk', '2026-03-02');
	assert.deepEqual(
		entries.map((e) => e.id),
		['l1', 'l2'],
	);
});
