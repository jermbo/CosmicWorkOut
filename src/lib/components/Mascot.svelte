<!--
	The Mascot (US-064): the pixel star, drawn frame by frame from src/lib/mascot/sprite.ts.
	It moves only by changing drawn frames and by whole pixels of its own grid — never by
	a CSS rotate, scale or tween (decision 13). Under reduced motion it shows its still
	standing frame and every action resolves at once.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import {
		ACTIONS,
		BODY_W,
		DUST_COLOR,
		DUST_FRAMES,
		EXITS,
		IDLE,
		SPARKLE_COLORS,
		SPARKLE_FRAMES,
		STANDING,
		TALK_FRAMES,
		VIEWBOX,
		Z_COLOR,
		Z_FRAME,
		framePixels,
		pickIdleBit,
		PALETTE,
		type ActionName,
		type Frame,
	} from '$lib/mascot/sprite';

	type Props = {
		/** Screen pixels per star pixel. Whole numbers keep the pixels square and sharp. */
		scale?: number;
		/** Breathe and show a little personality while nothing else plays; sleep when left alone. */
		idle?: boolean;
		/** Face left: the frames are drawn facing right, and every move is mirrored. */
		flip?: boolean;
		/** Out of sight until an action plays, for a star that will run in. */
		offstage?: boolean;
	};

	let { scale = 3, idle = false, flip = false, offstage = false }: Props = $props();

	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

	let frame = $state<Frame>(STANDING);
	let busy = $state(false);
	let pixels = $derived(framePixels(frame, flip !== (frame.turn ?? false)));
	/** Left after an exit, and before the first action of an offstage star. */
	// svelte-ignore state_referenced_locally
	let away = $state(offstage);
	let shown = $derived(!away || reducedMotion.current);
	/** The frame's offset in whole star pixels; mirrored along with the drawing. */
	let dx = $derived(flip ? -(frame.x ?? 0) : (frame.x ?? 0));

	type Dust = { id: number; x: number; y: number; step: number };
	let dust = $state<Dust[]>([]);
	/** The Zs that float up while it sleeps. */
	let zs = $state<Dust[]>([]);

	type Sparkle = { id: number; x: number; y: number; color: string; step: number };
	let sparkles = $state<Sparkle[]>([]);
	let sparkleId = 0;

	// Bookkeeping for cleanup only; nothing renders from it.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const timers = new Set<ReturnType<typeof setTimeout>>();
	let stopped = false;

	function wait(ms: number): Promise<void> {
		return new Promise((resolve) => {
			const t = setTimeout(() => {
				timers.delete(t);
				resolve();
			}, ms);
			timers.add(t);
		});
	}

	onDestroy(() => {
		stopped = true;
		for (const t of timers) clearTimeout(t);
		timers.clear();
	});

	/** Three sparkles at random spots around the star, five frames each. */
	function burst(): void {
		for (let k = 0; k < 3; k++) {
			void (async () => {
				await wait(k * 80);
				const s: Sparkle = {
					id: ++sparkleId,
					x: Math.round(Math.random() * (VIEWBOX.w - 5)),
					y: Math.round(Math.random() * (VIEWBOX.h * 0.6)),
					color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
					step: 0,
				};
				sparkles = [...sparkles, s];
				for (let i = 1; i < SPARKLE_FRAMES.length && !stopped; i++) {
					await wait(80);
					sparkles = sparkles.map((p) => (p.id === s.id ? { ...p, step: i } : p));
				}
				await wait(80);
				sparkles = sparkles.filter((p) => p.id !== s.id);
			})();
		}
	}

	/** A star-grid x, mirrored when the star faces left. */
	const mx = (x: number, w: number) => (flip ? BODY_W - 1 - (x + w - 1) : x);

	/**
	 * A puff of dust behind the feet (or on both sides), where the frame is. It stays where
	 * it was kicked up while the star moves on.
	 */
	function kick(f: Frame): void {
		const w = DUST_FRAMES[0][0].length;
		const fx = f.x ?? 0;
		const left = fx - 4;
		const right = fx + BODY_W - 2;
		const spots = f.dust === 'both' ? [left, right] : [f.turn ? right : left];
		for (const spot of spots) {
			const d: Dust = { id: ++sparkleId, x: mx(spot, w), y: 11, step: 0 };
			dust = [...dust, d];
			void (async () => {
				for (let i = 1; i < DUST_FRAMES.length && !stopped; i++) {
					await wait(80);
					dust = dust.map((p) => (p.id === d.id ? { ...p, step: i } : p));
				}
				await wait(80);
				dust = dust.filter((p) => p.id !== d.id);
			})();
		}
	}

	/** A Z that floats up and away from the top right of the head while it sleeps. */
	function floatZ(): void {
		const z: Dust = { id: ++sparkleId, x: mx(12, Z_FRAME[0].length), y: -2, step: 0 };
		zs = [...zs, z];
		void (async () => {
			for (let i = 1; i < 6 && !stopped; i++) {
				await wait(280);
				zs = zs.map((p) => (p.id === z.id ? { ...p, step: i } : p));
			}
			await wait(280);
			zs = zs.filter((p) => p.id !== z.id);
		})();
	}

	/** Each play or talk takes a new run; a newer run makes an older one stop. */
	let run = 0;

	/**
	 * Play one action from start to end, then stand; after an exit, the star stays out of
	 * sight. `frames` replaces the stock frames, for a move sized to the screen. Resolves at
	 * once under reduced motion.
	 */
	export async function play(
		name: ActionName,
		frames: readonly Frame[] = ACTIONS[name],
	): Promise<void> {
		if (reducedMotion.current) return;
		const mine = ++run;
		busy = true;
		away = false;
		for (const f of frames) {
			if (stopped || mine !== run) return;
			frame = f;
			if (f.spark) burst();
			if (f.dust) kick(f);
			await wait(f.t);
		}
		if (mine !== run) return;
		if ((EXITS as readonly string[]).includes(name)) away = true;
		frame = STANDING;
		busy = false;
	}

	/**
	 * Open and close the mouth until the returned function is called (US-066 2a), then
	 * smile and stand. A still star under reduced motion.
	 */
	export function talk(): () => void {
		if (reducedMotion.current) return () => {};
		const mine = ++run;
		busy = true;
		void (async () => {
			let i = 0;
			while (mine === run && !stopped) {
				const f = TALK_FRAMES[i++ % TALK_FRAMES.length];
				frame = f;
				await wait(f.t);
			}
		})();
		return () => {
			if (mine !== run) return;
			const done = ++run;
			frame = { b: 'stand', f: 'happy', t: 0 };
			void wait(400).then(() => {
				if (done !== run) return;
				frame = STANDING;
				busy = false;
			});
		};
	}

	// Idle (US-064 3): a slow, uneven breath; every 3 to 7 s a bit of personality, picked
	// at random by weight (a blink, a look around, a foot tap, a hum, a stretch…). With no
	// tap anywhere for 45 s it falls asleep, with Zs; the next tap wakes it.
	$effect(() => {
		if (!idle || reducedMotion.current || busy) return;
		let alive = true;
		let asleep = false;
		let lastTap = performance.now();
		let timer: ReturnType<typeof setTimeout> | undefined;
		let cut: (() => void) | undefined;

		const pause = (ms: number) =>
			new Promise<void>((resolve) => {
				cut = resolve;
				timer = setTimeout(resolve, ms);
			});
		const onTap = () => {
			lastTap = performance.now();
			if (!asleep) return;
			clearTimeout(timer);
			cut?.();
		};
		const show = (f: Frame) => {
			if (alive) frame = f;
		};
		const between = (a: number, b: number) => a + Math.random() * (b - a);
		const sleepy = () => performance.now() - lastTap > IDLE.sleepAfter;

		async function loop(): Promise<void> {
			while (alive) {
				if (sleepy()) {
					asleep = true;
					for (let i = 0; alive && sleepy(); i++) {
						const f = IDLE.sleep[i % 2];
						show(f);
						if (i % 2 === 0) floatZ();
						await pause(f.t);
					}
					asleep = false;
					for (const f of IDLE.wake) {
						show(f);
						await pause(f.t);
						if (!alive) return;
					}
					continue;
				}
				const until = performance.now() + between(IDLE.minGap, IDLE.maxGap);
				for (let i = 0; alive && performance.now() < until && !sleepy(); i++) {
					show(i % 2 === 0 ? STANDING : { b: 'breathe', t: 0 });
					await pause(between(IDLE.breathMin, IDLE.breathMax));
				}
				if (!alive || sleepy()) continue;
				for (const f of IDLE.bits[pickIdleBit(Math.random())].frames) {
					show(f);
					await pause(f.t);
					if (!alive) return;
				}
			}
		}

		window.addEventListener('pointerdown', onTap);
		window.addEventListener('keydown', onTap);
		void loop();
		return () => {
			alive = false;
			clearTimeout(timer);
			window.removeEventListener('pointerdown', onTap);
			window.removeEventListener('keydown', onTap);
			// A play or talk that stopped the idle has set its own frame already.
			if (!busy) frame = STANDING;
		};
	});
