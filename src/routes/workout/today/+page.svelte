<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
	import { runItAgain } from '$lib/plans/actions';
	import WorkoutPicker from '$lib/components/WorkoutPicker.svelte';
	import TodayWorkout from '$lib/components/TodayWorkout.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { todayIso, formatWeekdayShortDate } from '$lib/date';
	import { formatDuration } from '$lib/format';
	import { STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
	import { redirectWhenDisabled } from '$lib/featureGate.svelte';

	redirectWhenDisabled(() => prefsStore.practiceEnabled);

	const todayStr = todayIso();

	let contextDate = $derived(loggingContext.date);

	let programId = $derived(
		page.url.searchParams.get('program') ??
			programStore.activeProgramFor(STRENGTH_DISCIPLINE_ID)?.id ??
			null,
	);
	let viewingProgram = $derived.by(() => {
		if (programId) return programStore.programById(programId);
		return null;
	});

	let sessionForDate = $derived.by(() => {
		if (programId) return programStore.sessionForProgramDate(programId, contextDate);
		return programStore.sessionForDate(contextDate);
	});
	let suggestedWorkout = $derived.by(() => {
		if (programId) return programStore.suggestedRoutineInCurrentWeekForProgram(programId);
		return programStore.suggestedRoutineInCurrentWeek;
	});
	let weekWorkouts = $derived.by(() => {
		if (programId) return programStore.routinesForCurrentWeekForProgram(programId);
		return programStore.routinesForCurrentWeek;
	});
	let isProgramComplete = $derived.by(() => {
		if (programId) return programStore.isProgramCompleteForProgram(programId);
		return programStore.isProgramComplete;
	});

	let selectedWorkout = $derived.by(() => {
		if (loggingContext.workoutId) {
			return programStore.getRoutineById(loggingContext.workoutId) ?? suggestedWorkout;
		}
		return suggestedWorkout;
	});

	let showSuggestedHint = $derived(
		selectedWorkout && suggestedWorkout && selectedWorkout.id !== suggestedWorkout.id,
	);

	// Goal hook: when the viewed program has a goal attached, prescribe this week's
	// wave targets instead of last-used prefill.
	let goalPlan = $derived.by(() => {
		if (!programId) return null;
		return goalPlanStore.planForProgram(programId) ?? null;
	});
	let prescribedTargets = $derived(
		goalPlan ? goalPlanStore.prescribedTargets(goalPlan) : undefined,
	);
	let goalContext = $derived.by(() => {
		if (!goalPlan) return null;
		const block = goalPlanStore.currentBlock(goalPlan);
		const focus = goalPlanStore.focusTarget(goalPlan);
		if (!block || !focus) return null;
		return {
			programId: goalPlan.programId,
			blockNumber: block.blockNumber,
			totalBlocks: goalPlan.blocks.length,
			blockWeek: goalPlanStore.currentBlockWeek(goalPlan),
			phase: focus.phase,
		};
	});

	let showStartConfirm = $state(false);
	let showConflictConfirm = $state(false);
	let showDeleteConfirm = $state(false);

	async function doStartSession() {
		const workout = selectedWorkout;
		const program = viewingProgram;
		if (!workout || !program) return;
		await sessionStore.start(workout, program, programStore.itemMap, {
			date: contextDate,
			prescribed: prescribedTargets,
		});
	}

	async function startSession() {
		if (sessionStore.isActive && sessionStore.activeDisciplineId !== STRENGTH_DISCIPLINE_ID) {
			showConflictConfirm = true;
			return;
		}
		if (contextDate !== todayStr) {
			showStartConfirm = true;
			return;
		}
		await doStartSession();
	}

	async function editSession() {
		const session = sessionForDate;
		if (!session) return;
		const workout = programStore.getRoutineForSession(session);
		const program = programStore.programs.find((p) => p.id === session.programId);
		if (!workout || !program) return;
		await sessionStore.editSession(session, workout, program, programStore.itemMap);
	}

	async function deleteSession() {
		showDeleteConfirm = false;
		const session = sessionForDate;
		if (!session) return;
		await programStore.deleteSession(session.id);
	}

	async function handleRunItAgain() {
		if (!viewingProgram) return;
		await runItAgain(viewingProgram);
	}
</script>

<svelte:head>
	<title>Workout — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide workout-page">
	<PageHeader
		title="Workout"
		showBack
		backHref="/workout"
	>
		{#snippet trailing()}
			{#if viewingProgram}
				<a
					href={resolve(`/workout/plan/${viewingProgram.id}`)}
					class="workout-page__programs-link">Manage plan</a
				>
			{/if}
		{/snippet}
	</PageHeader>

	{#if !programStore.loaded}
		<div
			class="workout-page__loading"
			aria-busy="true"
			aria-label="Loading workout"
		>
			<div class="workout-page__spinner"></div>
		</div>
	{:else if isProgramComplete}
		<div class="workout-complete">
			<div
				class="workout-complete__icon"
				aria-hidden="true"
			>
				🎉
			</div>
			<h2 class="workout-complete__title">
				{viewingProgram?.name ?? 'Plan'} complete!
			</h2>
			<p class="workout-complete__body">
				You finished every week. Run it again, or start something new.
			</p>
			<div class="workout-complete__actions">
				<button
					class="workout-complete__cta"
					onclick={handleRunItAgain}
				>
					Run it again
				</button>
				<a
					href={resolve('/workout/new')}
					class="workout-complete__secondary"
				>
					New plan
				</a>
			</div>
		</div>
	{:else if !viewingProgram}
		<div class="workout-page__no-program">
			<p>No plan selected.</p>
			<a
				href={resolve('/workout')}
				class="workout-page__choose-btn"
			>
				Choose a plan
			</a>
			<a
				href={resolve('/workout/new')}
				class="workout-page__goal-link">Or start a new one</a
			>
		</div>
	{:else if sessionForDate && !sessionStore.isActive}
		<div class="session-done">
			<div
				class="session-done__icon"
				aria-hidden="true"
			>
				<svg
					viewBox="0 0 48 48"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="10 24 20 34 38 14" />
				</svg>
			</div>
			<div class="session-done__info">
				<p class="session-done__name">
					{programStore.getRoutineById(sessionForDate.routineId)?.name ?? 'Session logged'}
				</p>
				<p class="session-done__meta">
					{formatDuration(sessionForDate.durationSeconds ?? 0)}
					· {sessionForDate.items.length} exercises · {sessionForDate.totalVolume}
					lb
				</p>
			</div>
			<div class="session-done__actions">
				<button
					class="session-done__edit"
					onclick={editSession}
				>
					Edit
				</button>
				<button
					class="session-done__delete"
					onclick={() => (showDeleteConfirm = true)}
				>
					Delete
				</button>
			</div>
		</div>
	{:else if weekWorkouts.length > 0 && selectedWorkout}
		<div class="workout-page__body">
			{#if showSuggestedHint && suggestedWorkout}
				<p class="workout-page__hint">Suggested: {suggestedWorkout.name}</p>
			{/if}

			<WorkoutPicker
				workouts={weekWorkouts}
				selectedId={selectedWorkout.id}
				suggestedId={suggestedWorkout?.id}
				onSelect={(id) => loggingContext.setWorkoutId(id)}
			/>

			<TodayWorkout
				workout={selectedWorkout}
				exerciseMap={programStore.itemMap}
				onStart={startSession}
				prescribed={prescribedTargets}
				{goalContext}
			/>
		</div>
	{:else}
		<div class="workout-page__no-program">
			<p>No workout scheduled for this week.</p>
			{#if viewingProgram}
				<a
					href={resolve(`/workout/plan/${viewingProgram.id}`)}
					class="workout-page__program-link">View plan</a
				>
			{/if}
		</div>
	{/if}
</div>

{#if showStartConfirm}
	<ConfirmDialog
		title="Log workout for {formatWeekdayShortDate(contextDate)}?"
		confirmLabel="Start session"
		onconfirm={async () => {
			showStartConfirm = false;
			await doStartSession();
		}}
		oncancel={() => (showStartConfirm = false)}
	>
		This session will be saved for a past date, not today.
	</ConfirmDialog>
{/if}

{#if showConflictConfirm}
	<ConfirmDialog
		title="Another session is active"
		confirmLabel="Switch anyway"
		danger
		onconfirm={async () => {
			showConflictConfirm = false;
			sessionStore.abandon();
			await startSession();
		}}
		oncancel={() => (showConflictConfirm = false)}
	>
		You have an unfinished session in another discipline. Starting this workout will discard it.
	</ConfirmDialog>
{/if}

{#if showDeleteConfirm}
	<ConfirmDialog
		title="Delete this workout?"
		confirmLabel="Delete"
		danger
		onconfirm={deleteSession}
		oncancel={() => (showDeleteConfirm = false)}
	>
		This cannot be undone.
	</ConfirmDialog>
{/if}

<style>
	.workout-page {
		inline-size: 100%;
	}

	.workout-page__programs-link {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-3);
		block-size: 34px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		white-space: nowrap;
		transition: color var(--duration-fast) var(--ease-out);

		&:hover {
			color: var(--color-accent-text);
		}
	}

	.workout-page__loading {
		display: flex;
		justify-content: center;
		padding-block: var(--space-16);
	}

	.workout-page__spinner {
		inline-size: 28px;
		block-size: 28px;
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

	.workout-complete {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-3);
		padding-block: var(--space-12);
	}

	.workout-complete__icon {
		font-size: 3.5rem;
		line-height: 1;
	}

	.workout-complete__title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-accent-text);
	}

	.workout-complete__body {
		font-size: 1rem;
		color: var(--color-text-secondary);
		max-inline-size: 28ch;
	}

	.workout-complete__actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
		margin-block-start: var(--space-2);
	}

	.workout-complete__cta {
		padding-inline: var(--space-6);
		block-size: 52px;
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border-radius: var(--radius-full);
		font-size: 1rem;
		font-weight: 700;
	}

	.workout-complete__secondary {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-6);
		block-size: 52px;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		border-radius: var(--radius-full);
		font-size: 1rem;
		font-weight: 700;
	}

	.workout-page__no-program {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding-block: var(--space-16);
		text-align: center;
		color: var(--color-text-secondary);
		font-size: 1rem;
	}

	.workout-page__choose-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding-inline: var(--space-5);
		block-size: 48px;
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border-radius: var(--radius-full);
		font-size: 0.9375rem;
		font-weight: 700;
		text-decoration: none;
	}

	.workout-page__goal-link {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-decoration: none;

		&:hover {
			color: var(--color-accent-text);
		}
	}

	.workout-page__program-link {
		color: var(--color-accent-text);
		font-weight: 600;
	}

	.workout-page__hint {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		text-align: center;
		margin-block-end: var(--space-2);
	}

	.workout-page__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.session-done {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
		border-radius: var(--r-xl);
		background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface-2));
	}

	.session-done__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		inline-size: 52px;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent-text);

		svg {
			inline-size: 28px;
			block-size: 28px;
		}
	}

	.session-done__info {
		flex: 1;
		min-inline-size: 0;
	}

	.session-done__name {
		font-size: 1.0625rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.session-done__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: 3px;
	}

	.session-done__edit {
		flex-shrink: 0;
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	.session-done__actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.session-done__delete {
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-red);
	}
</style>
