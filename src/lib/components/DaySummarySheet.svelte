<script lang="ts">
	import type { SessionLog, Exercise } from '$lib/db/types';
	import { formatWeekdayShortDate } from '$lib/date';
	import { formatDuration, formatVolume, formatCountWithWord } from '$lib/format';
	import { formatHabitLogValue } from '$lib/habits';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';

	let {
		session,
		exerciseMap,
		onClose,
		onEdit,
		onDelete,
	}: {
		session: SessionLog;
		exerciseMap: Map<string, Exercise>;
		onClose: () => void;
		onEdit?: () => void;
		onDelete?: () => void;
	} = $props();

	let habitLogsForDay = $derived(habitStore.logsForDate(session.date));

	let habitEntries = $derived.by(() => {
		return habitLogsForDay
			.map((log) => {
				const habit = habitStore.habits.find((h) => h.id === log.habitId);
				if (!habit) return null;
				return { name: habit.name, valueStr: formatHabitLogValue(habit, log.value) };
			})
			.filter((e): e is { name: string; valueStr: string } => e !== null);
	});

	let showDeleteConfirm = $state(false);

	let workoutName = $derived(
		programStore.getWorkoutForSession(session)?.name ??
			programStore.getWorkoutById(session.workoutId)?.name ??
			'Workout',
	);

	async function handleEdit() {
		const workout = programStore.getWorkoutForSession(session);
		if (!workout) return;
		await sessionStore.editSession(session, workout, exerciseMap);
		onEdit?.();
		onClose();
	}

	async function handleDeleteConfirm() {
		await programStore.deleteSession(session.id);
		onDelete?.();
		onClose();
	}
</script>

<BottomSheet onclose={onClose}>
	<div class="day-summary">
		<div class="day-summary__date-badge">
			{formatWeekdayShortDate(session.date, ' · ')}
		</div>

		<h2 class="day-summary__workout-name">{workoutName}</h2>

		<div class="day-summary__stats">
			<div class="day-summary__stat">
				<span class="day-summary__stat-value">{formatDuration(session.durationSeconds ?? 0)}</span>
				<span class="day-summary__stat-label">Duration</span>
			</div>
			<div class="day-summary__stat-sep" aria-hidden="true"></div>
			<div class="day-summary__stat">
				<span class="day-summary__stat-value">{session.exercises.length}</span>
				<span class="day-summary__stat-label">Exercises</span>
			</div>
			<div class="day-summary__stat-sep" aria-hidden="true"></div>
			<div class="day-summary__stat">
				<span class="day-summary__stat-value">{formatVolume(session.totalVolume, 'zero')}</span>
				<span class="day-summary__stat-label">lb lifted</span>
			</div>
		</div>

		<div class="day-summary__exercises">
			{#each session.exercises as loggedEx (loggedEx.exerciseId)}
				{@const exercise = exerciseMap.get(loggedEx.exerciseId)}
				{#if exercise}
					<div class="day-summary__exercise">
						<div class="day-summary__exercise-header">
							<span class="day-summary__exercise-name">{exercise.name}</span>
							<span class="day-summary__exercise-sets">{formatCountWithWord(loggedEx.sets.length, 'set')}</span>
						</div>
						{#if loggedEx.sets.length > 0}
							<p class="day-summary__exercise-top">
								{#if typeof loggedEx.sets[0].weight === 'number' && loggedEx.sets[0].weight > 0}
									Top: {Math.max(
										...loggedEx.sets.filter((s) => typeof s.weight === 'number').map((s) => s.weight as number),
									)} lb
								{:else if typeof loggedEx.sets[0].weight === 'string'}
									{loggedEx.sets[0].weight}
								{:else}
									{loggedEx.sets[0].reps} reps
								{/if}
							</p>
						{/if}
					</div>
				{/if}
			{/each}
		</div>

		{#if habitEntries.length > 0}
			<div class="day-summary__habits">
				<p class="day-summary__habits-title">Habits</p>
				{#each habitEntries as entry}
					<div class="day-summary__habit-row">
						<span class="day-summary__habit-name">{entry.name}</span>
						<span class="day-summary__habit-value">{entry.valueStr}</span>
					</div>
				{/each}
			</div>
		{/if}

		<div class="day-summary__actions">
			<button class="day-summary__edit-btn" onclick={handleEdit}>Edit session</button>
			<button class="day-summary__delete-btn" onclick={() => (showDeleteConfirm = true)}> Delete </button>
		</div>
	</div>

{#if showDeleteConfirm}
	<ConfirmDialog
		title="Delete this session?"
		confirmLabel="Delete"
		danger
		onconfirm={handleDeleteConfirm}
		oncancel={() => (showDeleteConfirm = false)}
	>
		This cannot be undone.
	</ConfirmDialog>
{/if}
</BottomSheet>

<style>
	.day-summary {
		padding-inline: var(--space-5);
		padding-block-start: var(--space-2);
		padding-block-end: var(--space-4);
	}

	.day-summary__date-badge {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-3);
		block-size: 28px;
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		margin-block-end: var(--space-2);
	}

	.day-summary__workout-name {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-4);
	}

	.day-summary__stats {
		display: flex;
		align-items: center;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding-block: var(--space-4);
		margin-block-end: var(--space-5);
	}

	.day-summary__stat {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.day-summary__stat-sep {
		inline-size: 1px;
		block-size: 32px;
		background: var(--color-border);
		flex-shrink: 0;
	}

	.day-summary__stat-value {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-accent);
	}

	.day-summary__stat-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.day-summary__exercises {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin-block-end: var(--space-5);
	}

	.day-summary__exercise {
		padding-block: var(--space-3);
		border-block-end: 1px dashed var(--color-border);

		&:last-child {
			border-block-end: none;
		}
	}

	.day-summary__exercise-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.day-summary__exercise-name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.day-summary__exercise-sets {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.day-summary__exercise-top {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.day-summary__habits {
		margin-block-end: var(--space-5);
	}

	.day-summary__habits-title {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-block-end: var(--space-2);
	}

	.day-summary__habit-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: var(--space-2);
		border-block-end: 1px dashed var(--color-border);

		&:last-child {
			border-block-end: none;
		}
	}

	.day-summary__habit-name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.day-summary__habit-value {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.day-summary__actions {
		display: flex;
		gap: var(--space-2);
	}

	.day-summary__edit-btn,
	.day-summary__delete-btn {
		flex: 1;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;
		min-block-size: 48px;
	}

	.day-summary__edit-btn {
		background: var(--color-accent);
		color: #101010;
	}

	.day-summary__delete-btn {
		background: var(--color-surface-3);
		color: var(--color-red);
		border: 1px solid var(--color-border);
	}
</style>
