<script lang="ts">
	import { goto } from '$app/navigation';

	let { title }: { title: string } = $props();
</script>

<header class="settings-sub-header">
	<button class="settings-sub-header__back" onclick={() => goto('/settings')} aria-label="Back to Settings">
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<polyline points="15 18 9 12 15 6" />
		</svg>
		Settings
	</button>
	<h1 class="settings-sub-header__title">{title}</h1>
</header>

<style>
	.settings-sub-header {
		margin-block-end: var(--space-6);
	}

	.settings-sub-header__back {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-block-end: var(--space-1);

		svg {
			inline-size: 14px;
			block-size: 14px;
		}
	}

	.settings-sub-header__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
</style>
