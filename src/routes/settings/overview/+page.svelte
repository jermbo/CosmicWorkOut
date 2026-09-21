<script lang="ts">
	import OverviewLayoutEditor from '$lib/components/OverviewLayoutEditor.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
</script>

<svelte:head>
	<title>Overview layout — CosmicWorkOut</title>
</svelte:head>

<!-- Kept so old links work; the same editor lives on Settings → Personalization (US-046). -->
<div class="page page--wide">
	<SettingsSubHeader title="Overview layout" />
	<OverviewLayoutEditor />
</div>
