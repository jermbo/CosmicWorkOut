<script lang="ts">
	import { habitStore } from '$lib/stores/habits.svelte';
	import { formatHabitLogValue } from '$lib/habits';
	import { formatLongDate } from '$lib/date';
	import BottomSheet from './BottomSheet.svelte';

	type Props = {
		date: string;
		onClose: () => void;
	};

	let { date, onClose }: Props = $props();

	let logs = $derived(habitStore.logsForDate(date));

	let habitRows = $derived.by(() => {
		return logs
			.map((log) => {
				const habit = habitStore.habits.find((h) => h.id === log.habitId);
				if (!habit) return null;
				return { habit, value: log.value, label: formatHabitLogValue(habit, log.value) };
			})
			.filter((r) => r !== null);
	});
</script>

<BottomSheet onclose={onClose}>
	<div class="hh-sheet">
		<p class="hh-sheet__date">{formatLongDate(date)}</p>
		<p class="hh-sheet__heading">Habits logged</p>

		{#if habitRows.length === 0}
			<p class="hh-sheet__empty">No habits logged on this day.</p>
		{:else}
			<ul class="hh-sheet__list" role="list">
				{#each habitRows as row (row.habit.id)}
					<li class="hh-sheet__item">
						<span class="hh-sheet__name">{row.habit.name}</span>
						<span class="hh-sheet__value">{row.label}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</BottomSheet>

<style>
	.hh-sheet {
		padding-inline: var(--space-5);
		padding-block: var(--space-2) var(--space-6);
	}

	.hh-sheet__date {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-4);
	}

	.hh-sheet__heading {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.hh-sheet__empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.hh-sheet__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.hh-sheet__item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.hh-sheet__name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.hh-sheet__value {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}
</style>
