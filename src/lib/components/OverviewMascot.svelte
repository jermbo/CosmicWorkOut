<!--
	The Overview header's Mascot (US-064, US-066, US-067) and streak badges (US-065).
	Rendered straight into PageHeader's grid (its `aside`), so the star sits beside the
	title and the badges take their own row. Nothing here covers or blocks the screen:
	the speech box ignores taps, and any tap closes it.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { todayIso } from '#lib/date';
	import { prefsStore } from '#lib/stores/prefs.svelte';
	import { streakStore, type TrackerStreak } from '#lib/stores/streaks.svelte';
	import { shouldWelcome, streakLine, welcomeLine } from '#lib/mascot/lines';
	import Mascot from './Mascot.svelte';
	import StreakBadge from './StreakBadge.svelte';

	/** The date of the last welcome, on this device only (US-067 1e). */
	const WELCOME_KEY = 'cwout:lastWelcome';
	const TYPE_MS = 30;
	const SHOW_MS = 2600;

	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

	let mascot: ReturnType<typeof Mascot> | undefined = $state();
	let line = $state('');
	let shown = $state('');
	let lineId = 0;
	let stopTalk: (() => void) | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;
	let typeTimer: ReturnType<typeof setInterval> | undefined;

	function clearTimers(): void {
		clearTimeout(hideTimer);
		clearInterval(typeTimer);
	}

	function hide(): void {
		clearTimers();
		stopTalk?.();
		stopTalk = null;
		line = '';
		shown = '';
	}

	/**
	 * Say one line, typed in letter by letter, while the star talks (or does `action`
	 * instead). It goes 2.6 s after it is fully shown, or at the next tap (US-066 1).
	 */
	function say(text: string, action: 'talk' | 'shrug' | 'wave' = 'talk'): void {
		hide();
		const id = ++lineId;
		line = text;
		const done = () => {
			stopTalk?.();
			stopTalk = null;
			hideTimer = setTimeout(() => {
				if (id === lineId) hide();
			}, SHOW_MS);
		};

		if (reducedMotion.current) {
			shown = text;
			done();
			return;
		}
		if (action === 'talk') stopTalk = mascot?.talk() ?? null;
		else void mascot?.play(action);

		let i = 0;
		typeTimer = setInterval(() => {
			if (id !== lineId) return;
			shown = text.slice(0, ++i);
			if (i >= text.length) {
				clearInterval(typeTimer);
				done();
			}
		}, TYPE_MS);
	}

	function onBadge(streak: TrackerStreak): void {
		say(streakLine(streak), streak.count === 0 ? 'shrug' : 'talk');
	}

	/** Any tap that is not on a badge closes the line (US-066 1d). */
	function onDocumentPointerDown(e: PointerEvent): void {
		if (!line) return;
		if ((e.target as Element | null)?.closest?.('[data-streak-badge]')) return;
		hide();
	}

	onMount(() => {
		// The daily welcome (US-067): first open of the day, Mascot motion on.
		const today = todayIso();
		let last: string | null = null;
		try {
			last = localStorage.getItem(WELCOME_KEY);
		} catch {
			/* storage blocked: welcome anyway */
		}
		if (prefsStore.mascotMotion && shouldWelcome(last, today)) {
			try {
				localStorage.setItem(WELCOME_KEY, today);
			} catch {
				/* ignore */
			}
			say(welcomeLine(streakStore.longest), 'wave');
		}

		// Keep "today" in the counts right when the app stays open past midnight.
		streakStore.refreshToday();
		const refresh = () => {
			if (document.visibilityState === 'visible') streakStore.refreshToday();
		};
		document.addEventListener('visibilitychange', refresh);
		return () => {
			document.removeEventListener('visibilitychange', refresh);
			clearTimers();
			lineId++;
		};
	});
</script>

<svelte:document onpointerdown={onDocumentPointerDown} />

<div class="ov-star">
	{#if line}
		<p
			class="ov-star__speech"
			aria-live="polite"
		>
			<span class="ov-star__ghost">{line}</span>
			<span class="ov-star__typed">{shown}</span>
		</p>
	{/if}
	<Mascot
		bind:this={mascot}
		scale={3}
		idle
	/>
</div>

{#if streakStore.visible.length > 0}
	<ul
		class="ov-badges"
		aria-label="Streaks"
	>
		{#each streakStore.visible as streak (streak.tracker)}
			<li>
				<StreakBadge
					{streak}
					onclick={() => onBadge(streak)}
				/>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.ov-star {
		position: relative;
		grid-column: 2;
		grid-row: 1 / span 2;
		align-self: end;
		justify-self: end;
		display: flex;
	}

	/* The speech box sits to the left of the star, over the title. Taps go through it. */
	.ov-star__speech {
		position: absolute;
		inset-inline-end: calc(100% + var(--space-1));
		inset-block-start: var(--space-1);
		z-index: 2;
		inline-size: max-content;
		max-inline-size: min(15rem, 62cqi);
		padding: var(--space-2) var(--space-3);
		background: var(--color-paper);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1.35;
		pointer-events: none;
		display: grid;

		/* The tail, pointing at the star. */
		&::after {
			content: '';
			position: absolute;
			inset-inline-end: -9px;
			inset-block-start: 10px;
			inline-size: 9px;
			block-size: 9px;
			background: var(--color-paper);
			clip-path: polygon(0 0, 100% 50%, 0 100%);
		}
	}

	/* The full line holds the box's size, so it does not grow as the letters type in. */
	.ov-star__ghost,
	.ov-star__typed {
		grid-area: 1 / 1;
	}

	.ov-star__ghost {
		visibility: hidden;
	}

	.ov-badges {
		grid-column: 1 / -1;
		grid-row: 3;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-3);
		list-style: none;
	}
</style>
