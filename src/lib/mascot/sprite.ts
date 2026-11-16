/*
 * The Mascot (v1.13.0, US-064): an original pixel star, drawn as pixel maps. Each pose
 * and each face is drawn; the star moves only by changing frames and by whole pixels
 * of its own grid — never rotated, squashed or stretched (decision 13). The icons are
 * drawn from the same maps (scripts/build-icons.ts). Pure: no DOM.
 */

/** A 16×15 body map. `X` is star. */
type BodyMap = readonly string[];

const STAND: BodyMap = [
	'.......XX.......',
	'.......XX.......',
	'......XXXX......',
	'......XXXX......',
	'XXXXXXXXXXXXXXXX',
	'.XXXXXXXXXXXXXX.',
	'..XXXXXXXXXXXX..',
	'...XXXXXXXXXX...',
	'...XXXXXXXXXX...',
	'..XXXXXXXXXXXX..',
	'..XXXXX..XXXXX..',
	'.XXXXX....XXXXX.',
	'.XXXX......XXXX.',
	'XXX..........XXX',
	'................',
];

const BREATHE: BodyMap = [
	'................',
	'.......XX.......',
	'.......XX.......',
	'......XXXX......',
	'.XXXXXXXXXXXXXX.',
	'XXXXXXXXXXXXXXXX',
	'..XXXXXXXXXXXX..',
	'...XXXXXXXXXX...',
	'...XXXXXXXXXX...',
	'..XXXXXXXXXXXX..',
	'..XXXXX..XXXXX..',
	'.XXXXX....XXXXX.',
	'.XXXX......XXXX.',
	'XXX..........XXX',
	'................',
];

const CROUCH: BodyMap = [
	'................',
	'................',
	'.......XX.......',
	'......XXXX......',
	'XXXXXXXXXXXXXXXX',
	'XXXXXXXXXXXXXXXX',
	'.XXXXXXXXXXXXXX.',
	'..XXXXXXXXXXXX..',
	'..XXXXXXXXXXXX..',
	'..XXXXXXXXXXXX..',
	'.XXXXXXXXXXXXXX.',
	'.XXXXX....XXXXX.',
	'XXXX........XXXX',
	'XXX..........XXX',
	'................',
];

const REACH: BodyMap = [
	'.......XX.......',
	'.......XX.......',
	'......XXXX......',
	'.X....XXXX....X.',
	'.XXXXXXXXXXXXXX.',
	'..XXXXXXXXXXXX..',
	'...XXXXXXXXXX...',
	'...XXXXXXXXXX...',
	'...XXXXXXXXXX...',
	'...XXXXXXXXXX...',
	'...XXXX..XXXX...',
	'...XXX....XXX...',
	'...XXX....XXX...',
	'..XX........XX..',
	'................',
];

const CHEER: BodyMap = [
	'.......XX.......',
	'X......XX......X',
	'XX....XXXX....XX',
	'.XX...XXXX...XX.',
	'..XXXXXXXXXXXX..',
	'..XXXXXXXXXXXX..',
	'..XXXXXXXXXXXX..',
	'...XXXXXXXXXX...',
	'...XXXXXXXXXX...',
	'..XXXXXXXXXXXX..',
	'..XXXXX..XXXXX..',
	'.XXXXX....XXXXX.',
	'.XXXX......XXXX.',
	'XXX..........XXX',
	'................',
];

const SIDE: BodyMap = [
	'.......XX.......',
	'.......XX.......',
	'......XXXX......',
	'......XXXX......',
	'.....XXXXXX.....',
	'.....XXXXXX.....',
	'......XXXX......',
	'......XXXX......',
	'......XXXX......',
	'.....XXXXXX.....',
	'.....XXX.XX.....',
	'.....XXX.XX.....',
	'.....XX...X.....',
	'.....XX...XX....',
	'................',
];

/** The right arm, high and mid; the left is its mirror. */
const RIGHT_HIGH = ['X.......', 'X......X', 'XX....XX', 'XX...XX.', 'XXXXXX..', 'XXXXXX..'];
const RIGHT_MID = ['X.......', 'X.......', 'XX......', 'XX....XX', 'XXXXXXX.', 'XXXXXX..'];

