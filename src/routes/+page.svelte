<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import TodayWorkout from '$lib/components/TodayWorkout.svelte';
	import WorkoutPicker from '$lib/components/WorkoutPicker.svelte';
	import WeekStrip from '$lib/components/WeekStrip.svelte';

	const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const MONTHS_SHORT = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	];

	const todayStr = new Date().toISOString().split('T')[0];
	let dateInputEl: HTMLInputElement | undefined = $state();

	// Sync ?date= query param on load / navigation
	$effect(() => {
		const param = page.url.searchParams.get('date');
		if (param && param <= todayStr) {
			loggingContext.setDate(param);
		}
	});

	let contextDate = $derived(loggingContext.date);
	let isToday = $derived(contextDate === todayStr);

	let displayDate = $derived.by(() => {
		const d = new Date(contextDate + 'T00:00:00');
		return {
			dayName: DAYS_SHORT[d.getDay()],
			dateStr: `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`
		};
	});

	let sessionForDate = $derived(programStore.sessionForDate(contextDate));

	let suggestedWorkout = $derived(programStore.suggestedWorkoutInCurrentWeek);

	let selectedWorkout = $derived.by(() => {
		if (loggingContext.workoutId) {
			return programStore.getWorkoutById(loggingContext.workoutId) ?? suggestedWorkout;
		}
		return suggestedWorkout;
	});

	let showSuggestedHint = $derived(
		selectedWorkout &&
			suggestedWorkout &&
			selectedWorkout.id !== suggestedWorkout.id
	);

	let weekWorkouts = $derived(programStore.workoutsForCurrentWeek);

	function handleDateChange(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		if (value && value <= todayStr) {
			loggingContext.setDate(value);
			goto('/', { replaceState: true });
		}
	}

	function openDatePicker() {
		dateInputEl?.showPicker?.();
		dateInputEl?.click();
	}

	function goToToday() {
		loggingContext.resetToToday();
		goto('/', { replaceState: true });
	}

	async function startSession() {
		const workout = selectedWorkout;
		const program = programStore.activeProgram;
		if (!workout || !program) return;
		await sessionStore.start(workout, program, programStore.exerciseMap, {
			date: contextDate
		});
	}

	async function editSession() {
		const session = sessionForDate;
		if (!session) return;
		const workout = programStore.getWorkoutForSession(session);
		if (!workout) return;
		await sessionStore.editSession(session, workout, programStore.exerciseMap);
	}
</script>

<svelte:head>
	<title>Today — CosmicWorkOut</title>
</svelte:head>

