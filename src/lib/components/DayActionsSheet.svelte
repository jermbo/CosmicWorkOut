<script lang="ts">
	import { goto } from '$app/navigation';
	import type { SessionLog } from '$lib/db/types';
	import { formatLongDate } from '$lib/date';
	import { formatDuration } from '$lib/format';
	import { programStore } from '$lib/stores/program.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import Icon from './Icon.svelte';

	type Props = {
		date: string;
		session?: SessionLog | null;
		hasHabits?: boolean;
		hasActivities?: boolean;
		onClose: () => void;
		onViewSession?: () => void;
	};

	let { date, session = null, hasHabits = false, hasActivities = false, onClose, onViewSession }: Props = $props();

	let workoutName = $derived(
		session
			? (programStore.getWorkoutForSession(session)?.name ??
					programStore.getWorkoutById(session.workoutId)?.name ??
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
			<div class="day-actions__summary">
				<span class="day-actions__summary-label">Workout logged</span>
				<span class="day-actions__summary-value">{workoutName}</span>
				{#if session.durationSeconds}
					<span class="day-actions__summary-meta">{formatDuration(session.durationSeconds)}</span>
				{/if}
			</div>
		{/if}

		<div class="day-actions__list">
			<button class="day-actions__item" type="button" onclick={() => navigate('/habits')}>
				<span class="day-actions__item-icon" aria-hidden="true">
					<Icon name="check" size={20} />
				</span>
				<span class="day-actions__item-text">
					<span class="day-actions__item-label">{hasHabits ? 'Edit habits' : 'Log habits'}</span>
					<span class="day-actions__item-desc">Mood, water, meditation, and more</span>
				</span>
				<Icon name="chevron-right" size={18} />
			</button>

			<button class="day-actions__item" type="button" onclick={() => navigate('/workout')}>
				<span class="day-actions__item-icon" aria-hidden="true">
					<Icon name="edit" size={20} />
				</span>
				<span class="day-actions__item-text">
					<span class="day-actions__item-label">{session ? 'Edit workout' : 'Log workout'}</span>
					<span class="day-actions__item-desc">
						{session ? 'Update sets and exercises' : 'Start or record a session'}
					</span>
				</span>
				<Icon name="chevron-right" size={18} />
			</button>

			<button class="day-actions__item" type="button" onclick={() => navigate('/log')}>
				<span class="day-actions__item-icon" aria-hidden="true">
					<Icon name="plus" size={20} />
				</span>
				<span class="day-actions__item-text">
					<span class="day-actions__item-label">{hasActivities ? 'Edit activities' : 'Log activity'}</span>
					<span class="day-actions__item-desc">Runs, walks, yoga, and more</span>
				</span>
				<Icon name="chevron-right" size={18} />
			</button>

			{#if session && onViewSession}
				<button class="day-actions__item day-actions__item--secondary" type="button" onclick={onViewSession}>
					<span class="day-actions__item-icon" aria-hidden="true">
						<Icon name="chevron-down" size={20} />
					</span>
					<span class="day-actions__item-text">
						<span class="day-actions__item-label">View session details</span>
						<span class="day-actions__item-desc">Exercises, sets, and volume</span>
					</span>
					<Icon name="chevron-right" size={18} />
				</button>
			{/if}
		</div>
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

	.day-actions__summary {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-3) var(--space-4);
		background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface-3));
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
		border-radius: var(--radius-lg);
		margin-block-end: var(--space-4);
	}

	.day-actions__summary-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.day-actions__summary-value {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.day-actions__summary-meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.day-actions__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.day-actions__item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		inline-size: 100%;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		color: inherit;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.day-actions__item--secondary {
		background: transparent;
	}

	.day-actions__item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		color: var(--color-accent);
	}

	.day-actions__item-text {
		flex: 1;
		min-inline-size: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.day-actions__item-label {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.day-actions__item-desc {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.day-actions__item :global(svg:last-child) {
		flex-shrink: 0;
		color: var(--color-text-muted);
	}
</style>
