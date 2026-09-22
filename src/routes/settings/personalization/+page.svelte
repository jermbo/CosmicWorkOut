<!--
	Settings → Personalization (US-046): appearance (light / dark / match device, v1.11.0),
	accent color, weight unit, density, roundness, and Overview card order.
-->
<script lang="ts">
	import type { Density, Roundness, Theme } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import ColorSwatches from '$lib/components/ColorSwatches.svelte';
	import OverviewLayoutEditor from '$lib/components/OverviewLayoutEditor.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';

	const ACCENTS = [
		{ name: 'Lime', value: '#b2f042' },
		{ name: 'Lavender', value: '#b286fd' },
		{ name: 'Sky', value: '#60c6ff' },
		{ name: 'Red', value: '#e55733' },
		{ name: 'Orange', value: '#f97316' },
		{ name: 'Teal', value: '#2dd4bf' },
		{ name: 'Pink', value: '#f472b6' },
		{ name: 'Yellow', value: '#facc15' },
	];
	const ACCENT_NAMES = Object.fromEntries(ACCENTS.map((a) => [a.value, a.name]));

	const THEMES: { value: Theme; label: string }[] = [
		{ value: 'dark', label: 'Dark' },
		{ value: 'light', label: 'Light' },
		{ value: 'system', label: 'Match device' },
	];

	const WEIGHT_UNITS = [
		{ value: 'lb', label: 'lb' },
		{ value: 'kg', label: 'kg' },
	] as const;

	const DENSITIES: { value: Density; label: string }[] = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'spacious', label: 'Spacious' },
	];

	const ROUNDNESS: { value: Roundness; label: string }[] = [
		{ value: 'sharp', label: 'Sharp' },
		{ value: 'default', label: 'Default' },
		{ value: 'soft', label: 'Soft' },
	];
</script>

<svelte:head>
	<title>Personalization — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide personalization">
	<SettingsSubHeader title="Personalization" />

	<section
		class="p-section"
		aria-labelledby="p-theme"
	>
		<h2
			class="p-section__title"
			id="p-theme"
		>
			Appearance
		</h2>
		<SegmentedControl
			options={THEMES}
			value={prefsStore.theme}
			label="Appearance"
			onchange={(t) => prefsStore.setTheme(t)}
		/>
	</section>

	<section
		class="p-section"
		aria-labelledby="p-accent"
	>
		<h2
			class="p-section__title"
			id="p-accent"
		>
			Accent color
		</h2>
		<ColorSwatches
			value={prefsStore.accentColor}
			colors={ACCENTS.map((a) => a.value)}
			names={ACCENT_NAMES}
			label="Accent color"
			onchange={(c) => prefsStore.setAccentColor(c)}
		/>
	</section>

	<section
		class="p-section"
		aria-labelledby="p-weight"
	>
		<h2
			class="p-section__title"
			id="p-weight"
		>
			Weight unit
		</h2>
		<SegmentedControl
			options={WEIGHT_UNITS}
			value={prefsStore.weightUnit}
			label="Weight unit"
			onchange={(u) => prefsStore.setWeightUnit(u)}
		/>
		<p class="p-section__hint">Changes the label only — past readings are not converted.</p>
	</section>

	<section
		class="p-section"
		aria-labelledby="p-density"
	>
		<h2
			class="p-section__title"
			id="p-density"
		>
			Density
		</h2>
		<SegmentedControl
			options={DENSITIES}
			value={prefsStore.density}
			label="Density"
			onchange={(d) => prefsStore.setDensity(d)}
		/>
	</section>

	<section
		class="p-section"
		aria-labelledby="p-roundness"
	>
		<h2
			class="p-section__title"
			id="p-roundness"
		>
			Roundness
		</h2>
		<SegmentedControl
			options={ROUNDNESS}
			value={prefsStore.roundness}
			label="Roundness"
			onchange={(r) => prefsStore.setRoundness(r)}
		/>
	</section>

	<div
		class="p-overview"
		id="overview"
	>
		<OverviewLayoutEditor />
	</div>
</div>

<style>
	.p-section {
		margin-block-end: var(--space-6);
	}

	.p-section__title {
		margin-block-end: var(--space-3);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
	}

	.p-section__hint {
		margin-block-start: var(--space-2);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
</style>
