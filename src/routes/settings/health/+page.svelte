<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsRow from '$lib/components/SettingsRow.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';
</script>

<svelte:head>
	<title>Health — Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Health" />

	<SettingsGroup title="Health metrics">
		<SettingsToggleRow
			label="Health metrics"
			description="Track weight and blood pressure trends. Your readings are kept when off."
			checked={prefsStore.healthMetricsEnabled}
			onchange={(v) => prefsStore.setHealthMetricsEnabled(v)}
		/>
		{#if prefsStore.healthMetricsEnabled}
			<SettingsRow
				href="/settings/personalization"
				label="Weight unit"
				detail={prefsStore.weightUnit}
			/>
		{/if}
	</SettingsGroup>
</div>
