<script lang="ts">
	import type { Density, Roundness } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import AccentColorPicker from '$lib/components/AccentColorPicker.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';

	const WEIGHT_UNITS: { value: 'lb' | 'kg'; label: string }[] = [
		{ value: 'lb', label: 'lb' },
		{ value: 'kg', label: 'kg' },
	];

	const DENSITIES: { value: Density; label: string }[] = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'spacious', label: 'Spacious' },
	];

	const ROUNDNESS_OPTIONS: { value: Roundness; label: string }[] = [
		{ value: 'sharp', label: 'Sharp' },
		{ value: 'default', label: 'Default' },
		{ value: 'soft', label: 'Soft' },
	];
</script>

<svelte:head>
	<title>Appearance — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Appearance" />

	<section class="settings-section" aria-labelledby="section-accent">
		<h2 class="settings-section__title" id="section-accent">Accent Color</h2>
		<AccentColorPicker />
	</section>

	<section class="settings-section" aria-labelledby="section-unit">
		<h2 class="settings-section__title" id="section-unit">Weight Unit</h2>
		<SegmentedControl
			options={WEIGHT_UNITS}
			value={prefsStore.weightUnit}
			onchange={(v) => prefsStore.setWeightUnit(v)}
			ariaLabel="Weight unit"
		/>
	</section>

	<section class="settings-section" aria-labelledby="section-density">
		<h2 class="settings-section__title" id="section-density">Density</h2>
		<SegmentedControl
			options={DENSITIES}
			value={prefsStore.density}
			onchange={(v) => prefsStore.setDensity(v)}
			ariaLabel="Density"
		/>
	</section>

	<section class="settings-section" aria-labelledby="section-roundness">
		<h2 class="settings-section__title" id="section-roundness">Roundness</h2>
		<SegmentedControl
			options={ROUNDNESS_OPTIONS}
			value={prefsStore.roundness}
			onchange={(v) => prefsStore.setRoundness(v)}
			ariaLabel="Roundness"
		/>
	</section>
</div>

<style>
	.settings-section {
		margin-block-end: var(--space-6);
	}

	.settings-section__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}
</style>
