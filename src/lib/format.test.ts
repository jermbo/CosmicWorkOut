// Session durations: never blank. Short sessions read in seconds (DurationFormat
// prints a zero-minute duration as an empty string).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration } from './format.ts';

test('formatDuration shows seconds under a minute, never blank', () => {
	for (const s of [0, 6, 29, 59]) {
		for (const compact of [true, false]) {
			const out = formatDuration(s, compact);
			assert.ok(out.length > 0, `blank for ${s}s (compact ${compact})`);
			assert.match(out, new RegExp(String(Math.round(s))));
		}
	}
});

test('formatDuration shows minutes from a minute up', () => {
	assert.match(formatDuration(60, true), /1/);
	assert.match(formatDuration(45 * 60), /45/);
	assert.ok(formatDuration(90 * 60, true).length > 0);
});
