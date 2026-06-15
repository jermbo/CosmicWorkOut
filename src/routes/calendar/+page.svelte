<script lang="ts">
	import type { SessionLog } from '$lib/db/types';
	import { goto } from '$app/navigation';
	import { programStore } from '$lib/stores/program.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import DaySummarySheet from '$lib/components/DaySummarySheet.svelte';
	import ActivityLogSheet from '$lib/components/ActivityLogSheet.svelte';

	const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
	const MONTHS = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	let viewDate = $state(new Date());
	let selectedSession = $state<SessionLog | null>(null);
	let selectedActivityDate = $state<string | null>(null);

	const today = new Date();
	const todayStr = today.toISOString().split('T')[0];

	// Single pass over sessions — O(1) lookups for status and detail
	let sessionsByDate = $derived.by(() => {
		const map = new Map<string, SessionLog>();
		for (const s of programStore.sessions) {
			if (s.programId === programStore.activeProgram?.id) {
				map.set(s.date, s);
			}
		}
		return map;
	});

	// Derive training days-of-week from session history (0=Sun … 6=Sat).
	// Requires ≥ 2×daysPerWeek sessions to avoid noise.
	let trainingDayOfWeek = $derived.by(() => {
		const minSamples = (programStore.activeProgram?.daysPerWeek ?? 3) * 2;
		if (sessionsByDate.size < minSamples) return new Set<number>();

		const counts = new Array(7).fill(0);
		for (const s of sessionsByDate.values()) {
			const dow = new Date(s.date + 'T00:00:00').getDay();
			counts[dow]++;
		}
		const total = sessionsByDate.size;
		return new Set(counts.map((c, i) => (c / total > 0.2 ? i : -1)).filter((i) => i >= 0));
	});

	function buildCalendarDays() {
		const year = viewDate.getFullYear();
		const month = viewDate.getMonth();
		const firstDayJS = new Date(year, month, 1).getDay();
		const firstDayMon = (firstDayJS + 6) % 7;
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const cells: Array<{ date: string | null; dayNum: number | null }> = [];
		for (let i = 0; i < firstDayMon; i++) cells.push({ date: null, dayNum: null });
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			cells.push({ date: dateStr, dayNum: d });
		}
		return cells;
	}

	let calendarDays = $derived(buildCalendarDays());

	type DayStatus = 'completed' | 'today' | 'scheduled' | 'skipped' | 'future' | 'default';

	function getDayStatus(dateStr: string): DayStatus {
		if (dateStr === todayStr) return 'today';
		if (sessionsByDate.has(dateStr)) return 'completed';

		const dow = new Date(dateStr + 'T00:00:00').getDay();
		const isTrainingDay = trainingDayOfWeek.size > 0 && trainingDayOfWeek.has(dow);

		if (dateStr > todayStr) return isTrainingDay ? 'scheduled' : 'future';
		return isTrainingDay ? 'skipped' : 'default';
	}

	function getSessionForDay(dateStr: string): SessionLog | undefined {
		return sessionsByDate.get(dateStr);
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

	function handleDayTap(dateStr: string) {
		const session = getSessionForDay(dateStr);
		const hasActivity = (activityStore.activitiesByDate.get(dateStr)?.length ?? 0) > 0;
		if (session) {
			selectedSession = session;
			return;
		}
		if (hasActivity) {
			selectedActivityDate = dateStr;
			return;
		}
		if (dateStr <= todayStr) {
			loggingContext.setDate(dateStr);
			goto(`/?date=${dateStr}`);
		}
	}

	function isDayTappable(dateStr: string, status: DayStatus): boolean {
		if (status === 'completed') return true;
		if ((activityStore.activitiesByDate.get(dateStr)?.length ?? 0) > 0) return true;
		if (dateStr <= todayStr && status !== 'future') return true;
		return false;
	}

	let monthKey = $derived(
		`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`
	);

	let monthSessions = $derived(
		[...sessionsByDate.values()].filter((s) => s.date.startsWith(monthKey))
	);

	let monthVolume = $derived(monthSessions.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0));

	function formatVolume(v: number): string {
		if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
		return v > 0 ? String(v) : '—';
	}

	let isAtCurrentMonth = $derived(
		viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()
	);

	function ariaLabel(dateStr: string, status: DayStatus, dayNum: number): string {
		const base = `${MONTHS[viewDate.getMonth()]} ${dayNum}`;
		if (status === 'completed') return `${base}, workout logged — tap to view`;
		if (status === 'today') return `${base}, today — tap to log`;
		if (status === 'scheduled') return `${base}, scheduled training day`;
		if (status === 'skipped') return `${base}, missed — tap to log`;
		if (status === 'default' && dateStr <= todayStr) return `${base}, tap to log`;
		return base;
	}
