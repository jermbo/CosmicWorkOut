<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { formatDuration, formatVolume } from '$lib/format';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { BELLYDANCE_DISCIPLINE_ID } from '$lib/discipline';
	import BottomSheet from './BottomSheet.svelte';

	function handleBackToToday() {
		sessionStore.dismissComplete();
	}

	async function handleSeeCalendar() {
		sessionStore.dismissComplete();
		await goto(resolve('/calendar'));
	}

	let session = $derived(sessionStore.completedSession);
	let isDance = $derived(session?.disciplineId === BELLYDANCE_DISCIPLINE_ID);
	let totalSets = $derived(session?.items.reduce((sum, ex) => sum + ex.sets.length, 0) ?? 0);
	let itemsCompleted = $derived(session?.items.length ?? 0);
</script>

<BottomSheet
	onclose={handleBackToToday}
	maxHeight="100dvh"
	hideHandle
	fixedHeight
>
	<div
		class="session-complete"
		aria-labelledby="complete-title"
		aria-modal="true"
	>
		<div
			class="session-complete__graphic"
			aria-hidden="true"
		>
			<div class="session-complete__circle">
				<svg
					viewBox="0 0 48 48"
					fill="none"
					stroke="currentColor"
					stroke-width="3.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polyline points="10 24 20 34 38 14" />
				</svg>
			</div>
		</div>

		<div class="session-complete__text">
			<p
				class="session-complete__eyebrow"
				aria-hidden="true"
			>
				Filed away.
			</p>
			<h2
				class="session-complete__title"
				id="complete-title"
			>
				Session logged.
			</h2>
			<p class="session-complete__subtitle">Nice work today.</p>
		</div>

		{#if session}
			<div
				class="session-complete__stats"
				role="region"
				aria-label="Session summary"
			>
				{#if isDance}
					<div class="session-complete__stat">
						<span class="session-complete__stat-value">{itemsCompleted}</span>
						<span class="session-complete__stat-label">items</span>
					</div>
					<div
						class="session-complete__stat-sep"
						aria-hidden="true"
					></div>
					<div class="session-complete__stat">
						<span class="session-complete__stat-value"
							>{formatDuration(session.durationSeconds ?? 0, true)}</span
						>
						<span class="session-complete__stat-label">duration</span>
					</div>
				{:else}
					<div class="session-complete__stat">
						<span class="session-complete__stat-value">{totalSets}</span>
						<span class="session-complete__stat-label">sets</span>
					</div>
					<div
						class="session-complete__stat-sep"
						aria-hidden="true"
					></div>
					<div class="session-complete__stat">
						<span class="session-complete__stat-value"
							>{formatDuration(session.durationSeconds ?? 0, true)}</span
						>
						<span class="session-complete__stat-label">duration</span>
					</div>
					<div
						class="session-complete__stat-sep"
						aria-hidden="true"
					></div>
					<div class="session-complete__stat">
						<span class="session-complete__stat-value">{itemsCompleted}</span>
						<span class="session-complete__stat-label">exercises</span>
					</div>
					{#if session.totalVolume > 0}
						<div
							class="session-complete__stat-sep"
							aria-hidden="true"
						></div>
						<div class="session-complete__stat">
							<span class="session-complete__stat-value">{formatVolume(session.totalVolume)}</span>
							<span class="session-complete__stat-label">{prefsStore.weightUnit}</span>
						</div>
					{/if}
				{/if}
			</div>
		{/if}

		<div class="session-complete__actions">
			<button
				class="session-complete__btn session-complete__btn--primary"
				onclick={handleBackToToday}
			>
				Back to today
			</button>
			<button
				class="session-complete__btn session-complete__btn--secondary"
				onclick={handleSeeCalendar}
			>
				See it in calendar
			</button>
		</div>
	</div>
</BottomSheet>

<style>
	@keyframes circle-pop {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		60% {
			transform: scale(1.12);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes stat-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.session-complete {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		block-size: 100%;
		gap: var(--space-6);
		padding-inline: var(--space-8);
	}

	.session-complete__graphic {
		animation: circle-pop var(--duration-slow) var(--ease-spring) both;
	}

	.session-complete__circle {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 96px;
		block-size: 96px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		box-shadow: var(--shadow-lime);

		svg {
			inline-size: 48px;
			block-size: 48px;
			color: var(--color-accent-ink);
		}
	}

	.session-complete__text {
		text-align: center;
		animation: stat-in var(--duration-normal) var(--ease-out) 300ms both;
	}

	.session-complete__eyebrow {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-1);
	}

	.session-complete__title {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.session-complete__subtitle {
		margin-block-start: var(--space-1);
		font-size: 1rem;
		color: var(--color-text-secondary);
	}

	.session-complete__stats {
		display: flex;
		align-items: center;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding-block: var(--space-4);
		inline-size: 100%;
		animation: stat-in var(--duration-normal) var(--ease-out) 450ms both;
	}

	.session-complete__stat {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.session-complete__stat-sep {
		inline-size: 1px;
		block-size: 32px;
		background: var(--color-border);
		flex-shrink: 0;
	}

	.session-complete__stat-value {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-accent);
		line-height: 1;
	}

	.session-complete__stat-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.session-complete__actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		inline-size: 100%;
		max-inline-size: 300px;
		animation: stat-in var(--duration-normal) var(--ease-out) 550ms both;
	}

	.session-complete__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 100%;
		padding-block: var(--space-4);
		border-radius: var(--radius-full);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		min-block-size: 56px;
		transition: transform var(--duration-fast) var(--ease-out);

		&:active {
			transform: scale(0.97);
		}
	}

	.session-complete__btn--primary {
		background: var(--color-accent);
		color: var(--color-accent-ink);
		box-shadow: var(--shadow-lime);
	}

	.session-complete__btn--secondary {
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
	}
</style>
