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

	const isFirstTime = isLb && (typeof snap.weight !== 'number' || snap.weight <= 0);

	function initialStepWeight(): number {
		if (!isLb) return 0;
		if (typeof snap.weight === 'number') return roundWeight(snap.weight);
		return roundWeight(0);
	}

	function initialStepBand(): string {
		if (isBand && typeof snap.weight === 'string') return snap.weight;
		return 'Med';
	}

	function initialStepReps(): number {
		if (snap.reps > 0) return snap.reps;
		return defReps;
	}

	let stepWeight = $state(initialStepWeight());
	let stepBand = $state(initialStepBand());
	let stepReps = $state(initialStepReps());
	let manualWeightStr = $state('');
	let manualWeightInput = $state<HTMLInputElement | null>(null);

	onMount(async () => {
		if (isFirstTime) {
			await tick();
			manualWeightInput?.focus();
		}
	});

	function computeRepStep(): number {
		if (suffix === 's') return 5;
		return 1;
	}
	const repStep = computeRepStep();

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

	function manualWeightValue(): number {
		if (manualWeightStr) return roundWeight(parseFloat(manualWeightStr));
		return 0;
	}

	function handleSave() {
		let finalWeight: number | string;
		if (isBw) {
			finalWeight = 0;
		} else if (isBand) {
			finalWeight = stepBand;
		} else if (isFirstTime) {
			finalWeight = manualWeightValue();
		} else {
			finalWeight = stepWeight;
		}
		onSave(finalWeight, stepReps);
	}

	let hasPrevious = $derived.by(() => {
		if (isBand) return typeof activeSet.weight === 'string' && Boolean(activeSet.weight);
		return typeof activeSet.weight === 'number' && activeSet.weight > 0;
	});

	let weightOrBandLabel = $derived.by(() => {
		if (isBand) return 'Band';
		return 'Weight';
	});

	let weightOrBandNoun = $derived.by(() => {
		if (isBand) return 'band';
		return 'weight';
	});

	let stepperValue = $derived.by(() => {
		if (isBand) return stepBand;
		return stepWeight;
	});

	let stepperUnitLabel = $derived.by(() => {
		if (isBand) return 'level';
		return prefsStore.weightUnit;
	});

	let repCapLabel = $derived.by(() => {
		if (suffix === 's') return 'Hold (sec)';
		return 'Reps';
	});

	let repUnitLabel = $derived.by(() => {
		if (suffix === 's') return 'sec';
		if (suffix === 'ea') return 'each';
		return 'reps';
	});

	let lastTimeWeight = $derived.by(() => {
		if (isBand) return String(activeSet.weight);
		return `${activeSet.weight} ${prefsStore.weightUnit}`;
	});

	let suffixLabel = $derived.by(() => {
		if (suffix) return ` ${suffix}`;
		return '';
	});

	let confirmLabel = $derived.by(() => {
		if (activeSet.completed) return 'Update set';
		return `Log set ${setIndex + 1}`;
	});
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
				<strong>{lastTimeWeight}</strong>
				× {defReps}{suffixLabel}
			{:else}
				Target · <strong>{defReps}{suffixLabel}</strong>
				{#if isBw}· bodyweight{/if}
			{/if}
		</p>

		<div class="log-sheet__steppers">
			{#if !isBw}
				<div class="stepper">
					<div class="stepper__cap">{weightOrBandLabel}</div>
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
								aria-label="Decrease {weightOrBandNoun}"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<line
										x1="5"
										y1="12"
										x2="19"
										y2="12"
									/>
								</svg>
							</button>
							<div class="stepper__val">
								<span class="stepper__n">{stepperValue}</span>
								<span class="stepper__u">{stepperUnitLabel}</span>
							</div>
							<button
								class="stepper__btn"
								onclick={() => bumpWeight(1)}
								aria-label="Increase {weightOrBandNoun}"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<line
										x1="12"
										y1="5"
										x2="12"
										y2="19"
									/>
									<line
										x1="5"
										y1="12"
										x2="19"
										y2="12"
									/>
								</svg>
							</button>
						</div>
					{/if}
				</div>
			{/if}
			<div class="stepper">
				<div class="stepper__cap">{repCapLabel}</div>
				<div class="stepper__row">
					<button
						class="stepper__btn"
						onclick={() => bumpReps(-1)}
						aria-label="Decrease reps"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<line
								x1="5"
								y1="12"
								x2="19"
								y2="12"
							/>
						</svg>
					</button>
					<div class="stepper__val">
						<span class="stepper__n">{stepReps}</span>
						<span class="stepper__u">{repUnitLabel}</span>
					</div>
					<button
						class="stepper__btn"
						onclick={() => bumpReps(1)}
						aria-label="Increase reps"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<line
								x1="12"
								y1="5"
								x2="12"
								y2="19"
							/>
							<line
								x1="5"
								y1="12"
								x2="19"
								y2="12"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<button
			class="log-sheet__confirm"
			onclick={handleSave}
		>
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
			{confirmLabel}
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
