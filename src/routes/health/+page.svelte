<script lang="ts">
	import type { HealthReading, BloodPressureValues } from '$lib/db/types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { healthStore } from '$lib/stores/health.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { formatTime } from '$lib/date';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import HealthWeightSheet from '$lib/components/HealthWeightSheet.svelte';
	import HealthBloodPressureSheet from '$lib/components/HealthBloodPressureSheet.svelte';

	// Feature is gated — bounce out if it was disabled while navigating here.
	$effect(() => {
		if (!prefsStore.healthMetricsEnabled) goto(resolve('/'));
	});

	let contextDate = $derived(loggingContext.date);
	let weight = $derived(healthStore.weightForDate(contextDate));
	let bpReadings = $derived(healthStore.bloodPressureForDate(contextDate));

	let showWeightSheet = $state(false);
	let showBpSheet = $state(false);
	let editingBp = $state<(HealthReading & { values: BloodPressureValues }) | null>(null);

	function openBpNew() {
		editingBp = null;
		showBpSheet = true;
	}

	function openBpEdit(reading: HealthReading & { values: BloodPressureValues }) {
		editingBp = reading;
		showBpSheet = true;
	}
</script>

<svelte:head>
	<title>Health — CosmicWorkOut</title>
</svelte:head>

<div class="page health-page">
	<PageHeader
		title="Health"
		showBack
	/>

	<section class="health-block">
		<div class="health-block__head">
			<h2 class="health-block__title">Weight</h2>
		</div>
		<button
			class="weight-card"
			onclick={() => (showWeightSheet = true)}
		>
			{#if weight}
				<span class="weight-card__value">
					{weight.values.value}<span class="weight-card__unit">{prefsStore.weightUnit}</span>
				</span>
				<span class="weight-card__action">Edit</span>
			{:else}
				<span class="weight-card__empty">Not logged</span>
				<span class="weight-card__action">Log weight</span>
			{/if}
		</button>
	</section>

	<section class="health-block">
		<div class="health-block__head">
			<h2 class="health-block__title">Blood Pressure</h2>
			<button
				class="health-block__add"
				onclick={openBpNew}
				aria-label="Add blood pressure reading">+ Add</button
			>
		</div>

		{#if bpReadings.length === 0}
			<p class="health-block__empty">No readings for this day.</p>
		{:else}
			<ul class="bp-list">
				{#each bpReadings as reading (reading.id)}
					<li>
						<button
							class="bp-item"
							onclick={() => openBpEdit(reading)}
						>
							<span class="bp-item__value">
								{reading.values.systolic}/{reading.values.diastolic}
								<span class="bp-item__unit">mmHg</span>
							</span>
							<span class="bp-item__meta">
								{#if reading.values.pulse}{reading.values.pulse} bpm ·
								{/if}{formatTime(reading.recordedAt)}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

{#if showWeightSheet}
	<HealthWeightSheet
		date={contextDate}
		editing={weight ?? null}
		onClose={() => (showWeightSheet = false)}
	/>
{/if}

{#if showBpSheet}
	<HealthBloodPressureSheet
		date={contextDate}
		editing={editingBp}
		onClose={() => {
			showBpSheet = false;
			editingBp = null;
		}}
	/>
{/if}

<style>
	.health-block {
		margin-block-end: var(--space-6);
	}

	.health-block__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-3);
	}

	.health-block__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
	}

	.health-block__add {
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
	}

	.health-block__empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.weight-card {
		inline-size: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.weight-card__value {
		font-family: var(--font-mono);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.weight-card__unit {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin-inline-start: 4px;
	}

	.weight-card__empty {
		font-size: 1rem;
		color: var(--color-text-muted);
	}

	.weight-card__action {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
	}

	.bp-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		list-style: none;
		padding: 0;
		margin: 0;

		li {
			display: contents;
		}
	}

	.bp-item {
		inline-size: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.bp-item__value {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.bp-item__unit {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin-inline-start: 4px;
	}

	.bp-item__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}
</style>
