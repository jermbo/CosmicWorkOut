<script lang="ts">
	import type { CompletionFeel, Density, Roundness, HabitType } from '$lib/db/types';
	import { resetWorkoutData } from '$lib/db/database';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { habitStore } from '$lib/stores/habits.svelte';

	const ACCENT_PRESETS = [
		{ label: 'Lime', value: '#b2f042' },
		{ label: 'Lavender', value: '#b286fd' },
		{ label: 'Sky', value: '#60c6ff' },
		{ label: 'Red', value: '#e55733' },
		{ label: 'Orange', value: '#f97316' },
		{ label: 'Teal', value: '#2dd4bf' }
	];

	const DENSITIES: { value: Density; label: string }[] = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'spacious', label: 'Spacious' }
	];

	const ROUNDNESS_OPTIONS: { value: Roundness; label: string }[] = [
		{ value: 'sharp', label: 'Sharp' },
		{ value: 'default', label: 'Default' },
		{ value: 'soft', label: 'Soft' }
	];

	const HABIT_TYPES: { value: HabitType; label: string; desc: string }[] = [
		{ value: 'times', label: 'Times', desc: 'Tap to increment — no unit (e.g. coffee, supplements)' },
		{ value: 'minutes', label: 'Minutes', desc: 'Numeric duration input (e.g. meditation)' },
		{ value: 'count', label: 'Count', desc: 'Counter with a custom unit label (e.g. glasses, pages)' },
		{ value: 'boolean', label: 'Yes / No', desc: 'Simple toggle — done or not done' },
		{ value: 'mood', label: 'Mood', desc: 'Track how you feel on a −5 to +5 scale' }
	];

	const HABIT_PRESETS: { name: string; type: HabitType; unit: string }[] = [
		{ name: 'Meditation', type: 'minutes', unit: '' },
		{ name: 'Writing', type: 'count', unit: 'words' },
		{ name: 'Reading', type: 'count', unit: 'pages' },
		{ name: 'Water', type: 'count', unit: 'glasses' },
		{ name: 'Coffee', type: 'times', unit: '' },
		{ name: 'Alcohol', type: 'boolean', unit: '' },
		{ name: 'Mood', type: 'mood', unit: '' }
	];

	let customHex = $state(prefsStore.accentColor);
	let hexError = $state(false);
	let showClearDataConfirm = $state(false);
	let showResetPrefsConfirm = $state(false);
	let clearDataError = $state<string | null>(null);
	let clearingData = $state(false);

	// Habit management state
	let showHabitForm = $state(false);
	let editingHabit = $state<typeof habitStore.habits[0] | null>(null);
	let habitName = $state('');
	let habitUnit = $state('');
	let habitType = $state<HabitType>('times');
	let habitGoal = $state<number | undefined>(undefined);
	let habitSaving = $state(false);
	let confirmDeleteHabitId = $state<string | null>(null);
	let showPresetsPanel = $state(false);

	// Derived: does this type have a goal field?
	let typeHasGoal = $derived(habitType === 'times' || habitType === 'minutes' || habitType === 'count');
	// Does this type require a unit?
	let typeRequiresUnit = $derived(habitType === 'count');

	// Drag-to-reorder state
	let draggingId = $state<string | null>(null);
	let dragOverId = $state<string | null>(null);

	function openNewHabit() {
		editingHabit = null;
		habitName = '';
		habitUnit = '';
		habitType = 'times';
		habitGoal = undefined;
		showPresetsPanel = true;
		showHabitForm = true;
	}

	function applyPreset(preset: typeof HABIT_PRESETS[0]) {
		habitName = preset.name;
		habitType = preset.type;
		habitUnit = preset.unit;
		habitGoal = undefined;
		showPresetsPanel = false;
	}

	function openEditHabit(habit: typeof habitStore.habits[0]) {
		editingHabit = habit;
		habitName = habit.name;
		habitUnit = habit.unit;
		habitType = habit.type;
		habitGoal = habit.dailyGoal;
		showPresetsPanel = false;
		showHabitForm = true;
	}

	async function saveHabit() {
		if (!habitName.trim() || habitSaving) return;
		if (typeRequiresUnit && !habitUnit.trim()) return;
		habitSaving = true;
		try {
			if (editingHabit) {
				await habitStore.updateHabit({
					...editingHabit,
					name: habitName.trim(),
					unit: habitUnit.trim(),
					// Type is not editable on existing habits
					dailyGoal: typeHasGoal && habitGoal && habitGoal > 0 ? habitGoal : undefined
				});
			} else {
				await habitStore.addHabit({
					name: habitName.trim(),
					unit: habitUnit.trim(),
					type: habitType,
					dailyGoal: typeHasGoal && habitGoal && habitGoal > 0 ? habitGoal : undefined
				});
			}
			showHabitForm = false;
		} finally {
			habitSaving = false;
		}
	}

	async function deleteHabit(id: string) {
		if (confirmDeleteHabitId !== id) {
			confirmDeleteHabitId = id;
			return;
		}
		confirmDeleteHabitId = null;
		await habitStore.deleteHabit(id);
	}

	// Drag-to-reorder handlers
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
		// Build new order
		const sorted = [...habitStore.habits].sort((a, b) => a.sortOrder - b.sortOrder);
		const fromIdx = sorted.findIndex((h) => h.id === draggingId);
		const toIdx = sorted.findIndex((h) => h.id === targetId);
		if (fromIdx < 0 || toIdx < 0) return;
		const reordered = [...sorted];
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

	function habitTypeLabel(type: HabitType): string {
		return HABIT_TYPES.find((t) => t.value === type)?.label ?? type;
	}

	function applyCustomHex() {
		const val = customHex.trim();
		if (/^#[0-9a-fA-F]{6}$/.test(val)) {
			prefsStore.setAccentColor(val);
			hexError = false;
		} else {
			hexError = true;
		}
	}

	function selectPreset(value: string) {
		customHex = value;
		prefsStore.setAccentColor(value);
		hexError = false;
	}

	async function handleClearWorkoutData() {
		clearingData = true;
		clearDataError = null;
		try {
			await resetWorkoutData();
		} catch (err) {
			clearDataError =
				err instanceof Error ? err.message : 'Could not clear data. Please try again.';
			clearingData = false;
		}
	}

	function handleResetPreferences() {
		prefsStore.resetToDefaults();
		customHex = prefsStore.accentColor;
		hexError = false;
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
		<!-- Accent color -->
		<section class="settings-section settings-section--accent" aria-labelledby="section-accent">
			<h2 class="settings-section__title" id="section-accent">Accent Color</h2>
			<div class="color-swatches" role="group" aria-label="Accent color presets">
				{#each ACCENT_PRESETS as preset}
					<button
						class="color-swatch"
						class:color-swatch--active={prefsStore.accentColor === preset.value}
						style:--swatch={preset.value}
						onclick={() => selectPreset(preset.value)}
						aria-label="{preset.label}{prefsStore.accentColor === preset.value ? ' (selected)' : ''}"
						aria-pressed={prefsStore.accentColor === preset.value}
					>
						{#if prefsStore.accentColor === preset.value}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						{/if}
					</button>
				{/each}
			</div>
			<div class="hex-input-row">
				<label class="hex-input-label" for="hex-input">Custom hex</label>
				<div class="hex-input-wrap" class:hex-input-wrap--error={hexError}>
					<span class="hex-input-preview" style:background={prefsStore.accentColor}></span>
					<input
						id="hex-input"
						class="hex-input"
						type="text"
						bind:value={customHex}
						placeholder="#b2f042"
						maxlength={7}
						onblur={applyCustomHex}
						onkeydown={(e) => e.key === 'Enter' && applyCustomHex()}
					/>
				</div>
			</div>
		</section>

		<!-- Weight unit -->
		<section class="settings-section" aria-labelledby="section-unit">
			<h2 class="settings-section__title" id="section-unit">Weight Unit</h2>
			<div class="seg-control" role="radiogroup" aria-labelledby="section-unit">
				{#each (['lb', 'kg'] as const) as unit}
					<button
						class="seg-control__btn"
						class:seg-control__btn--active={prefsStore.weightUnit === unit}
						role="radio"
						aria-checked={prefsStore.weightUnit === unit}
						onclick={() => prefsStore.setWeightUnit(unit)}
					>
						{unit}
					</button>
				{/each}
			</div>
		</section>

		<!-- Completion feel -->
		<section class="settings-section" aria-labelledby="section-feel">
			<h2 class="settings-section__title" id="section-feel">Completion Feel</h2>
			<div class="option-list" role="radiogroup" aria-labelledby="section-feel">
				{#each ([{ value: 'full', label: 'Full', desc: 'Confetti + full ring animation' }, { value: 'subtle', label: 'Subtle', desc: 'Minimal indicators, no confetti' }] as const) as opt}
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

		<!-- Density -->
		<section class="settings-section" aria-labelledby="section-density">
			<h2 class="settings-section__title" id="section-density">Density</h2>
			<div class="seg-control" role="radiogroup" aria-labelledby="section-density">
				{#each DENSITIES as d}
					<button
						class="seg-control__btn"
						class:seg-control__btn--active={prefsStore.density === d.value}
						role="radio"
						aria-checked={prefsStore.density === d.value}
						onclick={() => prefsStore.setDensity(d.value)}
					>
						{d.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Roundness -->
		<section class="settings-section" aria-labelledby="section-roundness">
			<h2 class="settings-section__title" id="section-roundness">Roundness</h2>
			<div class="seg-control" role="radiogroup" aria-labelledby="section-roundness">
				{#each ROUNDNESS_OPTIONS as r}
					<button
						class="seg-control__btn"
						class:seg-control__btn--active={prefsStore.roundness === r.value}
						role="radio"
						aria-checked={prefsStore.roundness === r.value}
						onclick={() => prefsStore.setRoundness(r.value)}
					>
						{r.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Habits -->
		<section class="settings-section settings-section--habits" aria-labelledby="section-habits">
			<div class="settings-section__title-row">
				<h2 class="settings-section__title" id="section-habits">Habits</h2>
				<button class="habits-add-btn" onclick={openNewHabit} aria-label="Add habit">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					Add
				</button>
			</div>

			{#if habitStore.habits.length === 0}
				<p class="habits-empty">No habits yet. Tap Add to create your first.</p>
			{:else}
				<p class="habits-drag-hint">Drag to reorder</p>
				<div class="habits-list">
					{#each [...habitStore.habits].sort((a, b) => a.sortOrder - b.sortOrder) as habit (habit.id)}
						<div
							class="habit-row"
							class:habit-row--dragging={draggingId === habit.id}
							class:habit-row--dragover={dragOverId === habit.id}
							draggable="true"
							ondragstart={(e) => onDragStart(e, habit.id)}
							ondragover={(e) => onDragOver(e, habit.id)}
							ondragleave={onDragLeave}
							ondrop={(e) => onDrop(e, habit.id)}
							ondragend={onDragEnd}
							role="listitem"
						>
							<div class="habit-row__drag-handle" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<circle cx="9" cy="6" r="1.5" />
									<circle cx="15" cy="6" r="1.5" />
									<circle cx="9" cy="12" r="1.5" />
									<circle cx="15" cy="12" r="1.5" />
									<circle cx="9" cy="18" r="1.5" />
									<circle cx="15" cy="18" r="1.5" />
								</svg>
							</div>
							<div class="habit-row__info">
								<span class="habit-row__name">{habit.name}</span>
								<span class="habit-row__meta">
									{habitTypeLabel(habit.type)}{habit.dailyGoal ? ` · goal ${habit.dailyGoal}${habit.unit ? ' ' + habit.unit : ''}` : ''}{habit.unit && !habit.dailyGoal ? ` · ${habit.unit}` : ''}
								</span>
							</div>
							<div class="habit-row__actions">
								<button
									class="habit-row__toggle"
									class:habit-row__toggle--active={habit.active}
									onclick={() => habitStore.toggleActive(habit.id)}
									aria-label="{habit.active ? 'Deactivate' : 'Activate'} {habit.name}"
									role="switch"
									aria-checked={habit.active}
								>
									<span class="habit-row__toggle-thumb"></span>
								</button>
								<button
									class="habit-row__edit"
									onclick={() => openEditHabit(habit)}
									aria-label="Edit {habit.name}"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
									</svg>
								</button>
								{#if confirmDeleteHabitId === habit.id}
									<button class="habit-row__delete habit-row__delete--confirm" onclick={() => deleteHabit(habit.id)}>Sure?</button>
									<button class="habit-row__delete" onclick={() => (confirmDeleteHabitId = null)} aria-label="Cancel">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
											<line x1="18" y1="6" x2="6" y2="18" />
											<line x1="6" y1="6" x2="18" y2="18" />
										</svg>
									</button>
								{:else}
									<button class="habit-row__delete" onclick={() => deleteHabit(habit.id)} aria-label="Delete {habit.name}">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14H6L5 6" />
											<path d="M10 11v6M14 11v6" />
											<path d="M9 6V4h6v2" />
										</svg>
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<section class="settings-section settings-section--data" aria-labelledby="section-data">
			<h2 class="settings-section__title" id="section-data">Data</h2>

			<div class="data-action">
				<p class="data-action__desc">
					Remove session history, custom programs and exercises, weight memory, and any in-progress session.
					Your appearance preferences are kept.
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
					Reset accent color, weight unit, completion feel, density, and roundness to their defaults.
					Workout data is not affected.
				</p>
				<button
					class="data-action__btn data-action__btn--secondary"
					onclick={() => (showResetPrefsConfirm = true)}
				>
					Reset preferences
				</button>
			</div>
		</section>
	</div>
</div>

<!-- Habit form dialog -->
{#if showHabitForm}
	<div class="settings-confirm-backdrop" role="presentation" onclick={() => !habitSaving && (showHabitForm = false)}></div>
	<div class="settings-confirm habit-form" role="dialog" aria-labelledby="habit-form-title" aria-modal="true">
		<p class="settings-confirm__title" id="habit-form-title">{editingHabit ? 'Edit Habit' : 'New Habit'}</p>

		<!-- Presets panel (shown only when creating new) -->
		{#if showPresetsPanel && !editingHabit}
			<div class="hf-presets">
				<p class="hf-presets__label">Start from a preset</p>
				<div class="hf-presets__grid">
					{#each HABIT_PRESETS as preset}
						<button
							class="hf-preset-btn"
							onclick={() => applyPreset(preset)}
						>
							{preset.name}
						</button>
					{/each}
				</div>
				<button class="hf-presets__skip" onclick={() => (showPresetsPanel = false)}>
					Start from scratch
				</button>
			</div>
		{:else}
			<div class="hf-field">
				<label class="hf-label" for="habit-name">Name <span class="hf-hint">max 40 chars</span></label>
				<input id="habit-name" class="hf-input" type="text" bind:value={habitName} placeholder="e.g. Water" maxlength={40} />
			</div>

			<!-- Type — locked when editing -->
			{#if editingHabit}
				<div class="hf-field">
					<span class="hf-label">Type <span class="hf-hint">locked after creation</span></span>
					<div class="hf-type-locked">
						{habitTypeLabel(habitType)}
					</div>
				</div>
			{:else}
				<div class="hf-field">
					<span class="hf-label">Type</span>
					<div class="hf-types">
						{#each HABIT_TYPES as ht}
							<button
								class="hf-type-btn"
								class:hf-type-btn--active={habitType === ht.value}
								onclick={() => { habitType = ht.value; if (!['count'].includes(ht.value)) habitUnit = ''; }}
								aria-pressed={habitType === ht.value}
							>
								<span class="hf-type-btn__label">{ht.label}</span>
								<span class="hf-type-btn__desc">{ht.desc}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Unit (Count type only) -->
			{#if habitType === 'count'}
				<div class="hf-field">
					<label class="hf-label" for="habit-unit">Unit label <span class="hf-hint">required · max 20 chars</span></label>
					<input id="habit-unit" class="hf-input" type="text" bind:value={habitUnit} placeholder="e.g. glasses, pages, words" maxlength={20} />
				</div>
			{/if}

			<!-- Daily goal (Times, Minutes, Count only) -->
			{#if typeHasGoal}
				<div class="hf-field">
					<label class="hf-label" for="habit-goal">Daily goal <span class="hf-hint">optional</span></label>
					<input id="habit-goal" class="hf-input" type="number" bind:value={habitGoal} placeholder="e.g. 8" min="1" />
				</div>
			{/if}

			<div class="settings-confirm__actions" style="margin-block-start: var(--space-4);">
				<button class="settings-confirm__btn settings-confirm__btn--cancel" onclick={() => (showHabitForm = false)} disabled={habitSaving}>Cancel</button>
				<button
					class="settings-confirm__btn settings-confirm__btn--danger"
					style="background: var(--color-accent); color: var(--color-accent-ink);"
					onclick={saveHabit}
					disabled={!habitName.trim() || habitSaving || (typeRequiresUnit && !habitUnit.trim())}
				>
					{habitSaving ? 'Saving…' : 'Save'}
				</button>
			</div>
		{/if}
	</div>
{/if}

{#if showClearDataConfirm}
	<div
		class="settings-confirm-backdrop"
		role="presentation"
		onclick={() => !clearingData && (showClearDataConfirm = false)}
	></div>
	<div
		class="settings-confirm"
		role="alertdialog"
		aria-labelledby="clear-data-title"
		aria-modal="true"
	>
		<p class="settings-confirm__title" id="clear-data-title">Clear workout data?</p>
		<p class="settings-confirm__body">
			This removes session history, custom programs and exercises, weight memory, and any in-progress
			session. Built-in content will be restored. This cannot be undone.
			{#if sessionStore.isActive}
				<br /><br />You have a session in progress — it will be discarded.
			{/if}
		</p>
		{#if clearDataError}
			<p class="settings-confirm__error">{clearDataError}</p>
		{/if}
		<div class="settings-confirm__actions">
			<button
				class="settings-confirm__btn settings-confirm__btn--cancel"
				disabled={clearingData}
				onclick={() => (showClearDataConfirm = false)}
			>
				Cancel
			</button>
			<button
				class="settings-confirm__btn settings-confirm__btn--danger"
				disabled={clearingData}
				onclick={handleClearWorkoutData}
			>
				{clearingData ? 'Clearing…' : 'Clear workout data'}
			</button>
		</div>
	</div>
{/if}

{#if showResetPrefsConfirm}
	<div
		class="settings-confirm-backdrop"
		role="presentation"
		onclick={() => (showResetPrefsConfirm = false)}
	></div>
	<div
		class="settings-confirm"
		role="alertdialog"
		aria-labelledby="reset-prefs-title"
		aria-modal="true"
	>
		<p class="settings-confirm__title" id="reset-prefs-title">Reset preferences?</p>
		<p class="settings-confirm__body">
			Reset accent color, weight unit, completion feel, density, and roundness to defaults?
		</p>
		<div class="settings-confirm__actions">
			<button
				class="settings-confirm__btn settings-confirm__btn--cancel"
				onclick={() => (showResetPrefsConfirm = false)}
			>
				Cancel
			</button>
			<button
				class="settings-confirm__btn settings-confirm__btn--danger"
				onclick={handleResetPreferences}
			>
				Reset preferences
			</button>
		</div>
	</div>
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

		.settings-section--accent { grid-column: 1 / -1; }
		.settings-section--habits { grid-column: 1 / -1; }
		.settings-section--data { grid-column: 1 / -1; }
	}

	.settings-page__header { margin-block-end: var(--space-6); }

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

	.settings-section { margin-block-end: var(--space-6); }

	.settings-section__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	/* Color swatches */
	.color-swatches {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin-block-end: var(--space-3);
	}

	.color-swatch {
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--radius-full);
		background: var(--swatch);
		border: 3px solid transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color var(--duration-fast) var(--ease-out);

		svg { inline-size: 18px; block-size: 18px; color: #101010; }
	}

	.color-swatch--active { border-color: var(--color-text-primary); }

	.hex-input-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.hex-input-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.hex-input-wrap {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding-inline: var(--space-3);
		block-size: 40px;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.hex-input-wrap--error { border-color: var(--color-red); }

	.hex-input-preview {
		inline-size: 18px;
		block-size: 18px;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.hex-input {
		background: none;
		border: none;
		outline: none;
		font: inherit;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-text-primary);
		inline-size: 80px;

		&::placeholder { color: var(--color-text-muted); }
	}

	/* Option rows */
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

	.option-row--active { border-color: var(--color-accent); }

	.option-row__info { flex: 1; min-inline-size: 0; }

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

	/* Segmented control */
	.seg-control {
		display: flex;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 3px;
		gap: 3px;
	}

	.seg-control__btn {
		flex: 1;
		block-size: 38px;
		border-radius: calc(var(--radius-lg) - 4px);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.seg-control__btn--active {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
	}

	/* Habits section */
	.settings-section__title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-3);

		.settings-section__title { margin-block-end: 0; }
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

		svg { inline-size: 13px; block-size: 13px; }
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

	.habit-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			opacity var(--duration-fast) var(--ease-out);
	}

	.habit-row--dragging {
		opacity: 0.4;
	}

	.habit-row--dragover {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface-2));
	}

	.habit-row__drag-handle {
		display: flex;
		align-items: center;
		cursor: grab;
		color: var(--color-text-muted);
		flex-shrink: 0;

		svg { inline-size: 16px; block-size: 16px; }
		&:active { cursor: grabbing; }
	}

	.habit-row__info { flex: 1; min-inline-size: 0; }

	.habit-row__name {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.habit-row__meta {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
		text-transform: capitalize;
	}

	.habit-row__actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.habit-row__toggle {
		position: relative;
		inline-size: 40px;
		block-size: 24px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.habit-row__toggle--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.habit-row__toggle-thumb {
		position: absolute;
		inset-block: 2px;
		inset-inline-start: 2px;
		inline-size: 18px;
		block-size: 18px;
		border-radius: var(--radius-full);
		background: white;
		transition: transform var(--duration-fast) var(--ease-out);

		.habit-row__toggle--active & { transform: translateX(16px); }
	}

	.habit-row__edit,
	.habit-row__delete {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		transition: color var(--duration-fast) var(--ease-out);

		svg { inline-size: 14px; block-size: 14px; }
		&:hover { color: var(--color-text-secondary); }
	}

	.habit-row__delete:hover { color: var(--color-red); }

	.habit-row__delete--confirm {
		inline-size: auto;
		padding-inline: var(--space-2);
		background: var(--color-red);
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 700;
	}

	/* Habit form */
	.habit-form {
		max-block-size: 85dvh;
		overflow-y: auto;
	}

	.hf-field {
		margin-block-end: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.hf-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.hf-hint {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: var(--color-text-muted);
	}

	.hf-input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		outline: none;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus { border-color: var(--color-accent); }
		&::placeholder { color: var(--color-text-muted); }
	}

	.hf-type-locked {
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.hf-types {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.hf-type-btn {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.hf-type-btn--active { border-color: var(--color-accent); }

	.hf-type-btn__label {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.hf-type-btn__desc {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	/* Presets panel */
	.hf-presets { padding-block-end: var(--space-2); }

	.hf-presets__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.hf-presets__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.hf-preset-btn {
		padding: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		text-align: center;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover { border-color: var(--color-accent); color: var(--color-accent); }
	}

	.hf-presets__skip {
		display: block;
		inline-size: 100%;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		font-weight: 600;
	}

	/* Data actions */
	.data-action {
		margin-block-end: var(--space-5);

		&:last-child { margin-block-end: 0; }
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

	/* Confirm dialogs */
	.settings-confirm-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 90;
	}

	.settings-confirm {
		position: fixed;
		inset-inline: var(--space-4);
		inset-block-start: 50%;
		transform: translateY(-50%);
		max-inline-size: 440px;
		margin-inline: auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--r-xl);
		padding: var(--space-5);
		z-index: 91;
		box-shadow: var(--shadow-lg);
	}

	.settings-confirm__title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.settings-confirm__body {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-4);
		line-height: 1.5;
	}

	.settings-confirm__error {
		font-size: 0.875rem;
		color: var(--color-red);
		margin-block-end: var(--space-4);
		line-height: 1.5;
	}

	.settings-confirm__actions {
		display: flex;
		gap: var(--space-2);
	}

	.settings-confirm__btn {
		flex: 1;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;
		min-block-size: 48px;
	}

	.settings-confirm__btn--cancel {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
	}

	.settings-confirm__btn--danger {
		background: var(--color-red);
		color: #ffffff;
	}

	.settings-confirm__btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
