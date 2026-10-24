<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic href props use resolveHref() */
	import { resolveHref } from '$lib/navigation';
	import type { Snippet } from 'svelte';

	/** Domain hue for the card's color field (v1.12.0). */
	type Field = 'train' | 'habit' | 'base' | 'health' | 'active';

	type Props = {
		href: string;
		title: string;
		/** One-letter index code shown as `[X]` before the title. */
		code: string;
		ariaLabel: string;
		field: Field;
		badge?: 'live' | 'done' | null;
		children: Snippet;
	};

	let { href, title, code, ariaLabel, field, badge = null, children }: Props = $props();
</script>

<a
	href={resolveHref(href)}
	class="home-card"
	style:--field="var(--field-{field})"
	aria-label={ariaLabel}
>
	<div class="home-card__header">
		<h2 class="home-card__title">[{code}] {title}</h2>
		{#if badge}
			<span class="home-card__badge home-card__badge--{badge}">
				{#if badge === 'live'}Live{:else}Done{/if}
			</span>
		{/if}
	</div>
	{@render children()}
</a>

<style>
	/* A color field: domain hue, ink on top, hard shadow that sinks on press. */
	.home-card {
		display: block;
		padding: var(--space-3);
		background: var(--field);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
		text-decoration: none;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;
		-webkit-tap-highlight-color: transparent;
	}

	.home-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		margin-block-end: var(--space-2);
	}

	/* Index code label: `[H] HABITS`. */
	.home-card__title {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.home-card__badge {
		padding: 2px var(--space-2);
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		background: var(--color-ink);
		color: var(--field);
	}

	.home-card__badge--live {
		animation: pulse 1.5s steps(2, jump-none) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}
</style>