</script>

<span
	class="mascot"
	style:--w="{VIEWBOX.w * scale}px"
	style:--h="{VIEWBOX.h * scale}px"
	aria-hidden="true"
>
	<svg
		viewBox="{VIEWBOX.x} {VIEWBOX.y} {VIEWBOX.w} {VIEWBOX.h}"
		shape-rendering="crispEdges"
	>
		{#if shown}
			<g transform="translate({dx} {frame.y ?? 0})">
				{#each pixels as [x, y, c], i (i)}
					<rect
						{x}
						{y}
						width="1.02"
						height="1.02"
						fill={PALETTE[c]}
					/>
				{/each}
			</g>
		{/if}
		{#each zs as z (z.id)}
			{#each Z_FRAME as row, py (py)}
				{#each [...row] as ch, px (px)}
					{#if ch !== '.'}
						<rect
							x={z.x + px + (flip ? -1 : 1) * Math.floor(z.step / 2)}
							y={z.y + py - z.step * 2}
							width="1.02"
							height="1.02"
							fill={Z_COLOR}
							opacity={1 - z.step / 6}
						/>
					{/if}
				{/each}
			{/each}
		{/each}
		{#each dust as d (d.id)}
			{#each DUST_FRAMES[d.step] as row, py (py)}
				{#each [...(flip ? [...row].reverse() : row)] as ch, px (px)}
					{#if ch !== '.'}
						<rect
							x={d.x + px}
							y={d.y + py}
							width="1.02"
							height="1.02"
							fill={DUST_COLOR}
						/>
					{/if}
				{/each}
			{/each}
		{/each}
		{#each sparkles as s (s.id)}
			{#each SPARKLE_FRAMES[s.step] as row, sy (sy)}
				{#each [...row] as ch, sx (sx)}
					{#if ch !== '.'}
						<rect
							x={VIEWBOX.x + s.x + sx}
							y={VIEWBOX.y + s.y + sy}
							width="1.02"
							height="1.02"
							style:fill={ch === 'W' ? '#ffffff' : s.color}
						/>
					{/if}
				{/each}
			{/each}
		{/each}
	</svg>
</span>

<style>
	.mascot {
		display: inline-block;
		inline-size: var(--w);
		block-size: var(--h);
		flex: none;
		line-height: 0;

		svg {
			inline-size: 100%;
			block-size: 100%;
			overflow: visible;
		}
	}
</style>
