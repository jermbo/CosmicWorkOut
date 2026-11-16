<!--
	Settings › Personalization › Mascot gallery: every action of the star, each on a loop,
	drawn by the same component and frames that the app uses (src/lib/mascot/sprite.ts).
	Under reduced motion every star stands still.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { ENTRANCES, type ActionName } from '#lib/mascot/sprite';
	import Mascot from '#lib/components/Mascot.svelte';
	import SettingsSubHeader from '#lib/components/SettingsSubHeader.svelte';

	type Card = {
		id: ActionName | 'idle' | 'talk';
		name: string;
		when: string;
	};

	const CARDS: Card[] = [
		{ id: 'idle', name: 'Idle', when: 'Always, in the Overview header; asleep after 45 s' },
		{ id: 'wave', name: 'Wave', when: 'The first open of the day' },
		{ id: 'talk', name: 'Talk', when: 'A tap on a streak badge' },
		{ id: 'shrug', name: 'Shrug', when: 'A badge at 0' },
		{ id: 'hop', name: 'Happy hop', when: 'A habit reaches its daily goal' },
		{ id: 'dance', name: 'Dance', when: 'A session is done' },
		{ id: 'runIn', name: 'Run in', when: 'A way in, from the left' },
		{ id: 'hopIn', name: 'Hop in', when: 'A way in, from the left' },
		{ id: 'peekIn', name: 'Peek in', when: 'A way in, from the right' },
		{ id: 'dashIn', name: 'Dash in', when: 'A way in, from the right' },
		{ id: 'dropIn', name: 'Drop in', when: 'A way in, from either side' },
		{ id: 'jumpOff', name: 'Jump off', when: 'A way out, after the hop' },
		{ id: 'runOff', name: 'Run off', when: 'A way out, after the hop' },
		{ id: 'runBack', name: 'Run back', when: 'A way out, after the hop' },
		{ id: 'rocketUp', name: 'Blast off', when: 'A way out, after the hop' },
		{ id: 'waveBye', name: 'Wave bye', when: 'A way out, after the hop' },
	];

	/** The pause between two loops of an action. */
	const GAP_MS = 900;
	const TALK_MS = 1600;

	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');
	const stars: Partial<Record<Card['id'], ReturnType<typeof Mascot>>> = $state({});
	let alive = true;

	const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

	async function playOnce(id: Card['id']): Promise<void> {
		const star = stars[id];
		if (!star || id === 'idle') return;
		if (id === 'talk') {
			const stop = star.talk();
			await wait(TALK_MS);
			stop();
			await wait(400);
			return;
		}
		await star.play(id);
	}

	async function loop(id: Card['id']): Promise<void> {
		while (alive && !reducedMotion.current) {
			await playOnce(id);
			await wait(GAP_MS);
		}
	}

	// One loop for each card, started once the stars are bound.
	onMount(() => {
		for (const card of CARDS) if (card.id !== 'idle') void loop(card.id);
		return () => {
			alive = false;
		};
	});
</script>

<svelte:head>
	<title>Mascot gallery — Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader
		title="Mascot gallery"
		backHref="/settings/personalization"
		backLabel="Personalization"
	/>

	<p class="gallery-intro">
		Every move of the star, on a loop. Each one is drawn frame by frame.
		{#if reducedMotion.current}
			Your device asks for reduced motion, so the stars stand still.
		{/if}
	</p>

	<ul class="gallery">
		{#each CARDS as card (card.id)}
			<li class="gallery__card">
				<div class="gallery__stage">
					<Mascot
						bind:this={stars[card.id]}
						scale={5}
						idle={card.id === 'idle'}
						offstage={(ENTRANCES as readonly string[]).includes(card.id)}
					/>
				</div>
				<p class="gallery__name">{card.name}</p>
				<p class="gallery__when">{card.when}</p>
			</li>
		{/each}
	</ul>
</div>

<style>
	.gallery-intro {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-4);
	}

	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-3);
		list-style: none;
	}

	.gallery__card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-4) var(--space-3);
		background: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
		text-align: center;
	}

	/* Room above the star for its jumps. A run in starts, and a jump off ends, past its clip. */
	.gallery__stage {
		align-self: stretch;
		overflow: clip;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-block-start: calc(var(--space-6) * 1.5);
	}

	.gallery__name {
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		font-size: 0.875rem;
	}

	.gallery__when {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
</style>
