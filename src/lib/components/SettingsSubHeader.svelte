<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { title }: { title: string } = $props();
</script>

<header class="settings-sub-header">
	<button
		class="settings-sub-header__back"
		onclick={() => goto(resolve('/settings'))}
		aria-label="Back to Settings"
	>
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
		padding-block-end: var(--space-2);
		border-block-end: var(--rule) solid var(--color-paper);
	}

	.settings-sub-header__back {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--color-text-muted);
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
		text-transform: uppercase;
		/* Scales down so long titles (PERSONALIZATION) fit on one line. */
		font-size: clamp(1.25rem, 7.5cqi, 2rem);
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 0.95;
		overflow-wrap: break-word;
	}
</style>
