<script lang="ts">
	import type { CompletionFeel, Density, Roundness, Habit } from '$lib/db/types';
	import { resetWorkoutData } from '$lib/db/database';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';
	import AccentColorPicker from '$lib/components/AccentColorPicker.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import HabitForm from '$lib/components/HabitForm.svelte';
	import HabitRow from '$lib/components/HabitRow.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const WEIGHT_UNITS: { value: 'lb' | 'kg'; label: string }[] = [
		{ value: 'lb', label: 'lb' },
		{ value: 'kg', label: 'kg' },
	];

	const DENSITIES: { value: Density; label: string }[] = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'spacious', label: 'Spacious' },
	];

	const ROUNDNESS_OPTIONS: { value: Roundness; label: string }[] = [
		{ value: 'sharp', label: 'Sharp' },
		{ value: 'default', label: 'Default' },
		{ value: 'soft', label: 'Soft' },
	];

	const COMPLETION_FEELS: { value: CompletionFeel; label: string; desc: string }[] = [
		{ value: 'full', label: 'Full', desc: 'Confetti + full ring animation' },
		{ value: 'subtle', label: 'Subtle', desc: 'Minimal indicators, no confetti' },
	];

	let showClearDataConfirm = $state(false);
	let showResetPrefsConfirm = $state(false);
	let clearDataError = $state<string | null>(null);
	let clearingData = $state(false);

	let showHabitForm = $state(false);
	let editingHabit = $state<Habit | null>(null);
	let confirmDeleteHabitId = $state<string | null>(null);

	let draggingId = $state<string | null>(null);
	let dragOverId = $state<string | null>(null);

	let sortedHabits = $derived([...habitStore.habits].sort((a, b) => a.sortOrder - b.sortOrder));

	function openNewHabit() {
		editingHabit = null;
		showHabitForm = true;
	}

	function openEditHabit(habit: Habit) {
		editingHabit = habit;
		showHabitForm = true;
	}

	async function deleteHabit(id: string) {
		if (confirmDeleteHabitId !== id) {
			confirmDeleteHabitId = id;
			return;
		}
		confirmDeleteHabitId = null;
		await habitStore.deleteHabit(id);
	}

	function onDragStart(e: DragEvent, id: string) {
		draggingId = id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', id);
		}
	}

	function onDragOver(e: DragEvent, id: string) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		if (id !== draggingId) dragOverId = id;
	}

	function onDragLeave() {
		dragOverId = null;
	}

	async function onDrop(e: DragEvent, targetId: string) {
		e.preventDefault();
		if (!draggingId || draggingId === targetId) {
			draggingId = null;
			dragOverId = null;
			return;
		}
		const reordered = [...sortedHabits];
		const fromIdx = reordered.findIndex((h) => h.id === draggingId);
		const toIdx = reordered.findIndex((h) => h.id === targetId);
		if (fromIdx < 0 || toIdx < 0) return;
		const [removed] = reordered.splice(fromIdx, 1);
		reordered.splice(toIdx, 0, removed);
		await habitStore.reorder(reordered.map((h) => h.id));
		draggingId = null;
		dragOverId = null;
	}

	function onDragEnd() {
		draggingId = null;
		dragOverId = null;
	}

	async function handleClearWorkoutData() {
		clearingData = true;
		clearDataError = null;
		try {
			await resetWorkoutData();
		} catch (err) {
			clearDataError = err instanceof Error ? err.message : 'Could not clear data. Please try again.';
			clearingData = false;
		}
	}

	function handleResetPreferences() {
		prefsStore.resetToDefaults();
		showResetPrefsConfirm = false;
	}
</script>

