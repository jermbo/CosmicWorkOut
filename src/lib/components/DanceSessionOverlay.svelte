<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { formatElapsed, formatCountWithWord } from '$lib/format';
	import type { ActiveItem, Item } from '$lib/db/types';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { disciplineById } from '$lib/discipline';
	import BottomSheet from './BottomSheet.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import ValueDialog from './ValueDialog.svelte';

	let showAbandonConfirm = $state(false);
	let elapsed = $state(0);
	let sectionIdx = $state(0);
	let measureTarget = $state<{ itemIndex: number; mode: 'duration' | 'reps' } | null>(null);
	let timerInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		timerInterval = setInterval(() => {
			elapsed++;
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(timerInterval);
	});

	let elapsedFormatted = $derived(formatElapsed(elapsed));
	let activeItems = $derived(sessionStore.activeItems);
	let disciplineId = $derived(sessionStore.activeDisciplineId ?? '');
	let sections = $derived(disciplineById(disciplineId)?.sections ?? []);
	let currentSection = $derived(sections[sectionIdx]);
	let isEditing = $derived(sessionStore.active?.isEditing === true);

	let sectionItems = $derived.by(() => {
		const key = currentSection?.key;
		if (!key) return [] as Array<{ item: ActiveItem; index: number; def: Item | undefined }>;
		return activeItems
			.map((item, index) => ({ item, index, def: programStore.getItemById(item.itemId) }))
			.filter(({ item }) => item.section === key);
	});

	function isItemDone(item: ActiveItem): boolean {
		if (item.metric === 'check') return item.checked === true;
		if (item.metric === 'measure') return item.skipped === true || item.value != null;
		return false;
	}

	let totalItems = $derived(activeItems.length);
	let doneItems = $derived(activeItems.filter(isItemDone).length);
	let progressPct = $derived.by(() => {
		if (totalItems > 0) return (doneItems / totalItems) * 100;
		return 0;
	});
	let allDone = $derived(totalItems > 0 && doneItems === totalItems);

	async function handleFinish() {
		await sessionStore.finish(elapsed);
		await programStore.refreshSessions();
	}

	function handleAbandonRequest() {
		showAbandonConfirm = true;
	}

	function handleAbandonConfirm() {
		sessionStore.abandon();
	}

	function openMeasure(index: number, mode: 'duration' | 'reps') {
		measureTarget = { itemIndex: index, mode };
	}

	function handleMeasureSave(value: number) {
		if (!measureTarget) return;
		sessionStore.setMeasure(measureTarget.itemIndex, value, measureTarget.mode);
		measureTarget = null;
	}

	function measureUnitLabel(mode: 'duration' | 'reps' | undefined): string {
		if (mode === 'reps') return 'reps';
		return 'sec';
	}

	function measureDialogTitle(mode: 'duration' | 'reps' | undefined): string {
		if (mode === 'reps') return 'Log reps';
		return 'Log duration (seconds)';
	}

	let abandonTitle = $derived.by(() => {
		if (isEditing) return 'Discard changes?';
		return 'End this practice?';
	});

	let abandonConfirmLabel = $derived.by(() => {
		if (isEditing) return 'Discard';
		return 'End practice';
	});

	function formatMeasureValue(item: ActiveItem): string {
		if (item.skipped) return 'Skipped';
		if (item.value == null) return 'Tap to log';
		return `${item.value} ${measureUnitLabel(item.measureMode)}`;
	}
</script>

