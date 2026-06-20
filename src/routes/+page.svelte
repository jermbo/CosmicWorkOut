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
	import { flattenItems } from '$lib/discipline';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import WeekStreakBadge from '$lib/components/WeekStreakBadge.svelte';
	import HomeHabitsCard from '$lib/components/HomeHabitsCard.svelte';
	import HomeWorkoutCard from '$lib/components/HomeWorkoutCard.svelte';
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

	let sessionForDate = $derived(programStore.sessionForDate(contextDate));
	let suggestedWorkout = $derived(programStore.suggestedRoutineInCurrentWeek);
	let workoutName = $derived.by(() => {
		if (sessionForDate) {
			return programStore.getRoutineById(sessionForDate.routineId)?.name ?? 'Session logged';
		}
		return suggestedWorkout?.name ?? null;
	});
	let workoutMeta = $derived.by(() => {
		if (sessionForDate) {
			return `${formatDuration(sessionForDate.durationSeconds ?? 0)} · ${formatCountWithWord(sessionForDate.items.length, 'exercise')}`;
		}
		if (suggestedWorkout) {
			return `${formatCountWithWord(flattenItems(suggestedWorkout).length, 'exercise')} · ~${formatMinutes(suggestedWorkout.estMin ?? 0)}`;
		}
		return null;
	});
</script>

<svelte:head>
	<title>Today — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide home-page">
	<PageHeader title={isToday ? 'Today' : 'Past Day'} onDateChange={() => goto('/', { replaceState: true })}>
		{#snippet trailing()}
			<WeekStreakBadge streak={programStore.weekStreak} />
		{/snippet}
	</PageHeader>

	<div class="home-cards">
		<HomeHabitsCard logged={habitsLogged} total={habitsTotal} />
		<HomeWorkoutCard
			{workoutName}
			{workoutMeta}
			loaded={programStore.loaded}
			isProgramComplete={programStore.isProgramComplete}
			hasSession={!!sessionForDate}
			isActive={sessionStore.isActive}
		/>
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
