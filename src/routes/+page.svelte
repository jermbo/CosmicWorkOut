<script lang="ts">
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import TodayWorkout from '$lib/components/TodayWorkout.svelte';
	import WeekStrip from '$lib/components/WeekStrip.svelte';

	const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const MONTHS_SHORT = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	];

	const now = new Date();
	const dayName = DAYS_SHORT[now.getDay()];
	const dateStr = `${MONTHS_SHORT[now.getMonth()]} ${now.getDate()}`;

	async function startSession() {
		const workout = programStore.todaysWorkout;
		const program = programStore.activeProgram;

		if (!workout || !program) {
			return;
		}

		await sessionStore.start(workout, program, programStore.exerciseMap);
	}
</script>

<svelte:head>
	<title>Today — CosmicWorkOut</title>
</svelte:head>

<div class="today-page">
	<header class="today-page__header">
		<div class="today-page__header-row">
			<div>
				<p class="today-page__eyebrow">{dayName} · {dateStr}</p>
				<h1 class="today-page__title">Today</h1>
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

	<div class="today-page__layout">
		<div class="today-page__primary">
			<div class="today-page__body">
				{#if !programStore.loaded}
					<div class="today-page__loading" aria-busy="true" aria-label="Loading workout">
						<div class="today-page__loading-spinner"></div>
					</div>
				{:else if programStore.todaySession}
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
							{programStore.getWorkoutById(programStore.todaySession.workoutId)?.name ?? 'Session logged'}
						</p>
					</div>
				{:else if programStore.todaysWorkout}
					<TodayWorkout
						workout={programStore.todaysWorkout}
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

		{#if programStore.loaded}
			<aside class="today-page__aside">
				<WeekStrip sessions={programStore.sessions} />
			</aside>
		{/if}
	</div>
</div>

<style>
	.today-page {
		container-type: inline-size;
		padding-block-start: calc(var(--safe-top) + var(--space-6));
		padding-block-end: var(--space-8);
	}

	.today-page__header {
		padding-inline: var(--space-4);
		margin-block-end: var(--space-5);
	}

	.today-page__header-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.today-page__eyebrow {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-block-end: var(--space-1);
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

	.today-page__layout {
		display: contents;
	}

	.today-page__primary {
		display: contents;
	}

	.today-page__aside {
		display: contents;
	}

	@container main (inline-size >= 600px) {
		.today-page {
			max-inline-size: 860px;
			margin-inline: auto;
			padding-inline: var(--space-8);
		}

		.today-page__header {
			padding-inline: 0;
		}
	}

	@container main (inline-size >= 900px) {
		.today-page__layout {
			display: grid;
			grid-template-columns: 1fr 280px;
			gap: var(--space-6);
			align-items: start;
		}

		.today-page__primary {
			display: block;
		}

		.today-page__aside {
			display: block;
			position: sticky;
			top: var(--space-6);
		}
	}

	.today-page__body {
		padding-block-end: var(--space-4);
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

	.today-page__empty {
		padding-inline: var(--space-4);
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
