<script lang="ts">
	import type { ActivityLog } from '$lib/db/types';
	import { formatActivitySummary } from '$lib/activities';
	import Icon from './Icon.svelte';

	type Props = {
		activities: ActivityLog[];
		onEdit?: (activity: ActivityLog) => void;
		onClose: () => void;
	};

	let { activities, onEdit, onClose }: Props = $props();
</script>

<div class="day-actions-activities">
	<p class="day-actions-activities__label">Activities</p>
	{#each activities as activity (activity.id)}
		<div class="day-actions-activities__row">
			<span class="day-actions-activities__name">{formatActivitySummary(activity)}</span>
			{#if onEdit}
				<button
					class="day-actions-activities__edit"
					type="button"
					onclick={() => {
						onClose();
						onEdit(activity);
					}}
					aria-label="Edit {activity.type} activity"
				>
					<Icon name="edit" size={14} />
					Edit
				</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	.day-actions-activities {
		margin-block-start: var(--space-4);
		border-block-start: 1px solid var(--color-border);
		padding-block-start: var(--space-4);
	}

	.day-actions-activities__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-2);
	}

	.day-actions-activities__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-block-end: var(--space-2);

		&:last-child {
			margin-block-end: 0;
		}
	}

	.day-actions-activities__name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.day-actions-activities__edit {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-inline: var(--space-2);
		block-size: 30px;
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-accent);
		flex-shrink: 0;
	}
</style>
