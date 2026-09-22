<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { INSIGHT_CHARTS } from '$lib/insights/charts';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsRow from '$lib/components/SettingsRow.svelte';

	/*
	 * One row per feature (v1.10.0, US-045). Each opens that feature's page, which
	 * holds its on / off switch, its manage list, and its own options.
	 */

	function onOff(on: boolean, extra?: string): string {
		if (!on) return 'Off';
		return extra ? `On · ${extra}` : 'On';
	}

	let activeHabitCount = $derived(habitStore.activeHabits.filter((h) => h.type !== 'mood').length);
	let activeBaselineCount = $derived(baselineStore.activeBaselines.length);
	let hiddenChartCount = $derived(
		INSIGHT_CHARTS.filter((c) => prefsStore.isChartHidden(c.id)).length,
	);
</script>

<svelte:head>
	<title>Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide settings-hub">
	<header class="settings-hub__header">
		<p class="settings-hub__eyebrow">Preferences</p>
		<h1 class="settings-hub__title">Settings</h1>
	</header>

	<SettingsGroup title="Features">
		<SettingsRow
			href="/settings/habits"
			label="Habits"
			detail={onOff(prefsStore.habitsEnabled, `${activeHabitCount} active`)}
		/>
		<SettingsRow
			href="/settings/baselines"
			label="Baselines"
			detail={onOff(prefsStore.baselinesEnabled, `${activeBaselineCount} active`)}
		/>
		<SettingsRow
			href="/settings/workout"
			label="Workout"
			detail={onOff(prefsStore.practiceEnabled)}
		/>
		<SettingsRow
			href="/settings/activity"
			label="Activity"
			detail={onOff(prefsStore.activityLogEnabled)}
		/>
		<SettingsRow
			href="/settings/health"
			label="Health"
			detail={onOff(prefsStore.healthMetricsEnabled)}
		/>
	</SettingsGroup>

	<SettingsGroup title="App">
		<SettingsRow
			href="/settings/insights"
			label="Insights"
			detail={hiddenChartCount > 0 ? `${hiddenChartCount} hidden` : 'All charts'}
		/>
		<SettingsRow
			href="/settings/personalization"
			label="Personalization"
		/>
		<SettingsRow
			href="/settings/data"
			label="Data & backup"
		/>
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
