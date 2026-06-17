<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Habit } from '$lib/db/types';
	import { MOOD_SCALE } from '$lib/db/types';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { DAYS_SHORT, todayIso, fromIso, toLocalIso, addDays, formatWeekdayShortDate } from '$lib/date';
	import Icon from '$lib/components/Icon.svelte';
	import HabitCard from '$lib/components/HabitCard.svelte';
	import ValueDialog from '$lib/components/ValueDialog.svelte';

	const NICE_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500];

	const todayStr = todayIso();

	let contextDate = $derived(loggingContext.date);

	let displayDate = $derived(formatWeekdayShortDate(contextDate));

	let isReadOnly = $derived(contextDate < addDays(todayStr, -1));

	let weekDays = $derived.by(() => {
		const days = [];
		for (let offset = -3; offset <= 3; offset++) {
			const d = new Date();
			d.setDate(d.getDate() + offset);
			const str = toLocalIso(d);
			days.push({
				str,
				dayLabel: DAYS_SHORT[d.getDay()].slice(0, 2).toUpperCase(),
				dayNum: d.getDate(),
				isFuture: str > todayStr,
				isToday: str === todayStr,
				isSelected: str === contextDate,
			});
		}
		return days;
	});

	function selectDay(dateStr: string) {
		if (dateStr > todayStr) return;
		loggingContext.setDate(dateStr);
	}

	function moodForDay(dateStr: string): number | null {
		const moodHabit = habitStore.habits.find((h) => h.type === 'mood' && h.active);
		if (!moodHabit) return null;
		const log = habitStore.getLog(moodHabit.id, dateStr);
		return log !== undefined ? log.value : null;
	}

	// Smart step: minutes always 5; count uses goal/10 rounded to a nice number
	function getStep(habit: Habit): number {
		if (habit.type === 'minutes') return 5;
		const goal = habit.dailyGoal ?? 10;
		const raw = goal / 10;
		return NICE_STEPS.find((s) => s >= raw) ?? 1;
	}

	function getMoodLabel(value: number): string {
		return MOOD_SCALE.find((m) => m.value === value)?.label ?? '—';
	}

	const MOOD_SCALE_ASC = [...MOOD_SCALE].reverse(); // -5 → +5 for left-to-right display

	let moodHabit = $derived(habitStore.habits.find((h) => h.type === 'mood' && h.active));

	let currentMoodValue = $derived.by(() => {
		if (!moodHabit) return null;
		const log = habitStore.getLog(moodHabit.id, contextDate);
		return log !== undefined ? log.value : null;
	});

	async function setMoodDirect(value: number) {
		if (isReadOnly || !moodHabit) return;
		if (currentMoodValue === value) {
			await habitStore.correctValue(moodHabit.id, 0, contextDate);
		} else {
			await habitStore.logMood(moodHabit.id, value, contextDate);
		}
	}

	let gridHabits = $derived(habitStore.activeHabits.filter((h) => h.type !== 'mood'));

	async function handleAdd(habit: Habit) {
		if (isReadOnly) return;
		const current = habitStore.valueFor(habit, contextDate);
		await habitStore.correctValue(habit.id, current + getStep(habit), contextDate);
	}

	async function handleSubtract(habit: Habit) {
		if (isReadOnly) return;
		const current = habitStore.valueFor(habit, contextDate);
		await habitStore.correctValue(habit.id, Math.max(0, current - getStep(habit)), contextDate);
	}

	async function handleToggle(habit: Habit) {
		if (isReadOnly) return;
		await habitStore.toggle(habit.id, contextDate);
	}

	// Exact-value dialog
	let exactTarget = $state<Habit | null>(null);

	function openExact(habit: Habit) {
		if (isReadOnly) return;
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
	<header class="habits-page__header">
		<button class="back-btn" onclick={() => goto('/')} aria-label="Back to home">
			<Icon name="back" size={20} />
		</button>
		<div>
			<h1 class="habits-page__title">Daily check-in</h1>
			<p class="habits-page__date">{displayDate}</p>
		</div>
	</header>

	<fieldset class="week-strip">
		<legend class="sr-only">Select date</legend>
		{#each weekDays as day}
			<label class="week-day" class:week-day--selected={day.isSelected} class:week-day--future={day.isFuture}>
				<input
					class="sr-only"
					type="radio"
					name="habits-date"
					value={day.str}
					checked={day.isSelected}
					disabled={day.isFuture}
					onchange={() => selectDay(day.str)}
					aria-label="{day.dayLabel} {day.dayNum}{day.isToday ? ', today' : ''}"
				/>
				<span class="week-day__label" aria-hidden="true">{day.dayLabel}</span>
				<span class="week-day__num" aria-hidden="true">{day.dayNum}</span>
				<span class="week-day__mood" aria-hidden="true">
					{#if moodForDay(day.str) !== null}
						<span
							class="week-day__mood-dot"
							class:week-day__mood-dot--pos={(moodForDay(day.str) ?? 0) > 0}
							class:week-day__mood-dot--neg={(moodForDay(day.str) ?? 0) < 0}
						></span>
					{:else}
						<span class="week-day__mood-dot week-day__mood-dot--empty"></span>
					{/if}
				</span>
			</label>
		{/each}
	</fieldset>

	{#if isReadOnly}
		<div class="readonly-banner" role="status">Past date — viewing only</div>
	{/if}

	{#if moodHabit}
		<section class="mood-section">
			<div class="mood-section__header">
				<span class="mood-section__title" id="mood-label">Mood</span>
				{#if currentMoodValue !== null}
					<span
						class="mood-section__result"
						class:mood-result--pos={currentMoodValue > 0}
						class:mood-result--neg={currentMoodValue < 0}
						aria-live="polite"
					>
						{getMoodLabel(currentMoodValue)}
						<span class="mood-section__score">{currentMoodValue > 0 ? '+' : ''}{currentMoodValue}</span>
					</span>
				{:else}
					<span class="mood-section__empty" aria-live="polite">{isReadOnly ? 'Not recorded' : 'Select below'}</span>
				{/if}
			</div>
			<fieldset class="mood-scale" aria-labelledby="mood-label">
				<legend class="sr-only">How are you feeling? ({isReadOnly ? 'read only' : 'use arrow keys to navigate'})</legend
				>
				{#each MOOD_SCALE_ASC as item}
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
							disabled={isReadOnly}
							onchange={() => setMoodDirect(item.value)}
							aria-label="{item.label} ({item.value > 0 ? '+' : ''}{item.value})"
						/>
						{item.value > 0 ? '+' : ''}{item.value}
					</label>
				{/each}
			</fieldset>
		</section>
	{/if}

	{#if gridHabits.length === 0}
		<div class="empty-state">
			<p>No habits configured.</p>
			<a href="/settings">Go to Settings to add habits</a>
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
					readOnly={isReadOnly}
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
		unit={exactTarget.type === 'minutes' ? 'min' : exactTarget.unit || ''}
		initialValue={habitStore.valueFor(exactTarget, contextDate)}
		onsave={saveExact}
		onclose={() => (exactTarget = null)}
	/>
{/if}

<style>
	/* ── Header ── */
	.habits-page__header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-block-end: var(--space-5);
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
	}

	.habits-page__title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.habits-page__date {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	/* ── Week strip ── */
	.week-strip {
		display: flex;
		justify-content: space-between;
		gap: var(--space-1);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-2);
		margin-block-end: var(--space-5);
		min-inline-size: 0;
	}

	.week-day {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		flex: 1;
		padding-block: var(--space-2);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: background var(--duration-fast) var(--ease-out);
	}

	.week-day--selected {
		background: var(--color-accent);
	}
	.week-day--future {
		opacity: 0.3;
		pointer-events: none;
	}

	.week-day:has(input:focus-visible) {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.week-day__label {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		user-select: none;

		.week-day--selected & {
			color: var(--color-accent-ink);
		}
	}

	.week-day__num {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
		color: var(--color-text-secondary);
		line-height: 1;
		user-select: none;

		.week-day--selected & {
			color: var(--color-accent-ink);
		}
	}

	.week-day__mood {
		block-size: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.week-day__mood-dot {
		display: block;
		inline-size: 5px;
		block-size: 5px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
	}

	.week-day__mood-dot--pos {
		background: #4ade80;
	}
	.week-day__mood-dot--neg {
		background: #f87171;
	}
	.week-day__mood-dot--empty {
		background: color-mix(in srgb, var(--color-border) 60%, transparent);
	}

	/* ── Read-only banner ── */
	.readonly-banner {
		margin-block-end: var(--space-4);
		padding: var(--space-3) var(--space-4);
		background: color-mix(in srgb, var(--color-text-muted) 8%, transparent);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-align: center;
	}

	/* ── Empty state ── */
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

	/* ── Grid ── */
	.habit-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-4);
	}

	/* ── Mood section ── */
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

		&:has(input:disabled) {
			opacity: 0.5;
			cursor: default;
		}
		&:not(:has(input:disabled)):hover {
			filter: brightness(1.2);
		}
	}
</style>
