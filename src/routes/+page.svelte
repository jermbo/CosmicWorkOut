<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { formatActivityChip } from '$lib/activities';
	import { todayIso } from '$lib/date';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import PageHeader from '$lib/components/PageHeader.svelte';

	const todayStr = todayIso();

	$effect(() => {
		const param = page.url.searchParams.get('date');
		if (param && param <= todayStr) {
			loggingContext.setDate(param);
		}
	});

	let contextDate = $derived(loggingContext.date);
	let isToday = $derived(contextDate === todayStr);

	// Habits card
	let habitsTotal = $derived(habitStore.activeHabits.length);
	let habitsLogged = $derived(habitStore.loggedCountForDate(contextDate));

	// Activity card
	let dateActivities = $derived(activityStore.activitiesByDate.get(contextDate) ?? []);

	// Workout summary
	let sessionForDate = $derived(programStore.sessionForDate(contextDate));
	let suggestedWorkout = $derived(programStore.suggestedWorkoutInCurrentWeek);
	let workoutName = $derived.by(() => {
		if (sessionForDate) {
			return programStore.getWorkoutById(sessionForDate.workoutId)?.name ?? 'Session logged';
		}
		return suggestedWorkout?.name ?? null;
	});
	let workoutMeta = $derived.by(() => {
		if (sessionForDate) {
			return `${formatDuration(sessionForDate.durationSeconds ?? 0)} · ${formatCountWithWord(sessionForDate.exercises.length, 'exercise')}`;
		}
		if (suggestedWorkout) {
			return `${formatCountWithWord(suggestedWorkout.exercises.length, 'exercise')} · ~${formatMinutes(suggestedWorkout.estMin ?? 0)}`;
		}
		return null;
	});


</script>

