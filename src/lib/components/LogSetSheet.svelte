<script lang="ts">
	import { untrack } from 'svelte';
	import type { Exercise, ActiveSet } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import BottomSheet from './BottomSheet.svelte';

	const BANDS = ['Light', 'Med', 'Heavy'];

	let {
		exercise,
		activeSet,
		setIndex,
		onSave,
		onClose
	}: {
		exercise: Exercise;
		activeSet: ActiveSet;
		setIndex: number;
		onSave: (weight: number | string, reps: number) => void;
		onClose: () => void;
	} = $props();

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
			suffix: parsed.suffix
		};
	});

	const isLb = snap.unit === 'lb';
	const isBand = snap.unit === 'band';
	const isBw = snap.unit === 'bodyweight';
	const defReps = snap.defReps;
	const suffix = snap.suffix;

	let stepWeight = $state(isLb ? (typeof snap.weight === 'number' ? snap.weight : 0) : 0);
	let stepBand = $state(isBand ? (typeof snap.weight === 'string' ? snap.weight : 'Med') : 'Med');
	let stepReps = $state(snap.reps > 0 ? snap.reps : defReps);
	let padField = $state<'weight' | 'reps'>(isLb ? 'weight' : 'reps');
	let padStr = $state('');

	const isNumpad = prefsStore.loggingMode === 'numpad';
	const repStep = suffix === 's' ? 5 : 1;

	function bumpWeight(d: number) {
		if (isBand) {
			const idx = Math.max(0, Math.min(BANDS.length - 1, BANDS.indexOf(stepBand) + d));
			stepBand = BANDS[idx];
		} else {
			stepWeight = Math.max(0, stepWeight + d * 5);
		}
	}

	function bumpReps(d: number) {
		stepReps = Math.max(0, stepReps + d * repStep);
	}

	function applyPad() {
		if (!padStr) {
			return;
		}
		const v = parseInt(padStr, 10);
		if (padField === 'weight') {
			stepWeight = v;
		} else {
			stepReps = v;
		}
	}

	function padPress(k: string) {
		if (k === 'del') {
			padStr = padStr.slice(0, -1);
			return;
		}
		if (k === 'next') {
			applyPad();
			padField = padField === 'weight' ? 'reps' : 'weight';
			padStr = '';
			return;
		}
		if (padStr.length >= 4) {
			return;
		}
		padStr = padStr + k;
	}

	function handleSave() {
		if (isNumpad) {
			applyPad();
		}
		const finalWeight: number | string = isBw ? 0 : isBand ? stepBand : stepWeight;
		onSave(finalWeight, stepReps);
	}

	let displayWeight = $derived(
		padField === 'weight' && padStr !== '' ? padStr : isBand ? stepBand : String(stepWeight)
	);
	let displayReps = $derived(padField === 'reps' && padStr !== '' ? padStr : String(stepReps));

	let hasPrevious = $derived(
		isBand
			? typeof activeSet.weight === 'string' && Boolean(activeSet.weight)
			: typeof activeSet.weight === 'number' && activeSet.weight > 0
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

		{#if !isNumpad}
			<!-- Stepper mode -->
			<div class="log-sheet__steppers">
				{#if !isBw}
					<div class="stepper">
						<div class="stepper__cap">{isBand ? 'Band' : 'Weight'}</div>
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
		{:else}
			<!-- Numpad mode -->
			<div class="log-sheet__pad-fields">
				{#if !isBw}
					<button
						class="pad-slot"
						class:pad-slot--active={padField === 'weight'}
						onclick={() => {
							applyPad();
							padField = 'weight';
							padStr = '';
						}}
					>
						<div class="pad-slot__label">{isBand ? 'Band' : `Weight (${prefsStore.weightUnit})`}</div>
						<div class="pad-slot__val">{displayWeight}</div>
					</button>
				{/if}
				<button
					class="pad-slot"
					class:pad-slot--active={padField === 'reps'}
					onclick={() => {
						applyPad();
						padField = 'reps';
						padStr = '';
					}}
				>
					<div class="pad-slot__label">{suffix === 's' ? 'Hold (s)' : 'Reps'}</div>
					<div class="pad-slot__val">{displayReps}</div>
				</button>
			</div>
			<div class="numpad" role="group" aria-label="Number pad">
				{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as k}
					<button class="numpad__key" onclick={() => padPress(k)}>{k}</button>
				{/each}
				<button class="numpad__key numpad__key--fn" onclick={() => padPress('del')}>Del</button>
				<button class="numpad__key" onclick={() => padPress('0')}>0</button>
				<button class="numpad__key numpad__key--fn" onclick={() => padPress('next')}>Next</button>
			</div>
		{/if}

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
			Log set {setIndex + 1}
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

	/* Numpad */
	.log-sheet__pad-fields {
		display: flex;
		gap: var(--space-3);
		margin-block-end: var(--space-4);
	}

	.pad-slot {
		flex: 1;
		background: var(--color-surface-3);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-3) var(--space-4);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.pad-slot--active {
		border-color: var(--color-accent);
	}

	.pad-slot__label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-1);
	}

	.pad-slot__val {
		font-family: var(--font-mono);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		min-block-size: 36px;
	}

	.numpad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.numpad__key {
		block-size: 56px;
		border-radius: var(--radius-lg);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		transition: background-color var(--duration-fast) var(--ease-out);

		&:active {
			background: var(--color-surface-2);
		}
	}

	.numpad__key--fn {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
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
