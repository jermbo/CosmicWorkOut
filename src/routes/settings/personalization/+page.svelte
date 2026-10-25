<!--
	Settings → Personalization (US-046): weight unit, density, haptics and sound (v1.12.0),
	and Overview card order.
	Appearance, accent color, and roundness were removed in v1.12.0 — the app is dark only
	with fixed per-domain colors (docs/architecture/design-system.md).
-->
<script lang="ts">
	import type { Density } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import OverviewLayoutEditor from '$lib/components/OverviewLayoutEditor.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';
	import { canVibrate, feedback } from '$lib/feedback';

	// Only offer haptics where the browser can actually vibrate.
	const vibrationSupported = canVibrate();

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

	<section
		class="p-section"
		aria-labelledby="p-feedback"
	>
		<h2
			class="p-section__title"
			id="p-feedback"
		>
			Feedback
		</h2>
		<div class="p-section__rows">
			{#if vibrationSupported}
				<SettingsToggleRow
					label="Haptics"
					description="A short buzz when you tap, log a set, or finish."
					checked={prefsStore.hapticsEnabled}
					onchange={(on) => {
						prefsStore.setHapticsEnabled(on);
						if (on) feedback('success');
					}}
				/>
			{/if}
			<SettingsToggleRow
				label="Sound"
				description="Mechanical clicks and clunks. Off by default."
				checked={prefsStore.soundEnabled}
				onchange={(on) => {
					prefsStore.setSoundEnabled(on);
					if (on) feedback('success');
				}}
			/>
		</div>
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

	/* Rows stack into one ruled block, like Settings groups. */
	.p-section__rows > :global(* + *) {
		margin-block-start: calc(var(--rule) * -1);
	}

	.p-section__hint {
		margin-block-start: var(--space-2);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
</style>
