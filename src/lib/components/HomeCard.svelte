<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic href props use resolveHref() */
	import { resolveHref } from '$lib/navigation';
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type CardVariant = 'habits' | 'workout' | 'dance' | 'log';

	type Props = {
		href: string;
		title: string;
		ariaLabel: string;
		variant?: CardVariant;
		done?: boolean;
		active?: boolean;
		badge?: 'live' | 'done' | null;
		children: Snippet;
	};

	let {
		href,
		title,
		ariaLabel,
		variant,
		done = false,
		active = false,
		badge = null,
		children,
	}: Props = $props();
</script>

<a
	href={resolveHref(href)}
	class="home-card"
	class:home-card--habits={variant === 'habits'}
	class:home-card--workout={variant === 'workout'}
	class:home-card--dance={variant === 'dance'}
	class:home-card--log={variant === 'log'}
	class:home-card--done={done}
	class:home-card--active={active}
	aria-label={ariaLabel}
>
	<div class="home-card__header">
		<h2 class="home-card__title">{title}</h2>
		{#if badge}
			<div class="home-card__badges">
				<span class="home-card__badge home-card__badge--{badge}">
					{#if badge === 'live'}Live{:else}Done{/if}
				</span>
				<Icon
					name="chevron-right"
					size={18}
				/>
			</div>
		{:else}
			<Icon
				name="chevron-right"
				size={18}
			/>
		{/if}
	</div>
	{@render children()}
</a>

<style>
	.home-card {
		display: block;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-4) var(--space-5);
		text-decoration: none;
		color: inherit;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.home-card--done {
		border-color: color-mix(in srgb, var(--color-accent) 35%, transparent);
		background: color-mix(in srgb, var(--color-accent) 4%, var(--color-surface-2));
	}

	.home-card--dance.home-card--done {
		border-color: color-mix(in srgb, var(--color-lavender) 35%, transparent);
		background: color-mix(in srgb, var(--color-lavender) 4%, var(--color-surface-2));
	}

	.home-card--dance:hover {
		border-color: var(--color-lavender);
	}

	.home-card--dance .home-card__badge--done {
		background: color-mix(in srgb, var(--color-lavender) 15%, transparent);
		color: var(--color-lavender);
	}

	.home-card--active {
		border-color: color-mix(in srgb, var(--color-accent) 60%, transparent);
		background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-2));
	}

	.home-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-3);
	}

	.home-card__title {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.home-card__header :global(.icon) {
		color: var(--color-text-muted);
	}

	.home-card__badges {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.home-card__badge {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border-radius: var(--radius-full);
		padding-inline: var(--space-2);
		padding-block: 2px;
	}

	.home-card__badge--done {
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
	}

	.home-card__badge--live {
		background: color-mix(in srgb, #ef4444 15%, transparent);
		color: #ef4444;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}
</style>
