<!--
	Settings → Personalization (US-046): weight unit, density, and Overview card order.
	Appearance, accent color, and roundness were removed in v1.12.0 — the app is dark only
	with fixed per-domain colors (docs/architecture/design-system.md).
-->
<script lang="ts">
	import type { Density } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import OverviewLayoutEditor from '$lib/components/OverviewLayoutEditor.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';

	const WEIGHT_UNITS = [
		{ value: 'lb', label: 'lb' },
		{ value: 'kg', label: 'kg' },
	] as const;

	const DENSITIES: { value: Density; label: string }[] = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'spacious', label: 'Spacious' },
	];
</script>

<svelte:head>
	<title>Personalization — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide personalization">
	<SettingsSubHeader title="Personalization" />

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
