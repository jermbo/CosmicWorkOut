<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import type { Item, ActiveSet } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import BottomSheet from './BottomSheet.svelte';

	const BANDS = ['Light', 'Med', 'Heavy'];

	type Props = {
		exercise: Item;
		activeSet: ActiveSet;
		setIndex: number;
		onSave: (weight: number | string, reps: number) => void;
		onClose: () => void;
	};

	let { exercise, activeSet, setIndex, onSave, onClose }: Props = $props();

	function parseTargetReps(r: string): { n: number; suffix: string } {
		const m = r.match(/^(\d+)\s*(.*)$/);
		if (!m) {
			return { n: 8, suffix: '' };
		}
		return { n: parseInt(m[1], 10), suffix: m[2].trim() };
	}

	// Snapshot props at open time — sheet data is intentionally frozen while open
	const snap = untrack(() => {
		const unit = exercise.unit;
		const parsed = parseTargetReps(activeSet.targetReps);
		return {
			unit,
			weight: activeSet.weight,
			reps: activeSet.reps,
			defReps: parsed.n,
			suffix: parsed.suffix,
			weightIncrement: exercise.weightIncrement ?? 5,
		};
	});

	const isLb = snap.unit === 'lb' || snap.unit === 'kg';
	const isBand = snap.unit === 'band';
	const isBw = snap.unit === 'bodyweight';
	const defReps = snap.defReps;
	const suffix = snap.suffix;
	const weightStep = snap.weightIncrement;

	function roundWeight(v: number): number {
		return Math.round(v / weightStep) * weightStep;
	}

	// First time = no previous numeric weight logged
	const isFirstTime = isLb && (typeof snap.weight !== 'number' || snap.weight <= 0);

	let stepWeight = $state(isLb ? roundWeight(typeof snap.weight === 'number' ? snap.weight : 0) : 0);
	let stepBand = $state(isBand ? (typeof snap.weight === 'string' ? snap.weight : 'Med') : 'Med');
	let stepReps = $state(snap.reps > 0 ? snap.reps : defReps);
	let manualWeightStr = $state('');
	let manualWeightInput = $state<HTMLInputElement | null>(null);

	onMount(async () => {
		if (isFirstTime) {
			await tick();
			manualWeightInput?.focus();
		}
	});

	const repStep = suffix === 's' ? 5 : 1;

	function bumpWeight(d: number) {
		if (isBand) {
			const idx = Math.max(0, Math.min(BANDS.length - 1, BANDS.indexOf(stepBand) + d));
			stepBand = BANDS[idx];
		} else {
			stepWeight = Math.max(0, stepWeight + d * weightStep);
		}
	}

	function bumpReps(d: number) {
		stepReps = Math.max(0, stepReps + d * repStep);
	}

	function handleSave() {
		let finalWeight: number | string;
		if (isBw) {
			finalWeight = 0;
		} else if (isBand) {
			finalWeight = stepBand;
		} else if (isFirstTime) {
			finalWeight = manualWeightStr ? roundWeight(parseFloat(manualWeightStr)) : 0;
		} else {
			finalWeight = stepWeight;
		}
		onSave(finalWeight, stepReps);
	}

	let hasPrevious = $derived(
		isBand
			? typeof activeSet.weight === 'string' && Boolean(activeSet.weight)
			: typeof activeSet.weight === 'number' && activeSet.weight > 0,
	);
</script>