<BottomSheet onclose={handleAbandonRequest} maxHeight="100dvh" hideHandle fixedHeight>
	<div class="dance-session" aria-labelledby="dance-session-title" aria-modal="true">
		<header class="dance-session__header">
			<div class="dance-session__top">
				<button class="dance-session__back" onclick={handleAbandonRequest} aria-label="End session">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</button>
				<div class="dance-session__titles">
					<p class="dance-session__name" id="dance-session-title">{sessionStore.activeRoutineName}</p>
					<p class="dance-session__context">
						{#if isEditing}
							Editing · {formatCountWithWord(doneItems, 'item')} logged
						{:else}
							{doneItems}/{totalItems} items · {currentSection?.label ?? ''}
						{/if}
					</p>
				</div>
				<div class="dance-session__timer" aria-label="Elapsed time {elapsedFormatted}">
					<span class="dance-session__timer-label">Elapsed</span>
					<span class="dance-session__timer-value">{elapsedFormatted}</span>
				</div>
			</div>
			<div
				class="dance-session__progress"
				role="progressbar"
				aria-valuenow={doneItems}
				aria-valuemin={0}
				aria-valuemax={totalItems}
			>
				<div class="dance-session__progress-fill" style:inline-size="{progressPct}%"></div>
			</div>
			<div class="dance-session__sections" role="tablist" aria-label="Routine sections">
				{#each sections as section, i}
					<button
						class="dance-session__sec-tab"
						class:dance-session__sec-tab--active={i === sectionIdx}
						role="tab"
						aria-selected={i === sectionIdx}
						onclick={() => (sectionIdx = i)}
					>
						{section.label}
					</button>
				{/each}
			</div>
		</header>

		<div class="dance-session__items">
			{#each sectionItems as { item, index, def }}
				{#if def}
					<div class="dance-item" class:dance-item--done={isItemDone(item)}>
						{#if item.metric === 'check'}
							<label class="dance-item__check">
								<input
									type="checkbox"
									checked={item.checked === true}
									onchange={() => sessionStore.toggleCheck(index)}
								/>
								<span class="dance-item__name">{def.name}</span>
							</label>
							{#if def.cue}
								<p class="dance-item__cue">{def.cue}</p>
							{/if}
						{:else if item.metric === 'measure'}
							<div class="dance-item__measure">
								<div class="dance-item__measure-head">
									<span class="dance-item__name">{def.name}</span>
									<button
										class="dance-item__value"
										class:dance-item__value--skipped={item.skipped}
										onclick={() => openMeasure(index, item.measureMode ?? 'duration')}
									>
										{formatMeasureValue(item)}
									</button>
								</div>
								{#if def.cue}
									<p class="dance-item__cue">{def.cue}</p>
								{/if}
								<div class="dance-item__modes">
									<button
										class="dance-item__mode"
										class:dance-item__mode--active={(item.measureMode ?? 'duration') === 'duration'}
										onclick={() => openMeasure(index, 'duration')}
									>
										Duration
									</button>
									<button
										class="dance-item__mode"
										class:dance-item__mode--active={item.measureMode === 'reps'}
										onclick={() => openMeasure(index, 'reps')}
									>
										Reps
									</button>
									<button class="dance-item__skip" onclick={() => sessionStore.skipItem(index)}>Skip</button>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>

		<div class="dance-session__footer">
			<div class="dance-session__nav">
				<button class="dance-session__nav-btn" disabled={sectionIdx === 0} onclick={() => sectionIdx--}>Previous</button
				>
				<button
					class="dance-session__nav-btn"
					disabled={sectionIdx >= sections.length - 1}
					onclick={() => sectionIdx++}
				>
					Next
				</button>
			</div>
			<button class="dance-session__finish" class:dance-session__finish--all-done={allDone} onclick={handleFinish}>
				{#if isEditing}
					Save changes
				{:else if allDone}
					Finish practice
				{:else}
					Finish early · {doneItems}/{totalItems} items
				{/if}
			</button>
		</div>

		{#if showAbandonConfirm}
			<ConfirmDialog
				title={abandonTitle}
				confirmLabel={abandonConfirmLabel}
				cancelLabel="Keep going"
				danger
				onconfirm={handleAbandonConfirm}
				oncancel={() => (showAbandonConfirm = false)}
			>
				{#if isEditing}
					Your saved session will be kept. Only unsaved edits are lost.
				{:else}
					Your progress will not be saved.
				{/if}
			</ConfirmDialog>
		{/if}
	</div>
</BottomSheet>

{#if measureTarget}
	{@const item = activeItems[measureTarget.itemIndex]}
	<ValueDialog
		title={measureDialogTitle(measureTarget.mode)}
		unit={measureUnitLabel(measureTarget.mode)}
		initialValue={item?.value ?? 0}
		onsave={handleMeasureSave}
		onclose={() => (measureTarget = null)}
	/>
{/if}

<style>
	.dance-session {
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.dance-session__header {
		flex-shrink: 0;
		border-block-end: 1px solid var(--color-border);
	}

	.dance-session__top {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: calc(var(--safe-top) + var(--space-3)) var(--space-4) var(--space-3);
	}

	.dance-session__back {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		flex-shrink: 0;

		svg {
			inline-size: 20px;
			block-size: 20px;
		}
	}

	.dance-session__titles {
		flex: 1;
		min-inline-size: 0;
	}

	.dance-session__name {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dance-session__context {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.dance-session__timer {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
	}

	.dance-session__timer-label {
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.dance-session__timer-value {
		font-family: var(--font-mono);
		font-size: 1.0625rem;
		font-weight: 600;
	}

	.dance-session__progress {
		block-size: 5px;
		background: var(--color-surface-3);
		overflow: hidden;
	}

	.dance-session__progress-fill {
		block-size: 100%;
		background: var(--color-lavender);
		transition: inline-size 400ms var(--ease-spring);
	}

	.dance-session__sections {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-4);
		overflow-x: auto;
	}

	.dance-session__sec-tab {
		flex-shrink: 0;
		padding-inline: var(--space-3);
		block-size: 30px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.dance-session__sec-tab--active {
		background: color-mix(in srgb, var(--color-lavender) 20%, transparent);
		border-color: color-mix(in srgb, var(--color-lavender) 50%, transparent);
		color: var(--color-lavender);
	}

	.dance-session__items {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.dance-item {
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
	}

	.dance-item--done {
		border-color: color-mix(in srgb, var(--color-lavender) 35%, transparent);
	}

	.dance-item__check {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		cursor: pointer;

		input {
			inline-size: 22px;
			block-size: 22px;
			accent-color: var(--color-lavender);
		}
	}

	.dance-item__name {
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.dance-item__cue {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-2);
		padding-inline-start: calc(22px + var(--space-3));
	}

	.dance-item__measure-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.dance-item__value {
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-lavender);
	}

	.dance-item__value--skipped {
		color: var(--color-text-muted);
	}

	.dance-item__modes {
		display: flex;
		gap: var(--space-2);
		margin-block-start: var(--space-2);
		flex-wrap: wrap;
	}

	.dance-item__mode {
		padding-inline: var(--space-2);
		block-size: 28px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.dance-item__mode--active {
		border-color: var(--color-lavender);
		color: var(--color-lavender);
	}

	.dance-item__skip {
		margin-inline-start: auto;
		padding-inline: var(--space-2);
		block-size: 28px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.dance-session__footer {
		flex-shrink: 0;
		padding: var(--space-4) var(--space-4) calc(var(--safe-bottom) + var(--space-4));
		border-block-start: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.dance-session__nav {
		display: flex;
		gap: var(--space-2);
	}

	.dance-session__nav-btn {
		flex: 1;
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:disabled {
			opacity: 0.35;
		}
	}

	.dance-session__finish {
		block-size: 56px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	.dance-session__finish--all-done {
		background: var(--color-lavender);
		color: #101010;
		border-color: var(--color-lavender);
	}
</style>
