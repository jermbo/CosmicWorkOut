<script lang="ts">
	import type { Habit } from '$lib/db/types';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { formatLongDate } from '$lib/date';
	import BottomSheet from './BottomSheet.svelte';
	import HabitCard from './HabitCard.svelte';
	import ValueDialog from './ValueDialog.svelte';
	import { minuteUnitLabel } from '$lib/format';
	import DialogTitle from './DialogTitle.svelte';

	type Props = {
		date: string;
		onClose: () => void;
	};

	let { date, onClose }: Props = $props();

	const NICE_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500];

	function getStep(habit: Habit): number {
		if (habit.type === 'minutes') return 5;
		const goal = habit.dailyGoal ?? 10;
		const raw = goal / 10;
		return NICE_STEPS.find((s) => s >= raw) ?? 1;
	}

	let gridHabits = $derived(habitStore.activeHabits.filter((h) => h.type !== 'mood'));

	async function handleAdd(habit: Habit) {
		const current = habitStore.valueFor(habit, date);
		await habitStore.correctValue(habit.id, current + getStep(habit), date);
	}

	async function handleSubtract(habit: Habit) {
		const current = habitStore.valueFor(habit, date);
		await habitStore.correctValue(habit.id, Math.max(0, current - getStep(habit)), date);
	}

	async function handleToggle(habit: Habit) {
		await habitStore.toggle(habit.id, date);
	}

	let exactTarget = $state<Habit | null>(null);

	function openExact(habit: Habit) {
		exactTarget = habit;
	}

	function exactUnit(): string {
		if (!exactTarget) return '';
		if (exactTarget.type === 'minutes') return minuteUnitLabel();
		return exactTarget.unit || '';
	}

	async function saveExact(value: number) {
		if (!exactTarget) return;
		if (exactTarget.type === 'minutes') {
			await habitStore.setMinutes(exactTarget.id, value, date);
		} else {
			await habitStore.correctValue(exactTarget.id, value, date);
		}
	}
</script>

<BottomSheet onclose={onClose}>
	<div class="hh-sheet">
		<DialogTitle>{formatLongDate(date)}</DialogTitle>
		<p class="hh-sheet__heading">Habits</p>

		{#if gridHabits.length === 0}
			<p class="hh-sheet__empty">No habits configured.</p>
		{:else}
			<div class="hh-sheet__grid">
				{#each gridHabits as habit (habit.id)}
					<HabitCard
						{habit}
						value={habitStore.valueFor(habit, date)}
						pct={habitStore.progressPct(habit, date)}
						done={habitStore.isComplete(habit, date)}
						step={getStep(habit)}
						onadd={() => handleAdd(habit)}
						onsubtract={() => handleSubtract(habit)}
						ontoggle={() => handleToggle(habit)}
						oneditexact={() => openExact(habit)}
					/>
				{/each}
			</div>
		{/if}
	</div>
</BottomSheet>

{#if exactTarget}
	<ValueDialog
		title={exactTarget.name}
		unit={exactUnit()}
		initialValue={habitStore.valueFor(exactTarget, date)}
		onsave={saveExact}
		onclose={() => (exactTarget = null)}
	/>
{/if}

<style>
	.hh-sheet {
		padding-inline: var(--space-5);
		padding-block: var(--space-2) var(--space-6);
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

	.hh-sheet__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		gap: var(--space-4);
	}
</style>
