<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';
</script>

<svelte:head>
	<title>Workout — Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Workout" />

	<SettingsGroup title="Workout">
		<SettingsToggleRow
			label="Workout"
			description="Plans, routines, and guided sessions — with an optional goal for one focus lift. Your plans and session history are kept when off."
			checked={prefsStore.practiceEnabled}
			onchange={(v) => prefsStore.setPracticeEnabled(v)}
		/>
	</SettingsGroup>
</div>
