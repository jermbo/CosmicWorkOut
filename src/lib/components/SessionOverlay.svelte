<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { formatElapsed, formatCountWithWord } from '$lib/format';
	import type { ActiveItem, ActiveSet } from '$lib/db/types';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import ExerciseCard from './ExerciseCard.svelte';
	import LogSetSheet from './LogSetSheet.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';

	let showAbandonConfirm = $state(false);
	let elapsed = $state(0);
	let sheetTarget = $state<{ exerciseIndex: number; setIndex: number } | null>(null);
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

	let totalSets = $derived(
		activeItems.reduce((sum: number, ex: ActiveItem) => sum + ex.sets.length, 0),
	);

	let doneSets = $derived(
		activeItems.reduce(
			(sum: number, ex: ActiveItem) => sum + ex.sets.filter((s: ActiveSet) => s.completed).length,
			0,
		),
	);

	let allDone = $derived(totalSets > 0 && doneSets === totalSets);

	/** The first exercise with a set still to log — drawn as the live Training field. */
	let currentIndex = $derived(activeItems.findIndex((ex) => ex.sets.some((s) => !s.completed)));
	let isEditing = $derived(sessionStore.active?.isEditing === true);

	let finishing = $state(false);

	// A failed save leaves the session active (the DB layer already toasts), so Finish can be retried.
	async function handleFinish() {
		if (finishing) return;
		finishing = true;
		try {
			await sessionStore.finish(elapsed);
			await programStore.refreshSessions();
		} catch (e) {
			console.error('[session] finish failed', e);
		} finally {
			finishing = false;
		}
	}

	function handleAbandonRequest() {
		showAbandonConfirm = true;
	}

	function handleAbandonConfirm() {
		sessionStore.abandon();
	}

	function handleAbandonCancel() {
		showAbandonConfirm = false;
	}

	function handleSetTap(exerciseIndex: number, setIndex: number) {
		const activeExercise = sessionStore.activeItems[exerciseIndex];
		const set = activeExercise?.sets[setIndex];
		if (!set) return;

		if (set.completed) {
			sheetTarget = { exerciseIndex, setIndex };
		} else {
			const hasWeight =
				activeExercise!.unit === 'bodyweight' ||
				activeExercise!.unit === 'band' ||
				(typeof set.weight === 'number' && set.weight > 0) ||
				(typeof set.weight === 'string' && Boolean(set.weight));

			if (hasWeight) {
				sessionStore.completeSet(exerciseIndex, setIndex);
			} else {
				sheetTarget = { exerciseIndex, setIndex };
			}
		}
	}

	function handleSheetSave(weight: number | string, reps: number) {
		if (!sheetTarget) {
			return;
		}
		sessionStore.logSet(sheetTarget.exerciseIndex, sheetTarget.setIndex, weight, reps);
		sheetTarget = null;
	}

	let sheetExercise = $derived.by(() => {
		if (!sheetTarget) return null;
		return programStore.getItemById(activeItems[sheetTarget.exerciseIndex]?.itemId ?? '');
	});

	let sheetActiveSet = $derived.by(() => {
		if (!sheetTarget) return null;
		return activeItems[sheetTarget.exerciseIndex]?.sets[sheetTarget.setIndex];
	});

	let abandonTitle = $derived.by(() => {
		if (isEditing) return 'Discard changes?';
		return 'End this session?';
	});

	let abandonConfirmLabel = $derived.by(() => {
		if (isEditing) return 'Discard';
		return 'End session';
	});
</script>

<BottomSheet
	onclose={handleAbandonRequest}
	maxHeight="100dvh"
	hideHandle
	fixedHeight
