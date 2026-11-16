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
		IDLE,
		SPARKLE_COLORS,
		SPARKLE_FRAMES,
		STANDING,
		TALK_FRAMES,
		VIEWBOX,
		framePixels,
		PALETTE,
		type ActionName,
		type Frame,
	} from '$lib/mascot/sprite';

	type Props = {
		/** Screen pixels per star pixel. Whole numbers keep the pixels square and sharp. */
		scale?: number;
		/** Breathe, blink and look around while nothing else plays. */
		idle?: boolean;
	};

	let { scale = 3, idle = false }: Props = $props();

	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

	let frame = $state<Frame>(STANDING);
	let busy = $state(false);
	let pixels = $derived(framePixels(frame));

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

	/** Each play or talk takes a new run; a newer run makes an older one stop. */
	let run = 0;

	/** Play one action from start to end, then stand. Resolves at once under reduced motion. */
	export async function play(name: ActionName): Promise<void> {
		if (reducedMotion.current) return;
		const mine = ++run;
		busy = true;
		for (const f of ACTIONS[name]) {
			if (stopped || mine !== run) return;
			frame = f;
			if (f.spark) burst();
			await wait(f.t);
		}
		if (mine !== run) return;
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

	// Idle (US-064 3): two breathing frames, 700 ms each, and at random times 1.8–4.6 s
	// apart a blink (110 ms) or a look left or right (900 ms).
	$effect(() => {
		if (!idle || reducedMotion.current || busy) return;
		let alive = true;
		let breath = 0;
		let face: Frame['f'] = 'open';
		let breathTimer: ReturnType<typeof setTimeout>;
		let eventTimer: ReturnType<typeof setTimeout>;

		const show = () => {
			const body = IDLE.breathe[breath % 2];
			frame = { ...body, f: face };
		};
		const breathe = () => {
			if (!alive) return;
			breath++;
			show();
			breathTimer = setTimeout(breathe, IDLE.breathe[breath % 2].t);
		};
		const nextEvent = () => {
			const gap = IDLE.minGap + Math.random() * (IDLE.maxGap - IDLE.minGap);
			eventTimer = setTimeout(() => {
				if (!alive) return;
				const roll = Math.random();
				const e = roll < 0.5 ? IDLE.blink : roll < 0.75 ? IDLE.lookL : IDLE.lookR;
				face = e.f;
				show();
				eventTimer = setTimeout(() => {
					face = 'open';
					show();
					nextEvent();
				}, e.t);
			}, gap);
		};

		show();
		breathTimer = setTimeout(breathe, IDLE.breathe[0].t);
		nextEvent();
		return () => {
			alive = false;
			clearTimeout(breathTimer);
			clearTimeout(eventTimer);
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
		<g transform="translate({frame.x ?? 0} {frame.y ?? 0})">
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
