<script lang="ts">
	import type { Habit } from '$lib/db/types';
	import { habitStore } from '$lib/stores/habits.svelte';
	import HabitForm from '$lib/components/HabitForm.svelte';
	import HabitRow from '$lib/components/HabitRow.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';

	let showHabitForm = $state(false);
	let editingHabit = $state<Habit | null>(null);
	let confirmDeleteHabitId = $state<string | null>(null);

	let draggingId = $state<string | null>(null);
	let dragOverId = $state<string | null>(null);

	let sortedHabits = $derived(
		[...habitStore.habits].sort((a, b) => {
			if (a.type === 'mood') return 1;
			if (b.type === 'mood') return -1;
			return a.sortOrder - b.sortOrder;
		}),
	);

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
		const habit = sortedHabits.find((h) => h.id === id);
		if (habit?.type === 'mood') return;
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
		const reordered = sortedHabits.filter((h) => h.type !== 'mood');
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
</script>

<svelte:head>
	<title>Habits — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Habits" />

	<SettingsGroup title="Habits">
		<SettingsToggleRow
			label="Habits"
			description="Daily check-in for mood, water, meditation, and more. Your habits and logs are kept when off."
			checked={prefsStore.habitsEnabled}
			onchange={(v) => prefsStore.setHabitsEnabled(v)}
		/>
	</SettingsGroup>

	{#if prefsStore.habitsEnabled}
		<section
			class="settings-section"
			aria-labelledby="section-habits"
		>
			<div class="settings-section__title-row">
				<h2
					class="settings-section__title"
					id="section-habits"
				>
					Habits
				</h2>
				<button
					class="habits-add-btn"
					onclick={openNewHabit}
					aria-label="Add habit"
				>
					<Icon
						name="plus"
						size={13}
						stroke={2.5}
					/>
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
	{/if}
</div>

{#if showHabitForm}
	<HabitForm
		editing={editingHabit}
		onclose={() => (showHabitForm = false)}
	/>
{/if}

<style>
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
		color: var(--color-accent-text);
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
</style>
