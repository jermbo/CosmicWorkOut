<!--
	A habit reaches its daily goal (US-068 3): the star comes in along the top of the bottom
	bar, does a happy hop, and leaves. The way in and the way out are picked at random each
	time, never the same as last time; each side has its own ways in (decision 23). It moves only
	by drawn frames and whole pixels of its grid, behind a clip. It takes no taps, and it
	runs in from the side away from the last tap, so it never covers the habit being logged.
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { tick, untrack } from 'svelte';
	import { mascotStore } from '#lib/stores/mascot.svelte';
	import Mascot from './Mascot.svelte';
	import {
		EXITS,
		dropIn,
		pickOther,
		runOff,
		type EntranceName,
		type ExitName,
	} from '#lib/mascot/sprite';

	const SCALE = 3;

	/** From the left it is playful; from the right it is sneaky and fast. */
	const WAYS_IN: Record<'left' | 'right', readonly EntranceName[]> = {
		left: ['runIn', 'hopIn', 'dropIn'],
		right: ['peekIn', 'dashIn', 'dropIn'],
	};
	let lastIn: EntranceName | undefined;
	let lastOut: ExitName | undefined;

	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

	let visible = $state(false);
	let side = $state<'left' | 'right'>('right');
	let mascot: ReturnType<typeof Mascot> | undefined = $state();
	let lastTapX = 0;
	let playing = false;

	async function celebrate(): Promise<void> {
		if (playing || reducedMotion.current) return;
		playing = true;
		side = lastTapX > window.innerWidth / 2 ? 'left' : 'right';
		const wayIn = pickOther(WAYS_IN[side], lastIn, Math.random());
		const wayOut = pickOther(EXITS, lastOut, Math.random());
		lastIn = wayIn;
		lastOut = wayOut;
		visible = true;
		await tick();
		// Sized to the screen: a drop from above its top, a run off past the far edge.
		const screen = { w: window.innerWidth / SCALE, h: window.innerHeight / SCALE };
		await mascot?.play(wayIn, wayIn === 'dropIn' ? dropIn(-Math.ceil(screen.h)) : undefined);
		await mascot?.play('hop');
		await mascot?.play(wayOut, wayOut === 'runOff' ? runOff(Math.ceil(screen.w) + 10) : undefined);
		visible = false;
		playing = false;
	}

	$effect(() => {
		if (mascotStore.peeks === 0) return;
		untrack(() => void celebrate());
	});
</script>

<svelte:document onpointerdown={(e) => (lastTapX = e.clientX)} />

{#if visible}
	<div
		class="mascot-peek"
		aria-hidden="true"
	>
		<div class="mascot-peek__star mascot-peek__star--{side}">
			<!-- From the right, it runs to the left: the drawing faces right, so mirror it. -->
			<Mascot
				bind:this={mascot}
				scale={SCALE}
				flip={side === 'right'}
				offstage
			/>
		</div>
	</div>
{/if}

<style>
	/*
	 * A clip box across the screen, its floor on the top of the bottom bar. It clips the
	 * sides and the floor only: the star runs in past an edge and falls through the floor,
	 * but it can drop from the sky and blast off upward.
	 */
	.mascot-peek {
		position: fixed;
		inset-inline: 0;
		inset-block-end: calc(var(--nav-height) + var(--safe-bottom));
		z-index: 40;
		clip-path: inset(-100vh 0 0 0);
		pointer-events: none;
		block-size: calc(var(--space-6) * 2 + 21 * 3px);
	}

	.mascot-peek__star {
		position: absolute;
		inset-block-end: 0;
		display: flex;
	}

	.mascot-peek__star--left {
		left: var(--space-3);
	}

	.mascot-peek__star--right {
		right: var(--space-3);
	}

	/* With the side nav, there is no bottom bar; the floor is the screen's edge. */
	@container app (inline-size >= 720px) {
		.mascot-peek {
			inset-block-end: var(--safe-bottom);
		}
	}
</style>