>
	<div
		class="session-overlay__inner"
		aria-labelledby="session-title"
		aria-modal="true"
	>
		<header class="session-overlay__header">
			<div class="session-overlay__top-row">
				<button
					class="session-overlay__back-btn"
					onclick={handleAbandonRequest}
					aria-label="End session"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</button>

				<div class="session-overlay__titles">
					<p
						class="session-overlay__workout-name"
						id="session-title"
					>
						{sessionStore.activeRoutineName}
					</p>
					<p class="session-overlay__context">
						{#if isEditing}
							Editing · {formatCountWithWord(doneSets, 'set')} logged
						{:else}
							{doneSets}/{totalSets} sets
						{/if}
					</p>
				</div>

				<div
					class="session-overlay__timer"
					aria-live="off"
					aria-label="Elapsed time {elapsedFormatted}"
				>
					<span class="session-overlay__timer-label">Elapsed</span>
					<span class="session-overlay__timer-value">{elapsedFormatted}</span>
				</div>
			</div>

			<div
				class="session-overlay__progress"
				role="progressbar"
				aria-valuenow={doneSets}
				aria-valuemin={0}
				aria-valuemax={totalSets}
				aria-label="Session progress"
			>
				{#each { length: totalSets }, i (i)}
					<span
						class="session-overlay__progress-seg"
						class:session-overlay__progress-seg--on={i < doneSets}
					></span>
				{/each}
			</div>
		</header>

		<div class="session-overlay__exercises">
			{#if sessionStore.active}
				{#each activeItems as activeExercise, exerciseIndex (activeExercise.itemId)}
					{@const exercise = programStore.getItemById(activeExercise.itemId)}
					{#if exercise}
						<ExerciseCard
							{activeExercise}
							{exercise}
							{exerciseIndex}
							current={exerciseIndex === currentIndex}
							onSetTap={handleSetTap}
						/>
					{/if}
				{/each}
			{/if}
		</div>

		<div class="session-overlay__footer">
			<button
				class="session-overlay__finish"
				class:session-overlay__finish--all-done={allDone}
				onclick={handleFinish}
				disabled={finishing}
			>
				{#if isEditing}
					Save changes
				{:else if allDone}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polygon
							points="14.5 2 18.5 9.5 23 10.9 17.5 16.5 18.8 21.5 14.5 19 10.2 21.5 11.5 16.5 6 10.9 10.5 9.5 14.5 2"
						/>
					</svg>
					Finish session
				{:else}
					Finish early · {doneSets}/{totalSets} sets
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
				oncancel={handleAbandonCancel}
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

{#if sheetTarget && sheetExercise && sheetActiveSet}
	<LogSetSheet
		exercise={sheetExercise}
		activeSet={sheetActiveSet}
		setIndex={sheetTarget.setIndex}
		onSave={handleSheetSave}
		onClose={() => (sheetTarget = null)}
	/>
{/if}

<style>
	.session-overlay__inner {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		block-size: 100%;
	}

	.session-overlay__header {
		flex-shrink: 0;
		inline-size: min(100%, var(--max-width));
		margin-inline: auto;
		padding-block-end: var(--space-3);
		border-block-end: var(--rule) solid var(--color-paper);
	}

	.session-overlay__top-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: calc(var(--safe-top) + var(--space-3)) var(--space-4) var(--space-3);
	}

	.session-overlay__back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 40px;
		block-size: 40px;
		border: var(--rule) solid var(--color-paper);
		color: var(--color-text-primary);
		flex-shrink: 0;

		svg {
			inline-size: 20px;
			block-size: 20px;
		}

		&:active {
			background: var(--color-paper);
			color: var(--color-ink);
		}
	}

	.session-overlay__titles {
		flex: 1;
		min-inline-size: 0;
	}

	.session-overlay__workout-name {
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1.125rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1.1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.session-overlay__context {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-block-start: 2px;
	}

	.session-overlay__timer {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
	}

	.session-overlay__timer-label {
		font-size: 0.625rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.session-overlay__timer-value {
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	/* One segment per set, split by ink rules — filled in the Training hue. */
	.session-overlay__progress {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		margin-inline: var(--space-4);
		border: var(--rule-thin) solid var(--color-paper);
	}

	.session-overlay__progress-seg {
		block-size: 12px;

		& + & {
			border-inline-start: var(--rule-thin) solid var(--color-border);
		}
	}

	.session-overlay__progress-seg--on {
		background: var(--field-train);
	}

	.session-overlay__exercises {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4) calc(var(--space-4) + var(--press-offset)) var(--space-4) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--card-gap);
		overscroll-behavior: contain;
		inline-size: min(100%, var(--max-width));
		margin-inline: auto;
	}

	.session-overlay__footer {
		flex-shrink: 0;
		padding: var(--space-4) calc(var(--space-4) + var(--press-offset))
			calc(var(--safe-bottom) + var(--space-4)) var(--space-4);
		border-block-start: var(--rule) solid var(--color-paper);
		background: var(--color-ink);
		inline-size: min(100%, var(--max-width));
		margin-inline: auto;
	}

	.session-overlay__finish {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		inline-size: 100%;
		min-block-size: 56px;
		padding-block: var(--space-3);
		background: transparent;
		color: var(--color-text-primary);
		border: var(--rule) solid var(--color-paper);
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 0.9375rem;
		font-weight: 800;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		svg {
			inline-size: 18px;
			block-size: 18px;
		}

		&:active:not(:disabled) {
			background: var(--color-paper);
			color: var(--color-ink);
		}
	}

	/* All sets logged: the big paper button with a Training shadow, like LOG SET. */
	.session-overlay__finish--all-done {
		min-block-size: 72px;
		background: var(--color-paper);
		color: var(--color-ink);
		font-size: 1.25rem;
		font-weight: 900;
		box-shadow: var(--press-offset) var(--press-offset) 0 var(--field-train);

		&:active:not(:disabled) {
			transform: translate(var(--press-offset), var(--press-offset));
			box-shadow: none;
		}
	}
</style>
