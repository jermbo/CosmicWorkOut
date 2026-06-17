<script lang="ts">
	import { page } from '$app/state';

	const navItems = [
		{ href: '/', label: 'Today', exact: true },
		{ href: '/habits', label: 'Habits', exact: false },
		{ href: '/program', label: 'Program', exact: false },
		{ href: '/calendar', label: 'History', exact: false },
		{ href: '/settings', label: 'Settings', exact: false }
	];

	function isActive(item: (typeof navItems)[number]): boolean {
		if (item.exact) {
			return page.url.pathname === item.href;
		}
		return page.url.pathname.startsWith(item.href);
	}
</script>

<nav class="bottom-nav" aria-label="Main navigation">
	<ul class="bottom-nav__list" role="list">
		{#each navItems as item}
			<li class="bottom-nav__item">
				<a
					href={item.href}
					class="bottom-nav__link"
					class:bottom-nav__link--active={isActive(item)}
					aria-current={isActive(item) ? 'page' : undefined}
				>
					{#if item.label === 'Today'}
						<svg class="bottom-nav__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
						</svg>
					{:else if item.label === 'Habits'}
						<svg class="bottom-nav__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M9 11l3 3L22 4" />
							<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
						</svg>
					{:else if item.label === 'Program'}
						<svg class="bottom-nav__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="8" y1="6" x2="21" y2="6" />
							<line x1="8" y1="12" x2="21" y2="12" />
							<line x1="8" y1="18" x2="21" y2="18" />
							<line x1="3" y1="6" x2="3.01" y2="6" />
							<line x1="3" y1="12" x2="3.01" y2="12" />
							<line x1="3" y1="18" x2="3.01" y2="18" />
						</svg>
					{:else if item.label === 'History'}
						<svg class="bottom-nav__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
					{:else}
						<svg class="bottom-nav__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="3" />
							<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
