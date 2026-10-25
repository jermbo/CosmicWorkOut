<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { ActiveSet } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';

	type Props = {
		set: ActiveSet;
		/** The set to log next in the current exercise — marked NOW. */
		next?: boolean;
		onTap: () => void;
	};

	let { set, next = false, onTap }: Props = $props();

	let isAnimating = $state(false);
	let animTimer: ReturnType<typeof setTimeout> | undefined;

	onDestroy(() => clearTimeout(animTimer));

	function formatWeight(w: number | string): string {
		if (typeof w === 'string') {
			return w;
		}
		if (w <= 0) {
			return 'BW';
		}
		return `${w}`;
	}

	function buildAriaLabel(): string {
		const base = `Set ${set.setNumber}: target ${set.targetReps} reps`;
		if (set.completed) {
			const wStr = formatWeight(set.weight);
			return `${base} — logged ${wStr} × ${set.reps}`;
		}
		return base;
	}

	function handleTap() {
		if (isAnimating) {
			return;
		}
		if (!set.completed) {
			isAnimating = true;
			clearTimeout(animTimer);
			animTimer = setTimeout(() => {
				isAnimating = false;
			}, 400);
		}
		onTap();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleTap();
		}
	}
</script>

<button
	class="set-tile"
	class:set-tile--completed={set.completed}
	class:set-tile--next={next}
	class:set-tile--animating={isAnimating}
	onclick={handleTap}
	onkeydown={handleKeydown}
	aria-label={buildAriaLabel()}
>
	{#if set.completed}
		<span
			class="set-tile__set-num"
			aria-hidden="true">Set {set.setNumber}</span
		>
		<span
			class="set-tile__logged-weight"
			aria-hidden="true"
		>
			{#if typeof set.weight === 'number' && set.weight > 0}
				{set.weight}<span class="set-tile__unit">{prefsStore.weightUnit}</span>
			{:else if typeof set.weight === 'string'}
				{set.weight}
			{:else}
				BW
			{/if}
		</span>
		<span
			class="set-tile__logged-reps"
			aria-hidden="true">×{set.reps}</span
		>
	{:else}
		<span
			class="set-tile__plus"
			aria-hidden="true">{next ? 'Now' : '+'}</span
		>
		<span
			class="set-tile__set-num"
			aria-hidden="true">Set {set.setNumber}</span
		>
	{/if}
</button>

<style>
	/*
	 * Logged: a solid block (paper on the page, ink inside a color field).
	 * To do: dashed outline. Next: solid outline marked NOW.
	 */
	.set-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		flex: 1;
		min-inline-size: 60px;
		block-size: var(--tile-h);
		background: transparent;
		border: var(--rule-thin) dashed var(--color-text-muted);
		color: var(--color-text-primary);
		touch-action: manipulation;
		user-select: none;
		transition: transform var(--duration-press) linear;
	}

	.set-tile--next {
		border: var(--rule) solid var(--color-text-primary);
		outline: var(--rule-thin) solid transparent;
		animation: ready 1.6s ease-in-out infinite;
	}

	/* Logging stamps the block down: big, then a hard squash, then settle. */
	.set-tile--completed {
		background: var(--color-text-primary);
		border: var(--rule-thin) solid var(--color-text-primary);
		color: var(--field, var(--color-ink));
		cursor: pointer;
		animation: tile-stamp 320ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}

	@keyframes tile-stamp {
		0% {
			transform: scale(1.18) rotate(-2deg);
		}
		45% {
			transform: scale(0.92);
		}
		100% {
			transform: none;
		}
	}

	/* "Your turn" — a slow outline pulse on the thing to press next. */
	@keyframes ready {
		0%,
		100% {
			outline-color: transparent;
			outline-offset: 0;
		}
		50% {
			outline-color: var(--ready-color, currentColor);
			outline-offset: 4px;
		}
	}

	.set-tile__plus {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		text-transform: uppercase;
		line-height: 1;
	}

	.set-tile__set-num {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		line-height: 1;

		.set-tile--completed & {
			color: inherit;
			opacity: 0.7;
		}
	}

	.set-tile__logged-weight {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.set-tile__unit {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		font-weight: 700;
		margin-inline-start: 1px;
		text-transform: uppercase;
	}

	.set-tile__logged-reps {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		line-height: 1;
	}
</style>
