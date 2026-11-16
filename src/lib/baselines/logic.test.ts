// Pure-function tests for baseline aggregation. No framework — runs on Node's
// built-in test runner with type stripping: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	sumMetric,
	dailySeries,
	isMetricLogged,
	parseDuration,
	durationInputText,
	mergeMetrics,
	isLegacyBaseline,
} from './logic.ts';
import type { Baseline, BaselineLog, BaselineMetric } from '$lib/db/types';

const pushups: BaselineMetric = {
	id: 'm-push',
	name: 'Pushups',
	measure: 'count',
	baseline: 10,
	label: 'reps',
};
const walkTime: BaselineMetric = { id: 'm-walk', name: 'Walk', measure: 'duration', baseline: 10 };
const daily10: Baseline = {
	id: 'b-10',
	name: 'Daily 10',
	metrics: [
		pushups,
		{ id: 'm-jj', name: 'Jumping jacks', measure: 'count', baseline: 10, label: 'reps' },
		walkTime,
		{ id: 'm-lunge', name: 'Lunges', measure: 'count', baseline: 10, label: 'reps' },
	],
	sortOrder: 0,
	active: true,
	createdAt: '2026-01-01T00:00:00.000Z',
};

function log(
	id: string,
	date: string,
	recordedAt: string,
	values: Record<string, number>,
	baselineId = 'b-10',
): BaselineLog {
	return { id, baselineId, date, recordedAt, values };
}

const logs: BaselineLog[] = [
	log('l1', '2026-03-02', '2026-03-02T09:00:00.000Z', { 'm-push': 15, 'm-walk': 10 }),
	log('l2', '2026-03-02', '2026-03-02T18:00:00.000Z', { 'm-push': 15 }),
	log('l3', '2026-03-04', '2026-03-04T12:00:00.000Z', { 'm-push': 40 }),
];

// ── Aggregation ──────────────────────────────────────────────

test('totals round away binary float drift', () => {
	const drifty = [
		log('d1', '2026-03-09', '2026-03-09T09:00:00.000Z', { 'm-dist': 0.6 }),
		log('d2', '2026-03-09', '2026-03-09T10:00:00.000Z', { 'm-dist': 0.7 }),
		log('d3', '2026-03-09', '2026-03-09T11:00:00.000Z', { 'm-dist': 0.1 }),
	];
	assert.equal(sumMetric(drifty, 'm-dist'), 1.4);
	assert.deepEqual(dailySeries(drifty, 'm-dist', ['2026-03-09']), [1.4]);
});

// ── Done = logged (US-038) ───────────────────────────────────

test('a metric left blank is "not logged", not zero', () => {
	const day = logs.filter((l) => l.date === '2026-03-02');
	assert.equal(isMetricLogged(day, 'm-push'), true);
	assert.equal(isMetricLogged(day, 'm-jj'), false);
});

// ── Duration text ────────────────────────────────────────────

test('parseDuration accepts minutes, m:ss and h:mm:ss', () => {
	assert.equal(parseDuration('30'), 30);
	assert.equal(parseDuration('7.5'), 7.5);
	assert.equal(parseDuration('7:30'), 7.5);
	assert.equal(parseDuration('1:05:00'), 65);
	assert.equal(parseDuration(''), null);
	assert.equal(parseDuration('7:75'), null);
	assert.equal(parseDuration('abc'), null);
});

test('durationInputText round-trips through parseDuration', () => {
	for (const minutes of [30, 7.5, 18.25, 65.5]) {
		assert.equal(parseDuration(durationInputText(minutes)), minutes);
	}
});

// ── Editing metrics (US-037) ─────────────────────────────────

test('mergeMetrics updates, adds, and soft-removes', () => {
	let n = 0;
	const merged = mergeMetrics(
		daily10.metrics,
		[
			{ id: 'm-push', name: 'Push-ups', measure: 'count', baseline: 12, label: 'reps' },
			{ id: 'm-walk', name: 'Walk', measure: 'count', baseline: 15 },
			{ name: 'Squats', measure: 'count', baseline: 10, label: 'reps' },
		],
		() => `new-${++n}`,
	);
	assert.deepEqual(
		merged.map((m) => [m.id, m.removed ?? false]),
		[
			['m-push', false],
			['m-walk', false],
			['new-1', false],
			['m-jj', true],
			['m-lunge', true],
		],
	);
	assert.equal(merged[0].name, 'Push-ups');
	assert.equal(merged[0].baseline, 12);
	// Measure is fixed at creation even if a draft claims otherwise.
	assert.equal(merged[1].measure, 'duration');
});

test('legacy v1.9.0 baselines are recognised', () => {
	assert.equal(
		isLegacyBaseline({ direction: 'up', metrics: [{ id: 'a', label: 'min', target: 30 }] }),
		true,
	);
	assert.equal(isLegacyBaseline({ metrics: [{ id: 'a', label: 'min', target: 30 }] }), true);
	assert.equal(isLegacyBaseline(daily10), false);
});
