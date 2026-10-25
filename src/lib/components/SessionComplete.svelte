<script lang="ts">
	import { formatDuration, formatVolume } from '$lib/format';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { onMount } from 'svelte';
	import { feedback } from '$lib/feedback';
	import BottomSheet from './BottomSheet.svelte';
	import CountUp from './CountUp.svelte';

	function handleBackToToday() {
		sessionStore.dismissComplete();
	}

	let session = $derived(sessionStore.completedSession);
	let totalSets = $derived(session?.items.reduce((sum, ex) => sum + ex.sets.length, 0) ?? 0);
	let itemsCompleted = $derived(session?.items.length ?? 0);

	onMount(() => feedback('win'));

	/** One bar per domain field, swept across the screen in turn. */
	const BURST = ['train', 'habit', 'base', 'health', 'active'] as const;
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
			class="session-complete__burst"
			aria-hidden="true"
		>
			{#each BURST as field, i (field)}
				<span
					class="session-complete__bar"
					style:--bar="var(--field-{field})"
					style:--i={i}
				></span>
			{/each}
		</div>
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
				<div class="session-complete__stat">
					<span class="session-complete__stat-value"
						><CountUp
							value={totalSets}
							delay={500}
						/></span
					>
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
					<span class="session-complete__stat-value"
						><CountUp
							value={itemsCompleted}
							delay={600}
						/></span
					>
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
			</div>
		{/if}

		<div class="session-complete__actions">
			<button
				class="session-complete__btn session-complete__btn--primary"
				onclick={handleBackToToday}
			>
				Back to today
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

	/*
	 * The win: five domain-colored bars slam across the screen one after another,
	 * then pull away to reveal the stamp and the tally.
	 */
	.session-complete__burst {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: repeat(5, 1fr);
		pointer-events: none;
		z-index: 2;
	}

	.session-complete__bar {
		background: var(--bar);
		border-block-end: var(--rule) solid var(--color-ink);
		transform-origin: left;
		transform: scaleX(0);
		animation: bar-sweep 900ms cubic-bezier(0.7, 0, 0.2, 1) both;
		animation-delay: calc(var(--i) * 50ms);
	}

	@keyframes bar-sweep {
		0% {
			transform: scaleX(0);
			transform-origin: left;
		}
		45% {
			transform: scaleX(1);
			transform-origin: left;
		}
		55% {
			transform: scaleX(1);
			transform-origin: right;
		}
		100% {
			transform: scaleX(0);
			transform-origin: right;
		}
	}

	.session-complete {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		block-size: 100%;
		gap: var(--space-6);
		padding-inline: var(--space-8);
	}

	.session-complete__graphic {
		animation: circle-pop 420ms cubic-bezier(0.2, 0.9, 0.3, 1.3) 650ms both;
	}

	.session-complete__circle {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 96px;
		block-size: 96px;
		background: var(--color-accent);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
		transform: rotate(-4deg);

		svg {
			inline-size: 48px;
			block-size: 48px;
			color: var(--color-accent-ink);
		}
	}

	.session-complete__text {
		text-align: center;
		animation: stat-in var(--duration-normal) var(--ease-out) 750ms both;
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
		text-transform: uppercase;
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
		background: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
		border-radius: var(--r-xl);
		padding-block: var(--space-4);
		inline-size: 100%;
		animation: stat-in var(--duration-normal) var(--ease-out) 850ms both;
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
		text-transform: uppercase;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-accent-text);
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
		animation: stat-in var(--duration-normal) var(--ease-out) 950ms both;
	}

	.session-complete__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 100%;
		padding-block: var(--space-4);
		border-radius: var(--radius-full);
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1rem;
		font-weight: 700;
		min-block-size: 56px;
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.session-complete__btn--primary {
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;
	}
</style>
