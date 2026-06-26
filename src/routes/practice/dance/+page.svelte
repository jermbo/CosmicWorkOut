<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { BELLYDANCE_DISCIPLINE_ID, effectiveSections } from '$lib/discipline';
	import WorkoutPicker from '$lib/components/WorkoutPicker.svelte';
	import ProgramSelectSheet from '$lib/components/ProgramSelectSheet.svelte';
	import CreateProgramSheet from '$lib/components/CreateProgramSheet.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { todayIso, formatWeekdayShortDate } from '$lib/date';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import { toastStore } from '$lib/stores/toast.svelte';

	const disciplineId = BELLYDANCE_DISCIPLINE_ID;
	const todayStr = todayIso();

	let contextDate = $derived(loggingContext.date);
	let programId = $derived(
		page.url.searchParams.get('program') ?? programStore.activeProgramFor(disciplineId)?.id ?? null,
	);
	let activeProgram = $derived.by(() => {
		if (programId) return programStore.programById(programId);
		return null;
	});

	let sessionForDate = $derived.by(() => {
		if (programId) return programStore.sessionForProgramDate(programId, contextDate);
		return programStore.sessionForDisciplineDate(disciplineId, contextDate);
	});
	let suggestedRoutine = $derived.by(() => {
		if (programId) return programStore.suggestedRoutineInCurrentWeekForProgram(programId);
		return programStore.suggestedRoutineInCurrentWeekFor(disciplineId);
	});
	let weekRoutines = $derived.by(() => {
		if (programId) return programStore.routinesForCurrentWeekForProgram(programId);
		return programStore.routinesForCurrentWeekFor(disciplineId);
	});

	let selectedRoutine = $derived.by(() => {
		if (loggingContext.workoutId) {
			return programStore.getRoutineById(loggingContext.workoutId) ?? suggestedRoutine;
		}
		return suggestedRoutine;
	});

	let showSuggestedHint = $derived(selectedRoutine && suggestedRoutine && selectedRoutine.id !== suggestedRoutine.id);

	let showProgramSelect = $state(false);
	let showCreateProgram = $state(false);
	let showStartConfirm = $state(false);
	let showConflictConfirm = $state(false);
	let starting = $state(false);

	async function doStartSession() {
		const routine = selectedRoutine;
		const program = activeProgram;
		if (!routine || !program) return;

		const itemCount = effectiveSections(program, routine).reduce((n, s) => n + s.items.length, 0);
		if (itemCount === 0) {
			toastStore.error('This routine has no moves yet. Activate “Belly Dance Foundations” or add items in Programs.');
			return;
		}

		await sessionStore.start(routine, program, programStore.itemMap, { date: contextDate });
	}

	async function startSession() {
		if (sessionStore.isActive && sessionStore.activeDisciplineId !== disciplineId) {
			showConflictConfirm = true;
			return;
		}
		if (contextDate !== todayStr) {
			showStartConfirm = true;
			return;
		}
		starting = true;
		try {
			await doStartSession();
		} finally {
			starting = false;
		}
	}

	async function editSession() {
		const session = sessionForDate;
		if (!session) return;
		const routine = programStore.getRoutineForSession(session);
		const program = programStore.programs.find((p) => p.id === session.programId);
		if (!routine || !program) return;
		await sessionStore.editSession(session, routine, program, programStore.itemMap);
	}

	let sectionPreview = $derived.by(() => {
		const routine = selectedRoutine;
		const program = activeProgram;
		if (!routine || !program) return [];
		return effectiveSections(program, routine);
	});
</script>

