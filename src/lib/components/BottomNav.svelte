<script lang="ts">
	import { resolve } from '$app/paths';
	import { prefsStore } from '$lib/stores/prefs.svelte';

	let { pathname }: { pathname: string } = $props();

	const ALL_NAV_ITEMS = [
		{ href: '/', label: 'Overview', exact: true },
		{ href: '/practice', label: 'Practice', exact: false },
		{ href: '/insights', label: 'Insights', exact: false },
		{ href: '/settings', label: 'Settings', exact: false },
	] as const;

	let navItems = $derived(
		ALL_NAV_ITEMS.filter((item) => item.href !== '/practice' || prefsStore.practiceEnabled),
	);

	function isActive(item: (typeof ALL_NAV_ITEMS)[number]): boolean {
		if (item.href === '/practice') {
			return pathname.startsWith('/practice') || pathname.startsWith('/workout');
		}
		if (item.exact) {
			return pathname === item.href;
		}
		return pathname.startsWith(item.href);
	}

	function ariaCurrentFor(item: (typeof ALL_NAV_ITEMS)[number]): 'page' | undefined {
		if (isActive(item)) return 'page';
		return undefined;
	}
</script>

<nav
	class="bottom-nav"
	aria-label="Main navigation"
>
	<ul
		class="bottom-nav__list"
		role="list"
	>
		{#each navItems as item (item.href)}
			<li class="bottom-nav__item">
				<a
					href={resolve(item.href)}
					class="bottom-nav__link"
					class:bottom-nav__link--active={isActive(item)}
					aria-current={ariaCurrentFor(item)}
				>
					{#if item.label === 'Overview'}
						<svg
							class="bottom-nav__icon"
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
						</svg>
					{:else if item.label === 'Practice'}
						<svg
							class="bottom-nav__icon"
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M6 4v6M18 4v6M3 7h4M17 7h4M6 14v6M18 14v6M3 17h4M17 17h4M8 10h8v4H8z" />
						</svg>
					{:else if item.label === 'Insights'}
						<svg
							class="bottom-nav__icon"
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line
								x1="18"
								y1="20"
								x2="18"
								y2="10"
							/>
							<line
								x1="12"
								y1="20"
								x2="12"
								y2="4"
							/>
							<line
								x1="6"
								y1="20"
								x2="6"
								y2="14"
							/>
						</svg>
					{:else}
						<svg
							class="bottom-nav__icon"
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle
								cx="12"
								cy="12"
								r="3"
							/>
							<path
								d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
							/>
						</svg>
					{/if}
					<span class="bottom-nav__label">{item.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.bottom-nav {
		position: fixed;
		inset-block-end: 0;
		inset-inline: 0;
		block-size: calc(var(--nav-height) + var(--safe-bottom));
		padding-block-end: var(--safe-bottom);
		background: var(--color-surface-1);
		border-block-start: 1px solid var(--color-border);
		z-index: 50;
	}

	@container app (inline-size >= 720px) {
		.bottom-nav {
			inset-block: 0;
			inset-inline-end: auto;
			inline-size: var(--side-nav-width);
			block-size: 100%;
			max-inline-size: none;
			padding-block-end: 0;
			padding-block-start: var(--safe-top);
			border-block-start: none;
			border-inline-end: 1px solid var(--color-border);
			display: flex;
			flex-direction: column;
		}

		.bottom-nav__list {
			flex-direction: column;
			block-size: auto;
			padding: var(--space-6) var(--space-3);
			gap: var(--space-1);
		}

		.bottom-nav__item {
			flex: 0;
		}

		.bottom-nav__link {
			flex-direction: row;
			justify-content: flex-start;
			padding: var(--space-3);
			border-radius: var(--radius-lg);
			gap: var(--space-3);
			block-size: auto;
		}

		.bottom-nav__link--active {
			background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		}

		.bottom-nav__icon {
			flex-shrink: 0;
		}

		.bottom-nav__label {
			font-size: 0.9375rem;
			letter-spacing: -0.01em;
			text-transform: none;
			font-weight: 600;
		}
	}

	.bottom-nav__list {
		display: flex;
		block-size: var(--nav-height);
		inline-size: 100%;
		max-inline-size: var(--max-width);
		margin-inline: auto;
		padding-inline-start: max(var(--page-gutter), env(safe-area-inset-left, 0px));
		padding-inline-end: max(var(--page-gutter), env(safe-area-inset-right, 0px));
	}

	.bottom-nav__item {
		flex: 1;
	}

	.bottom-nav__link {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
		block-size: 100%;
		color: var(--color-text-tertiary);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.bottom-nav__link--active {
		color: var(--color-accent);

		&:focus-visible {
			outline-offset: -3px;
		}
	}

	.bottom-nav__icon {
		inline-size: 22px;
		block-size: 22px;
	}

	.bottom-nav__label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}
</style>
