<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import ExerciseCard from './ExerciseCard.svelte';
	import LogSetSheet from './LogSetSheet.svelte';

	let dialog: HTMLDialogElement;
	let showAbandonConfirm = $state(false);
	let elapsed = $state(0);
	let sheetTarget = $state<{ exerciseIndex: number; setIndex: number } | null>(null);
	let timerInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		dialog.showModal();
		timerInterval = setInterval(() => {
			elapsed++;
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(timerInterval);
	});

	let elapsedFormatted = $derived(
		`${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
	);

	let totalSets = $derived(
		sessionStore.active?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) ?? 0
	);

	let doneSets = $derived(
		sessionStore.active?.exercises.reduce(
			(sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
			0
		) ?? 0
	);

	let progressPct = $derived(totalSets > 0 ? (doneSets / totalSets) * 100 : 0);
	let allDone = $derived(totalSets > 0 && doneSets === totalSets);

	function handleCancel(event: Event) {
		event.preventDefault();
		showAbandonConfirm = true;
	}

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

	function handleAbandonCancel() {
		showAbandonConfirm = false;
	}

	function handleSetTap(exerciseIndex: number, setIndex: number) {
		if (prefsStore.loggingMode === 'instant') {
			sessionStore.completeSet(exerciseIndex, setIndex);
		} else {
			sheetTarget = { exerciseIndex, setIndex };
		}
	}

	function handleSheetSave(weight: number | string, reps: number) {
		if (!sheetTarget) {
			return;
		}
		sessionStore.logSet(sheetTarget.exerciseIndex, sheetTarget.setIndex, weight, reps);
		sheetTarget = null;
	}

	let sheetExercise = $derived(
		sheetTarget
			? programStore.exerciseMap.get(
					sessionStore.active?.exercises[sheetTarget.exerciseIndex]?.exerciseId ?? ''
				)
			: null
	);

	let sheetActiveSet = $derived(
		sheetTarget
			? sessionStore.active?.exercises[sheetTarget.exerciseIndex]?.sets[sheetTarget.setIndex]
			: null
	);
</script>

<dialog
	bind:this={dialog}
	class="session-overlay"
	oncancel={handleCancel}
	aria-labelledby="session-title"
	aria-modal="true"
>
	<div class="session-overlay__inner">
		<!-- Header -->
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
					<p class="session-overlay__workout-name" id="session-title">
						{sessionStore.active?.workoutName ?? ''}
					</p>
					<p class="session-overlay__context">
						{doneSets}/{totalSets} sets
					</p>
				</div>

				<div class="session-overlay__timer" aria-live="off" aria-label="Elapsed time {elapsedFormatted}">
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
				<div
					class="session-overlay__progress-fill"
					style:inline-size="{progressPct}%"
				></div>
			</div>
		</header>

		<!-- Exercise list -->
		<div class="session-overlay__exercises">
			{#if sessionStore.active}
				{#each sessionStore.active.exercises as activeExercise, exerciseIndex}
					{@const exercise = programStore.exerciseMap.get(activeExercise.exerciseId)}
					{#if exercise}
						<ExerciseCard
							{activeExercise}
							{exercise}
							{exerciseIndex}
							onSetTap={handleSetTap}
						/>
					{/if}
				{/each}
			{/if}
		</div>

		<!-- Finish bar -->
		<div class="session-overlay__footer">
			<button
				class="session-overlay__finish"
				class:session-overlay__finish--all-done={allDone}
				onclick={handleFinish}
			>
				{#if allDone}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polygon points="14.5 2 18.5 9.5 23 10.9 17.5 16.5 18.8 21.5 14.5 19 10.2 21.5 11.5 16.5 6 10.9 10.5 9.5 14.5 2" />
					</svg>
					Finish session
				{:else}
					Finish early · {doneSets}/{totalSets} sets
				{/if}
			</button>
		</div>
	</div>

	{#if showAbandonConfirm}
		<div
			class="session-overlay__confirm"
			role="alertdialog"
			aria-labelledby="confirm-title"
			aria-modal="true"
		>
			<p class="session-overlay__confirm-title" id="confirm-title">End this session?</p>
			<p class="session-overlay__confirm-body">Your progress will not be saved.</p>
			<div class="session-overlay__confirm-actions">
				<button
					class="session-overlay__confirm-btn session-overlay__confirm-btn--cancel"
					onclick={handleAbandonCancel}
				>
					Keep going
				</button>
				<button
					class="session-overlay__confirm-btn session-overlay__confirm-btn--end"
					onclick={handleAbandonConfirm}
				>
					End session
				</button>
			</div>
		</div>
	{/if}
</dialog>

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
	.session-overlay {
		position: fixed;
		inset: 0;
		inline-size: 100%;
		max-inline-size: var(--max-width);
		margin-inline: auto;
		block-size: 100dvh;
		max-block-size: 100dvh;
		background: var(--color-bg);
		border: none;
		padding: 0;
		overflow: hidden;
		z-index: 200;

		&::backdrop {
			background: rgba(0, 0, 0, 0.8);
		}
	}

	.session-overlay__inner {
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.session-overlay__header {
		flex-shrink: 0;
		border-block-end: 1px solid var(--color-border);
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
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		flex-shrink: 0;

		svg {
			inline-size: 20px;
			block-size: 20px;
		}

		&:hover {
			color: var(--color-text-primary);
		}
	}

	.session-overlay__titles {
		flex: 1;
		min-inline-size: 0;
	}

	.session-overlay__workout-name {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.session-overlay__context {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 1px;
	}

	.session-overlay__timer {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
	}

	.session-overlay__timer-label {
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.session-overlay__timer-value {
		font-family: var(--font-mono);
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.session-overlay__progress {
		block-size: 5px;
		background: var(--color-surface-3);
		overflow: hidden;
	}

	.session-overlay__progress-fill {
		block-size: 100%;
		background: var(--color-accent);
		transition: inline-size 400ms var(--ease-spring);
	}

	.session-overlay__exercises {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		overscroll-behavior: contain;
	}

	.session-overlay__footer {
		flex-shrink: 0;
		padding: var(--space-4) var(--space-4) calc(var(--safe-bottom) + var(--space-4));
		border-block-start: 1px solid var(--color-border);
		background: var(--color-bg);
	}

	.session-overlay__finish {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		inline-size: 100%;
		padding-block: var(--space-4);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		border-radius: var(--radius-full);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		min-block-size: 56px;
		border: 1px solid var(--color-border);
		transition:
			background-color var(--duration-normal) var(--ease-out),
			color var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);

		svg {
			inline-size: 18px;
			block-size: 18px;
		}

		&:active {
			transform: scale(0.98);
		}
	}

	.session-overlay__finish--all-done {
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border-color: var(--color-accent);
		box-shadow: var(--shadow-lime);
	}

	/* Abandon confirm */
	.session-overlay__confirm {
		position: absolute;
		inset-inline: var(--space-4);
		inset-block-end: calc(var(--safe-bottom) + var(--space-4));
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--r-2xl);
		padding: var(--space-5);
		z-index: 10;
		box-shadow: var(--shadow-lg);
		animation: slide-up var(--duration-normal) var(--ease-spring) both;
	}

	.session-overlay__confirm-title {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
		margin-block-end: var(--space-1);
	}

	.session-overlay__confirm-body {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-4);
	}

	.session-overlay__confirm-actions {
		display: flex;
		gap: var(--space-2);
	}

	.session-overlay__confirm-btn {
		flex: 1;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;
		min-block-size: 48px;
	}

	.session-overlay__confirm-btn--cancel {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
	}

	.session-overlay__confirm-btn--end {
		background: var(--color-red);
		color: #ffffff;
	}
</style>