<svelte:head>
	<title>Settings — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide settings-page">
	<header class="settings-page__header">
		<p class="settings-page__eyebrow">Preferences</p>
		<h1 class="settings-page__title">Settings</h1>
	</header>

	<div class="settings-grid">
		<section class="settings-section settings-section--accent" aria-labelledby="section-accent">
			<h2 class="settings-section__title" id="section-accent">Accent Color</h2>
			<AccentColorPicker />
		</section>

		<section class="settings-section" aria-labelledby="section-unit">
			<h2 class="settings-section__title" id="section-unit">Weight Unit</h2>
			<SegmentedControl
				options={WEIGHT_UNITS}
				value={prefsStore.weightUnit}
				onchange={(v) => prefsStore.setWeightUnit(v)}
				ariaLabel="Weight unit"
			/>
		</section>

		<section class="settings-section" aria-labelledby="section-feel">
			<h2 class="settings-section__title" id="section-feel">Completion Feel</h2>
			<div class="option-list" role="radiogroup" aria-labelledby="section-feel">
				{#each COMPLETION_FEELS as opt}
					<button
						class="option-row"
						class:option-row--active={prefsStore.completionFeel === opt.value}
						role="radio"
						aria-checked={prefsStore.completionFeel === opt.value}
						onclick={() => prefsStore.setCompletionFeel(opt.value)}
					>
						<div class="option-row__info">
							<span class="option-row__label">{opt.label}</span>
							<span class="option-row__desc">{opt.desc}</span>
						</div>
						<span class="option-row__radio" aria-hidden="true"></span>
					</button>
				{/each}
			</div>
		</section>

		<section class="settings-section" aria-labelledby="section-density">
			<h2 class="settings-section__title" id="section-density">Density</h2>
			<SegmentedControl
				options={DENSITIES}
				value={prefsStore.density}
				onchange={(v) => prefsStore.setDensity(v)}
				ariaLabel="Density"
			/>
		</section>

		<section class="settings-section" aria-labelledby="section-roundness">
			<h2 class="settings-section__title" id="section-roundness">Roundness</h2>
			<SegmentedControl
				options={ROUNDNESS_OPTIONS}
				value={prefsStore.roundness}
				onchange={(v) => prefsStore.setRoundness(v)}
				ariaLabel="Roundness"
			/>
		</section>

		<section class="settings-section settings-section--habits" aria-labelledby="section-habits">
			<div class="settings-section__title-row">
				<h2 class="settings-section__title" id="section-habits">Habits</h2>
				<button class="habits-add-btn" onclick={openNewHabit} aria-label="Add habit">
					<Icon name="plus" size={13} stroke={2.5} />
					Add
				</button>
			</div>

			{#if habitStore.habits.length === 0}
				<p class="habits-empty">No habits yet. Tap Add to create your first.</p>
			{:else}
				<p class="habits-drag-hint">Drag to reorder</p>
				<div class="habits-list">
					{#each sortedHabits as habit (habit.id)}
						<HabitRow
							{habit}
							dragging={draggingId === habit.id}
							dragover={dragOverId === habit.id}
							confirmingDelete={confirmDeleteHabitId === habit.id}
							ondragstart={(e) => onDragStart(e, habit.id)}
							ondragover={(e) => onDragOver(e, habit.id)}
							ondragleave={onDragLeave}
							ondrop={(e) => onDrop(e, habit.id)}
							ondragend={onDragEnd}
							ontoggle={() => habitStore.toggleActive(habit.id)}
							onedit={() => openEditHabit(habit)}
							ondelete={() => deleteHabit(habit.id)}
							oncanceldelete={() => (confirmDeleteHabitId = null)}
						/>
					{/each}
				</div>
			{/if}
		</section>

		<section class="settings-section settings-section--data" aria-labelledby="section-data">
			<h2 class="settings-section__title" id="section-data">Data</h2>

			<div class="data-action">
				<p class="data-action__desc">
					Remove session history, custom programs and exercises, weight memory, and any in-progress session. Your
					appearance preferences are kept.
				</p>
				<button
					class="data-action__btn data-action__btn--danger"
					onclick={() => {
						clearDataError = null;
						showClearDataConfirm = true;
					}}
				>
					Clear workout data
				</button>
			</div>

			<div class="data-action">
				<p class="data-action__desc">
					Reset accent color, weight unit, completion feel, density, and roundness to their defaults. Workout data is
					not affected.
				</p>
				<button class="data-action__btn data-action__btn--secondary" onclick={() => (showResetPrefsConfirm = true)}>
					Reset preferences
				</button>
			</div>
		</section>
	</div>
</div>

{#if showHabitForm}
	<HabitForm editing={editingHabit} onclose={() => (showHabitForm = false)} />
{/if}

{#if showClearDataConfirm}
	<ConfirmDialog
		title="Clear workout data?"
		confirmLabel="Clear workout data"
		confirmBusyLabel="Clearing…"
		danger
		busy={clearingData}
		error={clearDataError}
		onconfirm={handleClearWorkoutData}
		oncancel={() => (showClearDataConfirm = false)}
	>
		This removes session history, custom programs and exercises, weight memory, and any in-progress session. Built-in
		content will be restored. This cannot be undone.
		{#if sessionStore.isActive}
			<br /><br />You have a session in progress — it will be discarded.
		{/if}
	</ConfirmDialog>
{/if}

{#if showResetPrefsConfirm}
	<ConfirmDialog
		title="Reset preferences?"
		confirmLabel="Reset preferences"
		danger
		onconfirm={handleResetPreferences}
		oncancel={() => (showResetPrefsConfirm = false)}
	>
		Reset accent color, weight unit, completion feel, density, and roundness to defaults?
	</ConfirmDialog>
{/if}

<style>
	.settings-page {
		container-type: inline-size;
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
	}

	@container page (inline-size >= 560px) {
		.settings-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 0 var(--space-8);
		}

		.settings-section--accent {
			grid-column: 1 / -1;
		}
		.settings-section--habits {
			grid-column: 1 / -1;
		}
		.settings-section--data {
			grid-column: 1 / -1;
		}
	}

	.settings-page__header {
		margin-block-end: var(--space-6);
	}

	.settings-page__eyebrow {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-1);
	}

	.settings-page__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.settings-section {
		margin-block-end: var(--space-6);
	}

	.settings-section__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	/* Completion feel option rows */
	.option-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.option-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-3) var(--space-4);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.option-row--active {
		border-color: var(--color-accent);
	}

	.option-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.option-row__label {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.option-row__desc {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.option-row__radio {
		inline-size: 20px;
		block-size: 20px;
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border-strong);
		flex-shrink: 0;
		position: relative;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.option-row--active .option-row__radio {
		border-color: var(--color-accent);

		&::after {
			content: '';
			position: absolute;
			inset: 3px;
			background: var(--color-accent);
			border-radius: var(--radius-full);
		}
	}

	/* Habits section */
	.settings-section__title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-3);

		.settings-section__title {
			margin-block-end: 0;
		}
	}

	.habits-add-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
	}

	.habits-empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.habits-drag-hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-block-end: var(--space-2);
	}

	.habits-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	/* Data actions */
	.data-action {
		margin-block-end: var(--space-5);

		&:last-child {
			margin-block-end: 0;
		}
	}

	.data-action__desc {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-3);
	}

	.data-action__btn {
		inline-size: 100%;
		block-size: 44px;
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.data-action__btn--danger {
		background: var(--color-red);
		color: #ffffff;
	}

	.data-action__btn--secondary {
		background: var(--color-surface-3);
		color: var(--color-red);
		border: 1px solid var(--color-border);
	}
</style>
