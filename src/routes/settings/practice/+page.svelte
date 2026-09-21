<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsRow from '$lib/components/SettingsRow.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';
</script>

<svelte:head>
	<title>Practice — Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Practice" />

	<SettingsGroup title="Practice">
		<SettingsToggleRow
			label="Practice"
			description="Programs, routines, and guided workout & dance sessions. Your programs and session history are kept when off."
			checked={prefsStore.practiceEnabled}
			onchange={(v) => prefsStore.setPracticeEnabled(v)}
		/>
	</SettingsGroup>

	{#if prefsStore.practiceEnabled}
		<SettingsGroup title="Lift plans">
			<SettingsToggleRow
				label="Lift plans"
				description="Wave-loading strength plans that build toward a target lift. Your plan data is kept when off."
				checked={prefsStore.goalProgressionPlansEnabled}
				onchange={(v) => prefsStore.setGoalProgressionPlansEnabled(v)}
			/>
			{#if prefsStore.goalProgressionPlansEnabled}
				<SettingsRow
					href="/goals"
					label="Manage lift plans"
					detail="View & create"
				/>
			{/if}
		</SettingsGroup>
	{/if}
</div>
