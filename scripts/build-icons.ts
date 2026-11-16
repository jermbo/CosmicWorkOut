// Draw the app icons from the Mascot's pixel maps (US-064, decision 19), so the icons
// and the Overview header come from one drawing. No packages: PNGs are written by hand
// with Node's zlib. Run with `npm run icons`; the files land in static/.
import { deflateSync, crc32 } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PALETTE, STANDING, framePixels, type ColorKey } from '../src/lib/mascot/sprite.ts';

const STATIC = join(import.meta.dirname, '..', 'static');
const BACKGROUND: RGB = [0x0a, 0x0a, 0x0a];
/** The star's own grid: 16 wide, 14 tall (the last row of each map is empty). */
const STAR_W = 16;
const STAR_H = 14;

type RGB = [number, number, number];

// ── Colour: oklch() and #hex to sRGB ────────────────────────────────────

function oklchToRgb(l: number, c: number, hDeg: number): RGB {
	const h = (hDeg * Math.PI) / 180;
	const a = c * Math.cos(h);
	const b = c * Math.sin(h);
	const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const linear = [
		4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
		-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
		-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
	];
	return linear.map((v) => {
		const x = Math.max(0, Math.min(1, v));
		const srgb = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
		return Math.round(srgb * 255);
	}) as RGB;
}

function toRgb(color: string): RGB {
	const ok = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(color);
	if (ok) return oklchToRgb(Number(ok[1]), Number(ok[2]), Number(ok[3]));
	const hex = /^#([0-9a-f]{6})$/i.exec(color);
	if (hex) {
		const n = parseInt(hex[1], 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}
	throw new Error(`Unknown colour ${color}`);
}

const RGB_OF = Object.fromEntries(Object.entries(PALETTE).map(([k, v]) => [k, toRgb(v)])) as Record<
	ColorKey,
	RGB
>;

const hex = ([r, g, b]: RGB) =>
	`#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

// ── Raster ─────────────────────────────────────────────────────────────

/** RGBA pixels: the standing star at `scale` screen pixels per star pixel, centred. */
function rasterize(size: number, scale: number, background: RGB | null): Uint8Array {
	const rgba = new Uint8Array(size * size * 4);
	if (background) {
		for (let i = 0; i < size * size; i++) rgba.set([...background, 255], i * 4);
	}
	const ox = Math.floor((size - STAR_W * scale) / 2);
	const oy = Math.floor((size - STAR_H * scale) / 2);
	for (const [x, y, c] of framePixels(STANDING)) {
		const color = RGB_OF[c];
		for (let dy = 0; dy < scale; dy++) {
			for (let dx = 0; dx < scale; dx++) {
				const px = ox + x * scale + dx;
				const py = oy + y * scale + dy;
				if (px < 0 || py < 0 || px >= size || py >= size) continue;
				rgba.set([...color, 255], (py * size + px) * 4);
			}
		}
	}
	return rgba;
}

function chunk(type: string, data: Uint8Array): Buffer {
	const head = Buffer.alloc(8);
	head.writeUInt32BE(data.length, 0);
	head.write(type, 4, 'ascii');
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
	return Buffer.concat([head, data, crc]);
}

function png(size: number, rgba: Uint8Array): Buffer {
	const header = Buffer.alloc(13);
	header.writeUInt32BE(size, 0);
	header.writeUInt32BE(size, 4);
	header[8] = 8; // bit depth
	header[9] = 6; // RGBA
	const raw = Buffer.alloc(size * (size * 4 + 1));
	for (let y = 0; y < size; y++) {
		raw[y * (size * 4 + 1)] = 0; // filter: none
		raw.set(rgba.subarray(y * size * 4, (y + 1) * size * 4), y * (size * 4 + 1) + 1);
	}
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', header),
		chunk('IDAT', deflateSync(raw)),
		chunk('IEND', new Uint8Array()),
	]);
}

/** An .ico holding one PNG, which every current browser reads. */
function ico(size: number, image: Buffer): Buffer {
	const dir = Buffer.alloc(22);
	dir.writeUInt16LE(0, 0);
	dir.writeUInt16LE(1, 2); // icon
	dir.writeUInt16LE(1, 4); // one image
	dir[6] = size;
	dir[7] = size;
	dir.writeUInt16LE(1, 10); // planes
	dir.writeUInt16LE(32, 12); // bits per pixel
	dir.writeUInt32LE(image.length, 14);
	dir.writeUInt32LE(22, 18);
	return Buffer.concat([dir, image]);
}

// ── SVG ────────────────────────────────────────────────────────────────

/** The full-bleed icon: the star on the app's ink, inside the maskable safe zone. */
function svg(): string {
	const rects = framePixels(STANDING)
		.map(
			([x, y, c]) =>
				`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${hex(RGB_OF[c])}"/>`,
		)
		.join('');
	// 26 star pixels across: the star fills ~60%, inside the 80% maskable circle.
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -6 26 26" shape-rendering="crispEdges" role="img" aria-label="CosmicWorkOut"><rect x="-5" y="-6" width="26" height="26" fill="${hex(BACKGROUND)}"/>${rects}</svg>\n`;
}

// ── Write ──────────────────────────────────────────────────────────────

const write = (name: string, data: string | Buffer) => {
	writeFileSync(join(STATIC, name), data);
	console.log(`wrote static/${name}`);
};

write('icon.svg', svg());
// Whole screen pixels per star pixel keep the edges sharp. Maskable icons keep the
// star inside the safe circle (80% of the size).
write('icon-512.png', png(512, rasterize(512, 18, BACKGROUND)));
write('icon-192.png', png(192, rasterize(192, 7, BACKGROUND)));
write('apple-touch-icon.png', png(180, rasterize(180, 8, BACKGROUND)));
// Tab icons: the star alone, on no background.
write('favicon.png', png(48, rasterize(48, 3, null)));
write('favicon.ico', ico(32, png(32, rasterize(32, 2, null))));
