<!--
	A habit reaches its daily goal (US-068 3): the star peeks up above the bottom bar, does
	a happy hop, and drops away. It moves only by drawn frames and whole pixels of its
	grid: the peek and the drop are steps of its own pixels behind a clip, not a slide.
	It takes no taps, and it comes up on the side away from the last tap, so it never
	covers the habit being logged.
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { untrack } from 'svelte';
	import { mascotStore } from '$lib/stores/mascot.svelte';
	import Mascot from './Mascot.svelte';

	const SCALE = 3;
	/** Star pixels the star rises by, one per step. */
	const RISE = 14;
	const STEP_MS = 30;

	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

	let visible = $state(false);
	let side = $state<'start' | 'end'>('end');
	/** How many star pixels of the star are below the clip line. */
	let sunk = $state(RISE);
	let mascot: ReturnType<typeof Mascot> | undefined = $state();
	let lastTapX = 0;
	let playing = false;

	const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

	async function peek(): Promise<void> {
		if (playing || reducedMotion.current) return;
		playing = true;
		side = lastTapX > window.innerWidth / 2 ? 'start' : 'end';
		sunk = RISE;
		visible = true;
		for (let i = RISE; i >= 0; i--) {
			sunk = i;
			await wait(STEP_MS);
		}
		await mascot?.play('hop');
		for (let i = 0; i <= RISE; i++) {
			sunk = i;
			await wait(STEP_MS);
		}
		visible = false;
		playing = false;
	}

	$effect(() => {
		if (mascotStore.peeks === 0) return;
		untrack(() => void peek());
	});
</script>

<svelte:document onpointerdown={(e) => (lastTapX = e.clientX)} />

{#if visible}
	<div
		class="mascot-peek mascot-peek--{side}"
		aria-hidden="true"
	>
		<div
			class="mascot-peek__star"
			style:--sunk="{sunk * SCALE}px"
		>
			<Mascot
				bind:this={mascot}
				scale={SCALE}
			/>
		</div>
	</div>
{/if}

<style>
	/* A clip box sitting on the bottom bar; the star rises out of it. */
	.mascot-peek {
		position: fixed;
		inset-block-end: calc(var(--nav-height) + var(--safe-bottom));
		z-index: 40;
		overflow: hidden;
		pointer-events: none;
		padding-block-start: calc(var(--space-6) * 2);
	}

	.mascot-peek--start {
		inset-inline-start: var(--space-3);
	}

	.mascot-peek--end {
		inset-inline-end: var(--space-3);
	}

	/* Whole star pixels only: --sunk is a count of its pixels times the scale. */
	.mascot-peek__star {
		display: flex;
		translate: 0 var(--sunk);
	}

	/* With the side nav, there is no bottom bar; the star comes up from the screen's edge. */
	@container app (inline-size >= 720px) {
		.mascot-peek {
			inset-block-end: var(--safe-bottom);
		}
	}
</style>
