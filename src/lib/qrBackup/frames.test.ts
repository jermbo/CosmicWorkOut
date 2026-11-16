// Pure-function tests for QR backup frames (US-057 / US-058). Runs on Node's built-in
// test runner with type stripping: `npm test`.
//
// The last test is the whole pipeline minus the camera: compress → frames → real QR
// codes → the bundled reader → collector → inflate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import {
	DENSITIES,
	FrameCollector,
	base45Encode,
	buildFrames,
	deflate,
	frameCount,
	inflate,
	parseFrame,
} from './frames.ts';
import { frameMatrix } from './qrMatrix.ts';

// ── Frames ────────────────────────────────────────────────────────────

test('parseFrame ignores anything that is not one of our frames', () => {
	assert.equal(parseFrame('https://example.com'), null);
	assert.equal(parseFrame('CW1:ABCDEF01:3:3:AB'), null, 'index past the end');
	assert.equal(parseFrame('CW1:ABCDEF01:0:0:AB'), null, 'zero total');
	assert.equal(parseFrame('CW1:abcdef01:0:1:AB'), null, 'lowercase id');
	assert.equal(parseFrame('CW1:ABCDEF01:0:1:ab'), null, 'lowercase data');
});

// ── Collector ─────────────────────────────────────────────────────────

test('collector accepts frames in any order and ignores repeats', () => {
	const bytes = new Uint8Array(900).map((_, i) => i % 256);
	const frames = buildFrames(bytes, 250);
	const c = new FrameCollector();
	assert.equal(c.add(frames[3]), 'added');
	assert.equal(c.add(frames[3]), 'duplicate');
	assert.equal(c.add('not a frame'), 'ignored');
	for (const f of [...frames].reverse()) c.add(f);
	assert.equal(c.received, frames.length);
	assert.ok(c.complete);
	assert.deepEqual(c.assemble(), bytes);
});

test('collector starts over on a different transfer', () => {
	const a = buildFrames(new Uint8Array(900).fill(1), 250);
	const b = buildFrames(new Uint8Array(900).fill(2), 250);
	const c = new FrameCollector();
	c.add(a[0]);
	c.add(a[1]);
	assert.equal(c.add(b[0]), 'restarted');
	assert.equal(c.received, 1);
});

test('collector starts over when the sender changes density', () => {
	const bytes = new Uint8Array(900).fill(3);
	const c = new FrameCollector();
	c.add(buildFrames(bytes, DENSITIES.low)[0]);
	assert.equal(c.add(buildFrames(bytes, DENSITIES.high)[0]), 'restarted');
	assert.equal(c.total, frameCount(bytes.length, 'high'));
});

test('collector refuses to assemble a payload that fails the checksum', () => {
	const frames = buildFrames(new Uint8Array(600).fill(9), 250);
	// Same header, different (valid base45) data in the last frame.
	const parts = frames[2].split(':');
	parts[4] = base45Encode(new Uint8Array(100).fill(8));
	const c = new FrameCollector();
	c.add(frames[0]);
	c.add(frames[1]);
	c.add(parts.join(':'));
	assert.ok(c.complete);
	assert.throws(() => c.assemble(), /Checksum/);
});

test('collector refuses to assemble before every frame is in', () => {
	const c = new FrameCollector();
	c.add(buildFrames(new Uint8Array(600), 250)[0]);
	assert.throws(() => c.assemble());
});

// ── Full round trip through real QR codes ─────────────────────────────

/** Paint a QR matrix to RGBA pixels, `scale` px per module, dark on white. */
function toPixels(matrix: boolean[][], scale: number) {
	const size = matrix.length * scale;
	const data = new Uint8ClampedArray(size * size * 4).fill(255);
	matrix.forEach((row, y) =>
		row.forEach((dark, x) => {
			if (!dark) return;
			for (let dy = 0; dy < scale; dy++) {
				for (let dx = 0; dx < scale; dx++) {
					const p = ((y * scale + dy) * size + (x * scale + dx)) * 4;
					data[p] = data[p + 1] = data[p + 2] = 0;
				}
			}
		}),
	);
	return { data, size };
}

test('a backup survives compress → QR codes → bundled reader → collector → inflate', async () => {
	const payload = JSON.stringify({
		format: 'cosmic-workout-backup',
		sessions: Array.from({ length: 20 }, (_, i) => ({
			id: crypto.randomUUID(),
			date: `2026-09-${String(i + 1).padStart(2, '0')}`,
			sets: [135, 145, 155],
		})),
	});
	const bytes = await deflate(payload);

	for (const density of ['low', 'medium', 'high'] as const) {
		const frames = buildFrames(bytes, DENSITIES[density]);
		const collector = new FrameCollector();
		for (const frame of frames) {
			const { data, size } = toPixels(frameMatrix(frame), 3);
			const code = jsQR(data, size, size, { inversionAttempts: 'dontInvert' });
			assert.ok(code, `${density}: reader found no code`);
			assert.equal(code.data, frame);
			collector.add(code.data);
		}
		assert.ok(collector.complete, density);
		assert.equal(await inflate(collector.assemble()), payload);
	}
});
