<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import '../app.css';
	import { initDB } from '$lib/db/database';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { healthStore } from '$lib/stores/health.svelte';
	import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import SessionOverlay from '$lib/components/SessionOverlay.svelte';
	import DanceSessionOverlay from '$lib/components/DanceSessionOverlay.svelte';
	import SessionComplete from '$lib/components/SessionComplete.svelte';
	import Toaster from '$lib/components/Toaster.svelte';
	import { BELLYDANCE_DISCIPLINE_ID } from '$lib/discipline';

	let { children } = $props();

	let appReady = $state(false);
	let loadError = $state(false);
	let hasRecoverableSession = $state(false);

	onMount(async () => {
		try {
			await initDB();
			prefsStore.load();
			await Promise.all([
				programStore.load(),
				habitStore.load(),
				activityStore.load(),
				healthStore.load(),
				goalPlanStore.load(),
				baselineStore.load(),
			]);

			// Practice owns sessions — with it off, a leftover session must not resurface.
			if (prefsStore.practiceEnabled && sessionStore.checkForRecovery()) {
				hasRecoverableSession = true;
			}
		} catch (e) {
			console.error('Startup failed:', e);
			loadError = true;
		} finally {
			appReady = true;
		}
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
	<Toaster />
	{#if appReady && loadError}
		<div
			class="app-loading"
			role="alert"
		>
			<div class="app-error">
				<p class="app-error__title">Couldn't load your data</p>
				<p class="app-error__body">
					Something went wrong while starting up. Try reloading — your data on this device is safe.
				</p>
				<button
					class="app-error__btn"
					onclick={() => location.reload()}
				>
					Reload
				</button>
			</div>
		</div>
	{:else if appReady}
		<main
			class="app__main"
			id="main-content"
		>
			{@render children()}
		</main>

		<BottomNav pathname={page.url.pathname} />

		{#if prefsStore.practiceEnabled}
			{#if sessionStore.isActive}
				{#if sessionStore.activeDisciplineId === BELLYDANCE_DISCIPLINE_ID}
					<DanceSessionOverlay />
				{:else}
					<SessionOverlay />
				{/if}
			{/if}

			{#if sessionStore.isComplete}
				<SessionComplete />
			{/if}
		{/if}

		{#if hasRecoverableSession}
			<div
				class="recovery-banner"
				role="alertdialog"
				aria-labelledby="recovery-title"
				aria-modal="true"
			>
				<p
					class="recovery-banner__title"
					id="recovery-title"
				>
					Resume session?
				</p>
				<p class="recovery-banner__body">You have an unfinished session to resume.</p>
				<div class="recovery-banner__actions">
					<button
						class="recovery-banner__btn recovery-banner__btn--resume"
						onclick={handleResumeSession}
					>
						Resume
					</button>
					<button
						class="recovery-banner__btn recovery-banner__btn--discard"
						onclick={handleDiscardSession}
					>
						Discard
					</button>
				</div>
			</div>
		{/if}
	{:else}
		<div
			class="app-loading"
			aria-busy="true"
			aria-label="Loading CosmicWorkOut"
		>
			<div
				class="app-loading__spinner"
				role="status"
			>
				<span class="sr-only">Loading…</span>
			</div>
		</div>
	{/if}
</div>
