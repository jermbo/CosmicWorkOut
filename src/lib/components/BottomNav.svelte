<script lang="ts">
	import { page } from '$app/state';

	const navItems = [
		{
			href: '/',
			label: 'Today',
			exact: true
		},
		{
			href: '/program',
			label: 'Program',
			exact: false
		},
		{
			href: '/calendar',
			label: 'Calendar',
			exact: false
		}
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
					{:else if item.label === 'Program'}
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
							<line x1="8" y1="6" x2="21" y2="6" />
							<line x1="8" y1="12" x2="21" y2="12" />
							<line x1="8" y1="18" x2="21" y2="18" />
							<line x1="3" y1="6" x2="3.01" y2="6" />
							<line x1="3" y1="12" x2="3.01" y2="12" />
							<line x1="3" y1="18" x2="3.01" y2="18" />
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
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
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
		max-inline-size: var(--max-width);
		margin-inline: auto;
		block-size: calc(var(--nav-height) + var(--safe-bottom));
		padding-block-end: var(--safe-bottom);
		background: var(--color-surface-1);
		border-block-start: 1px solid var(--color-border);
		z-index: 50;
	}

	.bottom-nav__list {
		display: flex;
		block-size: var(--nav-height);
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
