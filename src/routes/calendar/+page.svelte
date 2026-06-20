<script lang="ts">
	import type { SessionLog, ActivityLog } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import {
		formatMonthDayLong,
		formatMonthYear,
		todayIso,
		toLocalIso,
		weekdayHeadersMondayFirst,
		monthCalendarCells,
		monthIsoKey,
		daysInMonth,
	} from '$lib/date';
	import { formatVolume } from '$lib/format';
	import { formatMoodValue } from '$lib/habits';
	import DaySummarySheet from '$lib/components/DaySummarySheet.svelte';
	import DayActionsSheet from '$lib/components/DayActionsSheet.svelte';
	import HabitHistorySheet from '$lib/components/HabitHistorySheet.svelte';
	import ActivityLogSheet from '$lib/components/ActivityLogSheet.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const WEEKDAY_HEADERS = weekdayHeadersMondayFirst(2);

	let viewDate = $state(new Date());
	let selectedSession = $state<SessionLog | null>(null);
	let dayActionsDate = $state<string | null>(null);
	let habitHistoryDate = $state<string | null>(null);
	let editingActivity = $state<ActivityLog | null>(null);

	const today = new Date();
	const todayStr = todayIso();

	let sessionsByDate = $derived.by(() => {
		const map = new Map<string, SessionLog>();
		for (const s of programStore.sessions) {
			map.set(s.date, s);
		}
		return map;
	});

	function buildCalendarDays() {
		return monthCalendarCells(viewDate.getFullYear(), viewDate.getMonth());
	}

	let calendarDays = $derived(buildCalendarDays());

	type DayStatus = 'today' | 'past' | 'future';

	function getDayStatus(dateStr: string): DayStatus {
		if (dateStr === todayStr) return 'today';
		if (dateStr < todayStr) return 'past';
		return 'future';
	}

	// Habit heat map: completion ratio for a date (0..1)
	function habitRatio(dateStr: string): number {
		return habitStore.completionRatioForDate(dateStr);
	}

	// Mood for a date (first mood habit log found)
	function moodForDate(dateStr: string): { label: string; value: number } | null {
		const moodHabit = habitStore.habits.find((h) => h.type === 'mood');
		if (!moodHabit) return null;
		const log = habitStore.getLog(moodHabit.id, dateStr);
		if (log === undefined) return null;
		const label = formatMoodValue(log.value);
		return label === '—' ? null : { label, value: log.value };
	}

	function prevMonth() {
		const d = new Date(viewDate);
		d.setMonth(d.getMonth() - 1);
		viewDate = d;
	}

	function nextMonth() {
		const d = new Date(viewDate);
		d.setMonth(d.getMonth() + 1);
		viewDate = d;
	}

	let dayActionsSession = $derived(dayActionsDate ? (sessionsByDate.get(dayActionsDate) ?? null) : null);

	let dayActionsHasHabits = $derived(
		dayActionsDate ? habitStore.logsForDate(dayActionsDate).length > 0 : false,
	);

	let dayActionsHasActivities = $derived(
		dayActionsDate ? (activityStore.activitiesByDate.get(dayActionsDate)?.length ?? 0) > 0 : false,
	);

	function handleDayTap(dateStr: string) {
		loggingContext.setDate(dateStr);
		dayActionsDate = dateStr;
	}

	function openSessionDetails() {
		if (!dayActionsSession) return;
		selectedSession = dayActionsSession;
		dayActionsDate = null;
	}

	function openHabitHistory() {
		habitHistoryDate = dayActionsDate;
		dayActionsDate = null;
	}

	function handleEditActivity(activity: ActivityLog) {
		editingActivity = activity;
	}

	let monthKey = $derived(monthIsoKey(viewDate));

	let monthSessions = $derived([...sessionsByDate.values()].filter((s) => s.date.startsWith(monthKey)));

	let monthActivities = $derived(activityStore.activities.filter((a) => a.date.startsWith(monthKey)));

	let monthVolume = $derived(monthSessions.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0));

	// Month habit stats
	let monthHabitDays = $derived.by(() => {
		const totalDays = daysInMonth(viewDate);
		let loggedDays = 0;
		for (let d = 1; d <= totalDays; d++) {
			const dateStr = toLocalIso(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
			if (dateStr > todayStr) break;
			if (habitStore.loggedCountForDate(dateStr) > 0) loggedDays++;
		}
		return loggedDays;
	});

	let isAtCurrentMonth = $derived(
		viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth(),
	);

	function ariaLabel(dateStr: string, status: DayStatus, dayNum: number): string {
		const base = formatMonthDayLong(viewDate, dayNum);
		if (status === 'today') return `${base}, today — tap to edit`;
		if (status === 'past') return `${base} — tap to edit`;
		return base;
	}
</script>

<svelte:head>
	<title>History — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide calendar-page">
	<header class="calendar-page__header">
		<h1 class="calendar-page__title">History</h1>
	</header>

	<!-- Stats -->
	<div class="calendar-page__stats">
		<div class="cal-stat">
			<span class="cal-stat__value">{monthSessions.length}</span>
			<span class="cal-stat__label">Workouts</span>
		</div>
		<div class="cal-stat">
			<span class="cal-stat__value">{formatVolume(monthVolume)}</span>
			<span class="cal-stat__label">lb lifted</span>
		</div>
		<div class="cal-stat">
			<span class="cal-stat__value">{monthActivities.length}</span>
			<span class="cal-stat__label">Activities</span>
		</div>
		<div class="cal-stat">
			<span class="cal-stat__value">{monthHabitDays}</span>
			<span class="cal-stat__label">Habit days</span>
		</div>
	</div>

	<!-- Calendar grid -->
	<div class="calendar-month">
		<div class="calendar-month__nav">
			<button class="calendar-month__nav-btn" onclick={prevMonth} aria-label="Previous month">
				<Icon name="chevron-left" size={20} />
			</button>

			<span class="calendar-month__label" aria-live="polite" aria-atomic="true">
				{formatMonthYear(viewDate)}
			</span>

			<button class="calendar-month__nav-btn" onclick={nextMonth} aria-label="Next month" disabled={isAtCurrentMonth}>
				<Icon name="chevron-right" size={20} />
			</button>
		</div>

		<div class="calendar-month__grid" role="grid" aria-label={formatMonthYear(viewDate)}>
			<div class="calendar-month__weekdays" role="row">
				{#each WEEKDAY_HEADERS as day}
					<div class="calendar-month__weekday" role="columnheader" aria-label={day}>{day}</div>
				{/each}
			</div>

			<div class="calendar-month__days" role="rowgroup">
				{#each calendarDays as cell}
					{#if cell.date && cell.dayNum}
						{@const status = getDayStatus(cell.date)}
						{@const hasSession = sessionsByDate.has(cell.date)}
						{@const hasActivity = (activityStore.activitiesByDate.get(cell.date)?.length ?? 0) > 0}
						{@const tappable = status !== 'future'}
						{@const ratio = status !== 'future' ? habitRatio(cell.date) : 0}
						{@const mood = status !== 'future' ? moodForDate(cell.date) : null}
						<button
							class="calendar-day"
							class:calendar-day--today={status === 'today'}
							class:calendar-day--has-session={hasSession}
							class:calendar-day--future={status === 'future'}
							style:--habit-ratio={ratio}
							role="gridcell"
							aria-label={ariaLabel(cell.date, status, cell.dayNum)}
							onclick={() => tappable && handleDayTap(cell.date!)}
							disabled={!tappable}
						>
							<span class="calendar-day__num" aria-hidden="true">{cell.dayNum}</span>
							<span class="calendar-day__dots" aria-hidden="true">
								{#if hasSession}
									<span class="calendar-day__dot calendar-day__dot--session"></span>
								{/if}
								{#if hasActivity}
									<span class="calendar-day__dot calendar-day__dot--activity"></span>
								{/if}
								{#if mood}
									<span
										class="calendar-day__dot calendar-day__dot--mood"
										class:calendar-day__dot--mood-pos={mood.value > 0}
										class:calendar-day__dot--mood-neg={mood.value < 0}
									></span>
								{/if}
							</span>
						</button>
					{:else}
						<div class="calendar-day calendar-day--empty" role="gridcell" aria-hidden="true"></div>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	<!-- Legend -->
	<div class="calendar-legend" aria-label="Legend">
		<span class="cal-legend-item cal-legend-item--session">Workout</span>
		<span class="cal-legend-item cal-legend-item--activity">Activity</span>
		<span class="cal-legend-item cal-legend-item--mood">Mood</span>
		<span class="cal-legend-item cal-legend-item--habits">Habits logged</span>
	</div>
</div>

{#if selectedSession}
	<DaySummarySheet
		session={selectedSession}
		exerciseMap={programStore.exerciseMap}
		onClose={() => (selectedSession = null)}
	/>
{/if}

{#if dayActionsDate}
	<DayActionsSheet
		date={dayActionsDate}
		session={dayActionsSession}
		hasHabits={dayActionsHasHabits}
		hasActivities={dayActionsHasActivities}
		activities={activityStore.activitiesByDate.get(dayActionsDate) ?? []}
		onClose={() => (dayActionsDate = null)}
		onViewSession={dayActionsSession ? openSessionDetails : undefined}
		onViewHabits={dayActionsHasHabits ? openHabitHistory : undefined}
		onEditActivity={handleEditActivity}
	/>
{/if}

{#if habitHistoryDate}
	<HabitHistorySheet
		date={habitHistoryDate}
		onClose={() => (habitHistoryDate = null)}
	/>
{/if}

{#if editingActivity}
	<ActivityLogSheet
		editing={editingActivity}
		onClose={() => (editingActivity = null)}
	/>
{/if}

<style>
	.calendar-page {
		container-type: inline-size;
	}

	@container page (inline-size >= 800px) {
		.calendar-page {
			display: grid;
			grid-template-columns: 1fr 300px;
			grid-template-rows: auto auto 1fr;
			column-gap: var(--space-6);
			align-items: start;
		}

		.calendar-page__header {
			grid-column: 1 / -1;
		}

		.calendar-month {
			grid-column: 1;
			grid-row: 2 / 4;
		}

		.calendar-page__stats {
			grid-column: 2;
			grid-row: 2;
			grid-template-columns: 1fr;
			gap: var(--space-3);
		}

		.cal-stat {
			flex-direction: row;
			justify-content: space-between;
			padding-inline: var(--space-4);
			padding-block: var(--space-4);
		}

		.cal-stat__value {
			font-size: 1.75rem;
		}

		.calendar-legend {
			grid-column: 2;
			grid-row: 3;
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-3);
			margin-block-start: 0;
			background: var(--color-surface-2);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-lg);
			padding: var(--space-4);
		}
	}

	.calendar-page__header {
		margin-block-end: var(--space-5);
	}

	.calendar-page__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	/* Stats */
	.calendar-page__stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.cal-stat {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding-block: var(--space-3);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
	}

	.cal-stat__value {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-accent);
		line-height: 1;
	}

	.cal-stat__label {
		font-size: 0.5625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
		text-align: center;
	}

	/* Calendar */
	.calendar-month {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		overflow: hidden;
	}

	.calendar-month__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		border-block-end: 1px solid var(--color-border);
	}

	.calendar-month__nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		transition: color var(--duration-fast) var(--ease-out);

		&:not(:disabled):hover {
			color: var(--color-text-primary);
		}
		&:disabled {
			opacity: 0.3;
			cursor: default;
		}
	}

	.calendar-month__label {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
	}

	.calendar-month__grid {
		padding: var(--space-4);
	}

	.calendar-month__weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		margin-block-end: var(--space-2);
	}

	.calendar-month__weekday {
		text-align: center;
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding-block: var(--space-1);
	}

	.calendar-month__days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--space-1);
	}

	.calendar-day {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		aspect-ratio: 1;
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);

		/* Habit heat map overlay */
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: color-mix(in srgb, var(--color-accent) calc(var(--habit-ratio, 0) * 18%), transparent);
			pointer-events: none;
			border-radius: inherit;
		}

		&:not(:disabled):active {
			transform: scale(0.93);
		}
	}

	.calendar-day--today {
		border: 2px solid var(--color-accent);
		color: var(--color-text-primary);
		font-weight: 700;
	}

	.calendar-day--has-session {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		color: var(--color-text-primary);
		font-weight: 700;
	}

	.calendar-day--future {
		opacity: 0.3;
		cursor: default;
	}

	.calendar-day--empty {
		pointer-events: none;
	}

	.calendar-day__num {
		line-height: 1;
		position: relative;
	}

	.calendar-day__dots {
		display: flex;
		gap: 3px;
		align-items: center;
		justify-content: center;
		min-block-size: 5px;
		position: relative;
	}

	.calendar-day__dot {
		inline-size: 4px;
		block-size: 4px;
		border-radius: var(--radius-full);
	}

	.calendar-day__dot--session {
		background: var(--color-accent);
	}
	.calendar-day__dot--activity {
		background: var(--color-lavender);
	}
	.calendar-day__dot--mood {
		background: var(--color-text-muted);
	}
	.calendar-day__dot--mood-pos {
		background: #4ade80;
	}
	.calendar-day__dot--mood-neg {
		background: #f87171;
	}

	/* Legend */
	.calendar-legend {
		display: flex;
		gap: var(--space-4);
		justify-content: center;
		margin-block-start: var(--space-4);
		flex-wrap: wrap;
	}

	.cal-legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;

		&::before {
			content: '';
			display: block;
			inline-size: 8px;
			block-size: 8px;
			border-radius: var(--radius-full);
		}
	}

	.cal-legend-item--session::before {
		background: var(--color-accent);
	}
	.cal-legend-item--activity::before {
		background: var(--color-lavender);
	}
	.cal-legend-item--mood::before {
		background: #4ade80;
	}
	.cal-legend-item--habits::before {
		background: color-mix(in srgb, var(--color-accent) 30%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 50%, transparent);
	}
</style>
