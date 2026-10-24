<script lang="ts">
	import RollingNumber from './RollingNumber.svelte';
	import { holdRepeat } from '$lib/feedback/holdRepeat';
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
								use:holdRepeat={() => bumpWeight(-1)}
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
								<span class="stepper__n"><RollingNumber value={stepperValue} /></span>
								<span class="stepper__u">{stepperUnitLabel}</span>
							</div>
							<button
								class="stepper__btn"
								onclick={() => bumpWeight(1)}
								use:holdRepeat={() => bumpWeight(1)}
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
						use:holdRepeat={() => bumpReps(-1)}
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
						<span class="stepper__n"><RollingNumber value={stepReps} /></span>
						<span class="stepper__u">{repUnitLabel}</span>
					</div>
					<button
						class="stepper__btn"
						onclick={() => bumpReps(1)}
						use:holdRepeat={() => bumpReps(1)}
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
		padding-inline: var(--space-4) calc(var(--space-4) + var(--press-offset));
		padding-block-end: var(--space-2);
	}

	.log-sheet__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		padding-block: var(--space-3) var(--space-2);
	}

	.log-sheet__name {
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1.375rem;
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.log-sheet__set-badge {
		flex-shrink: 0;
		padding: 2px var(--space-2);
		background: var(--color-paper);
		color: var(--color-ink);
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.log-sheet__prev {
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-block-end: var(--space-4);
		line-height: 1.5;

		strong {
			color: var(--color-text-primary);
		}
	}

	/*
	 * The Training field, split into rows by ink rules. Each row: label + huge figure
	 * on the left, a +/- column on the right (v1.12.0 "active set").
	 */
	.log-sheet__steppers {
		--field: var(--field-train);
		--color-text-muted: color-mix(in srgb, var(--color-ink) 45%, var(--field));
		display: flex;
		flex-direction: column;
		margin-block-end: var(--space-5);
		background: var(--field);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
	}

	.stepper {
		position: relative;

		& + & {
			border-block-start: var(--rule) solid var(--color-ink);
		}
	}

	.stepper__cap {
		position: absolute;
		inset-block-start: var(--space-2);
		inset-inline-start: var(--space-3);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		pointer-events: none;
	}

	.stepper__row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 92px;
		grid-template-rows: 1fr 1fr;
		min-block-size: 120px;
	}

	.stepper__val {
		grid-column: 1;
		grid-row: 1 / 3;
		display: flex;
		align-items: flex-end;
		gap: var(--space-1);
		padding: var(--space-6) var(--space-3) var(--space-2);
		border-inline-end: var(--rule) solid var(--color-ink);
		min-inline-size: 0;
	}

	.stepper__btn {
		grid-column: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-ink);

		svg {
			inline-size: 26px;
			block-size: 26px;
		}

		&:active {
			background: var(--color-ink);
			color: var(--field);
		}

		/* DOM order is minus, value, plus: put plus on top. */
		&:first-child {
			grid-row: 2;
			border-block-start: var(--rule) solid var(--color-ink);
		}

		&:last-child {
			grid-row: 1;
		}
	}

	.stepper__n {
		font-family: var(--font-display);
		font-size: clamp(3rem, 18cqi, 4.5rem);
		font-weight: 900;
		letter-spacing: -0.06em;
		line-height: 0.9;
	}

	.stepper__u {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		padding-block-end: 4px;
	}

	.stepper__first-time {
		display: flex;
		align-items: flex-end;
		gap: var(--space-1);
		padding: var(--space-6) var(--space-3) var(--space-2);
	}

	.stepper__manual-input {
		inline-size: 100%;
		background: none;
		border: none;
		border-block-end: var(--rule) solid var(--color-ink);
		outline: none;
		font-family: var(--font-display);
		font-size: 3rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		color: var(--color-ink);
		padding-block: var(--space-1);

		&::placeholder {
			color: var(--color-text-muted);
		}

		&::-webkit-outer-spin-button,
		&::-webkit-inner-spin-button {
			-webkit-appearance: none;
		}
	}

	/* The big paper "LOG SET" block with a Training shadow — sinks on press. */
	.log-sheet__confirm {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		inline-size: 100%;
		min-block-size: 80px;
		padding-inline: var(--space-4);
		background: var(--color-paper);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1.375rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		box-shadow: var(--press-offset) var(--press-offset) 0 var(--field-train);
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		svg {
			order: 2;
			inline-size: 28px;
			block-size: 28px;
		}
	}
</style>
