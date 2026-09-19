<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Habit } from '$lib/db/types';
	import { MOOD_SCALE } from '$lib/db/types';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { formatMoodValue } from '$lib/habits';
	import { minuteUnitLabel } from '$lib/format';
	import HabitCard from '$lib/components/HabitCard.svelte';
	import ValueDialog from '$lib/components/ValueDialog.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { redirectWhenDisabled } from '$lib/featureGate.svelte';

	redirectWhenDisabled(() => prefsStore.habitsEnabled);

	const NICE_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500];

	let contextDate = $derived(loggingContext.date);

	function getStep(habit: Habit): number {
		if (habit.type === 'minutes') return 5;
		const goal = habit.dailyGoal ?? 10;
		const raw = goal / 10;
		return NICE_STEPS.find((s) => s >= raw) ?? 1;
	}

	function getMoodLabel(value: number): string {
		return formatMoodValue(value);
	}

	const MOOD_SCALE_ASC = [...MOOD_SCALE].reverse();

	let moodHabit = $derived(habitStore.habits.find((h) => h.type === 'mood'));

	let currentMoodValue = $derived.by(() => {
		if (!moodHabit) return null;
		const log = habitStore.getLog(moodHabit.id, contextDate);
		if (log !== undefined) return log.value;
		return null;
	});

	function signPrefix(value: number | null): string {
		if (value !== null && value > 0) return '+';
		return '';
	}

	function exactUnit(): string {
		if (!exactTarget) return '';
		if (exactTarget.type === 'minutes') return minuteUnitLabel();
		return exactTarget.unit || '';
	}

	async function setMoodDirect(value: number) {
		if (!moodHabit) return;
		if (currentMoodValue === value) {
			await habitStore.correctValue(moodHabit.id, 0, contextDate);
		} else {
			await habitStore.logMood(moodHabit.id, value, contextDate);
		}
	}

	let gridHabits = $derived(habitStore.activeHabits.filter((h) => h.type !== 'mood'));

	async function handleAdd(habit: Habit) {
		const current = habitStore.valueFor(habit, contextDate);
		await habitStore.correctValue(habit.id, current + getStep(habit), contextDate);
	}

	async function handleSubtract(habit: Habit) {
		const current = habitStore.valueFor(habit, contextDate);
		await habitStore.correctValue(habit.id, Math.max(0, current - getStep(habit)), contextDate);
	}

	async function handleToggle(habit: Habit) {
		await habitStore.toggle(habit.id, contextDate);
	}

	let exactTarget = $state<Habit | null>(null);

	function openExact(habit: Habit) {
		exactTarget = habit;
	}

	async function saveExact(value: number) {
		if (!exactTarget) return;
		if (exactTarget.type === 'minutes') {
			await habitStore.setMinutes(exactTarget.id, value, contextDate);
		} else {
			await habitStore.correctValue(exactTarget.id, value, contextDate);
		}
	}
</script>

<svelte:head>
	<title>Habits — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide habits-page">
	<PageHeader
		title="Daily check-in"
		showBack
		showMoodDots
	/>

	{#if moodHabit}
		<section class="mood-section">
			<div class="mood-section__header">
				<span
					class="mood-section__title"
					id="mood-label">Mood</span
				>
				{#if currentMoodValue !== null}
					<span
						class="mood-section__result"
						class:mood-result--pos={currentMoodValue > 0}
						class:mood-result--neg={currentMoodValue < 0}
						aria-live="polite"
					>
						{getMoodLabel(currentMoodValue)}
						<span class="mood-section__score">{signPrefix(currentMoodValue)}{currentMoodValue}</span
						>
					</span>
				{:else}
					<span
						class="mood-section__empty"
						aria-live="polite">Select below</span
					>
				{/if}
			</div>
			<fieldset
				class="mood-scale"
				aria-labelledby="mood-label"
			>
				<legend class="sr-only">How are you feeling? (use arrow keys to navigate)</legend>
				{#each MOOD_SCALE_ASC as item (item.value)}
					<label
						class="mood-scale__item"
						class:mood-scale__item--pos={item.value > 0}
						class:mood-scale__item--neg={item.value < 0}
						class:mood-scale__item--selected={currentMoodValue === item.value}
						title={item.label}
					>
						<input
							class="sr-only"
							type="radio"
							name="mood"
							value={item.value}
							checked={currentMoodValue === item.value}
							onchange={() => setMoodDirect(item.value)}
							aria-label="{item.label} ({signPrefix(item.value)}{item.value})"
						/>
						{signPrefix(item.value)}{item.value}
					</label>
				{/each}
			</fieldset>
		</section>
	{/if}

	{#if gridHabits.length === 0}
		<div class="empty-state">
			<p>No habits configured.</p>
			<a href={resolve('/settings')}>Go to Settings to add habits</a>
		</div>
	{:else}
		<div class="habit-grid">
			{#each gridHabits as habit (habit.id)}
				<HabitCard
					{habit}
					value={habitStore.valueFor(habit, contextDate)}
					pct={habitStore.progressPct(habit, contextDate)}
					done={habitStore.isComplete(habit, contextDate)}
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

{#if exactTarget}
	<ValueDialog
		title={exactTarget.name}
		unit={exactUnit()}
		initialValue={habitStore.valueFor(exactTarget, contextDate)}
		onsave={saveExact}
		onclose={() => (exactTarget = null)}
	/>
{/if}

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-12);
		text-align: center;
		color: var(--color-text-secondary);

		a {
			color: var(--color-accent);
			font-weight: 600;
		}
	}

	.habit-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		gap: var(--space-4);
	}

	.mood-section {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-3) var(--space-4);
		margin-block-end: var(--space-5);
	}

	.mood-section__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-3);
	}

	.mood-section__title {
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--color-text-muted);
	}

	.mood-section__result {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.mood-result--pos {
		color: #4ade80;
	}
	.mood-result--neg {
		color: #f87171;
	}

	.mood-section__score {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		opacity: 0.7;
	}

	.mood-section__empty {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		font-style: italic;
	}

	.mood-scale {
		display: flex;
		gap: 3px;
		min-inline-size: 0;
		border: none;
		padding: 0;
		margin: 0;
	}

	.mood-scale__item {
		flex: 1;
		block-size: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-surface-3);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--color-text-muted);
		cursor: pointer;
		user-select: none;
		transition:
			background var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);

		&.mood-scale__item--pos {
			color: color-mix(in srgb, #4ade80 80%, var(--color-text-muted));
			border-color: color-mix(in srgb, #4ade80 20%, var(--color-border));
		}

		&.mood-scale__item--neg {
			color: color-mix(in srgb, #f87171 80%, var(--color-text-muted));
			border-color: color-mix(in srgb, #f87171 20%, var(--color-border));
		}

		&.mood-scale__item--selected {
			transform: scaleY(1.12);
			border-color: transparent;
			color: #000;
			font-size: 0.75rem;
		}

		&.mood-scale__item--pos.mood-scale__item--selected {
			background: #4ade80;
		}
		&:not(.mood-scale__item--pos):not(.mood-scale__item--neg).mood-scale__item--selected {
			background: var(--color-text-muted);
		}
		&.mood-scale__item--neg.mood-scale__item--selected {
			background: #f87171;
		}

		&:has(input:focus-visible) {
			outline: 2px solid var(--color-accent);
			outline-offset: 2px;
		}

		&:hover {
			filter: brightness(1.2);
		}
	}
</style>
