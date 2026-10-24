<script lang="ts">
	import { resolve } from '$app/paths';
	import { prefsStore } from '$lib/stores/prefs.svelte';

	let { pathname }: { pathname: string } = $props();

	const ALL_NAV_ITEMS = [
		{ href: '/', label: 'Overview', exact: true },
		{ href: '/workout', label: 'Workout', exact: false },
		{ href: '/insights', label: 'Insights', exact: false },
		{ href: '/settings', label: 'Settings', exact: false },
	] as const;

	let navItems = $derived(
		ALL_NAV_ITEMS.filter((item) => item.href !== '/workout' || prefsStore.practiceEnabled),
	);

	function isActive(item: (typeof ALL_NAV_ITEMS)[number]): boolean {
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
		{#each navItems as item, i (item.href)}
			<li class="bottom-nav__item">
				<a
					href={resolve(item.href)}
					class="bottom-nav__link"
					class:bottom-nav__link--active={isActive(item)}
					aria-current={ariaCurrentFor(item)}
				>
					<span
						class="bottom-nav__index"
						aria-hidden="true">{String(i + 1).padStart(2, '0')}</span
					>
					<span class="bottom-nav__label">{item.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* Numbered blocks split by 3px rules; the current tab is filled paper. */
	.bottom-nav {
		position: fixed;
		inset-block-end: 0;
		inset-inline: 0;
		block-size: calc(var(--nav-height) + var(--safe-bottom));
		background: var(--color-ink);
		border-block-start: var(--rule) solid var(--color-paper);
		z-index: 50;
	}

	.bottom-nav__list {
		display: flex;
		block-size: 100%;
		inline-size: 100%;
	}

	.bottom-nav__item {
		flex: 1;
		min-inline-size: 0;

		& + & {
			border-inline-start: var(--rule) solid var(--color-paper);
		}
	}

	.bottom-nav__link {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: 2px;
		block-size: 100%;
		padding: var(--space-3) var(--space-2) calc(var(--safe-bottom) + var(--space-2));
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-primary);
	}

	.bottom-nav__index {
		color: var(--color-text-muted);
	}

	.bottom-nav__label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bottom-nav__link--active {
		background: var(--color-paper);
		color: var(--color-ink);

		.bottom-nav__index {
			color: inherit;
			opacity: 0.6;
		}

		&:focus-visible {
			outline-color: var(--color-accent);
			outline-offset: -3px;
		}
	}

	@container app (inline-size >= 720px) {
		.bottom-nav {
			inset-block: 0;
			inset-inline-end: auto;
			inline-size: var(--side-nav-width);
			block-size: 100%;
			padding-block-start: var(--safe-top);
			border-block-start: none;
			border-inline-end: var(--rule) solid var(--color-paper);
		}

		.bottom-nav__list {
			flex-direction: column;
			block-size: auto;
			border-block-end: var(--rule) solid var(--color-paper);
		}

		.bottom-nav__item {
			flex: 0;

			& + & {
				border-inline-start: none;
				border-block-start: var(--rule) solid var(--color-paper);
			}
		}

		.bottom-nav__link {
			padding: var(--space-4);
			font-size: 0.8125rem;
		}
	}
</style>
