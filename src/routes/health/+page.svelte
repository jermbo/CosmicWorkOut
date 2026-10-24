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
		padding-inline-end: var(--press-offset);
	}

	.health-block__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-3);
	}

	.health-block__title {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.health-block__add {
		padding-inline: var(--space-3);
		block-size: 36px;
		background: transparent;
		border: var(--rule) solid var(--color-paper);
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		color: var(--color-text-primary);

		&:active {
			background: var(--color-paper);
			color: var(--color-ink);
		}
	}

	.health-block__empty {
		padding: var(--space-4);
		background: var(--field-empty);
		border: var(--rule) dashed var(--color-paper);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-text-primary);
	}

	/* Readings are Health fields; tap to edit, so they carry the press shadow. */
	.weight-card,
	.bp-item {
		inline-size: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--field-health);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
		text-align: start;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;
	}

	.weight-card__value,
	.bp-item__value {
		font-family: var(--font-display);
		font-size: 2.25rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		line-height: 1;
	}

	.bp-item__value {
		font-size: 1.75rem;
	}

	.weight-card__unit,
	.bp-item__unit {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0;
		text-transform: uppercase;
		margin-inline-start: 4px;
	}

	.weight-card__empty {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 900;
		text-transform: uppercase;
	}

	.weight-card__action,
	.bp-item__meta {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.bp-list {
		display: flex;
		flex-direction: column;
		gap: var(--card-gap);
		list-style: none;
		padding: 0;
		margin: 0;

		li {
			display: contents;
		}
	}
</style>