const mirror = (half: readonly string[]): string[] => half.map((r) => [...r].reverse().join(''));

function withArms(left: readonly string[] | null, right: readonly string[] | null): BodyMap {
	return STAND.map((row, y) =>
		y < 6 ? (left ? left[y] : row.slice(0, 8)) + (right ? right[y] : row.slice(8)) : row,
	);
}

/** The top half shifted one whole pixel left (-1) or right (1). */
function lean(rows: BodyMap, d: -1 | 1): BodyMap {
	return rows.map((r, y) => (y > 8 ? r : d > 0 ? '.' + r.slice(0, -1) : r.slice(1) + '.'));
}

const BODIES = {
	stand: STAND,
	breathe: BREATHE,
	crouch: CROUCH,
	reach: REACH,
	cheer: CHEER,
	side: SIDE,
	waveHigh: withArms(null, RIGHT_HIGH),
	waveMid: withArms(null, RIGHT_MID),
	shrug: withArms(mirror(RIGHT_MID), RIGHT_MID),
	cheerL: lean(CHEER, -1),
	cheerR: lean(CHEER, 1),
} satisfies Record<string, BodyMap>;

export type BodyName = keyof typeof BODIES;

/** A face is a list of pixels on the body: x, y, colour key. */
type Pixel = readonly [x: number, y: number, color: ColorKey];

const FACES = {
	open: [
		[5, 5, 'W'],
		[6, 5, 'E'],
		[5, 6, 'E'],
		[6, 6, 'E'],
		[9, 5, 'W'],
		[10, 5, 'E'],
		[9, 6, 'E'],
		[10, 6, 'E'],
		[7, 8, 'E'],
		[8, 8, 'E'],
	],
	lookL: [
		[4, 5, 'W'],
		[5, 5, 'E'],
		[4, 6, 'E'],
		[5, 6, 'E'],
		[8, 5, 'W'],
		[9, 5, 'E'],
		[8, 6, 'E'],
		[9, 6, 'E'],
		[6, 8, 'E'],
		[7, 8, 'E'],
	],
	lookR: [
		[6, 5, 'E'],
		[7, 5, 'W'],
		[6, 6, 'E'],
		[7, 6, 'E'],
		[10, 5, 'E'],
		[11, 5, 'W'],
		[10, 6, 'E'],
		[11, 6, 'E'],
		[8, 8, 'E'],
		[9, 8, 'E'],
	],
	blink: [
		[5, 6, 'E'],
		[6, 6, 'E'],
		[9, 6, 'E'],
		[10, 6, 'E'],
		[7, 8, 'E'],
		[8, 8, 'E'],
	],
	happy: [
		[4, 6, 'E'],
		[5, 5, 'E'],
		[6, 6, 'E'],
		[9, 6, 'E'],
		[10, 5, 'E'],
		[11, 6, 'E'],
		[6, 8, 'E'],
		[7, 9, 'E'],
		[8, 9, 'E'],
		[9, 8, 'E'],
		[3, 7, 'C'],
		[12, 7, 'C'],
	],
	oh: [
		[5, 5, 'W'],
		[6, 5, 'E'],
		[5, 6, 'E'],
		[6, 6, 'E'],
		[9, 5, 'W'],
		[10, 5, 'E'],
		[9, 6, 'E'],
		[10, 6, 'E'],
		[7, 8, 'E'],
		[8, 8, 'E'],
		[7, 9, 'E'],
		[8, 9, 'E'],
	],
	squint: [
		[4, 5, 'E'],
		[5, 6, 'E'],
		[6, 6, 'E'],
		[9, 6, 'E'],
		[10, 6, 'E'],
		[11, 5, 'E'],
		[7, 8, 'E'],
		[8, 8, 'E'],
		[3, 7, 'C'],
		[12, 7, 'C'],
	],
	meh: [
		[4, 5, 'W'],
		[5, 5, 'E'],
		[4, 6, 'E'],
		[5, 6, 'E'],
		[8, 5, 'W'],
		[9, 5, 'E'],
		[8, 6, 'E'],
		[9, 6, 'E'],
		[6, 8, 'E'],
		[7, 8, 'E'],
		[8, 8, 'E'],
		[9, 8, 'E'],
	],
	none: [],
} satisfies Record<string, readonly Pixel[]>;