<div class="page today-page">
	<header class="today-page__header">
		<div class="today-page__header-row">
			<div>
				<button class="today-page__date-btn" onclick={openDatePicker} aria-label="Change logging date">
					<p class="today-page__eyebrow">
						{displayDate.dayName} · {displayDate.dateStr}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</p>
				</button>
				<input
					bind:this={dateInputEl}
					type="date"
					class="today-page__date-input"
					max={todayStr}
					value={contextDate}
					onchange={handleDateChange}
					aria-label="Logging date"
				/>
				<h1 class="today-page__title">{isToday ? 'Today' : 'Log workout'}</h1>
				{#if !isToday}
					<button class="today-page__back-today" onclick={goToToday}>Back to today</button>
				{/if}
			</div>
			{#if programStore.weekStreak > 0}
				<div class="today-page__streak" aria-label="{programStore.weekStreak} week streak">
					<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
					</svg>
					<span><strong>{programStore.weekStreak}</strong> wk streak</span>
				</div>
			{/if}
		</div>
	</header>

	{#if programStore.loaded}
		<WeekStrip
			sessions={programStore.sessions.filter(
				(s) => s.programId === programStore.activeProgram?.id
			)}
		/>
	{/if}

	<div class="today-page__body">
		{#if !programStore.loaded}
			<div class="today-page__loading" aria-busy="true" aria-label="Loading workout">
				<div class="today-page__loading-spinner"></div>
			</div>
		{:else if sessionForDate}
			<div class="today-page__done" role="status">
				<div class="today-page__done-icon" aria-hidden="true">
					<svg
						viewBox="0 0 40 40"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="8 20 16 28 32 12" />
					</svg>
				</div>
				<h2 class="today-page__done-title">Workout complete</h2>
				<p class="today-page__done-subtitle">
					{programStore.getWorkoutById(sessionForDate.workoutId)?.name ?? 'Session logged'}
				</p>
				<button class="today-page__edit-btn" onclick={editSession}>Edit session</button>
			</div>
		{:else if selectedWorkout && weekWorkouts.length > 0}
			{#if showSuggestedHint && suggestedWorkout}
				<p class="today-page__suggested-hint">
					Suggested: {suggestedWorkout.name}
				</p>
			{/if}
			<WorkoutPicker
				workouts={weekWorkouts}
				selectedId={selectedWorkout.id}
				suggestedId={suggestedWorkout?.id}
				onSelect={(id) => loggingContext.setWorkoutId(id)}
			/>
			<TodayWorkout
				workout={selectedWorkout}
				exerciseMap={programStore.exerciseMap}
				onStart={startSession}
			/>
		{:else}
			<div class="today-page__empty">
				<p>No program active. Head to <a href="/program">Program</a> to get started.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.today-page__header {
		margin-block-end: var(--space-5);
	}

	.today-page__header-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.today-page__date-btn {
		display: block;
		text-align: start;
	}

	.today-page__date-input {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.today-page__eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-block-end: var(--space-1);

		svg {
			inline-size: 14px;
			block-size: 14px;
			opacity: 0.7;
		}
	}

	.today-page__back-today {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		margin-block-start: var(--space-1);
	}

	.today-page__title {
		font-family: var(--font-display);
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.today-page__streak {
		display: flex;
		align-items: center;
		gap: 5px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		padding-inline: var(--space-3);
		block-size: 32px;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		flex-shrink: 0;
		margin-block-start: var(--space-1);

		svg {
			inline-size: 14px;
			block-size: 14px;
			color: var(--color-accent);
		}

		strong {
			color: var(--color-text-primary);
		}
	}

	.today-page__suggested-hint {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		text-align: center;
		margin-block-end: var(--space-2);
	}

	.today-page__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		inline-size: 100%;
	}

	@container main (inline-size >= 900px) {
		.today-page {
			inline-size: min(100%, 860px);
		}

		.today-page {
			display: grid;
			grid-template-columns: 1fr 240px;
			grid-template-rows: auto auto 1fr;
			column-gap: var(--space-6);
			align-items: start;
		}

		.today-page__header {
			grid-column: 1 / -1;
		}

		.today-page :global(.week-strip) {
			grid-column: 2;
			grid-row: 2 / 4;
			position: sticky;
			top: var(--space-6);
			margin-block-end: 0;
		}

		.today-page__body {
			grid-column: 1;
			grid-row: 2 / 4;
		}
	}

	.today-page__loading {
		display: flex;
		justify-content: center;
		padding-block: var(--space-12);
	}

	.today-page__loading-spinner {
		inline-size: 28px;
		block-size: 28px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.today-page__done {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-12);
		text-align: center;
		animation: fade-in var(--duration-normal) var(--ease-out) both;
	}

	.today-page__done-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 64px;
		block-size: 64px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);

		svg {
			inline-size: 28px;
			block-size: 28px;
		}
	}

	.today-page__done-title {
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 700;
	}

	.today-page__done-subtitle {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}

	.today-page__edit-btn {
		margin-block-start: var(--space-2);
		padding-inline: var(--space-5);
		padding-block: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
		min-block-size: 44px;
	}

	.today-page__empty {
		padding-block: var(--space-12);
		text-align: center;
		color: var(--color-text-secondary);
		font-size: 0.9375rem;

		a {
			color: var(--color-accent);
			font-weight: 500;
		}
	}
</style>
