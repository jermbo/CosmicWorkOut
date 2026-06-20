<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { journalStore } from '$lib/stores/journal.svelte';
	import { todayIso } from '$lib/date';
	import { flattenItems, effectiveSections, BELLYDANCE_DISCIPLINE_ID, STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import WeekStreakBadge from '$lib/components/WeekStreakBadge.svelte';
	import HomeHabitsCard from '$lib/components/HomeHabitsCard.svelte';
	import HomeWorkoutCard from '$lib/components/HomeWorkoutCard.svelte';
	import HomeDanceCard from '$lib/components/HomeDanceCard.svelte';
	import HomeActivityCard from '$lib/components/HomeActivityCard.svelte';
	import HomeJournalCard from '$lib/components/HomeJournalCard.svelte';

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
	let journalEntry = $derived(journalStore.entryForDate(contextDate));

	let strengthSession = $derived(programStore.sessionForDisciplineDate(STRENGTH_DISCIPLINE_ID, contextDate));
	let suggestedWorkout = $derived(programStore.suggestedRoutineInCurrentWeekFor(STRENGTH_DISCIPLINE_ID));
	let workoutName = $derived.by(() => {
		if (strengthSession) {
			return programStore.getRoutineById(strengthSession.routineId)?.name ?? 'Session logged';
		}
		return suggestedWorkout?.name ?? null;
	});
	let workoutMeta = $derived.by(() => {
		if (strengthSession) {
			return `${formatDuration(strengthSession.durationSeconds ?? 0)} · ${formatCountWithWord(strengthSession.items.length, 'exercise')}`;
		}
		if (suggestedWorkout) {
			return `${formatCountWithWord(flattenItems(suggestedWorkout).length, 'exercise')} · ~${formatMinutes(suggestedWorkout.estMin ?? 0)}`;
		}
		return null;
	});

	let danceSession = $derived(programStore.sessionForDisciplineDate(BELLYDANCE_DISCIPLINE_ID, contextDate));
	let suggestedDance = $derived(programStore.suggestedRoutineInCurrentWeekFor(BELLYDANCE_DISCIPLINE_ID));
	let danceProgram = $derived(programStore.activeProgramFor(BELLYDANCE_DISCIPLINE_ID));
	let danceName = $derived.by(() => {
		if (danceSession) {
			return programStore.getRoutineById(danceSession.routineId)?.name ?? 'Practice logged';
		}
		return suggestedDance?.name ?? null;
	});
	let danceMeta = $derived.by(() => {
		if (danceSession) {
			return `${formatDuration(danceSession.durationSeconds ?? 0)} · ${formatCountWithWord(danceSession.items.length, 'item')}`;
		}
		if (suggestedDance && danceProgram) {
			const count = effectiveSections(danceProgram, suggestedDance).reduce((n, s) => n + s.items.length, 0);
			return `Routine ${suggestedDance.letter ?? '?'} · ${formatCountWithWord(count, 'item')} · ~${formatMinutes(suggestedDance.estMin ?? 0)}`;
		}
		return null;
	});

	let strengthActive = $derived(
		sessionStore.isActive && sessionStore.activeDisciplineId === STRENGTH_DISCIPLINE_ID,
	);
	let danceActive = $derived(
		sessionStore.isActive && sessionStore.activeDisciplineId === BELLYDANCE_DISCIPLINE_ID,
	);

let weekIndicators = $derived.by(() => {
	const indicators: Record<
		string,
		Array<'habits' | 'strength' | 'dance' | 'activity' | 'journal'>
	> = {};

	function add(date: string, indicator: 'habits' | 'strength' | 'dance' | 'activity' | 'journal') {
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

	for (const entry of journalStore.entries) {
		add(entry.date, 'journal');
	}

	return indicators;
});
</script>

<svelte:head>
	<title>Today — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide home-page">
	<PageHeader
		title={isToday ? 'Today' : 'Past Day'}
		dayIndicators={weekIndicators}
		onDateChange={() => goto('/', { replaceState: true })}
	>
		{#snippet trailing()}
			<WeekStreakBadge streak={programStore.combinedWeekStreak} />
		{/snippet}
	</PageHeader>

	<div class="home-cards">
		<HomeHabitsCard logged={habitsLogged} total={habitsTotal} />
		<HomeWorkoutCard
			workoutName={workoutName}
			workoutMeta={workoutMeta}
			loaded={programStore.loaded}
			isProgramComplete={programStore.isProgramComplete}
			hasSession={!!strengthSession}
			isActive={strengthActive}
		/>
		{#if programStore.activeProgramFor(BELLYDANCE_DISCIPLINE_ID)}
			<HomeDanceCard
				routineName={danceName}
				routineMeta={danceMeta}
				loaded={programStore.loaded}
				isProgramComplete={programStore.isProgramCompleteFor(BELLYDANCE_DISCIPLINE_ID)}
				hasSession={!!danceSession}
				isActive={danceActive}
			/>
		{/if}
		<HomeActivityCard activities={dateActivities} />
		<HomeJournalCard entry={journalEntry} />
	</div>
</div>

<style>
	.home-page {
		inline-size: 100%;
	}

	.home-cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	@container page (inline-size >= 520px) {
		.home-cards {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.home-cards :global(.home-card--journal) {
			grid-column: 1 / -1;
		}
	}
</style>
