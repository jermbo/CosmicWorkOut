<script lang="ts">
	import RollingNumber from './RollingNumber.svelte';
	import { onMount, onDestroy, tick, untrack } from 'svelte';
	import { formatElapsed, formatCountWithWord } from '$lib/format';
	import type { ActiveItem, ActiveSet } from '$lib/db/types';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import ExerciseCard from './ExerciseCard.svelte';
	import LogSetSheet from './LogSetSheet.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { feedback, prefersReducedMotion } from '$lib/feedback';
	import {
		PLATE_DELAY_MS,
		PLATE_LIFT,
		PLATE_MS,
		PLATE_SCROLL_MS,
		PLATE_SWAP_AT,
		handoffScrollTop,
		plateKeyframes,
		type Box,
	} from '$lib/feedback/plate';

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
		clearTimeout(plateSwapTimer);
		plateAnim?.cancel();
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

	/*
	 * The blue plate (v1.12.0): one Training-blue block behind the live exercise.
	 * `liveIndex` is the exercise the cards draw as live; it follows `currentIndex`
	 * mid-handoff, at the moment the stretched plate covers both cards.
	 */
	let listEl: HTMLElement | undefined = $state();
	let plateEl: HTMLElement | undefined = $state();
	let liveIndex = $state(untrack(() => currentIndex));
	let plateAnim: Animation | null = null;
	let plateSwapTimer: ReturnType<typeof setTimeout> | undefined;

	function cardBox(index: number): Box | null {
		const card = listEl?.querySelector<HTMLElement>(`[data-exercise="${index}"]`);
		return card ? { top: card.offsetTop, height: card.offsetHeight } : null;
	}

	function placePlate(index: number): void {
		if (!plateEl || plateAnim) return;
		const box = cardBox(index);
		plateEl.hidden = !box;
		if (box) {
			plateEl.style.top = `${box.top}px`;
			plateEl.style.height = `${box.height}px`;
		}
	}

	/** Scroll so both cards (or at least the next one) are on screen. True if it scrolled. */
	function revealHandoff(a: Box, b: Box): boolean {
		if (!listEl) return false;
		const top = handoffScrollTop(a, b, {
			scrollTop: listEl.scrollTop,
			height: listEl.clientHeight,
		});
		if (top === null) return false;
		listEl.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
		return true;
	}

	function handOff(from: number, to: number): void {
		clearTimeout(plateSwapTimer);
		plateAnim?.cancel();
		plateAnim = null;
		const a = cardBox(from);
		const b = cardBox(to);
		if (!plateEl || !a || !b || prefersReducedMotion()) {
			if (a && b) revealHandoff(a, b);
			liveIndex = to;
			void tick().then(() => placePlate(to));
			return;
		}
		// Bring the handoff on screen first, while the DONE stamp lands — on a
		// phone the next exercise is often below the fold.
		const delay = revealHandoff(a, b) ? PLATE_DELAY_MS + PLATE_SCROLL_MS : PLATE_DELAY_MS;
		const paper = getComputedStyle(document.documentElement).getPropertyValue('--color-paper');
		const rest = getComputedStyle(plateEl).boxShadow;
		const lifted = `${6 + PLATE_LIFT * 1.5}px ${6 + PLATE_LIFT * 1.5}px 0 ${paper}`;
		const anim = plateEl.animate(plateKeyframes(a, b, { rest, lifted }), {
			duration: PLATE_MS,
			delay,
			easing: 'cubic-bezier(0.45, 0, 0.25, 1)',
			fill: 'both',
		});
		plateAnim = anim;
		plateSwapTimer = setTimeout(() => (liveIndex = to), delay + PLATE_MS * PLATE_SWAP_AT);
		anim.onfinish = () => {
			if (plateAnim !== anim) return;
			plateAnim = null;
			placePlate(to);
			anim.cancel();
			feedback('select');
		};
	}

	// Last exercise done: nothing to hand to, so the plate presses into the page and fades.
	function settlePlate(): void {
		if (!plateEl) return;
		clearTimeout(plateSwapTimer);
		plateAnim?.cancel();
		const anim = plateEl.animate([{}, { translate: '6px 6px', boxShadow: 'none', opacity: 0 }], {
			duration: 420,
			delay: PLATE_DELAY_MS,
			easing: 'ease-in',
			fill: 'both',
		});
		plateAnim = anim;
		// Hand the card back its own colors while the plate is half faded.
		plateSwapTimer = setTimeout(() => (liveIndex = -1), PLATE_DELAY_MS + 210);
		anim.onfinish = () => {
			if (plateAnim !== anim) return;
			plateAnim = null;
			placePlate(-1);
			anim.cancel();
		};
	}

	// Hand the plate over whenever the live exercise changes.
	$effect(() => {
		const next = currentIndex;
		untrack(() => {
			if (next === liveIndex && !plateAnim) return;
			if (next < 0 && liveIndex >= 0 && plateEl && !prefersReducedMotion()) {
				settlePlate();
				return;
			}
			if (next < 0 || liveIndex < 0) {
				clearTimeout(plateSwapTimer);
				plateAnim?.cancel();
				plateAnim = null;
				liveIndex = next;
				void tick().then(() => placePlate(next));
				return;
			}
			handOff(liveIndex, next);
		});
	});

	// First placement, and keep the plate on its card when the layout shifts.
	onMount(() => {
		void tick().then(() => placePlate(liveIndex));
		const ro = new ResizeObserver(() => placePlate(liveIndex));
		if (listEl) ro.observe(listEl);
		return () => ro.disconnect();
	});

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
				feedback('success');
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
		feedback('success');
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
							<RollingNumber value={doneSets} />/{totalSets} sets
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

		<div
			class="session-overlay__exercises"
			bind:this={listEl}
		>
			<div
				class="session-overlay__plate"
				bind:this={plateEl}
				aria-hidden="true"
				hidden
			></div>
			{#if sessionStore.active}
				{#each activeItems as activeExercise, exerciseIndex (activeExercise.itemId)}
					{@const exercise = programStore.getItemById(activeExercise.itemId)}
					{#if exercise}
						<ExerciseCard
							{activeExercise}
							{exercise}
							{exerciseIndex}
							current={exerciseIndex === liveIndex}
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

	/* A segment fills with a white flash that cools to the Training hue. */
	.session-overlay__progress-seg--on {
		background: var(--field-train);
		animation: seg-fill 420ms var(--ease-out);
	}

	@keyframes seg-fill {
		0% {
			background: var(--color-paper);
			transform: scaleY(1.8);
		}
		100% {
			background: var(--field-train);
			transform: none;
		}
	}

	.session-overlay__exercises {
		position: relative;
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

	/* Sits under the live card; the cards are transparent so it shows through. */
	.session-overlay__plate {
		position: absolute;
		inset-inline: var(--space-4) calc(var(--space-4) + var(--press-offset));
		z-index: 0;
		background: var(--field-train);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
		pointer-events: none;
	}

	.session-overlay__plate[hidden] {
		display: none;
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
	}
</style>