</script>

<svelte:head>
	<title>Calendar — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide calendar-page">
	<header class="calendar-page__header">
		<h1 class="calendar-page__title">History</h1>
	</header>

	<!-- Stats row -->
	<div class="calendar-page__stats">
		<div class="cal-stat">
			<span class="cal-stat__value">{monthSessions.length}</span>
			<span class="cal-stat__label">Sessions</span>
		</div>
		<div class="cal-stat">
			<span class="cal-stat__value">{formatVolume(monthVolume)}</span>
			<span class="cal-stat__label">lb this month</span>
		</div>
		<div class="cal-stat">
			<span class="cal-stat__value">{programStore.weekStreak}</span>
			<span class="cal-stat__label">Wk streak</span>
		</div>
	</div>

	<!-- Calendar -->
	<div class="calendar-month">
		<div class="calendar-month__nav">
			<button class="calendar-month__nav-btn" onclick={prevMonth} aria-label="Previous month">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>

			<span class="calendar-month__label" aria-live="polite" aria-atomic="true">
				{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
			</span>

			<button
				class="calendar-month__nav-btn"
				onclick={nextMonth}
				aria-label="Next month"
				disabled={isAtCurrentMonth}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
		</div>

		<div class="calendar-month__grid" role="grid" aria-label="{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}">
			<div class="calendar-month__weekdays" role="row">
				{#each DAYS_SHORT as day}
					<div class="calendar-month__weekday" role="columnheader" aria-label={day}>{day}</div>
				{/each}
			</div>

			<div class="calendar-month__days" role="rowgroup">
				{#each calendarDays as cell}
					{#if cell.date && cell.dayNum}
						{@const status = getDayStatus(cell.date)}
						{@const tappable = isDayTappable(cell.date, status)}
						{@const hasActivity = (activityStore.activitiesByDate.get(cell.date)?.length ?? 0) > 0}
						<button
							class="calendar-day"
							class:calendar-day--completed={status === 'completed'}
							class:calendar-day--today={status === 'today'}
							class:calendar-day--scheduled={status === 'scheduled'}
							class:calendar-day--skipped={status === 'skipped'}
							class:calendar-day--future={status === 'future'}
							class:calendar-day--tappable={tappable && status !== 'completed'}
							role="gridcell"
							aria-label={ariaLabel(cell.date, status, cell.dayNum)}
							onclick={() => tappable && handleDayTap(cell.date!)}
							disabled={!tappable}
						>
							<span class="calendar-day__num" aria-hidden="true">{cell.dayNum}</span>
							<span class="calendar-day__dots" aria-hidden="true">
								<span class="calendar-day__dot"></span>
								{#if hasActivity}
									<span class="calendar-day__dot calendar-day__dot--activity"></span>
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

	<!-- Legend (only when training pattern is detected) -->
	{#if trainingDayOfWeek.size > 0}
		<div class="calendar-legend" aria-label="Legend">
			<span class="cal-legend-item cal-legend-item--completed">Completed</span>
			<span class="cal-legend-item cal-legend-item--scheduled">Scheduled</span>
			<span class="cal-legend-item cal-legend-item--skipped">Missed</span>
		</div>
	{/if}
</div>

{#if selectedSession}
	<DaySummarySheet
		session={selectedSession}
		exerciseMap={programStore.exerciseMap}
		onClose={() => (selectedSession = null)}
	/>
{/if}

{#if selectedActivityDate}
	{@const acts = activityStore.activitiesByDate.get(selectedActivityDate) ?? []}
	<div class="activity-detail-backdrop" role="presentation" onclick={() => (selectedActivityDate = null)}></div>
	<div class="activity-detail" role="dialog" aria-label="Activity details" aria-modal="true">
		<div class="activity-detail__header">
			<p class="activity-detail__title">Activities — {selectedActivityDate}</p>
			<button onclick={() => (selectedActivityDate = null)} aria-label="Close" class="activity-detail__close">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>
		{#each acts as act (act.id)}
			<div class="activity-detail__row">
				<div class="activity-detail__info">
					<span class="activity-detail__name">{act.type === 'Other' ? (act.customType || 'Other') : act.type}</span>
					<span class="activity-detail__meta">{act.durationMinutes} min · {act.intensity}</span>
				</div>
				<button
					class="activity-detail__delete"
					onclick={async () => { await activityStore.remove(act.id); if (acts.length <= 1) selectedActivityDate = null; }}
					aria-label="Delete activity"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-1 14H6L5 6" />
					</svg>
				</button>
			</div>
		{/each}
	</div>
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

	/* Stats row */
	.calendar-page__stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
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
		font-size: 1.375rem;
		font-weight: 700;
		color: var(--color-accent);
		line-height: 1;
	}

	.cal-stat__label {
		font-size: 0.625rem;
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

		svg { inline-size: 20px; block-size: 20px; }

		&:not(:disabled):hover { color: var(--color-text-primary); }
		&:disabled { opacity: 0.3; cursor: default; }
	}

	.calendar-month__label {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
	}

	.calendar-month__grid { padding: var(--space-4); }

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
		transition:
			background-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
		cursor: default;
	}

	.calendar-day--completed {
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		color: var(--color-text-primary);
		font-weight: 700;
		cursor: pointer;

		&:active { transform: scale(0.93); }
	}

	.calendar-day--today {
		border: 2px solid var(--color-accent);
		color: var(--color-text-primary);
		font-weight: 700;
	}

	.calendar-day--scheduled {
		background: color-mix(in srgb, var(--color-text-muted) 8%, transparent);
		color: var(--color-text-muted);
	}

	.calendar-day--skipped {
		color: var(--color-text-muted);
	}

	.calendar-day--future { opacity: 0.3; }
	.calendar-day--empty { pointer-events: none; }

	.calendar-day--tappable {
		cursor: pointer;

		&:active { transform: scale(0.93); }
	}

	.calendar-day--today.calendar-day--tappable {
		cursor: pointer;
	}

	.calendar-day__num { line-height: 1; }

	.calendar-day__dots {
		display: flex;
		gap: 3px;
		align-items: center;
		justify-content: center;
	}

	.calendar-day__dot {
		inline-size: 4px;
		block-size: 4px;
		border-radius: var(--radius-full);

		.calendar-day--completed & { background: var(--color-accent); }
		.calendar-day--today & { background: var(--color-accent); }
		.calendar-day--scheduled & { background: var(--color-text-muted); opacity: 0.5; }
		.calendar-day--skipped & { background: var(--color-red); opacity: 0.5; }
	}

	.calendar-day__dot--activity {
		background: var(--color-lavender) !important;
		opacity: 1 !important;
	}

	/* Activity detail popup */
	.activity-detail-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 80;
	}

	.activity-detail {
		position: fixed;
		inset-inline: var(--space-4);
		inset-block-start: 50%;
		transform: translateY(-50%);
		max-inline-size: 400px;
		margin-inline: auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--r-xl);
		padding: var(--space-5);
		z-index: 81;
		box-shadow: var(--shadow-lg);
	}

	.activity-detail__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-4);
	}

	.activity-detail__title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
	}

	.activity-detail__close {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);

		svg { inline-size: 14px; block-size: 14px; }
	}

	.activity-detail__row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-block-end: var(--space-2);

		&:last-child { margin-block-end: 0; }
	}

	.activity-detail__info {
		flex: 1;
		min-inline-size: 0;
	}

	.activity-detail__name {
		display: block;
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.activity-detail__meta {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.activity-detail__delete {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition: color var(--duration-fast) var(--ease-out);

		svg { inline-size: 14px; block-size: 14px; }
		&:hover { color: var(--color-red); }
	}

	/* Legend */
	.calendar-legend {
		display: flex;
		gap: var(--space-4);
		justify-content: center;
		margin-block-start: var(--space-4);
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

	.cal-legend-item--completed::before { background: var(--color-accent); }
	.cal-legend-item--scheduled::before { background: var(--color-text-muted); opacity: 0.5; }
	.cal-legend-item--skipped::before { background: var(--color-red); opacity: 0.5; }
</style>