<BottomSheet onclose={onClose}>
	<div class="log-sheet">
		<div class="log-sheet__head">
			<span class="log-sheet__name">{exercise.name}</span>
			<span class="log-sheet__set-badge">Set {setIndex + 1}</span>
		</div>

		<p class="log-sheet__prev">
			{#if hasPrevious}
				Last time ·
				<strong>{isBand ? activeSet.weight : `${activeSet.weight} ${prefsStore.weightUnit}`}</strong>
				× {defReps}{suffix ? ` ${suffix}` : ''}
			{:else}
				Target · <strong>{defReps}{suffix ? ` ${suffix}` : ''}</strong>
				{isBw ? '· bodyweight' : ''}
			{/if}
		</p>

		<div class="log-sheet__steppers">
			{#if !isBw}
				<div class="stepper">
					<div class="stepper__cap">{isBand ? 'Band' : 'Weight'}</div>
					{#if isFirstTime}
						<div class="stepper__first-time">
							<input
								bind:this={manualWeightInput}
								class="stepper__manual-input"
								type="number"
								inputmode="decimal"
								placeholder="0"
								bind:value={manualWeightStr}
								aria-label="Enter weight in {prefsStore.weightUnit}"
							/>
							<span class="stepper__u">{prefsStore.weightUnit}</span>
						</div>
					{:else}
						<div class="stepper__row">
							<button
								class="stepper__btn"
								onclick={() => bumpWeight(-1)}
								aria-label="Decrease {isBand ? 'band' : 'weight'}"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<line x1="5" y1="12" x2="19" y2="12" />
								</svg>
							</button>
							<div class="stepper__val">
								<span class="stepper__n">{isBand ? stepBand : stepWeight}</span>
								<span class="stepper__u">{isBand ? 'level' : prefsStore.weightUnit}</span>
							</div>
							<button
								class="stepper__btn"
								onclick={() => bumpWeight(1)}
								aria-label="Increase {isBand ? 'band' : 'weight'}"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<line x1="12" y1="5" x2="12" y2="19" />
									<line x1="5" y1="12" x2="19" y2="12" />
								</svg>
							</button>
						</div>
					{/if}
				</div>
			{/if}
			<div class="stepper">
				<div class="stepper__cap">{suffix === 's' ? 'Hold (sec)' : 'Reps'}</div>
				<div class="stepper__row">
					<button class="stepper__btn" onclick={() => bumpReps(-1)} aria-label="Decrease reps">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
					</button>
					<div class="stepper__val">
						<span class="stepper__n">{stepReps}</span>
						<span class="stepper__u">{suffix === 's' ? 'sec' : suffix === 'ea' ? 'each' : 'reps'}</span>
					</div>
					<button class="stepper__btn" onclick={() => bumpReps(1)} aria-label="Increase reps">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<button class="log-sheet__confirm" onclick={handleSave}>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
			{activeSet.completed ? 'Update set' : `Log set ${setIndex + 1}`}
		</button>
	</div>
</BottomSheet>

<style>
	.log-sheet {
		padding-inline: var(--space-5);
		padding-block-end: var(--space-2);
	}

	.log-sheet__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: var(--space-3) var(--space-2);
	}

	.log-sheet__name {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.log-sheet__set-badge {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-accent);
	}

	.log-sheet__prev {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-5);
		line-height: 1.5;

		strong {
			color: var(--color-text-primary);
		}
	}

	/* Steppers */
	.log-sheet__steppers {
		display: flex;
		gap: var(--space-3);
		margin-block-end: var(--space-5);
	}

	.stepper {
		flex: 1;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-4) var(--space-3);
	}

	.stepper__cap {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		text-align: center;
		margin-block-end: var(--space-3);
	}

	.stepper__row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.stepper__first-time {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding-block: var(--space-1);
	}

	.stepper__manual-input {
		inline-size: 100%;
		background: none;
		border: none;
		border-block-end: 2px solid var(--color-accent);
		outline: none;
		font-family: var(--font-mono);
		font-size: 1.875rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-align: center;
		padding-block: var(--space-1);

		&::placeholder {
			color: var(--color-text-muted);
		}

		/* hide browser spinners */
		&::-webkit-outer-spin-button,
		&::-webkit-inner-spin-button {
			-webkit-appearance: none;
		}
	}

	.stepper__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--radius-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-accent);
		flex-shrink: 0;
		transition: background-color var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 20px;
			block-size: 20px;
		}

		&:active {
			background: var(--color-surface-1);
		}
	}

	.stepper__val {
		flex: 1;
		text-align: center;
	}

	.stepper__n {
		display: block;
		font-family: var(--font-mono);
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1;
	}

	.stepper__u {
		display: block;
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	/* Confirm button */
	.log-sheet__confirm {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		inline-size: 100%;
		padding-block: var(--space-4);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border-radius: var(--radius-full);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		min-block-size: 56px;
		box-shadow: var(--shadow-lime);
		transition: transform var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 18px;
			block-size: 18px;
		}

		&:active {
			transform: scale(0.98);
		}
	}
</style>
