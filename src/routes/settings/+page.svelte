<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsRow from '$lib/components/SettingsRow.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';

	let activeHabitCount = $derived(habitStore.activeHabits.filter((h) => h.type !== 'mood').length);
</script>

<svelte:head>
	<title>Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide settings-hub">
	<header class="settings-hub__header">
		<p class="settings-hub__eyebrow">Preferences</p>
		<h1 class="settings-hub__title">Settings</h1>
	</header>

	<SettingsGroup title="Tracking">
		<SettingsRow href="/settings/habits" label="Habits" detail="{activeHabitCount} active" />
		<SettingsToggleRow
			label="Health metrics"
			description="Track weight and blood pressure trends."
			checked={prefsStore.healthMetricsEnabled}
			onchange={(v) => prefsStore.setHealthMetricsEnabled(v)}
		/>
	</SettingsGroup>

	<SettingsGroup title="Data">
		<SettingsRow href="/settings/data" label="Data & backup" />
	</SettingsGroup>
</div>

<style>
	.settings-hub__header {
		margin-block-end: var(--space-6);
	}

	.settings-hub__eyebrow {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-1);
	}

	.settings-hub__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
</style>
