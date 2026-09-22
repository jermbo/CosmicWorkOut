<!-- Settings → Insights: show / hide each Insights chart (US-043). -->
<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import {
		INSIGHT_CHARTS,
		chartAvailable,
		unavailableReason,
		type InsightFeature,
	} from '$lib/insights/charts';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';

	let enabled = $derived<Record<InsightFeature, boolean>>({
		habits: prefsStore.habitsEnabled,
		practice: prefsStore.practiceEnabled,
		activity: prefsStore.activityLogEnabled,
		health: prefsStore.healthMetricsEnabled,
		baselines: prefsStore.baselinesEnabled,
	});

	let hiddenCount = $derived(INSIGHT_CHARTS.filter((c) => prefsStore.isChartHidden(c.id)).length);

	function description(chart: (typeof INSIGHT_CHARTS)[number]): string {
		if (!chartAvailable(chart, enabled))
			return `${unavailableReason(chart)} — turn it on to see this chart.`;
		return chart.experimental ? `Experimental · ${chart.desc}` : chart.desc;
	}

	function showAll() {
		for (const chart of INSIGHT_CHARTS) prefsStore.setChartHidden(chart.id, false);
	}
</script>

<svelte:head>
	<title>Insights — Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Insights" />

	<p class="insights-settings__intro">
		Choose which charts appear on Insights. Hide the ones that feel like noise — what you keep is
		what's useful. You can also hide a chart from its ⋯ menu.
	</p>

	<SettingsGroup title="Charts">
		{#each INSIGHT_CHARTS as chart (chart.id)}
			<SettingsToggleRow
				label={chart.title}
				description={description(chart)}
				checked={!prefsStore.isChartHidden(chart.id)}
				onchange={(show) => prefsStore.setChartHidden(chart.id, !show)}
			/>
		{/each}
	</SettingsGroup>

	{#if hiddenCount > 0}
		<button
			class="insights-settings__reset"
			onclick={showAll}>Show all charts ({hiddenCount} hidden)</button
		>
	{/if}
</div>

<style>
	.insights-settings__intro {
		margin-block-end: var(--space-5);
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	.insights-settings__reset {
		margin-block-start: var(--space-4);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-accent-text);
	}
</style>
