<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic backHref uses resolveHref() */
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveHref } from '$lib/navigation';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { formatWeekdayShortDate, todayIso } from '$lib/date';
	import WeekStrip from '$lib/components/WeekStrip.svelte';

	type Props = {
		title: string;
		showBack?: boolean;
		backHref?: string;
		showMoodDots?: boolean;
		dayIndicators?: Record<string, Array<'habits' | 'strength' | 'activity' | 'health'>>;
		onDateChange?: (date: string) => void;
		trailing?: Snippet;
	};

	let {
		title,
		showBack = false,
		backHref = '/',
		showMoodDots = false,
		dayIndicators = {},
		onDateChange,
		trailing,
	}: Props = $props();

	const todayStr = todayIso();

	let dateInputEl: HTMLInputElement | undefined = $state();

	let contextDate = $derived(loggingContext.date);
	let displayDate = $derived(formatWeekdayShortDate(contextDate, ' · '));
	// Feeds the week strip's "done" pips — empty while Workout is off so other pages
	// don't show session marks for a hidden feature.
	let activeSessions = $derived(
		prefsStore.practiceEnabled
			? programStore.sessions.filter((s) => s.programId === programStore.activeProgram?.id)
			: [],
	);

	function openDatePicker() {
		dateInputEl?.showPicker?.();
		dateInputEl?.click();
	}

	function handleDateChange(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		if (value && value <= todayStr) {
			loggingContext.setDate(value);
			onDateChange?.(value);
		}
	}
</script>

<header class="page-header">
	<div class="page-header__row">
		<div class="page-header__text">
			<div class="page-header__eyebrow-row">
				{#if showBack}
					<button
						class="page-header__back"
						onclick={() => goto(resolveHref(backHref))}
						aria-label="Back"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
				{/if}
				<button
					class="page-header__date-btn"
					onclick={openDatePicker}
					aria-label="Change logging date"
				>
					{displayDate}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
			</div>
			<input
				bind:this={dateInputEl}
				type="date"
				class="page-header__date-input"
				max={todayStr}
				value={contextDate}
				onchange={handleDateChange}
				aria-label="Logging date"
			/>
			<h1 class="page-header__title">{title}</h1>
		</div>

		{#if trailing}
			<div class="page-header__trailing">
				{@render trailing()}
			</div>
		{/if}
	</div>
</header>

{#if programStore.loaded}
	<WeekStrip
		sessions={activeSessions}
		stayOnPage={showBack}
		{showMoodDots}
		{dayIndicators}
	/>
{/if}

<style>
	/* Big caps title on a 3px paper rule (v1.12.0). */
	.page-header {
		margin-block-end: var(--space-4);
		padding-block-end: var(--space-2);
		border-block-end: var(--rule) solid var(--color-paper);
	}

	/* Date line + trailing on top, full-width title below. */
	.page-header__row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		column-gap: var(--space-3);
	}

	.page-header__text {
		display: contents;
	}

	.page-header__eyebrow-row {
		grid-column: 1;
		grid-row: 1;
	}

	.page-header__eyebrow-row {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 2px;
		color: var(--color-text-muted);
	}

	.page-header__back {
		display: flex;
		align-items: center;
		color: inherit;

		svg {
			inline-size: 14px;
			block-size: 14px;
		}
	}

	.page-header__date-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		color: inherit;
		text-transform: uppercase;
		letter-spacing: 0.06em;

		svg {
			inline-size: 14px;
			block-size: 14px;
			opacity: 0.7;
		}
	}

	.page-header__date-input {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.page-header__title {
		font-family: var(--font-display);
		text-transform: uppercase;
		grid-column: 1 / -1;
		grid-row: 2;
		margin-block-start: var(--space-2);
		font-size: clamp(1.75rem, 11cqi, 2.75rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.04em;
		overflow-wrap: anywhere;
		animation: title-in 320ms cubic-bezier(0.2, 0.9, 0.3, 1) both;
	}

	/* The title slides in from the left as the page arrives. */
	@keyframes title-in {
		from {
			opacity: 0;
			transform: translateX(-24px);
		}
	}

	.page-header__trailing {
		grid-column: 2;
		grid-row: 1;
	}
</style>
