<script lang="ts">
	import type { SessionLog } from '$lib/db/types';
	import { goto } from '$app/navigation';
	import { addDays, formatWeekRange, formatWeekdayNarrow, fromIso, mondayOf, todayIso, toLocalIso } from '$lib/date';
	import { formatWeeksAgo } from '$lib/format';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';

	let {
		sessions,
		stayOnPage = false,
		showMoodDots = false,
	}: {
		sessions: SessionLog[];
		/** When true, date changes update context without navigating home. */
		stayOnPage?: boolean;
		/** Show mood-colored dots instead of workout-completion dots. */
		showMoodDots?: boolean;
	} = $props();

	const todayStr = todayIso();

	function getWeekDays(weekStartStr: string) {
		const days: { dow: string; date: number; dateStr: string; status: string }[] = [];
		const monday = fromIso(weekStartStr);

		for (let i = 0; i < 7; i++) {
			const d = new Date(monday);
			d.setDate(monday.getDate() + i);
			const dateStr = toLocalIso(d);

			let status: string;
			if (sessions.some((s) => s.date === dateStr)) {
				status = 'done';
			} else if (dateStr > todayStr) {
				status = 'future';
			} else {
				status = 'rest';
			}

			days.push({ dow: formatWeekdayNarrow(d), date: d.getDate(), dateStr, status });
		}

		return days;
	}

	let selectedDate = $derived(loggingContext.date);
	let currentWeekStart = $derived(mondayOf(todayStr));
	let viewWeekStart = $derived(mondayOf(selectedDate));
	let isCurrentWeek = $derived(viewWeekStart === currentWeekStart);

	let weekDays = $derived(getWeekDays(viewWeekStart));
	let doneDays = $derived(weekDays.filter((d) => d.status === 'done').length);

	let weekLabel = $derived(isCurrentWeek ? 'This week' : formatWeekRange(viewWeekStart));

	let weeksAgo = $derived.by(() => {
		if (isCurrentWeek) return 0;
		const start = fromIso(viewWeekStart);
		const current = fromIso(currentWeekStart);
		return Math.round((current.getTime() - start.getTime()) / (7 * 86400000));
	});

	let weekOffsetLabel = $derived(formatWeeksAgo(weeksAgo));

	let canGoNextWeek = $derived(viewWeekStart < currentWeekStart);
	let viewingPastDate = $derived(selectedDate !== todayStr);

	function dayAriaLabel(day: (typeof weekDays)[number]): string {
		const parts = [`${day.dow} ${day.date}`];
		if (day.dateStr === selectedDate) parts.push('selected');
		if (day.dateStr === todayStr) parts.push('today');
		if (day.status === 'done') parts.push('completed');
		return parts.join(', ');
	}

	function moodForDay(dateStr: string): number | null {
		if (!showMoodDots) return null;
		const moodHabit = habitStore.habits.find((h) => h.type === 'mood' && h.active);
		if (!moodHabit) return null;
		const log = habitStore.getLog(moodHabit.id, dateStr);
		return log !== undefined ? log.value : null;
	}

	function navigateToDate(dateStr: string) {
		loggingContext.setDate(dateStr);
		if (!stayOnPage) {
			goto(dateStr === todayStr ? '/' : `/?date=${dateStr}`);
		}
	}

	function handleDayTap(dateStr: string) {
		if (dateStr > todayStr) return;
		navigateToDate(dateStr);
	}

	function shiftWeek(delta: number) {
		let newDate = addDays(selectedDate, delta * 7);
		if (newDate > todayStr) newDate = todayStr;
		navigateToDate(newDate);
	}
</script>

