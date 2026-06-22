<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Session, ActivityLog } from '$lib/db/types';
	import { formatLongDate } from '$lib/date';
	import { formatDuration } from '$lib/format';
	import { programStore } from '$lib/stores/program.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import DayActionItem from './DayActionItem.svelte';
	import DayActionsActivityList from './DayActionsActivityList.svelte';
	import DayActionsWorkoutSummary from './DayActionsWorkoutSummary.svelte';

	type Props = {
		date: string;
		strengthSession?: Session | null;
		danceSession?: Session | null;
		hasHabits?: boolean;
		hasActivities?: boolean;
		activities?: ActivityLog[];
		onClose: () => void;
		onViewStrengthSession?: () => void;
		onViewDanceSession?: () => void;
		onViewHabits?: () => void;
		onEditActivity?: (activity: ActivityLog) => void;
	};

	let {
		date,
		strengthSession = null,
		danceSession = null,
		hasHabits = false,
		hasActivities = false,
		activities = [],
		onClose,
		onViewStrengthSession,
		onViewDanceSession,
		onViewHabits,
		onEditActivity,
	}: Props = $props();

	function routineName(session: Session): string {
		return (
			programStore.getRoutineForSession(session)?.name ??
			programStore.getRoutineById(session.routineId)?.name ??
			'Session'
		);
	}

	function navigate(path: string) {
		onClose();
		goto(path);
	}

	function durationLabelFor(session: Session): string | null {
		if (session.durationSeconds) return formatDuration(session.durationSeconds);
		return null;
	}

	let habitsActionLabel = $derived.by(() => {
		if (hasHabits) return 'Edit habits';
		return 'Log habits';
	});

	let strengthActionLabel = $derived.by(() => {
		if (strengthSession) return 'Edit strength session';
		return 'Log strength workout';
	});

	let strengthActionDescription = $derived.by(() => {
		if (strengthSession) return 'Update sets and exercises';
		return 'Start or record a session';
	});

	let danceActionLabel = $derived.by(() => {
		if (danceSession) return 'Edit dance practice';
		return 'Log dance practice';
	});

	let danceActionDescription = $derived.by(() => {
		if (danceSession) return 'Update items and duration';
		return 'Start or record a practice';
	});

	let activityActionLabel = $derived.by(() => {
		if (hasActivities) return 'Add activity';
		return 'Log activity';
	});
</script>

<BottomSheet onclose={onClose}>
	<div class="day-actions">
		<p class="day-actions__date">{formatLongDate(date)}</p>

		{#if strengthSession}
			<DayActionsWorkoutSummary
				workoutName={routineName(strengthSession)}
				durationLabel={durationLabelFor(strengthSession)}
			/>
		{/if}

		{#if danceSession}
			<DayActionsWorkoutSummary
				workoutName={routineName(danceSession)}
				durationLabel={durationLabelFor(danceSession)}
				variant="dance"
			/>
		{/if}

		<div class="day-actions__list">
			<DayActionItem
				icon="check"
				label={habitsActionLabel}
				description="Mood, water, meditation, and more"
				onclick={() => navigate('/habits')}
			/>

			{#if hasHabits && onViewHabits}
				<DayActionItem
					icon="check"
					label="View logged habits"
					description="See what was logged on this day"
					secondary
					onclick={onViewHabits}
				/>
			{/if}

			<DayActionItem
				icon="edit"
				label={strengthActionLabel}
				description={strengthActionDescription}
				onclick={() => navigate('/workout')}
			/>

			<DayActionItem
				icon="edit"
				label={danceActionLabel}
				description={danceActionDescription}
				onclick={() => navigate('/practice/dance')}
			/>

			<DayActionItem
				icon="plus"
				label={activityActionLabel}
				description="Runs, walks, yoga, and more"
				onclick={() => navigate('/log')}
			/>

			{#if strengthSession && onViewStrengthSession}
				<DayActionItem
					icon="chevron-down"
					label="View strength details"
					description="Exercises, sets, and volume"
					secondary
					onclick={onViewStrengthSession}
				/>
			{/if}

			{#if danceSession && onViewDanceSession}
				<DayActionItem
					icon="chevron-down"
					label="View dance details"
					description="Routine, items, and duration"
					secondary
					onclick={onViewDanceSession}
				/>
			{/if}
		</div>

		{#if activities.length > 0}
			<DayActionsActivityList {activities} {onClose} onEdit={onEditActivity} />
		{/if}
	</div>
</BottomSheet>

<style>
	.day-actions {
		padding-inline: var(--space-5);
		padding-block: var(--space-2) var(--space-4);
	}

	.day-actions__date {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-4);
	}

	.day-actions__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
