<script lang="ts">
	import HomeCard from './HomeCard.svelte';

	type Props = {
		routineName: string | null;
		routineMeta: string | null;
		loaded: boolean;
		isProgramComplete: boolean;
		hasSession: boolean;
		isActive: boolean;
	};

	let { routineName, routineMeta, loaded, isProgramComplete, hasSession, isActive }: Props = $props();

	let badge = $derived<'live' | 'done' | null>(isActive ? 'live' : hasSession ? 'done' : null);
	let ariaLabel = $derived(`Belly Dance${routineName ? ': ' + routineName : ''}`);
</script>

<HomeCard
	href="/practice/dance"
	title="Belly Dance"
	{ariaLabel}
	variant="dance"
	done={hasSession}
	active={isActive}
	{badge}
>
	{#snippet children()}
		{#if !loaded}
			<div class="home-dance-card__loading" aria-busy="true">
				<div class="home-dance-card__spinner"></div>
			</div>
		{:else if isProgramComplete}
			<p class="home-dance-card__name">Program complete!</p>
			<p class="home-dance-card__meta">Time for something new.</p>
		{:else if routineName}
			<p class="home-dance-card__name">{routineName}</p>
			{#if routineMeta}
				<p class="home-dance-card__meta">{routineMeta}</p>
			{/if}
		{:else}
			<p class="home-dance-card__empty">No program active.</p>
		{/if}
	{/snippet}
</HomeCard>

<style>
	.home-dance-card__name {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1.2;
	}

	.home-dance-card__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-1);
	}

	.home-dance-card__empty {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}

	.home-dance-card__loading {
		display: flex;
		justify-content: center;
		padding-block: var(--space-4);
	}

	.home-dance-card__spinner {
		inline-size: 22px;
		block-size: 22px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-lavender);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