<section class="week-strip" aria-label="{weekLabel} schedule">
	<div class="week-strip__header">
		<div class="week-strip__nav-row">
			<button type="button" class="week-strip__nav-btn" aria-label="Previous week" onclick={() => shiftWeek(-1)}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>

			<div class="week-strip__title">
				<h3 class="week-strip__label">{weekLabel}</h3>
				{#if weekOffsetLabel}
					<span class="week-strip__offset">{weekOffsetLabel}</span>
				{/if}
			</div>

			<button
				type="button"
				class="week-strip__nav-btn"
				aria-label="Next week"
				disabled={!canGoNextWeek}
				onclick={() => shiftWeek(1)}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
		</div>

		<span class="week-strip__count">
			{#if viewingPastDate}
				<button type="button" class="week-strip__back-today" onclick={() => navigateToDate(todayStr)}>
					Back to today
				</button>
			{:else}
				{doneDays} done
			{/if}
		</span>
	</div>

	<div class="week-strip__days" aria-label="Days in {weekLabel}">
		{#each weekDays as day}
			<button
				type="button"
				class="week-day"
				class:week-day--selected={day.dateStr === selectedDate}
				class:week-day--actual-today={day.dateStr === todayStr}
				class:week-day--done={day.status === 'done'}
				class:week-day--future={day.status === 'future'}
				class:week-day--tappable={day.dateStr <= todayStr}
				disabled={day.dateStr > todayStr}
				aria-label={dayAriaLabel(day)}
				aria-current={day.dateStr === selectedDate ? 'date' : undefined}
				onclick={() => handleDayTap(day.dateStr)}
			>
				<span class="week-day__dow">{day.dow}</span>
				<span class="week-day__date">{day.date}</span>
				{#if showMoodDots}
					{@const mood = moodForDay(day.dateStr)}
					<span
						class="week-day__indicator"
						class:week-day__indicator--mood-pos={mood !== null && mood > 0}
						class:week-day__indicator--mood-neg={mood !== null && mood < 0}
						class:week-day__indicator--mood-neutral={mood === 0}
						class:week-day__indicator--mood-empty={mood === null}
						aria-hidden="true"
					></span>
				{:else}
					<span class="week-day__indicator" aria-hidden="true"></span>
				{/if}
			</button>
		{/each}
	</div>

	{#if stayOnPage || viewingPastDate || !isCurrentWeek}
		<p class="week-strip__legend" class:week-strip__legend--compact={stayOnPage && isCurrentWeek && !viewingPastDate}>
			{#if viewingPastDate}
				<span class="week-strip__legend-item week-strip__legend-item--selected">Selected</span>
			{/if}
			{#if !isCurrentWeek}
				<span class="week-strip__legend-item week-strip__legend-item--current-week">This week</span>
			{:else if stayOnPage || viewingPastDate}
				<span class="week-strip__legend-item week-strip__legend-item--today">Today</span>
			{/if}
		</p>
	{/if}
</section>

<style>
	.week-strip {
		inline-size: 100%;
		margin-block-end: var(--space-4);
	}

	.week-strip__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		margin-block-end: var(--space-3);
	}

	.week-strip__nav-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-inline-size: 0;
		flex: 1;
	}

	.week-strip__nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		flex-shrink: 0;

		svg {
			inline-size: 16px;
			block-size: 16px;
		}

		&:disabled {
			opacity: 0.35;
			cursor: default;
		}

		&:not(:disabled):active {
			transform: scale(0.93);
		}
	}

	.week-strip__title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		min-inline-size: 0;
		flex: 1;
	}

	.week-strip__label {
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
		text-align: center;
		white-space: nowrap;
	}

	.week-strip__offset {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-accent);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.week-strip__count {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		flex-shrink: 0;
		padding-block-start: 6px;
	}

	.week-strip__days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: var(--space-1);
	}

	.week-day {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding-block: var(--space-2);
		border-radius: var(--radius-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.week-day--tappable:not(:disabled):active {
		transform: scale(0.95);
	}

	.week-day:disabled {
		cursor: default;
	}

	.week-day--selected {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.week-day--actual-today:not(.week-day--selected) {
		border-color: var(--color-accent);
		box-shadow: inset 0 0 0 1px var(--color-accent);
	}

	.week-day__dow {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-text-secondary);
		letter-spacing: 0.04em;

		.week-day--selected & {
			color: var(--color-accent-ink);
			opacity: 0.7;
		}

		.week-day--actual-today:not(.week-day--selected) & {
			color: var(--color-accent);
		}
	}

	.week-day__date {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1;
		color: var(--color-text-primary);

		.week-day--selected & {
			color: var(--color-accent-ink);
		}

		.week-day--future & {
			color: var(--color-text-muted);
		}
	}

	.week-day__indicator {
		inline-size: 5px;
		block-size: 5px;
		border-radius: var(--radius-full);
		background: transparent;

		.week-day--done:not(.week-day--selected) & {
			background: var(--color-accent);
		}

		.week-day--done.week-day--selected & {
			background: var(--color-accent-ink);
			opacity: 0.55;
		}

		.week-day--actual-today:not(.week-day--selected) & {
			background: var(--color-accent);
		}

		.week-day--selected.week-day--actual-today & {
			background: var(--color-accent-ink);
			opacity: 0.5;
		}
	}

	.week-strip__legend {
		display: flex;
		justify-content: center;
		gap: var(--space-4);
		margin-block-start: var(--space-2);
		min-block-size: 18px;
	}

	.week-strip__legend--compact {
		/* Keeps legend row height stable on sub-pages when viewing today */
		visibility: hidden;
	}

	.week-strip__legend-item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);

		&::before {
			content: '';
			display: block;
			inline-size: 10px;
			block-size: 10px;
			border-radius: var(--radius-sm);
			border: 1px solid var(--color-border);
		}
	}

	.week-strip__legend-item--selected::before {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.week-strip__legend-item--today::before,
	.week-strip__legend-item--current-week::before {
		background: transparent;
		border-color: var(--color-accent);
		box-shadow: inset 0 0 0 1px var(--color-accent);
	}

	.week-day__indicator--mood-pos {
		background: #4ade80;
	}
	.week-day__indicator--mood-neg {
		background: #f87171;
	}
	.week-day__indicator--mood-neutral {
		background: var(--color-text-muted);
	}
	.week-day__indicator--mood-empty {
		background: color-mix(in srgb, var(--color-border) 60%, transparent);
	}

	.week-strip__back-today {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-accent);
		white-space: nowrap;
	}
</style>
