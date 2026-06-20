<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { formatLongDate, todayIso } from '$lib/date';
	import { BELLYDANCE_DISCIPLINE_ID, STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
	import { formatCountWithWord } from '$lib/format';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import WeekStreakBadge from '$lib/components/WeekStreakBadge.svelte';
	import HomeHabitsCard from '$lib/components/HomeHabitsCard.svelte';
	import HomePracticeHubCard from '$lib/components/HomePracticeHubCard.svelte';
	import HomeActivityCard from '$lib/components/HomeActivityCard.svelte';

	const todayStr = todayIso();

	$effect(() => {
		const param = page.url.searchParams.get('date');
		if (param && param <= todayStr) {
			loggingContext.setDate(param);
		}
	});

	let contextDate = $derived(loggingContext.date);
	let isToday = $derived(contextDate === todayStr);

	let habitsTotal = $derived(habitStore.activeHabits.length);
	let habitsLogged = $derived(habitStore.loggedCountForDate(contextDate));
	let dateActivities = $derived(activityStore.activitiesByDate.get(contextDate) ?? []);

	let strengthSession = $derived(programStore.sessionForDisciplineDate(STRENGTH_DISCIPLINE_ID, contextDate));
	let suggestedWorkout = $derived(programStore.suggestedRoutineInCurrentWeekFor(STRENGTH_DISCIPLINE_ID));
	let workoutName = $derived.by(() => {
		if (strengthSession) {
			return programStore.getRoutineById(strengthSession.routineId)?.name ?? 'Session logged';
		}
		return suggestedWorkout?.name ?? null;
	});

	let danceSession = $derived(programStore.sessionForDisciplineDate(BELLYDANCE_DISCIPLINE_ID, contextDate));
	let suggestedDance = $derived(programStore.suggestedRoutineInCurrentWeekFor(BELLYDANCE_DISCIPLINE_ID));
	let danceName = $derived.by(() => {
		if (danceSession) {
			return programStore.getRoutineById(danceSession.routineId)?.name ?? 'Practice logged';
		}
		return suggestedDance?.name ?? null;
	});

	let strengthActive = $derived(
		sessionStore.isActive && sessionStore.activeDisciplineId === STRENGTH_DISCIPLINE_ID,
	);
	let danceActive = $derived(
		sessionStore.isActive && sessionStore.activeDisciplineId === BELLYDANCE_DISCIPLINE_ID,
	);

	let practiceActiveCount = $derived.by(() => {
		let count = 0;
		if (programStore.activeProgramFor(STRENGTH_DISCIPLINE_ID)) count += 1;
		if (programStore.activeProgramFor(BELLYDANCE_DISCIPLINE_ID)) count += 1;
		return count;
	});

	let practiceCompletedCount = $derived([strengthSession, danceSession].filter(Boolean).length);
	let practiceLiveCount = $derived([strengthActive, danceActive].filter(Boolean).length);

	let practiceHeadline = $derived.by(() => {
		if (strengthActive && workoutName) return `Live: ${workoutName}`;
		if (danceActive && danceName) return `Live: ${danceName}`;
		if (strengthSession && workoutName) return workoutName;
		if (danceSession && danceName) return danceName;
		if (workoutName && danceName) return `${workoutName} + ${danceName}`;
		if (workoutName) return workoutName;
		if (danceName) return danceName;
		if (practiceActiveCount > 0) return 'Ready to practice';
		return 'No active programs';
	});

	let practiceDetail = $derived.by(() => {
		if (practiceLiveCount > 0) return 'Jump back into your active session.';
		if (practiceCompletedCount > 0) return `${practiceCompletedCount} practice block${practiceCompletedCount === 1 ? '' : 's'} logged for this date.`;
		if (practiceActiveCount > 0) return 'One card to review routines and jump into focused practice.';
		return 'Open Practice to choose or create a program.';
	});

	let selectedDayTitle = $derived(contextDate === todayStr ? 'Today in focus' : formatLongDate(contextDate));

	let focusItems = $derived.by(() => {
		const items: { label: string; value: string; tone?: 'muted' }[] = [];
		items.push({
			label: 'Habits',
			value: habitsTotal > 0 ? `${habitsLogged} of ${habitsTotal} logged` : 'No active habits',
			tone: habitsTotal > 0 ? undefined : 'muted',
		});
		items.push({
			label: 'Workout',
			value: strengthSession
				? workoutName ?? 'Workout logged'
				: workoutName ?? 'No workout queued',
			tone: workoutName || strengthSession ? undefined : 'muted',
		});
		if (programStore.activeProgramFor(BELLYDANCE_DISCIPLINE_ID) || danceSession) {
			items.push({
				label: 'Dance',
				value: danceSession ? danceName ?? 'Practice logged' : danceName ?? 'No dance routine queued',
				tone: danceName || danceSession ? undefined : 'muted',
			});
		}
		return items;
	});

	let progressItems = $derived.by(() => {
		const items: { label: string; value: string; tone?: 'muted' }[] = [];
		items.push({
			label: 'Habits',
			value: habitsTotal > 0 ? `${habitsLogged} of ${habitsTotal} complete` : 'Nothing to track',
			tone: habitsTotal > 0 ? undefined : 'muted',
		});
		items.push({
			label: 'Practice',
			value:
				practiceCompletedCount > 0
					? `${practiceCompletedCount} practice block${practiceCompletedCount === 1 ? '' : 's'} logged`
					: 'No practice logged yet',
			tone: practiceCompletedCount > 0 ? undefined : 'muted',
		});
		items.push({
			label: 'Activity',
			value:
				dateActivities.length > 0
					? `${formatCountWithWord(dateActivities.length, 'activity', 'activities')} logged`
					: 'No activity logged yet',
			tone: dateActivities.length > 0 ? undefined : 'muted',
		});
		return items;
	});

let weekIndicators = $derived.by(() => {
	const indicators: Record<
		string,
		Array<'habits' | 'strength' | 'dance' | 'activity'>
	> = {};

	function add(date: string, indicator: 'habits' | 'strength' | 'dance' | 'activity') {
		if (!indicators[date]) indicators[date] = [];
		if (!indicators[date].includes(indicator)) indicators[date].push(indicator);
	}

	for (const session of programStore.sessions) {
		add(session.date, session.disciplineId === BELLYDANCE_DISCIPLINE_ID ? 'dance' : 'strength');
	}

	for (const activity of activityStore.activities) {
		add(activity.date, 'activity');
	}

	const activeHabitIds = new Set(habitStore.activeHabits.map((habit) => habit.id));
	for (const log of habitStore.logs) {
		if (activeHabitIds.has(log.habitId)) add(log.date, 'habits');
	}

	return indicators;
});
</script>

<svelte:head>
	<title>Overview — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide home-page">
	<PageHeader
		title="Overview"
		dayIndicators={weekIndicators}
		onDateChange={() => goto('/', { replaceState: true })}
	>
		{#snippet trailing()}
			<WeekStreakBadge streak={programStore.combinedWeekStreak} />
		{/snippet}
	</PageHeader>

	<section class="overview-hero">
		<div>
			<p class="overview-hero__eyebrow">Overview snapshot</p>
			<h2 class="overview-hero__title">{isToday ? 'Your week at a glance' : 'Zoomed out, even when the date changes'}</h2>
			<p class="overview-hero__body">
				Keep the week in view, then dive into a focused page when you want to work on habits, practice, or activity.
			</p>
		</div>
	</section>

	<div class="home-cards">
		<HomeHabitsCard logged={habitsLogged} total={habitsTotal} />
		<HomePracticeHubCard
			activeCount={practiceActiveCount}
			completedCount={practiceCompletedCount}
			liveCount={practiceLiveCount}
			headline={practiceHeadline}
			detail={practiceDetail}
		/>
		<HomeActivityCard activities={dateActivities} />
	</div>

	<section class="selected-day">
		<div class="selected-day__header">
			<div>
				<p class="selected-day__eyebrow">Selected day</p>
				<h2 class="selected-day__title">{selectedDayTitle}</h2>
				<p class="selected-day__body">
					{isToday ? 'Balance what is planned with what is already complete.' : 'Use the selected date to review both focus and progress.'}
				</p>
			</div>
		</div>

		<div class="selected-day__grid">
			<section class="day-panel" aria-labelledby="day-focus-heading">
				<div class="day-panel__header">
					<p class="day-panel__eyebrow">Focus</p>
					<h3 class="day-panel__title" id="day-focus-heading">On deck</h3>
				</div>
				<ul class="day-panel__list" role="list">
					{#each focusItems as item}
						<li class="day-panel__item">
							<span class="day-panel__label">{item.label}</span>
							<span class:day-panel__value--muted={item.tone === 'muted'} class="day-panel__value">{item.value}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="day-panel" aria-labelledby="day-progress-heading">
				<div class="day-panel__header">
					<p class="day-panel__eyebrow">Progress</p>
					<h3 class="day-panel__title" id="day-progress-heading">Logged</h3>
				</div>
				<ul class="day-panel__list" role="list">
					{#each progressItems as item}
						<li class="day-panel__item">
							<span class="day-panel__label">{item.label}</span>
							<span class:day-panel__value--muted={item.tone === 'muted'} class="day-panel__value">{item.value}</span>
						</li>
					{/each}
				</ul>
			</section>
		</div>
	</section>
</div>

<style>
	.home-page {
		inline-size: 100%;
	}

	.overview-hero {
		padding: var(--space-4) var(--space-5);
		border-radius: var(--r-xl);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 8%, var(--color-surface-2)), var(--color-surface-2));
		border: 1px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border));
		margin-block-end: var(--space-4);
	}

	.overview-hero__eyebrow,
	.selected-day__eyebrow,
	.day-panel__eyebrow {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.overview-hero__title,
	.selected-day__title {
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-block-start: var(--space-1);
	}

	.overview-hero__body,
	.selected-day__body {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-2);
		max-inline-size: 42ch;
	}

	.home-cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-block-end: var(--space-5);
	}

	.selected-day__header {
		margin-block-end: var(--space-3);
	}

	.selected-day__grid {
		display: grid;
		gap: var(--space-3);
	}

	.day-panel {
		padding: var(--space-4) var(--space-5);
		border-radius: var(--r-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
	}

	.day-panel__header {
		margin-block-end: var(--space-3);
	}

	.day-panel__title {
		font-size: 1rem;
		font-weight: 700;
		margin-block-start: 2px;
	}

	.day-panel__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.day-panel__item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.day-panel__label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
	}

	.day-panel__value {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.day-panel__value--muted {
		color: var(--color-text-secondary);
	}

	@container page (inline-size >= 520px) {
		.home-cards {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.selected-day__grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
