<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { formatWeekdayShortDate, todayIso } from '$lib/date';
	import WeekStrip from '$lib/components/WeekStrip.svelte';

	type Props = {
		title: string;
		showBack?: boolean;
		backHref?: string;
		showMoodDots?: boolean;
		dayIndicators?: Record<string, Array<'habits' | 'strength' | 'dance' | 'activity' | 'health'>>;
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
	let activeSessions = $derived(programStore.sessions.filter((s) => s.programId === programStore.activeProgram?.id));

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
					<button class="page-header__back" onclick={() => goto(backHref)} aria-label="Back">
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
				<button class="page-header__date-btn" onclick={openDatePicker} aria-label="Change logging date">
					{displayDate}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
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
	<WeekStrip sessions={activeSessions} stayOnPage={showBack} {showMoodDots} {dayIndicators} />
{/if}

<style>
	.page-header {
		margin-block-end: var(--space-4);
	}

	.page-header__row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.page-header__text {
		min-inline-size: 0;
	}

	.page-header__eyebrow-row {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		color: var(--color-accent);
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
		font-size: 0.8125rem;
		font-weight: 600;
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
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.page-header__trailing {
		flex-shrink: 0;
	}
</style>
