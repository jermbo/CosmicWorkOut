<script lang="ts">
	import HomeCard from './HomeCard.svelte';

	type Props = {
		workoutName: string | null;
		workoutMeta: string | null;
		loaded: boolean;
		isProgramComplete: boolean;
		hasSession: boolean;
		isActive: boolean;
	};

	let { workoutName, workoutMeta, loaded, isProgramComplete, hasSession, isActive }: Props =
		$props();

	let badge = $derived<'live' | 'done' | null>(
		isActive ? 'live' : hasSession ? 'done' : null,
	);

	let ariaLabel = $derived(`Workout${workoutName ? ': ' + workoutName : ''}`);
</script>

<HomeCard
	href="/workout"
	title="Workout"
	{ariaLabel}
	variant="workout"
	done={hasSession}
	active={isActive}
	{badge}
>
	{#snippet children()}
		{#if !loaded}
			<div class="home-workout-card__loading" aria-busy="true">
				<div class="home-workout-card__spinner"></div>
			</div>
		{:else if isProgramComplete}
			<p class="home-workout-card__name">Program complete!</p>
			<p class="home-workout-card__meta">Time for something new.</p>
		{:else if workoutName}
			<p class="home-workout-card__name">{workoutName}</p>
			{#if workoutMeta}
				<p class="home-workout-card__meta">{workoutMeta}</p>
			{/if}
		{:else}
			<p class="home-workout-card__empty">No program active.</p>
		{/if}
	{/snippet}
</HomeCard>

<style>
	.home-workout-card__name {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1.2;
	}

	.home-workout-card__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-1);
	}

	.home-workout-card__empty {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}

	.home-workout-card__loading {
		display: flex;
		justify-content: center;
		padding-block: var(--space-4);
	}

	.home-workout-card__spinner {
		inline-size: 22px;
		block-size: 22px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
