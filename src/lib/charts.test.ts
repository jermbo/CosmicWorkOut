// Pure-function tests for shared chart math. Lives at src/lib/ so the existing
// `npm test` glob picks it up without touching package.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { niceAxis, niceStep, valueToOffset, formatTick } from './charts/scale.ts';

test('niceStep picks 1/2/5 × 10^n steps', () => {
	assert.equal(niceStep(10, 4), 2);
	assert.equal(niceStep(100, 4), 20);
	assert.equal(niceStep(37, 4), 10);
	assert.equal(niceStep(1, 4), 0.2);
});

test('niceAxis rounds the domain out to whole steps', () => {
	const axis = niceAxis([3, 37], { includeZero: true });
	assert.deepEqual(axis.domain, [0, 40]);
	assert.deepEqual(axis.ticks, [0, 10, 20, 30, 40]);
});

test('niceAxis honours fixed bounds', () => {
	const axis = niceAxis([2, -1], { min: -5, max: 5 });
	assert.deepEqual(axis.domain, [-5, 5]);
	assert.ok(axis.ticks.includes(0));
	assert.equal(axis.ticks[0], -4);
});

test('niceAxis survives empty and flat series', () => {
	assert.deepEqual(niceAxis([]).domain, [0, 1]);
	const flat = niceAxis([10, 10], { includeZero: true });
	assert.equal(flat.domain[0], 0);
	assert.ok(flat.domain[1] >= 10);
});

test('niceAxis has no float noise in ticks', () => {
	const axis = niceAxis([0, 0.9]);
	for (const t of axis.ticks) assert.equal(t, Number.parseFloat(t.toPrecision(6)));
});

test('valueToOffset maps max to the top and min to the bottom', () => {
	assert.equal(valueToOffset(40, [0, 40], 200), 0);
	assert.equal(valueToOffset(0, [0, 40], 200), 200);
	assert.equal(valueToOffset(10, [0, 40], 200), 150);
});

test('formatTick shortens thousands', () => {
	assert.equal(formatTick(12000), '12k');
	assert.equal(formatTick(1500), '1.5k');
	assert.equal(formatTick(1250), '1250');
	assert.equal(formatTick(2000), '2k');
	assert.equal(formatTick(0.5), '0.5');
});
