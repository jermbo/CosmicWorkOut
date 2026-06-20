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
		session?: Session | null;
		hasHabits?: boolean;
		hasActivities?: boolean;
		activities?: ActivityLog[];
		onClose: () => void;
		onViewSession?: () => void;
		onViewHabits?: () => void;
		onEditActivity?: (activity: ActivityLog) => void;
	};

	let {
		date,
		session = null,
		hasHabits = false,
		hasActivities = false,
		activities = [],
		onClose,
		onViewSession,
		onViewHabits,
		onEditActivity,
	}: Props = $props();

	let workoutName = $derived(
		session
			? (programStore.getRoutineForSession(session)?.name ??
					programStore.getRoutineById(session.routineId)?.name ??
					'Workout')
			: null,
	);

	function navigate(path: string) {
		onClose();
		goto(path);
	}
</script>

<BottomSheet onclose={onClose}>
	<div class="day-actions">
		<p class="day-actions__date">{formatLongDate(date)}</p>

		{#if session && workoutName}
			<DayActionsWorkoutSummary
				{workoutName}
				durationLabel={session.durationSeconds ? formatDuration(session.durationSeconds) : null}
			/>
		{/if}

		<div class="day-actions__list">
			<DayActionItem
				icon="check"
				label={hasHabits ? 'Edit habits' : 'Log habits'}
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
				label={session ? 'Edit workout' : 'Log workout'}
				description={session ? 'Update sets and exercises' : 'Start or record a session'}
				onclick={() => navigate('/workout')}
			/>

			<DayActionItem
				icon="plus"
				label={hasActivities ? 'Add activity' : 'Log activity'}
				description="Runs, walks, yoga, and more"
				onclick={() => navigate('/log')}
			/>

			{#if session && onViewSession}
				<DayActionItem
					icon="chevron-down"
					label="View session details"
					description="Exercises, sets, and volume"
					secondary
					onclick={onViewSession}
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
