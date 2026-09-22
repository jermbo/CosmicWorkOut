<!-- One Insights chart card: title, optional "Experimental" badge, and ⋯ → Hide (US-043). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { InsightChartDef } from '$lib/insights/charts';
	import { prefsStore } from '$lib/stores/prefs.svelte';

	let { chart, children }: { chart: InsightChartDef; children: Snippet } = $props();

	let menuOpen = $state(false);
	let menuEl: HTMLDivElement | undefined = $state();
	const titleId = $props.id();

	function hide() {
		menuOpen = false;
		prefsStore.setChartHidden(chart.id, true);
	}

	function onWindowPointer(e: PointerEvent) {
		if (menuOpen && menuEl && !menuEl.contains(e.target as Node)) menuOpen = false;
	}

	function onKey(e: KeyboardEvent) {
		if (menuOpen && e.key === 'Escape') menuOpen = false;
	}
</script>

<svelte:window
	onpointerdown={onWindowPointer}
	onkeydown={onKey}
/>

<section
	class="insight-card"
	class:insight-card--wide={chart.wide}
	aria-labelledby={titleId}
>
	<header class="insight-card__head">
		<div class="insight-card__titles">
			<h2
				class="insight-card__title"
				id={titleId}
			>
				{chart.title}
				{#if chart.experimental}
					<span class="insight-card__badge">Experimental</span>
				{/if}
			</h2>
			<p class="insight-card__desc">{chart.desc}</p>
		</div>
		<div
			class="insight-card__menu"
			bind:this={menuEl}
		>
			<button
				class="insight-card__menu-btn"
				aria-label="Options for {chart.title}"
				aria-haspopup="menu"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}>⋯</button
			>
			{#if menuOpen}
				<div
					class="insight-card__popover"
					role="menu"
				>
					<button
						role="menuitem"
						class="insight-card__item"
						onclick={hide}>Hide chart</button
					>
					<p class="insight-card__note">Bring it back in Settings → Insights.</p>
				</div>
			{/if}
		</div>
	</header>
	{@render children()}
</section>

<style>
	.insight-card {
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-5);
		min-inline-size: 0;
	}

	@container app (inline-size >= 720px) {
		.insight-card--wide {
			grid-column: 1 / -1;
		}
	}

	.insight-card__head {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.insight-card__titles {
		flex: 1;
		min-inline-size: 0;
	}

	.insight-card__title {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text-primary);
	}

	.insight-card__badge {
		padding: 1px var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-strong);
		font-family: var(--font-body);
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}

	.insight-card__desc {
		margin-block-start: var(--space-1);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.insight-card__menu {
		position: relative;
		flex: none;
	}

	.insight-card__menu-btn {
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: 1.25rem;
		line-height: 1;

		&:hover,
		&[aria-expanded='true'] {
			background: var(--color-surface-3);
			color: var(--color-text-primary);
		}
	}

	.insight-card__popover {
		position: absolute;
		inset-inline-end: 0;
		inset-block-start: calc(100% + 4px);
		z-index: 20;
		min-inline-size: 200px;
		padding: var(--space-2);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
	}

	.insight-card__item {
		display: block;
		inline-size: 100%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		text-align: start;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);

		&:hover {
			background: var(--color-surface-2);
		}
	}

	.insight-card__note {
		padding: var(--space-1) var(--space-3) 0;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
</style>
