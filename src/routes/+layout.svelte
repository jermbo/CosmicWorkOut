<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { initDB } from '$lib/db/database';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import SessionOverlay from '$lib/components/SessionOverlay.svelte';
	import SessionComplete from '$lib/components/SessionComplete.svelte';

	let { children } = $props();

	let appReady = $state(false);
	let hasRecoverableSession = $state(false);

	onMount(async () => {
		await initDB();
		prefsStore.load();
		await programStore.load();

		if (sessionStore.checkForRecovery()) {
			hasRecoverableSession = true;
		}

		appReady = true;
	});

	function handleResumeSession() {
		sessionStore.recoverSession();
		hasRecoverableSession = false;
	}

	function handleDiscardSession() {
		sessionStore.abandon();
		hasRecoverableSession = false;
	}
</script>

<div class="app">
	{#if appReady}
		<main class="app__main" id="main-content">
			{@render children()}
		</main>

		<BottomNav />

		{#if sessionStore.isActive}
			<SessionOverlay />
		{/if}

		{#if sessionStore.isComplete}
			<SessionComplete />
		{/if}

		{#if hasRecoverableSession}
			<div
				class="recovery-banner"
				role="alertdialog"
				aria-labelledby="recovery-title"
				aria-modal="true"
			>
				<p class="recovery-banner__title" id="recovery-title">Resume session?</p>
				<p class="recovery-banner__body">You have an unfinished workout to resume.</p>
				<div class="recovery-banner__actions">
					<button class="recovery-banner__btn recovery-banner__btn--resume" onclick={handleResumeSession}>
						Resume
					</button>
					<button class="recovery-banner__btn recovery-banner__btn--discard" onclick={handleDiscardSession}>
						Discard
					</button>
				</div>
			</div>
		{/if}
	{:else}
		<div class="app-loading" aria-busy="true" aria-label="Loading CosmicWorkOut">
			<div class="app-loading__spinner" role="status">
				<span class="sr-only">Loading…</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
