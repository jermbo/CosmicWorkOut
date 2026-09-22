<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';
</script>

<svelte:head>
	<title>Activity — Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Activity" />

	<SettingsGroup title="Activity log">
		<SettingsToggleRow
			label="Activity log"
			description="Runs, walks, yoga, and other one-off activities. Your logged activities are kept when off."
			checked={prefsStore.activityLogEnabled}
			onchange={(v) => prefsStore.setActivityLogEnabled(v)}
		/>
	</SettingsGroup>
</div>
