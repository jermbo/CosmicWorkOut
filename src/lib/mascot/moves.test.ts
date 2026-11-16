import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	ACTIONS,
	ENTRANCES,
	EXITS,
	IDLE,
	pickIdleBit,
	pickOther,
	runOff,
	type Frame,
} from './sprite.ts';

/** Star pixels from the screen edge to the body's near side, when it stands at its spot. */
const EDGE = 7;
const BODY = 16;

const last = (frames: Frame[]) => frames[frames.length - 1];
const isWhole = (n: number | undefined) => Number.isInteger(n ?? 0);

test('every way in starts out of sight (or just peeking) and ends standing at its spot', () => {
	for (const name of ENTRANCES) {
		const frames = ACTIONS[name];
		const first = frames[0];
		const hidden = (first.x ?? 0) + EDGE + BODY <= 0 || (first.y ?? 0) <= -60;
		const peeking = name === 'peekIn' && (first.x ?? 0) < -10;
		assert.ok(hidden || peeking, `${name} starts in sight`);
		assert.equal(last(frames).x ?? 0, 0, `${name} ends off its spot`);
		assert.equal(last(frames).y ?? 0, 0, `${name} ends in the air`);
	}
});

test('every way out ends out of sight', () => {
	for (const name of EXITS) {
		const end = last(ACTIONS[name]);
		const x = end.x ?? 0;
		const y = end.y ?? 0;
		const gone = y >= 15 || y <= -200 || x + EDGE + BODY <= 0 || x >= 60;
		assert.ok(gone, `${name} ends at x ${x}, y ${y}`);
	}
});

test('a run off goes past the far edge of a screen of any width', () => {
	assert.ok((last(runOff(140)).x ?? 0) >= 140);
});

test('every move steps by whole star pixels only', () => {
	for (const [name, frames] of Object.entries(ACTIONS)) {
		for (const f of frames) assert.ok(isWhole(f.x) && isWhole(f.y), `${name} has a part pixel`);
	}
});

test('an idle bit is picked by weight, and every bit can come up', () => {
	const seen = new Set<string>();
	for (let i = 0; i < 1000; i++) seen.add(pickIdleBit(i / 1000));
	assert.deepEqual([...seen].sort(), Object.keys(IDLE.bits).sort());
	assert.equal(pickIdleBit(0), 'blink');
});

test('a random pick is never the same as the last one, when there is a choice', () => {
	for (let r = 0; r < 1; r += 0.05) assert.notEqual(pickOther(['a', 'b', 'c'], 'b', r), 'b');
	assert.equal(pickOther(['a'], 'a', 0.5), 'a');
});
