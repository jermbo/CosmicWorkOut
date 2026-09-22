<script lang="ts">
	import type { Baseline } from '$lib/db/types';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import BaselineForm from '$lib/components/BaselineForm.svelte';
	import BaselineRow from '$lib/components/BaselineRow.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import SettingsSubHeader from '$lib/components/SettingsSubHeader.svelte';
	import SettingsGroup from '$lib/components/SettingsGroup.svelte';
	import SettingsToggleRow from '$lib/components/SettingsToggleRow.svelte';

	let showForm = $state(false);
	let editingBaseline = $state<Baseline | null>(null);
	let confirmDeleteId = $state<string | null>(null);

	let draggingId = $state<string | null>(null);
	let dragOverId = $state<string | null>(null);

	let sortedBaselines = $derived(
		[...baselineStore.baselines].sort((a, b) => a.sortOrder - b.sortOrder),
	);

	function openNew() {
		editingBaseline = null;
		showForm = true;
	}

	function openEdit(baseline: Baseline) {
		editingBaseline = baseline;
		showForm = true;
	}

	async function deleteBaseline(id: string) {
		if (confirmDeleteId !== id) {
			confirmDeleteId = id;
			return;
		}
		confirmDeleteId = null;
		await baselineStore.deleteBaseline(id);
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
		const reordered = [...sortedBaselines];
		const fromIdx = reordered.findIndex((b) => b.id === draggingId);
		const toIdx = reordered.findIndex((b) => b.id === targetId);
		if (fromIdx < 0 || toIdx < 0) return;
		const [removed] = reordered.splice(fromIdx, 1);
		reordered.splice(toIdx, 0, removed);
		await baselineStore.reorder(reordered.map((b) => b.id));
		draggingId = null;
		dragOverId = null;
	}

	function onDragEnd() {
		draggingId = null;
		dragOverId = null;
	}
</script>

<svelte:head>
	<title>Baselines — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide">
	<SettingsSubHeader title="Baselines" />

	<SettingsGroup title="Baselines">
		<SettingsToggleRow
			label="Baselines"
			description="Embarrassingly low daily baselines for anything you want to keep showing up for. Your baseline data is kept when off."
			checked={prefsStore.baselinesEnabled}
			onchange={(v) => prefsStore.setBaselinesEnabled(v)}
		/>
	</SettingsGroup>

	{#if prefsStore.baselinesEnabled}
		<section
			class="settings-section"
			aria-labelledby="section-baselines"
		>
			<div class="settings-section__title-row">
				<h2
					class="settings-section__title"
					id="section-baselines"
				>
					Baselines
				</h2>
				<button
					class="baselines-add-btn"
					onclick={openNew}
					aria-label="Add baseline"
				>
					<Icon
						name="plus"
						size={13}
						stroke={2.5}
					/>
					Add
				</button>
			</div>

			{#if sortedBaselines.length === 0}
				<p class="baselines-empty">No baselines yet. Tap Add and set the bar embarrassingly low.</p>
			{:else}
				<p class="baselines-drag-hint">Drag to reorder</p>
				<div class="baselines-list">
					{#each sortedBaselines as baseline (baseline.id)}
						<BaselineRow
							{baseline}
							dragging={draggingId === baseline.id}
							dragover={dragOverId === baseline.id}
							confirmingDelete={confirmDeleteId === baseline.id}
							ondragstart={(e) => onDragStart(e, baseline.id)}
							ondragover={(e) => onDragOver(e, baseline.id)}
							ondragleave={onDragLeave}
							ondrop={(e) => onDrop(e, baseline.id)}
							ondragend={onDragEnd}
							ontoggle={() => baselineStore.toggleActive(baseline.id)}
							onedit={() => openEdit(baseline)}
							ondelete={() => deleteBaseline(baseline.id)}
							oncanceldelete={() => (confirmDeleteId = null)}
						/>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>

{#if showForm}
	<BaselineForm
		editing={editingBaseline}
		onclose={() => (showForm = false)}
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

	.baselines-add-btn {
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

	.baselines-empty,
	.baselines-drag-hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-block-end: var(--space-2);
	}

	.baselines-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
