<script lang="ts">
	import type { ActivityType } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';
	import ActivityTypeRow from '$lib/components/ActivityTypeRow.svelte';
	import ActivityTypeRenameSheet from '$lib/components/ActivityTypeRenameSheet.svelte';

	let renaming = $state<ActivityType | null>(null);
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

	{#if prefsStore.activityLogEnabled}
		<SettingsGroup title="Activity types">
			<p class="types-hint">
				Log Other with a new name to add a type. A hidden type leaves the picker and Activity Mix;
				its entries stay.
			</p>
			<div
				class="types-list"
				role="list"
			>
				{#each activityStore.allTypesByName as type (type.id)}
					<ActivityTypeRow
						{type}
						entries={activityStore.countsByType.get(type.id) ?? 0}
						ontoggle={() => activityStore.setHidden(type.id, !type.hidden)}
						onrename={() => (renaming = type)}
					/>
				{/each}
			</div>
		</SettingsGroup>
	{/if}
</div>

{#if renaming}
	<ActivityTypeRenameSheet
		type={renaming}
		onClose={() => (renaming = null)}
	/>
{/if}

<style>
	.types-hint {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.types-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
