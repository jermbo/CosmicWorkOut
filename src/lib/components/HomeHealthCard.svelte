<script lang="ts">
	import type { HealthReading, WeightValues, BloodPressureValues } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import HomeCard from './HomeCard.svelte';

	type Props = {
		weight: (HealthReading & { values: WeightValues }) | undefined;
		latestBp: (HealthReading & { values: BloodPressureValues }) | undefined;
	};

	let { weight, latestBp }: Props = $props();

	let hasAny = $derived(weight !== undefined || latestBp !== undefined);

	let ariaLabel = $derived(
		hasAny ? 'Health metrics logged for this day' : 'Health metrics: nothing logged',
	);
</script>

<HomeCard
	href="/health"
	title="Health"
	{ariaLabel}
	variant="log"
>
	{#if !hasAny}
		<p class="home-health-card__empty">Not logged</p>
	{:else}
		<div class="home-health-card__stats">
			{#if weight}
				<span class="home-health-card__stat">
					<span class="home-health-card__num"
						>{weight.values.value}<span class="home-health-card__unit">{prefsStore.weightUnit}</span
						></span
					>
					<span class="home-health-card__label">Weight</span>
				</span>
			{/if}
			{#if latestBp}
				<span class="home-health-card__stat">
					<span class="home-health-card__num"
						>{latestBp.values.systolic}/{latestBp.values.diastolic}</span
					>
					<span class="home-health-card__label">Blood pressure</span>
				</span>
			{/if}
		</div>
	{/if}
</HomeCard>

<style>
	.home-health-card__empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.home-health-card__stats {
		display: flex;
		gap: var(--space-6);
	}

	.home-health-card__stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.home-health-card__num {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.home-health-card__unit {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin-inline-start: 3px;
	}

	.home-health-card__label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
</style>