<svelte:head>
	<title>Today — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide home-page">
	<PageHeader
		title={isToday ? 'Today' : 'Past Day'}
		onDateChange={() => goto('/', { replaceState: true })}
	>
		{#snippet trailing()}
			{#if programStore.weekStreak > 0}
				<div class="home-page__streak" aria-label="{programStore.weekStreak} week streak">
					<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
					</svg>
					<span><strong>{programStore.weekStreak}</strong> wk streak</span>
				</div>
			{/if}
		{/snippet}
	</PageHeader>

	<div class="home-cards">
		<!-- Habits card -->
		<a
			href="/habits"
			class="home-card home-card--habits"
			aria-label="Habits: {habitsTotal === 0 ? 'Add habits' : `${habitsLogged} of ${habitsTotal} logged`}"
		>
			<div class="home-card__header">
				<h2 class="home-card__title">Habits</h2>
				<svg
					class="home-card__chevron"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</div>
			{#if habitsTotal === 0}
				<p class="home-card__empty">Add habits in Settings to get started.</p>
			{:else}
				<div class="home-card__habits-summary">
					<span class="home-card__habits-count">{habitsLogged}</span>
					<span class="home-card__habits-sep">/</span>
					<span class="home-card__habits-total">{habitsTotal}</span>
					<span class="home-card__habits-label">habits logged</span>
				</div>
				{#if habitsLogged === habitsTotal && habitsTotal > 0}
					<p class="home-card__done-note">All done today!</p>
				{/if}
			{/if}
		</a>

		<!-- Workout card — compact summary, taps through to /workout -->
		<a
			href="/workout"
			class="home-card home-card--workout"
			class:home-card--done={!!sessionForDate}
			class:home-card--active={sessionStore.isActive}
			aria-label="Workout{workoutName ? ': ' + workoutName : ''}"
		>
			<div class="home-card__header">
				<h2 class="home-card__title">Workout</h2>
				<div class="home-card__badges">
					{#if sessionStore.isActive}
						<span class="home-card__badge home-card__badge--live">Live</span>
					{:else if sessionForDate}
						<span class="home-card__badge home-card__badge--done">Done</span>
					{/if}
					<svg
						class="home-card__chevron"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</div>
			</div>

			{#if !programStore.loaded}
				<div class="home-card__loading" aria-busy="true">
					<div class="home-card__spinner"></div>
				</div>
			{:else if programStore.isProgramComplete}
				<p class="home-card__workout-name">Program complete!</p>
				<p class="home-card__workout-meta">Time for something new.</p>
			{:else if workoutName}
				<p class="home-card__workout-name">{workoutName}</p>
				{#if workoutMeta}
					<p class="home-card__workout-meta">{workoutMeta}</p>
				{/if}
			{:else}
				<p class="home-card__empty">No program active.</p>
			{/if}
		</a>

		<!-- Activity / Log card -->
		<a
			href="/log"
			class="home-card home-card--log"
			aria-label="Activity log: {dateActivities.length === 0
				? 'No activities yet'
				: `${dateActivities.length} ${dateActivities.length === 1 ? 'activity' : 'activities'} logged`}"
		>
			<div class="home-card__header">
				<h2 class="home-card__title">Activity</h2>
				<svg
					class="home-card__chevron"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</div>
			{#if dateActivities.length === 0}
				<p class="home-card__empty-note">No activities yet.</p>
			{:else}
				<p class="home-card__log-summary">
					{formatCountWithWord(dateActivities.length, 'activity', 'activities')} logged
				</p>
				<div class="home-card__activity-chips">
					{#each dateActivities.slice(0, 3) as activity (activity.id)}
						<span class="home-card__activity-chip">
							{formatActivityChip(activity)}
						</span>
					{/each}
					{#if dateActivities.length > 3}
						<span class="home-card__activity-chip home-card__activity-chip--more">
							+{dateActivities.length - 3} more
						</span>
					{/if}
				</div>
			{/if}
		</a>

		<!-- Journal card — coming soon -->
		<div class="home-card home-card--journal home-card--coming-soon" aria-label="Journal — coming soon">
			<div class="home-card__header">
				<h2 class="home-card__title">Journal</h2>
				<span class="home-card__soon-badge">Coming soon</span>
			</div>
			<p class="home-card__empty-note">Reflect on your day. Coming in a future update.</p>
		</div>
	</div>
</div>

<style>
	.home-page {
		inline-size: 100%;
	}

	.home-page__streak {
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

	/* Cards layout */
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

		.home-card--journal {
			grid-column: 1 / -1;
		}
	}

	.home-card {
		display: block;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-4) var(--space-5);
		text-decoration: none;
		color: inherit;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:is(a):hover {
			border-color: var(--color-accent);
		}
	}

	.home-card--done {
		border-color: color-mix(in srgb, var(--color-accent) 35%, transparent);
		background: color-mix(in srgb, var(--color-accent) 4%, var(--color-surface-2));
	}

	.home-card--active {
		border-color: color-mix(in srgb, var(--color-accent) 60%, transparent);
		background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-2));
	}

	.home-card--coming-soon {
		opacity: 0.6;
	}

	.home-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-3);
	}

	.home-card__title {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.home-card__chevron {
		inline-size: 18px;
		block-size: 18px;
		color: var(--color-text-muted);
	}

	.home-card__badges {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.home-card__badge {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border-radius: var(--radius-full);
		padding-inline: var(--space-2);
		padding-block: 2px;
	}

	.home-card__badge--done {
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
	}

	.home-card__badge--live {
		background: color-mix(in srgb, #ef4444 15%, transparent);
		color: #ef4444;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	.home-card__soon-badge {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		padding-inline: var(--space-2);
		padding-block: 2px;
	}

	/* Habits card */
	.home-card__habits-summary {
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
	}

	.home-card__habits-count {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-accent);
		line-height: 1;
	}

	.home-card__habits-sep {
		font-size: 1.25rem;
		color: var(--color-text-muted);
	}

	.home-card__habits-total {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	.home-card__habits-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-inline-start: var(--space-1);
	}

	.home-card__done-note {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		margin-block-start: var(--space-1);
	}

	/* Workout card */
	.home-card__workout-name {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1.2;
	}

	.home-card__workout-meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-1);
	}

	/* Loading */
	.home-card__loading {
		display: flex;
		justify-content: center;
		padding-block: var(--space-4);
	}

	.home-card__spinner {
		inline-size: 22px;
		block-size: 22px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Empty states */
	.home-card__empty {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}

	.home-card__empty-note {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	/* Activity card */
	.home-card__log-summary {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-block-end: var(--space-2);
	}

	.home-card__activity-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.home-card__activity-chip {
		padding-inline: var(--space-2);
		block-size: 28px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-3));
		border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
	}

	.home-card__activity-chip--more {
		background: var(--color-surface-3);
		border-color: var(--color-border);
	}
</style>
