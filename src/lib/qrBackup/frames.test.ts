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
	base45Decode,
	base45Encode,
	buildFrames,
	crc32Hex,
	deflate,
	frameCount,
	inflate,
	loopSeconds,
	parseFrame,
} from './frames.ts';
import { frameMatrix } from './qrMatrix.ts';

const bytesOf = (...values: number[]) => new Uint8Array(values);

// ── Base45 ────────────────────────────────────────────────────────────

test('base45 matches the RFC 9285 examples', () => {
	const enc = new TextEncoder();
	assert.equal(base45Encode(enc.encode('AB')), 'BB8');
	assert.equal(base45Encode(enc.encode('Hello!!')), '%69 VD92EX0');
	assert.equal(base45Encode(enc.encode('base-45')), 'UJCLQE7W581');
	assert.equal(new TextDecoder().decode(base45Decode('QED8WEX0')), 'ietf!');
});

test('base45 round-trips every byte value and odd lengths', () => {
	const all = new Uint8Array(257).map((_, i) => i % 256);
	assert.deepEqual(base45Decode(base45Encode(all)), all);
	assert.deepEqual(base45Decode(base45Encode(bytesOf(255))), bytesOf(255));
	assert.deepEqual(base45Decode(base45Encode(bytesOf())), bytesOf());
});

test('base45 rejects bad input', () => {
	assert.throws(() => base45Decode('A'));
	assert.throws(() => base45Decode('ab!'));
	assert.throws(() => base45Decode(':::'), 'value above 0xFFFF');
});

// ── CRC-32 ────────────────────────────────────────────────────────────

test('crc32 matches the standard check value', () => {
	assert.equal(crc32Hex(new TextEncoder().encode('123456789')), 'CBF43926');
	assert.equal(crc32Hex(bytesOf()), '00000000');
});

// ── Compression ───────────────────────────────────────────────────────

test('deflate and inflate round-trip unicode text', async () => {
	const text = JSON.stringify({ note: 'Bench — 135 lb ✓', n: [1, 2, 3] }).repeat(50);
	const packed = await deflate(text);
	assert.ok(packed.length < text.length);
	assert.equal(await inflate(packed), text);
});

test('inflate rejects corrupt input', async () => {
	await assert.rejects(inflate(bytesOf(0xff, 0xff, 0xff, 0xff)));
});

// ── Frames ────────────────────────────────────────────────────────────

test('buildFrames splits by density and every frame parses', () => {
	const bytes = new Uint8Array(1000).map((_, i) => (i * 7) % 256);
	const frames = buildFrames(bytes, 450);
	assert.equal(frames.length, 3);
	assert.equal(frames.length, frameCount(bytes.length, 'medium'));
	frames.forEach((f, i) => {
		const parsed = parseFrame(f);
		assert.ok(parsed);
		assert.equal(parsed.index, i);
		assert.equal(parsed.total, 3);
		assert.equal(parsed.id, crc32Hex(bytes));
	});
});

test('an empty payload still makes one frame', () => {
	assert.equal(buildFrames(bytesOf(), 450).length, 1);
});

test('parseFrame ignores anything that is not one of our frames', () => {
	assert.equal(parseFrame('https://example.com'), null);
	assert.equal(parseFrame('CW1:ABCDEF01:3:3:AB'), null, 'index past the end');
	assert.equal(parseFrame('CW1:ABCDEF01:0:0:AB'), null, 'zero total');
	assert.equal(parseFrame('CW1:abcdef01:0:1:AB'), null, 'lowercase id');
	assert.equal(parseFrame('CW1:ABCDEF01:0:1:ab'), null, 'lowercase data');
});

test('loopSeconds scales with frames and speed', () => {
	assert.equal(loopSeconds(12, 'normal'), 3);
	assert.equal(loopSeconds(12, 'slow'), 6);
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
