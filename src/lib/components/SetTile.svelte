<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { ActiveSet } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';

	type Props = {
		set: ActiveSet;
		onTap: () => void;
	};

	let { set, onTap }: Props = $props();

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
			aria-hidden="true">+</span
		>
		<span
			class="set-tile__set-num"
			aria-hidden="true">Set {set.setNumber}</span
		>
	{/if}
</button>

<style>
	@keyframes tile-pop {
		0% {
			transform: scale(0.93);
		}
		55% {
			transform: scale(1.06);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes flash {
		0% {
			opacity: 0.35;
		}
		100% {
			opacity: 0;
		}
	}

	.set-tile {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1px;
		flex: 1;
		min-inline-size: 60px;
		block-size: var(--tile-h);
		border-radius: var(--r-tile);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		transition:
			background-color var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out),
			color var(--duration-normal) var(--ease-out);
		touch-action: manipulation;
		user-select: none;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: white;
			opacity: 0;
			pointer-events: none;
		}

		&:not(:disabled):hover {
			border-color: var(--color-border-strong);
		}

		&:not(:disabled):active {
			transform: scale(0.95);
		}
	}

	.set-tile--animating {
		animation: tile-pop var(--duration-normal) var(--ease-spring) forwards;

		&::after {
			animation: flash 280ms var(--ease-out) forwards;
		}
	}

	.set-tile--completed {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
		cursor: pointer;
	}

	.set-tile__plus {
		font-size: 1.125rem;
		font-weight: 300;
		color: var(--color-text-muted);
		line-height: 1;
	}

	.set-tile__set-num {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		line-height: 1;

		.set-tile--completed & {
			color: var(--color-accent-ink);
			opacity: 0.6;
		}
	}

	.set-tile__logged-weight {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1;
		color: var(--color-accent-ink);
	}

	.set-tile__unit {
		font-size: 0.5625rem;
		margin-inline-start: 1px;
	}

	.set-tile__logged-reps {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--color-accent-ink);
		opacity: 0.75;
		line-height: 1;
	}
</style>