export type FaceName = keyof typeof FACES;

/** Where each body's face sits, in whole pixels. */
const FACE_AT: Partial<Record<BodyName, readonly [number, number]>> = {
	breathe: [0, 1],
	crouch: [0, 2],
	cheerL: [-1, 0],
	cheerR: [1, 0],
};

/**
 * The colours. X: star yellow, the `--field-health` token. H: light from the top
 * left. S: shade. K: the back of the star. E: eye and mouth. W: eye shine. C: blush.
 */
export const PALETTE = {
	X: 'oklch(0.86 0.14 95)',
	H: '#fff8d0',
	S: 'oklch(0.72 0.15 75)',
	K: 'oklch(0.62 0.13 70)',
	E: '#0a0a0a',
	W: '#ffffff',
	C: 'oklch(0.76 0.13 30)',
} as const;

export type ColorKey = keyof typeof PALETTE;

/** The frame's box, in star pixels: room above for hops and to the sides for arms. */
export const VIEWBOX = { x: -3, y: -6, w: 22, h: 21 } as const;

export type Frame = {
	b: BodyName;
	f?: FaceName;
	/** Whole-pixel offsets on the star's grid. */
	x?: number;
	y?: number;
	/** How long the frame shows, in ms. */
	t: number;
	/** The back of the star: no face. */
	back?: boolean;
	/** Sparkles start on this frame. */
	spark?: boolean;
};

export const STANDING: Frame = { b: 'stand', f: 'open', t: 0 };

/** The star's pixels for one frame, lit from the top left. */
export function framePixels(frame: Frame): Pixel[] {
	const rows = BODIES[frame.b];
	const h = rows.length;
	const w = rows[0].length;
	const at = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < w && rows[y][x] === 'X';
	const out: Pixel[] = [];
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (!at(x, y)) continue;
			let c: ColorKey = 'X';
			if (!at(x, y - 1) || !at(x - 1, y)) c = 'H';
			if (!at(x, y + 1) || !at(x + 1, y)) c = 'S';
			if (frame.back) c = c === 'H' ? 'X' : 'K';
			out.push([x, y, c]);
		}
	}
	if (!frame.back) {
		const [dx, dy] = FACE_AT[frame.b] ?? [0, 0];
		for (const [x, y, c] of FACES[frame.f ?? 'open']) out.push([x + dx, y + dy, c]);
	}
	return out;
}

/** SVG `<rect>`s for a frame. Slightly over 1 wide, so no hairline shows between pixels. */
export function frameRects(frame: Frame, palette: Record<ColorKey, string> = PALETTE): string {
	return framePixels(frame)
		.map(([x, y, c]) => `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${palette[c]}"/>`)
		.join('');
}

const rep = (n: number, frames: Frame[]): Frame[] => Array.from({ length: n }, () => frames).flat();

export type ActionName = 'wave' | 'hop' | 'dance' | 'shrug';

/**
 * The actions of Phase 1 (decision 17) that play once. Idle and talk are played by the
 * component (IDLE, TALK_FRAMES).
 */
