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
	import { computeWorkoutNextUp } from '$lib/workoutNextUp';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import WeekStreakBadge from '$lib/components/WeekStreakBadge.svelte';
	import HomeHabitsCard from '$lib/components/HomeHabitsCard.svelte';
	import HomePracticeHubCard from '$lib/components/HomePracticeHubCard.svelte';
	import HomeActivityCard from '$lib/components/HomeActivityCard.svelte';
	import HomeHealthCard from '$lib/components/HomeHealthCard.svelte';
	import HomeBaselinesCard from '$lib/components/HomeBaselinesCard.svelte';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import type { HomeCardId } from '$lib/homeCards';

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

	let cardEnabled = $derived<Record<HomeCardId, boolean>>({
		habits: habitsEnabled,
		practice: practiceEnabled,
		activity: activityLogEnabled,
		baselines: prefsStore.baselinesEnabled,
		health: healthEnabled,
	});

	/** User-chosen order (Settings → Overview layout), minus whatever is turned off. */
	let visibleCards = $derived(prefsStore.homeCardOrder.filter((id) => cardEnabled[id]));
	let dateWeight = $derived(healthStore.weightForDate(contextDate));
	let dateLatestBp = $derived(healthStore.bloodPressureForDate(contextDate).at(-1));

	let baselinesTotal = $derived(baselineStore.activeBaselines.length);
	let baselinesDone = $derived(baselineStore.loggedCountForDate(contextDate));

	let workoutNextUp = $derived(
		computeWorkoutNextUp({
			activeProgram: programStore.activeProgram,
			contextDate,
			isLive: sessionStore.isActive,
			liveRoutineName: sessionStore.active?.routineName ?? null,
			sessionForProgram: (programId, date) => programStore.sessionForProgramDate(programId, date),
			suggestedRoutineForProgram: (programId) =>
				programStore.suggestedRoutineInCurrentWeekForProgram(programId),
		}),
	);

	let weekIndicators = $derived.by(() => {
		const indicators: Record<string, Array<'habits' | 'strength' | 'activity' | 'health'>> = {};

		function add(date: string, indicator: 'habits' | 'strength' | 'activity' | 'health') {
			if (!indicators[date]) indicators[date] = [];
			if (!indicators[date].includes(indicator)) indicators[date].push(indicator);
		}

		if (practiceEnabled) {
			for (const session of programStore.sessions) {
				add(session.date, 'strength');
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
				Habits, Activity log, Workout, Health metrics, and Baselines are each opt-in — turn on what
				you want to track.
			</p>
			<a
				class="home-empty__link"
				href={resolve('/settings')}>Choose what to track</a
			>
		</div>
	{/if}

	<div class="home-cards">
		{#each visibleCards as cardId (cardId)}
			{#if cardId === 'habits'}
				<HomeHabitsCard
					logged={habitsLogged}
					total={habitsTotal}
				/>
			{:else if cardId === 'practice'}
				<HomePracticeHubCard
					completedCount={workoutNextUp.completedCount}
					live={workoutNextUp.live}
					headline={workoutNextUp.headline}
					detail={workoutNextUp.detail}
				/>
			{:else if cardId === 'activity'}
				<HomeActivityCard activities={dateActivities} />
			{:else if cardId === 'baselines'}
				<HomeBaselinesCard
					done={baselinesDone}
					total={baselinesTotal}
				/>
			{:else if cardId === 'health'}
				<HomeHealthCard
					weight={dateWeight}
					latestBp={dateLatestBp}
				/>
			{/if}
		{/each}
	</div>
</div>

<style>
	.home-page {
		inline-size: 100%;
	}

	/* Room on the right and below for the cards' hard shadows. */
	.home-cards {
		display: flex;
		flex-direction: column;
		gap: var(--card-gap);
		padding-inline-end: var(--press-offset);
		padding-block-end: var(--press-offset);
	}

	/* Cards drop in one after another (up to 8 staggered steps). */
	.home-cards > :global(*) {
		animation: card-drop 340ms cubic-bezier(0.2, 0.9, 0.3, 1.15) both;
	}

	.home-cards > :global(:nth-child(2)) {
		animation-delay: 50ms;
	}
	.home-cards > :global(:nth-child(3)) {
		animation-delay: 100ms;
	}
	.home-cards > :global(:nth-child(4)) {
		animation-delay: 150ms;
	}
	.home-cards > :global(:nth-child(5)) {
		animation-delay: 200ms;
	}
	.home-cards > :global(:nth-child(6)) {
		animation-delay: 250ms;
	}
	.home-cards > :global(:nth-child(7)) {
		animation-delay: 300ms;
	}
	.home-cards > :global(:nth-child(n + 8)) {
		animation-delay: 350ms;
	}

	@keyframes card-drop {
		from {
			opacity: 0;
			transform: translateY(-16px);
		}
	}

	.home-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-8) var(--space-4);
		text-align: center;
		background: var(--field-empty);
		border: var(--rule) dashed var(--color-paper);
	}

	.home-empty__msg {
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1.125rem;
		font-weight: 900;
		background: var(--color-ink);
		padding: 2px var(--space-2);
	}

	.home-empty__hint {
		max-inline-size: 42ch;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		background: var(--color-ink);
		padding: var(--space-2);
	}

	.home-empty__link {
		margin-block-start: var(--space-2);
		padding: var(--space-3) var(--space-5);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	@container page (inline-size >= 520px) {
		.home-cards {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
