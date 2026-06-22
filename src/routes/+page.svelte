<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { todayIso } from '$lib/date';
	import { BELLYDANCE_DISCIPLINE_ID, STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
	import { computePracticeNextUp } from '$lib/practice';
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

	let habitsTotal = $derived(habitStore.activeHabits.length);
	let habitsLogged = $derived(habitStore.loggedCountForDate(contextDate));
	let dateActivities = $derived(activityStore.activitiesByDate.get(contextDate) ?? []);

	let liveDiscipline = $derived.by(() => {
		if (sessionStore.isActive) return sessionStore.activeDisciplineId;
		return null;
	});

	let practiceNextUp = $derived(
		computePracticeNextUp({
			activePrograms: programStore.activePrograms,
			contextDate,
			liveDisciplineId: liveDiscipline,
			liveRoutineName: sessionStore.active?.routineName ?? null,
			sessionsForProgram: (programId, date) => programStore.sessionForProgramDate(programId, date),
			suggestedRoutineForProgram: (programId) => programStore.suggestedRoutineInCurrentWeekForProgram(programId),
		}),
	);

	let weekIndicators = $derived.by(() => {
		const indicators: Record<string, Array<'habits' | 'strength' | 'dance' | 'activity'>> = {};

		function add(date: string, indicator: 'habits' | 'strength' | 'dance' | 'activity') {
			if (!indicators[date]) indicators[date] = [];
			if (!indicators[date].includes(indicator)) indicators[date].push(indicator);
		}

		for (const session of programStore.sessions) {
			let kind: 'dance' | 'strength' = 'strength';
			if (session.disciplineId === BELLYDANCE_DISCIPLINE_ID) kind = 'dance';
			add(session.date, kind);
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
	<PageHeader title="Overview" dayIndicators={weekIndicators} onDateChange={() => goto('/', { replaceState: true })}>
		{#snippet trailing()}
			<WeekStreakBadge streak={programStore.combinedWeekStreak} />
		{/snippet}
	</PageHeader>

	<div class="home-cards">
		<HomeHabitsCard logged={habitsLogged} total={habitsTotal} />
		<HomePracticeHubCard
			groupCount={practiceNextUp.groupCount}
			planCount={practiceNextUp.planCount}
			completedCount={practiceNextUp.completedCount}
			live={practiceNextUp.live}
			headline={practiceNextUp.headline}
			detail={practiceNextUp.detail}
		/>
		<HomeActivityCard activities={dateActivities} />
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
	}
</style>
