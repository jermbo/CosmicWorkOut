<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import type { Habit } from '$lib/db/types';
	import { MOOD_SCALE } from '$lib/db/types';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';

	const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	const NICE_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500];

	const todayStr = new Date().toISOString().split('T')[0];

	let contextDate = $derived(loggingContext.date);

	let displayDate = $derived.by(() => {
		const d = new Date(contextDate + 'T00:00:00');
		return `${DAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
	});

	let isReadOnly = $derived.by(() => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		return contextDate < yesterday.toISOString().split('T')[0];
	});

	let weekDays = $derived.by(() => {
		const days = [];
		for (let offset = -3; offset <= 3; offset++) {
			const d = new Date();
			d.setDate(d.getDate() + offset);
			const str = d.toISOString().split('T')[0];
			days.push({
				str,
				dayLabel: DAYS_SHORT[d.getDay()].slice(0, 2).toUpperCase(),
				dayNum: d.getDate(),
				isFuture: str > todayStr,
				isToday: str === todayStr,
				isSelected: str === contextDate
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

	// ── Per-habit helpers ────────────────────────────────────────────

	function getLog(habit: Habit) {
		return habitStore.getLog(habit.id, contextDate);
	}

	function getValue(habit: Habit): number {
		return getLog(habit)?.value ?? 0;
	}

	function isComplete(habit: Habit): boolean {
		const val = getValue(habit);
		if (habit.type === 'boolean') return val === 1;
		if (habit.type === 'mood') return getLog(habit) !== undefined;
		if (habit.dailyGoal) return val >= habit.dailyGoal;
		return val > 0;
	}

	function progressPct(habit: Habit): number {
		const val = getValue(habit);
		if (habit.type === 'boolean') return val === 1 ? 100 : 0;
		if (habit.type === 'mood') return getLog(habit) !== undefined ? 100 : 0;
		if (habit.dailyGoal) return Math.min(100, (val / habit.dailyGoal) * 100);
		return val > 0 ? 100 : 0;
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

	// ── Mood section (inline, no modal) ──────────────────────────────
	const MOOD_SCALE_ASC = [...MOOD_SCALE].reverse(); // -5 → +5 for left-to-right display

	let moodHabit = $derived(habitStore.habits.find((h) => h.type === 'mood' && h.active));

	let currentMoodValue = $derived.by(() => {
		if (!moodHabit) return null;
		const log = habitStore.getLog(moodHabit.id, contextDate);
		return log !== undefined ? log.value : null;
	});

	async function setMoodDirect(value: number) {
		if (isReadOnly || !moodHabit) return;
		// Toggle off if tapping the already-selected value
		if (currentMoodValue === value) {
			await habitStore.correctValue(moodHabit.id, 0, contextDate);
		} else {
			await habitStore.logMood(moodHabit.id, value, contextDate);
		}
	}

	// Non-mood habits only in the grid
	let gridHabits = $derived(habitStore.activeHabits.filter((h) => h.type !== 'mood'));

	// ── Interaction handlers ─────────────────────────────────────────

	async function handleAdd(habit: Habit) {
		if (isReadOnly) return;
		const step = getStep(habit);
		const current = getValue(habit);
		await habitStore.correctValue(habit.id, current + step, contextDate);
	}

	async function handleSubtract(habit: Habit) {
		if (isReadOnly) return;
		const step = getStep(habit);
		const current = getValue(habit);
		const next = Math.max(0, current - step);
		await habitStore.correctValue(habit.id, next, contextDate);
	}

	async function handleToggle(habit: Habit) {
		if (isReadOnly) return;
		await habitStore.toggle(habit.id, contextDate);
	}

	// Exact-value dialog
	let exactTarget = $state<Habit | null>(null);
	let exactInput = $state('');
	let exactDialog = $state<HTMLDialogElement | null>(null);

	async function openExact(habit: Habit) {
		if (isReadOnly) return;
		exactInput = String(getValue(habit) || '');
		exactTarget = habit;
		await tick(); // let {#if} render the <dialog> first
		exactDialog?.showModal();
	}

	async function saveExact() {
		if (!exactTarget) return;
		const val = parseInt(exactInput, 10);
		if (!isNaN(val) && val >= 0) {
			if (exactTarget.type === 'minutes') {
				await habitStore.setMinutes(exactTarget.id, val, contextDate);
			} else {
				await habitStore.correctValue(exactTarget.id, val, contextDate);
			}
		}
		exactDialog?.close();
	}

	function closeExact() {
		exactDialog?.close();
	}

	function exactUnit(habit: Habit): string {
		if (habit.type === 'minutes') return 'min';
		return habit.unit || '';
	}

</script>

<svelte:head>
	<title>Habits — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide habits-page">

	<!-- Header -->
	<header class="habits-page__header">
		<button class="back-btn" onclick={() => goto('/')} aria-label="Back to home">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
				<polyline points="15 18 9 12 15 6" />
			</svg>
		</button>
		<div>
			<h1 class="habits-page__title">Daily check-in</h1>
			<p class="habits-page__date">{displayDate}</p>
		</div>
	</header>

	<!-- Week strip -->
	<fieldset class="week-strip">
		<legend class="sr-only">Select date</legend>
		{#each weekDays as day}
			<label
				class="week-day"
				class:week-day--selected={day.isSelected}
				class:week-day--future={day.isFuture}
			>
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

	<!-- Mood strip -->
	{#if moodHabit}
		<section class="mood-section">
			<div class="mood-section__header">
				<span class="mood-section__title" id="mood-label">Mood</span>
				{#if currentMoodValue !== null}
					<span class="mood-section__result" class:mood-result--pos={currentMoodValue > 0} class:mood-result--neg={currentMoodValue < 0} aria-live="polite">
						{getMoodLabel(currentMoodValue)}
						<span class="mood-section__score">{currentMoodValue > 0 ? '+' : ''}{currentMoodValue}</span>
					</span>
				{:else}
					<span class="mood-section__empty" aria-live="polite">{isReadOnly ? 'Not recorded' : 'Select below'}</span>
				{/if}
			</div>
			<fieldset class="mood-scale" aria-labelledby="mood-label">
				<legend class="sr-only">How are you feeling? ({isReadOnly ? 'read only' : 'use arrow keys to navigate'})</legend>
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

	<!-- Habit grid -->
	{#if gridHabits.length === 0}
		<div class="empty-state">
			<p>No habits configured.</p>
			<a href="/settings">Go to Settings to add habits</a>
		</div>
	{:else}
		<div class="habit-grid">
			{#each gridHabits as habit (habit.id)}
				{@const pct = progressPct(habit)}
				{@const done = isComplete(habit)}
				{@const val = getValue(habit)}
				{@const step = getStep(habit)}
				{@const circumference = 2 * Math.PI * 44}
				{@const filled = (pct / 100) * circumference}

				<div class="habit-card" class:habit-card--done={done}>

					<!-- Ring -->
					<div class="habit-card__ring" aria-hidden="true">
						<svg viewBox="0 0 110 110" class="ring-svg">
							<circle class="ring-track" cx="55" cy="55" r="44" />
							{#if pct > 0}
								<circle
									class="ring-fill"
									class:ring-fill--done={done}
									cx="55" cy="55" r="44"
									stroke-dasharray="{filled} {circumference}"
									stroke-dashoffset="0"
								/>
							{/if}
						</svg>

						<!-- Center label -->
						{#if habit.type === 'boolean'}
							<div class="ring-center">
								<span class="ring-center__value ring-center__value--bool" class:ring-center__value--done={done}>
									{done ? 'Yes' : 'No'}
								</span>
							</div>
						{:else}
							<!-- count / times / minutes -->
							<button
								class="ring-center ring-center--tap"
								onclick={() => openExact(habit)}
								disabled={isReadOnly}
								aria-label="Enter exact value for {habit.name}"
								title="Tap to enter exact value"
							>
								<span class="ring-center__value" class:ring-center__value--done={done}>{val}</span>
								{#if !done && habit.dailyGoal}
									<span class="ring-center__goal">/ {habit.dailyGoal}</span>
								{/if}
								{#if habit.unit || habit.type === 'minutes'}
									<span class="ring-center__unit">{habit.type === 'minutes' ? 'min' : habit.unit}</span>
								{/if}
							</button>
						{/if}
					</div>

					<!-- Name -->
					<p class="habit-card__name">{habit.name}</p>

					<!-- Actions -->
					<div class="habit-card__actions">
						{#if habit.type === 'boolean'}
							<label class="toggle-label" class:toggle-label--on={done}>
								<input
									class="sr-only"
									type="checkbox"
									checked={done}
									disabled={isReadOnly}
									onchange={() => handleToggle(habit)}
									aria-label="{habit.name}"
								/>
								{done ? '✓ Done' : 'Mark done'}
							</label>

						{:else}
							<!-- count / times / minutes: ± buttons with step label -->
							<div class="stepper">
								<button
									class="stepper__btn stepper__btn--minus"
									onclick={() => handleSubtract(habit)}
									disabled={isReadOnly || val < step}
									aria-label="Subtract {step} from {habit.name}"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
										<line x1="5" y1="12" x2="19" y2="12" />
									</svg>
								</button>

								<button
									class="stepper__step-label"
									onclick={() => openExact(habit)}
									disabled={isReadOnly}
									aria-label="Enter exact value"
									title="Tap to enter exact value"
								>
									{#if habit.type === 'minutes'}
										{step} min
									{:else if habit.unit}
										{step} {habit.unit}
									{:else}
										{step}
									{/if}
								</button>

								<button
									class="stepper__btn stepper__btn--plus"
									onclick={() => handleAdd(habit)}
									disabled={isReadOnly}
									aria-label="Add {step} to {habit.name}"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
										<line x1="12" y1="5" x2="12" y2="19" />
										<line x1="5" y1="12" x2="19" y2="12" />
									</svg>
								</button>
							</div>
						{/if}
					</div>

				</div>
			{/each}
		</div>
	{/if}

</div>

<!-- Exact-value dialog -->
{#if exactTarget}
	<dialog
		bind:this={exactDialog}
		class="value-dialog"
		onclose={() => { exactTarget = null; }}
		onclick={(e) => { if (e.target === exactDialog) closeExact(); }}
	>
		<label class="value-dialog__title" for="exact-input">{exactTarget.name}</label>
		<div class="value-dialog__field">
			<input
				id="exact-input"
				class="value-dialog__input"
				type="number"
				bind:value={exactInput}
				min="0"
				placeholder="0"
				onkeydown={(e) => e.key === 'Enter' && saveExact()}
			/>
			{#if exactUnit(exactTarget)}
				<span class="value-dialog__unit" aria-hidden="true">{exactUnit(exactTarget)}</span>
			{/if}
		</div>
		<div class="value-dialog__actions">
			<button class="value-dialog__save" onclick={saveExact}>Save</button>
			<button class="value-dialog__cancel" onclick={closeExact}>Cancel</button>
		</div>
	</dialog>
{/if}


<style>
	/* ── Visually hidden (accessible) ── */
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

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

		svg { inline-size: 20px; block-size: 20px; }
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
		/* reset fieldset defaults */
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

	.week-day--selected { background: var(--color-accent); }
	.week-day--future { opacity: 0.3; pointer-events: none; }

	/* Focus ring on the label when the hidden input is focused */
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

		.week-day--selected & { color: var(--color-accent-ink); }
	}

	.week-day__num {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
		color: var(--color-text-secondary);
		line-height: 1;
		user-select: none;

		.week-day--selected & { color: var(--color-accent-ink); }
	}

	.week-day__mood { block-size: 6px; display: flex; align-items: center; justify-content: center; }

	.week-day__mood-dot {
		display: block;
		inline-size: 5px;
		block-size: 5px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
	}

	.week-day__mood-dot--pos { background: #4ade80; }
	.week-day__mood-dot--neg { background: #f87171; }
	.week-day__mood-dot--empty { background: color-mix(in srgb, var(--color-border) 60%, transparent); }

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
		padding-block: var(--space-16);
		text-align: center;
		color: var(--color-text-secondary);

		a { color: var(--color-accent); font-weight: 600; }
	}

	/* ── Grid ── */
	.habit-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-4);
	}

	/* ── Card ── */
	.habit-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-4) var(--space-4);
		background: var(--color-surface-2);
		border: 1.5px solid var(--color-border);
		border-radius: var(--r-2xl);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out);
	}

	.habit-card--done {
		border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
		background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-2));
	}

	/* ── Ring ── */
	.habit-card__ring {
		position: relative;
		inline-size: 120px;
		block-size: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ring-svg {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		transform: rotate(-90deg);
		overflow: visible;
	}

	.ring-track {
		fill: none;
		stroke: var(--color-surface-3);
		stroke-width: 7;
	}

	.ring-fill {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 7;
		stroke-linecap: round;
		transition: stroke-dasharray 350ms var(--ease-out);
		opacity: 0.65;
	}

	.ring-fill--done {
		opacity: 1;
	}

	/* Center of ring */
	.ring-center {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
		text-align: center;
	}

	.ring-center--tap {
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--radius-full);
		transition: background var(--duration-fast) var(--ease-out);

		&:not(:disabled):hover {
			background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		}
		&:disabled { cursor: default; }
	}

	.ring-center__value {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-text-primary);
		line-height: 1;
		letter-spacing: -0.03em;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.ring-center__value--done {
		color: var(--color-accent);
	}

	.ring-center__value--bool {
		font-size: 1.25rem;
	}


	.ring-center__goal {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
		line-height: 1;
	}

	.ring-center__unit {
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		line-height: 1;
	}


	/* ── Name ── */
	.habit-card__name {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-align: center;
		letter-spacing: -0.01em;
		line-height: 1.2;
	}

	/* ── Actions ── */
	.habit-card__actions {
		inline-size: 100%;
	}

	/* Boolean toggle */
	.toggle-label {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 100%;
		block-size: 48px;
		border-radius: var(--radius-full);
		border: 1.5px solid var(--color-border);
		background: var(--color-surface-3);
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-text-secondary);
		letter-spacing: 0.01em;
		cursor: pointer;
		user-select: none;
		transition:
			background var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);

		&.toggle-label--on {
			background: var(--color-accent);
			border-color: var(--color-accent);
			color: var(--color-accent-ink);
		}

		/* Focus ring when the hidden checkbox is focused */
		&:has(input:focus-visible) {
			outline: 2px solid var(--color-accent);
			outline-offset: 2px;
		}

		&:has(input:disabled) { opacity: 0.4; cursor: default; }
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

	.mood-result--pos { color: #4ade80; }
	.mood-result--neg { color: #f87171; }

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
		/* reset fieldset defaults */
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

		&.mood-scale__item--pos.mood-scale__item--selected { background: #4ade80; }
		&:not(.mood-scale__item--pos):not(.mood-scale__item--neg).mood-scale__item--selected {
			background: var(--color-text-muted);
		}
		&.mood-scale__item--neg.mood-scale__item--selected { background: #f87171; }

		/* Focus ring when the hidden radio is focused */
		&:has(input:focus-visible) {
			outline: 2px solid var(--color-accent);
			outline-offset: 2px;
		}

		&:has(input:disabled) { opacity: 0.5; cursor: default; }
		&:not(:has(input:disabled)):hover { filter: brightness(1.2); }
	}

	/* Stepper */
	.stepper {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.stepper__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 48px;
		block-size: 48px;
		flex-shrink: 0;
		border-radius: var(--radius-full);
		border: 1.5px solid var(--color-border);
		background: var(--color-surface-3);
		color: var(--color-accent);
		transition: background var(--duration-fast) var(--ease-out);

		svg { inline-size: 18px; block-size: 18px; }

		&:not(:disabled):active {
			background: color-mix(in srgb, var(--color-accent) 15%, var(--color-surface-3));
		}
		&:disabled { opacity: 0.25; }
	}

	.stepper__step-label {
		flex: 1;
		block-size: 48px;
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-accent);
		letter-spacing: 0.02em;
		line-height: 1.2;
		white-space: nowrap;
		transition: background var(--duration-fast) var(--ease-out);

		&:hover { background: color-mix(in srgb, var(--color-accent) 14%, transparent); }
		&:disabled { opacity: 0.4; cursor: default; }
	}

	/* ── Value dialog (native <dialog>) ── */
	dialog.value-dialog {
		/* Reset browser dialog defaults */
		border: none;
		padding: 0;
		color: inherit;
		/* Positioning */
		position: fixed;
		inset-inline: var(--space-4);
		inset-block-start: 50%;
		translate: 0 -50%;
		max-inline-size: 360px;
		inline-size: 100%;
		margin-inline: auto;
		/* Appearance */
		background: var(--color-surface-2);
		border-radius: var(--r-2xl);
		padding: var(--space-5);
		box-shadow: var(--shadow-lg);
		outline: none;
	}

	dialog.value-dialog::backdrop {
		background: rgba(0, 0, 0, 0.65);
	}

	.value-dialog__title {
		display: block;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-4);
		cursor: default;
	}

	.value-dialog__field {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.value-dialog__input {
		inline-size: 100%;
		block-size: 80px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--color-text-primary);
		text-align: center;
		outline: none;
		-moz-appearance: textfield;
		appearance: textfield;

		&::-webkit-inner-spin-button,
		&::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
		&:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent); }
		&::placeholder { color: var(--color-text-muted); font-size: 1.5rem; font-weight: 400; }
	}

	.value-dialog__unit {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.value-dialog__actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.value-dialog__save {
		block-size: 52px;
		border-radius: var(--radius-lg);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 1rem;
		font-weight: 700;

		&:disabled { opacity: 0.4; cursor: not-allowed; }
	}

	.value-dialog__cancel {
		block-size: 46px;
		border-radius: var(--radius-lg);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		font-weight: 600;
	}

</style>