export const ACTIONS: Record<ActionName, Frame[]> = {
	wave: [
		{ b: 'stand', t: 120 },
		{ b: 'stand', f: 'oh', t: 140 },
		...rep(3, [
			{ b: 'waveMid', f: 'happy', t: 120 },
			{ b: 'waveHigh', f: 'happy', t: 150 },
		]),
		{ b: 'stand', f: 'happy', t: 500 },
	],
	hop: [
		{ b: 'crouch', f: 'squint', t: 90 },
		{ b: 'reach', f: 'happy', y: -3, t: 70 },
		{ b: 'reach', f: 'happy', y: -5, t: 90 },
		{ b: 'stand', f: 'happy', y: -4, t: 80 },
		{ b: 'stand', f: 'happy', y: -2, t: 70 },
		{ b: 'crouch', f: 'happy', t: 90 },
		{ b: 'stand', f: 'happy', t: 600 },
	],
	dance: [
		{ b: 'stand', f: 'oh', t: 160 },
		{ b: 'crouch', f: 'squint', t: 140 },
		{ b: 'reach', f: 'happy', y: -4, t: 70 },
		{ b: 'cheer', f: 'happy', y: -7, t: 90, spark: true },
		{ b: 'cheer', f: 'happy', y: -8, t: 120 },
		{ b: 'cheer', f: 'happy', y: -6, t: 80 },
		{ b: 'reach', f: 'happy', y: -3, t: 60 },
		{ b: 'crouch', f: 'happy', t: 100 },
		{ b: 'stand', y: -1, t: 70 },
		{ b: 'side', f: 'none', y: -2, t: 70 },
		{ b: 'stand', back: true, y: -3, t: 80 },
		{ b: 'side', f: 'none', y: -2, t: 70 },
		{ b: 'stand', f: 'happy', y: -1, t: 70 },
		{ b: 'crouch', f: 'happy', t: 90 },
		...rep(2, [
			{ b: 'cheerL', f: 'happy', x: -1, t: 150, spark: true },
			{ b: 'cheer', f: 'happy', t: 90 },
			{ b: 'cheerR', f: 'happy', x: 1, t: 150 },
			{ b: 'cheer', f: 'happy', t: 90 },
		]),
		{ b: 'crouch', f: 'squint', t: 90 },
		{ b: 'reach', f: 'happy', y: -4, t: 80 },
		{ b: 'cheer', f: 'happy', y: -5, t: 120, spark: true },
		{ b: 'reach', f: 'happy', y: -2, t: 70 },
		{ b: 'crouch', f: 'happy', t: 90 },
		{ b: 'cheer', f: 'happy', t: 900 },
	],
	shrug: [
		{ b: 'stand', f: 'lookL', t: 300 },
		{ b: 'shrug', f: 'meh', t: 120 },
		{ b: 'shrug', f: 'meh', y: -1, t: 500 },
		{ b: 'shrug', f: 'meh', t: 120 },
		{ b: 'stand', f: 'meh', t: 400 },
		{ b: 'stand', t: 300 },
	],
};

/** The two talking frames, swapped while a line types (US-066 2a). */
export const TALK_FRAMES: readonly Frame[] = [
	{ b: 'stand', f: 'oh', t: 110 },
	{ b: 'stand', f: 'open', t: 90 },
];

/** Idle (US-064 3): two breathing frames, and a blink or a look at random times. */
export const IDLE = {
	breathe: [
		{ b: 'stand', t: 700 },
		{ b: 'breathe', t: 700 },
	] as const satisfies readonly Frame[],
	blink: { f: 'blink', t: 110 } as const,
	lookL: { f: 'lookL', t: 900 } as const,
	lookR: { f: 'lookR', t: 900 } as const,
	minGap: 1800,
	maxGap: 4600,
};

/** A sparkle: five 5×5 frames, 80 ms each. `X` takes the sparkle's colour. */
export const SPARKLE_FRAMES: readonly (readonly string[])[] = [
	['.....', '.....', '..X..', '.....', '.....'],
	['.....', '..X..', '.XXX.', '..X..', '.....'],
	['..X..', '..X..', 'XXWXX', '..X..', '..X..'],
	['.....', '..X..', '.X.X.', '..X..', '.....'],
	['.....', '.....', '..X..', '.....', '.....'],
];

/** Sparkle colours: the five tracker fields. */
export const SPARKLE_COLORS = [
	'var(--field-health)',
	'var(--field-train)',
	'var(--field-habit)',
	'var(--field-base)',
	'var(--field-active)',
] as const;