<svelte:head>
	<title>Belly Dance — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide dance-page">
	<PageHeader title="Belly Dance" showBack backHref="/practice">
		{#snippet trailing()}
			<a href={resolve('/program?discipline=bellydance')} class="dance-page__programs-link">Program</a>
		{/snippet}
	</PageHeader>

	{#if !programStore.loaded}
		<div class="dance-page__loading" aria-busy="true">
			<div class="dance-page__spinner"></div>
		</div>
	{:else if programStore.isProgramCompleteFor(disciplineId)}
		<div class="dance-complete">
			<div class="dance-complete__icon" aria-hidden="true">✨</div>
			<h2 class="dance-complete__title">{activeProgram?.name ?? 'Program'} complete!</h2>
			<p class="dance-complete__body">You finished every practice. Time for something new.</p>
			<button class="dance-complete__cta" onclick={() => (showProgramSelect = true)}>Choose a new program</button>
		</div>
	{:else if !activeProgram}
		<div class="dance-page__no-program">
			<p>No program active.</p>
			<button class="dance-page__choose-btn" onclick={() => (showProgramSelect = true)}>Choose a program</button>
		</div>
	{:else if sessionForDate && !sessionStore.isActive}
		<div class="session-done">
			<div class="session-done__icon" aria-hidden="true">
				<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
					<polyline points="10 24 20 34 38 14" />
				</svg>
			</div>
			<div class="session-done__info">
				<p class="session-done__name">
					{programStore.getRoutineById(sessionForDate.routineId)?.name ?? 'Practice logged'}
				</p>
				<p class="session-done__meta">
					{formatDuration(sessionForDate.durationSeconds ?? 0)}
					· {formatCountWithWord(sessionForDate.items.length, 'item')}
				</p>
			</div>
			<button class="session-done__edit" onclick={editSession}>Edit</button>
		</div>
	{:else if weekRoutines.length > 0 && selectedRoutine}
		<div class="dance-page__body">
			{#if showSuggestedHint && suggestedRoutine}
				<p class="dance-page__hint">Suggested: {suggestedRoutine.name}</p>
			{/if}

			<WorkoutPicker
				workouts={weekRoutines}
				selectedId={selectedRoutine.id}
				suggestedId={suggestedRoutine?.id}
				onSelect={(id) => loggingContext.setWorkoutId(id)}
			/>

			<article class="routine-preview">
				<h2 class="routine-preview__title">{selectedRoutine.name}</h2>
				{#if selectedRoutine.focus}
					<p class="routine-preview__focus">{selectedRoutine.focus}</p>
				{/if}
				<ul class="routine-preview__sections">
					{#each sectionPreview as section (section.key)}
						<li class="routine-preview__section">
							<span class="routine-preview__section-label">{section.label}</span>
							<span class="routine-preview__section-count">{section.items.length} items</span>
						</li>
					{/each}
				</ul>
				{#if selectedRoutine.estMin}
					<p class="routine-preview__time">~{formatMinutes(selectedRoutine.estMin)}</p>
				{/if}
				<button class="routine-preview__start" onclick={startSession} disabled={starting} aria-busy={starting}>
					{#if starting}Starting…{:else}Start practice{/if}
				</button>
			</article>
		</div>
	{:else}
		<div class="dance-page__no-program">
			<p>No routine scheduled for this week.</p>
			<a href={resolve('/program?discipline=bellydance')} class="dance-page__program-link">View program</a>
		</div>
	{/if}
</div>

{#if showProgramSelect}
	<ProgramSelectSheet
		{disciplineId}
		onClose={() => (showProgramSelect = false)}
		onCreateNew={() => {
			showProgramSelect = false;
			showCreateProgram = true;
		}}
	/>
{/if}

{#if showCreateProgram}
	<CreateProgramSheet {disciplineId} onClose={() => (showCreateProgram = false)} />
{/if}

{#if showStartConfirm}
	<ConfirmDialog
		title="Log practice for {formatWeekdayShortDate(contextDate)}?"
		confirmLabel="Start practice"
		onconfirm={async () => {
			showStartConfirm = false;
			starting = true;
			try {
				await doStartSession();
			} finally {
				starting = false;
			}
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
		You have an unfinished session in another discipline. Starting this practice will discard it.
	</ConfirmDialog>
{/if}

<style>
	.dance-page__programs-link {
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
	}

	.dance-page__loading {
		display: flex;
		justify-content: center;
		padding-block: var(--space-16);
	}

	.dance-page__spinner {
		inline-size: 28px;
		block-size: 28px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-lavender);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.dance-complete {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-3);
		padding-block: var(--space-12);
	}

	.dance-complete__icon {
		font-size: 3.5rem;
	}

	.dance-complete__title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-lavender);
	}

	.dance-complete__body {
		color: var(--color-text-secondary);
	}

	.dance-complete__cta {
		margin-block-start: var(--space-2);
		padding-inline: var(--space-6);
		block-size: 52px;
		background: var(--color-lavender);
		color: #101010;
		border-radius: var(--radius-full);
		font-weight: 700;
	}

	.dance-page__no-program {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding-block: var(--space-16);
		text-align: center;
		color: var(--color-text-secondary);
	}

	.dance-page__choose-btn {
		padding-inline: var(--space-5);
		block-size: 48px;
		background: var(--color-lavender);
		color: #101010;
		border-radius: var(--radius-full);
		font-weight: 700;
	}

	.dance-page__program-link {
		color: var(--color-lavender);
		font-weight: 600;
	}

	.dance-page__hint {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		text-align: center;
	}

	.dance-page__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.routine-preview {
		padding: var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
	}

	.routine-preview__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
	}

	.routine-preview__focus {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-1);
	}

	.routine-preview__sections {
		list-style: none;
		margin-block: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.routine-preview__section {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		padding-block: var(--space-2);
		border-block-end: 1px solid var(--color-border);
	}

	.routine-preview__section-label {
		font-weight: 600;
	}

	.routine-preview__section-count {
		color: var(--color-text-secondary);
	}

	.routine-preview__time {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-4);
	}

	.routine-preview__start {
		inline-size: 100%;
		block-size: 56px;
		border-radius: var(--radius-full);
		background: var(--color-lavender);
		color: #101010;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
	}

	.session-done {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5);
		border: 1px solid color-mix(in srgb, var(--color-lavender) 35%, transparent);
		border-radius: var(--r-xl);
		background: color-mix(in srgb, var(--color-lavender) 5%, var(--color-surface-2));
	}

	.session-done__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 52px;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-lavender) 15%, transparent);
		color: var(--color-lavender);

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
		font-weight: 700;
	}

	.session-done__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: 3px;
	}

	.session-done__edit {
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-weight: 600;
	}
</style>
