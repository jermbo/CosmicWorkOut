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

/** A breath in: only the top point dips one pixel. The arms stay still. */
const BREATHE: BodyMap = ['................', '.......XX.......', ...STAND.slice(2)];

/** A foot tap: the right toe lifts. */
const TOE_UP: BodyMap = [
	...STAND.slice(0, 12),
	'.XXXX......XXXXX',
	'XXX.............',
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

/** Running, facing right: the back leg tucked up (A), then the front leg (B). */
const RUN_A: BodyMap = [
	...STAND.slice(0, 10),
	'..XXXXX..XXXXX..',
	'..XXXX....XXXXX.',
	'...XX......XXXX.',
	'.............XXX',
	'................',
];

const RUN_B: BodyMap = [
	...STAND.slice(0, 10),
	'..XXXXX..XXXXX..',
	'.XXXXX....XXXX..',
	'.XXXX......XX...',
	'XXX.............',
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
	runA: lean(RUN_A, 1),
	runB: lean(RUN_B, 1),
	skid: lean(STAND, -1),
	swayR: lean(STAND, 1),
	toeUp: TOE_UP,
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
	sleep: [
		[4, 6, 'E'],
		[5, 6, 'E'],
		[6, 6, 'E'],
		[9, 6, 'E'],
		[10, 6, 'E'],
		[11, 6, 'E'],
		[7, 8, 'E'],
		[8, 8, 'E'],
		[3, 7, 'C'],
		[12, 7, 'C'],
	],
	yawn: [
		[4, 5, 'E'],
		[5, 6, 'E'],
		[6, 6, 'E'],
		[9, 6, 'E'],
		[10, 6, 'E'],
		[11, 5, 'E'],
		[7, 8, 'E'],
		[8, 8, 'E'],
		[6, 9, 'E'],
		[7, 9, 'E'],
		[8, 9, 'E'],
		[9, 9, 'E'],
		[7, 10, 'E'],
		[8, 10, 'E'],
	],
	none: [],
} satisfies Record<string, readonly Pixel[]>;

export type FaceName = keyof typeof FACES;

/** Where each body's face sits, in whole pixels. */
const FACE_AT: Partial<Record<BodyName, readonly [number, number]>> = {
	crouch: [0, 2],
	cheerL: [-1, 0],
	cheerR: [1, 0],
	runA: [1, 0],
	runB: [1, 0],
	skid: [-1, 0],
	swayR: [1, 0],
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
	/** A puff of dust is kicked up behind the feet on this frame; `both` puffs on each side. */
	dust?: boolean | 'both';
	/** Face the other way from the component, for a frame that runs back. */
	turn?: boolean;
};

export const STANDING: Frame = { b: 'stand', f: 'open', t: 0 };

/** The width of a body map, in star pixels. */
export const BODY_W = 16;

/**
 * The star's pixels for one frame, lit from the top left. Frames are drawn facing right;
 * `flip` mirrors the drawing to face left. The light stays on the top left either way.
 */
export function framePixels(frame: Frame, flip = false): Pixel[] {
	const drawn = BODIES[frame.b];
	const rows = flip ? drawn.map((r) => [...r].reverse().join('')) : drawn;
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
		for (const [x, y, c] of FACES[frame.f ?? 'open']) {
			out.push([flip ? w - 1 - (x + dx) : x + dx, y + dy, c]);
		}
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

/** The moves that bring the star to a celebration. Each starts out of sight. */
export const ENTRANCES = ['runIn', 'hopIn', 'peekIn', 'dashIn', 'dropIn'] as const;
/** The moves that take it away again. Each ends out of sight. */
export const EXITS = ['jumpOff', 'runOff', 'runBack', 'rocketUp', 'waveBye'] as const;

export type EntranceName = (typeof ENTRANCES)[number];
export type ExitName = (typeof EXITS)[number];
export type ActionName = 'wave' | 'hop' | 'dance' | 'shrug' | EntranceName | ExitName;

/** How far away the star starts its run, in star pixels: out of sight past a screen edge. */
export const RUN_FROM = -30;

/** A run cycle from `x` by `steps`, legs swapping each step, facing the way it moves. */
function runSteps(x: number, steps: number[], turn = false, dustEvery = 4): Frame[] {
	const dir = turn ? -1 : 1;
	return steps.map((s, i) => {
		x += s * dir;
		const a = i % 2 === 0;
		return {
			b: a ? 'runA' : 'runB',
			f: 'lookR',
			x,
			y: a ? 0 : -1,
			t: s > 3 ? 45 : s > 2 ? 60 : 75,
			dust: a && i % dustEvery === 0,
			turn,
		};
	});
}

const SKID_STOP: Frame[] = [
	{ b: 'skid', f: 'oh', x: -1, t: 90, dust: true },
	{ b: 'skid', f: 'oh', x: 0, t: 130, dust: true },
	{ b: 'stand', f: 'oh', t: 120 },
	{ b: 'stand', f: 'happy', t: 250 },
];

/** Gravity: a fall from `y` to past `to`, each step longer than the last. */
function fall(frame: Omit<Frame, 'y' | 't'>, y: number, to: number, dx = 0, start = 2): Frame[] {
	const out: Frame[] = [];
	let x = frame.x ?? 0;
	for (let v = start; y < to; v++) {
		y = Math.min(y + v, to);
		x += dx;
		out.push({ ...frame, x, y, t: 45 });
		if (y === to) break;
	}
	return out;
}

/** Run in from the edge, faster at first, then a skid to a stop. */
export function runIn(): Frame[] {
	return [...runSteps(RUN_FROM, [3, 3, 3, 3, 3, 3, 3, 3, 2, 2]), ...SKID_STOP];
}

/** Bunny hops in from the edge: four hops, then a happy landing. */
export function hopIn(): Frame[] {
	const out: Frame[] = [];
	let x = RUN_FROM;
	for (let i = 0; i < 4; i++) {
		out.push(
			{ b: 'crouch', f: 'squint', x, t: 80, dust: i > 0 },
			{ b: 'reach', f: 'happy', x: x + 2, y: -3, t: 60 },
			{ b: 'reach', f: 'happy', x: x + 4, y: -5, t: 70 },
			{ b: 'stand', f: 'happy', x: x + 6, y: -3, t: 60 },
		);
		x += 7;
		if (x > 0) x = 0;
		out.push({ b: 'stand', f: 'happy', x: Math.min(x, 0), y: -1, t: 40 });
	}
	out.push(
		{ b: 'crouch', f: 'happy', x: -2, t: 90, dust: true },
		{ b: 'stand', f: 'happy', t: 300 },
	);
	return out.map((f) => ({ ...f, x: Math.min(f.x ?? 0, 0) }));
}

/** Peeks in from the edge, looks around, then dashes to its spot. */
export function peekIn(): Frame[] {
	return [
		{ b: 'stand', f: 'lookR', x: -18, t: 140 },
		{ b: 'stand', f: 'lookR', x: -16, t: 500 },
		{ b: 'stand', f: 'blink', x: -16, t: 110 },
		{ b: 'stand', f: 'lookR', x: -16, t: 350 },
		{ b: 'stand', f: 'oh', x: -16, t: 250 },
		...runSteps(-16, [4, 4, 3, 3]),
		...SKID_STOP.map((f, i) => (i === 0 ? { ...f, x: -2 } : f)),
	];
}

/** A dash like a comet: big steps and sparkles, then a long skid. */
export function dashIn(): Frame[] {
	return [
		...runSteps(RUN_FROM - 6, [5, 5, 5, 5, 5, 4], false, 2).map((f, i) => ({
			...f,
			spark: i === 1,
		})),
		{ b: 'skid', f: 'oh', x: -4, t: 70, dust: true },
		{ b: 'skid', f: 'oh', x: -2, t: 90, dust: true },
		...SKID_STOP,
	];
}

/** Drops from the sky, lands in a crouch with dust on both sides, and bounces up. */
export function dropIn(from = -70): Frame[] {
	return [
		...fall({ b: 'reach', f: 'oh' }, from, 0, 0, 3),
		{ b: 'crouch', f: 'squint', t: 140, dust: 'both' },
		{ b: 'stand', f: 'happy', y: -2, t: 70 },
		{ b: 'stand', f: 'happy', y: -1, t: 70 },
		{ b: 'stand', f: 'happy', t: 300 },
	];
}

/**
 * Jumps up and off, back toward the edge it came from, and falls out of sight below its
 * spot (behind the bottom bar).
 */
export function jumpOff(): Frame[] {
	return [
		{ b: 'crouch', f: 'squint', t: 140 },
		{ b: 'reach', f: 'happy', x: -1, y: -3, t: 60 },
		{ b: 'cheer', f: 'happy', x: -2, y: -6, t: 70 },
		{ b: 'cheer', f: 'happy', x: -3, y: -8, t: 90 },
		{ b: 'cheer', f: 'happy', x: -4, y: -9, t: 120 },
		{ b: 'reach', f: 'oh', x: -5, y: -8, t: 70 },
		...fall({ b: 'reach', f: 'oh', x: -5 }, -8, 30, -1),
	];
}

/** Runs on across the screen and off the far edge. `across` is in star pixels. */
export function runOff(across = 60): Frame[] {
	const steps = Array.from({ length: Math.ceil(across / 3) }, () => 3);
	return [
		{ b: 'stand', f: 'lookR', t: 250 },
		{ b: 'crouch', f: 'lookR', t: 90 },
		...runSteps(0, steps),
	];
}

/** Turns around and runs back off the edge it came from. */
export function runBack(): Frame[] {
	return [
		{ b: 'stand', f: 'lookL', t: 300 },
		{ b: 'stand', f: 'lookR', turn: true, t: 120 },
		...runSteps(0, [2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], true),
	];
}

/** Crouches, then blasts straight up and out of sight, with sparkles. */
export function rocketUp(): Frame[] {
	return [
		{ b: 'crouch', f: 'squint', t: 200 },
		{ b: 'crouch', f: 'squint', x: -1, t: 50 },
		{ b: 'crouch', f: 'squint', x: 1, t: 50 },
		{ b: 'crouch', f: 'squint', t: 60, dust: 'both' },
		...[-4, -10, -18, -30, -46, -66, -92, -124, -160, -200, -250].map((y, i): Frame => ({
			b: i < 2 ? 'reach' : 'cheer',
			f: 'happy',
			y,
			t: 45,
			spark: i === 1,
		})),
	];
}

/** Waves goodbye, then hops down behind the bottom bar. */
export function waveBye(): Frame[] {
	return [
		...rep(2, [
			{ b: 'waveMid', f: 'happy', t: 120 },
			{ b: 'waveHigh', f: 'happy', t: 150 },
		]),
		{ b: 'stand', f: 'happy', t: 200 },
		{ b: 'crouch', f: 'squint', t: 100 },
		{ b: 'reach', f: 'happy', y: -3, t: 70 },
		{ b: 'reach', f: 'happy', y: -4, t: 90 },
		...fall({ b: 'reach', f: 'oh' }, -4, 30, 0, 1),
	];
}

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
	runIn: runIn(),
	hopIn: hopIn(),
	peekIn: peekIn(),
	dashIn: dashIn(),
	dropIn: dropIn(),
	jumpOff: jumpOff(),
	runOff: runOff(),
	runBack: runBack(),
	rocketUp: rocketUp(),
	waveBye: waveBye(),
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

/**
 * Idle (US-064 3): a slow, uneven breath, and every few seconds a small bit of
 * personality. With no tap for a while, it falls asleep; a tap wakes it.
 */
export const IDLE = {
	/** One breath: out, then in; each side 1.1 to 1.6 s. */
	breathMin: 1100,
	breathMax: 1600,
	/** The gap between two bits. */
	minGap: 3000,
	maxGap: 7000,
	/** No tap for this long, and the star falls asleep. */
	sleepAfter: 45_000,
	/** Each bit and how often it is picked (its weight). */
	bits: {
		blink: { w: 5, frames: [{ b: 'stand', f: 'blink', t: 110 }] },
		doubleBlink: {
			w: 2,
			frames: [
				{ b: 'stand', f: 'blink', t: 90 },
				{ b: 'stand', t: 110 },
				{ b: 'stand', f: 'blink', t: 90 },
			],
		},
		lookAround: {
			w: 3,
			frames: [
				{ b: 'stand', f: 'lookL', t: 700 },
				{ b: 'stand', t: 150 },
				{ b: 'stand', f: 'lookR', t: 700 },
			],
		},
		smile: { w: 2, frames: [{ b: 'stand', f: 'happy', t: 1100 }] },
		footTap: {
			w: 2,
			frames: [
				{ b: 'stand', f: 'lookR', t: 200 },
				...rep(4, [
					{ b: 'toeUp', f: 'lookR', t: 150 },
					{ b: 'stand', f: 'lookR', t: 150 },
				]),
			],
		},
		hum: {
			w: 2,
			frames: rep(2, [
				{ b: 'skid', f: 'squint', x: -1, t: 380 },
				{ b: 'stand', f: 'squint', t: 200 },
				{ b: 'swayR', f: 'squint', x: 1, t: 380 },
				{ b: 'stand', f: 'squint', t: 200 },
			]),
		},
		bounce: {
			w: 1,
			frames: rep(2, [
				{ b: 'crouch', f: 'happy', t: 100 },
				{ b: 'stand', f: 'happy', y: -1, t: 90 },
				{ b: 'stand', f: 'happy', y: -2, t: 110 },
				{ b: 'stand', f: 'happy', y: -1, t: 80 },
			]),
		},
		stretch: {
			w: 1,
			frames: [
				{ b: 'reach', f: 'squint', t: 400 },
				{ b: 'cheer', f: 'yawn', y: -1, t: 900 },
				{ b: 'reach', f: 'squint', t: 250 },
				{ b: 'stand', f: 'blink', t: 150 },
			],
		},
	} satisfies Record<string, { w: number; frames: Frame[] }>,
	/** Asleep: a slow breath with the eyes shut, and a Z that floats up. */
	sleep: [
		{ b: 'stand', f: 'sleep', t: 1700 },
		{ b: 'breathe', f: 'sleep', t: 1700 },
	] as const satisfies readonly Frame[],
	wake: [
		{ b: 'stand', f: 'oh', y: -1, t: 260 },
		{ b: 'stand', f: 'blink', t: 110 },
		{ b: 'stand', t: 120 },
		{ b: 'stand', f: 'blink', t: 110 },
	] as const satisfies readonly Frame[],
};

export type IdleBit = keyof typeof IDLE.bits;

/** A random pick, weighted. `roll` is from 0 to 1 (Math.random), so a test can fix it. */
export function pickIdleBit(roll: number): IdleBit {
	const entries = Object.entries(IDLE.bits) as [IdleBit, { w: number }][];
	const total = entries.reduce((n, [, b]) => n + b.w, 0);
	let at = roll * total;
	for (const [name, b] of entries) {
		at -= b.w;
		if (at < 0) return name;
	}
	return entries[entries.length - 1][0];
}

/** A random pick from `list` that is not `last`, when there is another choice. */
export function pickOther<T>(list: readonly T[], last: T | undefined, roll: number): T {
	const pool = list.length > 1 ? list.filter((x) => x !== last) : list;
	return pool[Math.min(pool.length - 1, Math.floor(roll * pool.length))];
}

/** A Z that floats up while the star sleeps: 4×4. */
export const Z_FRAME: readonly string[] = ['XXXX', '..X.', '.X..', 'XXXX'];
export const Z_COLOR = 'oklch(0.85 0.03 250)';

/** A puff of dust: three 6×3 frames, 80 ms each. `X` takes the dust colour. */
export const DUST_FRAMES: readonly (readonly string[])[] = [
	['......', '..XX..', '.XXXX.'],
	['..X...', '.X..X.', 'X.XX.X'],
	['.X..X.', '......', 'X....X'],
];

export const DUST_COLOR = 'oklch(0.72 0.03 80)';

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
