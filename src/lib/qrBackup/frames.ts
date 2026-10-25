/**
 * The pure half of QR backup (US-057 / US-058): compress a backup, split it into
 * QR-sized frames, and put it back together on the other side.
 *
 * Kept free of the DOM and IndexedDB so the whole round trip can be unit-tested in Node.
 *
 * Wire format of one frame (all characters in the QR alphanumeric set, which packs
 * ~30% more data per code than byte mode):
 *
 *     CW1:<id>:<index>:<total>:<base45 data>
 *
 * `id` is the CRC-32 of the full compressed payload as 8 hex digits. It names the
 * transfer and doubles as the checksum once every frame is in.
 */

export const FRAME_PREFIX = 'CW1';

/** Payload bytes per frame. Lower density = fewer bytes = a smaller, easier-to-read code. */
export const DENSITIES = {
	low: 250,
	medium: 450,
	high: 800,
} as const;
export type Density = keyof typeof DENSITIES;

/** Milliseconds each frame stays on screen. */
export const SPEEDS = {
	slow: 500,
	normal: 250,
	fast: 150,
} as const;
export type Speed = keyof typeof SPEEDS;

// --- Compression ------------------------------------------------------------

/** UTF-8 encode and raw-deflate a string. Built into every supported browser and Node. */
export async function deflate(text: string): Promise<Uint8Array> {
	const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Reverse of `deflate`. Rejects on corrupt input. */
export async function inflate(bytes: Uint8Array): Promise<string> {
	const stream = new Blob([bytes as BlobPart])
		.stream()
		.pipeThrough(new DecompressionStream('deflate-raw'));
	return new Response(stream).text();
}

// --- Base45 (RFC 9285) ------------------------------------------------------

const B45 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

export function base45Encode(bytes: Uint8Array): string {
	let out = '';
	for (let i = 0; i < bytes.length; i += 2) {
		if (i + 1 < bytes.length) {
			const n = bytes[i] * 256 + bytes[i + 1];
			out += B45[n % 45] + B45[Math.floor(n / 45) % 45] + B45[Math.floor(n / 2025)];
		} else {
			const n = bytes[i];
			out += B45[n % 45] + B45[Math.floor(n / 45)];
		}
	}
	return out;
}

/** Throws on characters outside the alphabet or an impossible length. */
export function base45Decode(text: string): Uint8Array {
	if (text.length % 3 === 1) throw new Error('Invalid base45 length.');
	const out = new Uint8Array(Math.floor(text.length / 3) * 2 + (text.length % 3 === 2 ? 1 : 0));
	let o = 0;
	for (let i = 0; i < text.length; i += 3) {
		const chunk = text.slice(i, i + 3);
		let n = 0;
		for (let j = chunk.length - 1; j >= 0; j--) {
			const v = B45.indexOf(chunk[j]);
			if (v < 0) throw new Error('Invalid base45 character.');
			n = n * 45 + v;
		}
		if (chunk.length === 3) {
			if (n > 0xffff) throw new Error('Invalid base45 value.');
			out[o++] = n >> 8;
			out[o++] = n & 0xff;
		} else {
			if (n > 0xff) throw new Error('Invalid base45 value.');
			out[o++] = n;
		}
	}
	return out;
}

// --- CRC-32 -----------------------------------------------------------------

// Not SubtleCrypto: that needs a secure context, and a phone on `npm run dev --host`
// (plain http on the LAN) still has to be able to send.
const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
})();

export function crc32Hex(bytes: Uint8Array): string {
	let crc = 0xffffffff;
	for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
	return ((crc ^ 0xffffffff) >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

// --- Frames -----------------------------------------------------------------

/** Split compressed bytes into frame strings, one per QR code. */
export function buildFrames(bytes: Uint8Array, bytesPerFrame: number): string[] {
	const id = crc32Hex(bytes);
	const total = Math.max(1, Math.ceil(bytes.length / bytesPerFrame));
	const frames: string[] = [];
	for (let i = 0; i < total; i++) {
		const chunk = bytes.subarray(i * bytesPerFrame, (i + 1) * bytesPerFrame);
		frames.push(`${FRAME_PREFIX}:${id}:${i}:${total}:${base45Encode(chunk)}`);
	}
	return frames;
}

export function frameCount(byteLength: number, density: Density): number {
	return Math.max(1, Math.ceil(byteLength / DENSITIES[density]));
}

/** Seconds one loop of every frame takes on screen. */
export function loopSeconds(frames: number, speed: Speed): number {
	return (frames * SPEEDS[speed]) / 1000;
}

export interface Frame {
	id: string;
	index: number;
	total: number;
	data: string;
}

const FRAME_RE = /^CW1:([0-9A-F]{8}):(\d{1,5}):(\d{1,5}):([0-9A-Z $%*+\-./:]*)$/;

/** Parse one scanned string. Returns null for anything that isn't one of our frames. */
export function parseFrame(text: string): Frame | null {
	const m = FRAME_RE.exec(text);
	if (!m) return null;
	const index = Number(m[2]);
	const total = Number(m[3]);
	if (total < 1 || index >= total) return null;
	return { id: m[1], index, total, data: m[4] };
}

export type CollectResult = 'added' | 'duplicate' | 'restarted' | 'ignored';

/**
 * Gathers frames for one transfer, in any order. A frame from a different transfer
 * (new id, or same id with a different total — the sender changed density) starts over.
 */
export class FrameCollector {
	id: string | null = null;
	total = 0;
	received = 0;
	private chunks: (string | undefined)[] = [];

	add(text: string): CollectResult {
		const frame = parseFrame(text);
		if (!frame) return 'ignored';

		let result: CollectResult = 'added';
		if (frame.id !== this.id || frame.total !== this.total) {
			result = this.id === null ? 'added' : 'restarted';
			this.id = frame.id;
			this.total = frame.total;
			this.received = 0;
			this.chunks = new Array(frame.total);
		}
		if (this.chunks[frame.index] !== undefined) return 'duplicate';
		this.chunks[frame.index] = frame.data;
		this.received++;
		return result;
	}

	get complete(): boolean {
		return this.total > 0 && this.received === this.total;
	}

	has(index: number): boolean {
		return this.chunks[index] !== undefined;
	}

	/** Join every frame and check it against the transfer id. Throws if incomplete or corrupt. */
	assemble(): Uint8Array {
		if (!this.complete) throw new Error('Not every code has been read yet.');
		const parts = this.chunks.map((c) => base45Decode(c as string));
		const bytes = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
		let offset = 0;
		for (const part of parts) {
			bytes.set(part, offset);
			offset += part.length;
		}
		if (crc32Hex(bytes) !== this.id) {
			throw new Error('Checksum mismatch — a code was misread.');
		}
		return bytes;
	}

	reset(): void {
		this.id = null;
		this.total = 0;
		this.received = 0;
		this.chunks = [];
	}
}
