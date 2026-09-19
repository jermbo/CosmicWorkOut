<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { healthStore } from '$lib/stores/health.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { todayIso } from '$lib/date';
	import { BELLYDANCE_DISCIPLINE_ID } from '$lib/discipline';
	import { computePracticeNextUp } from '$lib/practice';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import WeekStreakBadge from '$lib/components/WeekStreakBadge.svelte';
	import HomeHabitsCard from '$lib/components/HomeHabitsCard.svelte';
	import HomePracticeHubCard from '$lib/components/HomePracticeHubCard.svelte';
	import HomeActivityCard from '$lib/components/HomeActivityCard.svelte';
	import HomeHealthCard from '$lib/components/HomeHealthCard.svelte';
	import HomeBaselinesCard from '$lib/components/HomeBaselinesCard.svelte';
	import { baselineStore } from '$lib/stores/baselines.svelte';

	const todayStr = todayIso();

	$effect(() => {
		const param = page.url.searchParams.get('date');
		if (param && param <= todayStr) {
			loggingContext.setDate(param);
		}
	});

	let contextDate = $derived(loggingContext.date);

	let habitsTotal = $derived(habitStore.trackableHabits.length);
	let habitsLogged = $derived(habitStore.loggedCountForDate(contextDate));
	let dateActivities = $derived(activityStore.activitiesByDate.get(contextDate) ?? []);

	let habitsEnabled = $derived(prefsStore.habitsEnabled);
	let activityLogEnabled = $derived(prefsStore.activityLogEnabled);
	let practiceEnabled = $derived(prefsStore.practiceEnabled);
	let healthEnabled = $derived(prefsStore.healthMetricsEnabled);
	let dateWeight = $derived(healthStore.weightForDate(contextDate));
	let dateLatestBp = $derived(healthStore.bloodPressureForDate(contextDate).at(-1));

	let baselinesEnabled = $derived(prefsStore.baselinesEnabled);
	let baselinesTotal = $derived(baselineStore.activeBaselines.length);
	let baselinesCleared = $derived(baselineStore.clearedCountForDate(contextDate));

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
			suggestedRoutineForProgram: (programId) =>
				programStore.suggestedRoutineInCurrentWeekForProgram(programId),
		}),
	);

	let weekIndicators = $derived.by(() => {
		const indicators: Record<
			string,
			Array<'habits' | 'strength' | 'dance' | 'activity' | 'health'>
		> = {};

		function add(date: string, indicator: 'habits' | 'strength' | 'dance' | 'activity' | 'health') {
			if (!indicators[date]) indicators[date] = [];
			if (!indicators[date].includes(indicator)) indicators[date].push(indicator);
		}

		if (practiceEnabled) {
			for (const session of programStore.sessions) {
				let kind: 'dance' | 'strength' = 'strength';
				if (session.disciplineId === BELLYDANCE_DISCIPLINE_ID) kind = 'dance';
				add(session.date, kind);
			}
		}

		if (activityLogEnabled) {
			for (const activity of activityStore.activities) {
				add(activity.date, 'activity');
			}
		}

		if (habitsEnabled) {
			const activeHabitIds = new Set(habitStore.trackableHabits.map((habit) => habit.id));
			for (const log of habitStore.logs) {
				if (activeHabitIds.has(log.habitId)) add(log.date, 'habits');
			}
		}

		if (healthEnabled) {
			for (const reading of healthStore.readings) {
				add(reading.date, 'health');
			}
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
		onDateChange={() => goto(resolve('/'), { replaceState: true })}
	>
		{#snippet trailing()}
			{#if practiceEnabled}
				<WeekStreakBadge streak={programStore.combinedWeekStreak} />
			{/if}
		{/snippet}
	</PageHeader>

	{#if !prefsStore.anyTrackingEnabled}
		<div class="home-empty">
			<p class="home-empty__msg">Nothing is being tracked yet.</p>
			<p class="home-empty__hint">
				Habits, Activity log, Practice, Health metrics, and Baselines are each opt-in — turn on what
				you want to track.
			</p>
			<a
				class="home-empty__link"
				href={resolve('/settings')}>Choose what to track</a
			>
		</div>
	{/if}

	<div class="home-cards">
		{#if habitsEnabled}
			<HomeHabitsCard
				logged={habitsLogged}
				total={habitsTotal}
			/>
		{/if}
		{#if practiceEnabled}
			<HomePracticeHubCard
				completedCount={practiceNextUp.completedCount}
				live={practiceNextUp.live}
				headline={practiceNextUp.headline}
				detail={practiceNextUp.detail}
			/>
		{/if}
		{#if activityLogEnabled}
			<HomeActivityCard activities={dateActivities} />
		{/if}
		{#if baselinesEnabled}
			<HomeBaselinesCard
				cleared={baselinesCleared}
				total={baselinesTotal}
			/>
		{/if}
		{#if healthEnabled}
			<HomeHealthCard
				weight={dateWeight}
				latestBp={dateLatestBp}
			/>
		{/if}
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

	.home-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-8) var(--space-4);
		text-align: center;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
	}

	.home-empty__msg {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
	}

	.home-empty__hint {
		max-inline-size: 42ch;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.home-empty__link {
		margin-block-start: var(--space-2);
		padding: var(--space-3) var(--space-5);
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	@container page (inline-size >= 520px) {
		.home-cards {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
