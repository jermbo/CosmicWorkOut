<script lang="ts">
	import RollingNumber from './RollingNumber.svelte';
	import { holdRepeat } from '$lib/feedback/holdRepeat';
	import type { Habit } from '$lib/db/types';
	import { formatCount, formatMinutes, minuteUnitLabel } from '$lib/format';
	import { formatHabitBooleanValue } from '$lib/habits';
	import { untrack } from 'svelte';
	import { habitColor } from '$lib/habitColors';
	import { feedback } from '$lib/feedback';
	import Icon from './Icon.svelte';
	import ProgressBlocks from './ProgressBlocks.svelte';

	type Props = {
		habit: Habit;
		value: number;
		pct: number;
		done: boolean;
		step: number;
		readOnly?: boolean;
		onadd: () => void;
		onsubtract: () => void;
		ontoggle: () => void;
		oneditexact: () => void;
	};

	let {
		habit,
		value,
		pct,
		done,
		step,
		readOnly = false,
		onadd,
		onsubtract,
		ontoggle,
		oneditexact,
	}: Props = $props();

	let unitLabel = $derived.by(() => {
		if (habit.type === 'minutes') return minuteUnitLabel();
		return habit.unit;
	});
	let stepLabel = $derived.by(() => {
		if (habit.type === 'minutes') return formatMinutes(step);
		return formatCount(step, habit.unit || undefined);
	});
	let boolLabel = $derived.by(() => {
		if (done) return formatHabitBooleanValue(1);
		return formatHabitBooleanValue(0);
	});

	/*
	 * Progress blocks (v1.12.0): one block per unit when the daily goal is small
	 * enough to count, otherwise ten blocks for the percentage.
	 */
	let blocks = $derived.by(() => {
		const goal = habit.dailyGoal ?? 0;
		if (goal > 0 && goal <= 12 && Number.isInteger(goal)) {
			return { total: goal, on: Math.min(goal, Math.floor(value)) };
		}
		return { total: 10, on: Math.min(10, Math.round(pct / 10)) };
	});
	let showBlocks = $derived(habit.type !== 'boolean' && (habit.dailyGoal ?? 0) > 0);
	let empty = $derived(habit.type === 'boolean' ? !done : value === 0);

	// Hitting the goal is a moment: buzz and stamp the tile (not on first render).
	let wasDone = untrack(() => done);
	let justDone = $state(false);
	$effect(() => {
		if (done && !wasDone) {
			justDone = true;
			feedback('success');
			const t = setTimeout(() => (justDone = false), 600);
			wasDone = done;
			return () => clearTimeout(t);
		}
		wasDone = done;
	});
</script>

<div
	class="habit-card"
	class:habit-card--empty={empty}
	class:habit-card--done={done}
	class:habit-card--just-done={justDone}
	style:--field={habitColor(habit)}
>
	<div class="habit-card__head">
		<p class="habit-card__name">
			{habit.name}{#if unitLabel}<span class="habit-card__unit">&nbsp;/ {unitLabel}</span>{/if}
		</p>
		{#if habit.type === 'boolean'}
			<span class="habit-card__value habit-card__value--bool">{boolLabel}</span>
		{:else}
			<button
				class="habit-card__center-btn"
				onclick={oneditexact}
				disabled={readOnly}
				aria-label="Enter exact value for {habit.name}"
				title="Tap to enter exact value"
			>
				<span class="habit-card__value"><RollingNumber {value} /></span>
				{#if habit.dailyGoal}
					<span class="habit-card__goal">/{habit.dailyGoal}</span>
				{/if}
			</button>
		{/if}
	</div>

	{#if showBlocks}
		<ProgressBlocks
			total={blocks.total}
			on={blocks.on}
		/>
	{/if}

	<div class="habit-card__actions">
		{#if habit.type === 'boolean'}
			<label
				class="toggle-label"
				class:toggle-label--on={done}
			>
				<input
					class="sr-only"
					type="checkbox"
					checked={done}
					disabled={readOnly}
					onchange={ontoggle}
					aria-label={habit.name}
				/>
				{#if done}✓ Done{:else}[ ] Mark done{/if}
			</label>
		{:else}
			<div class="stepper">
				<button
					class="stepper__btn"
					onclick={onsubtract}
					use:holdRepeat={onsubtract}
					disabled={readOnly || value < step}
					aria-label="Subtract {step} from {habit.name}"
				>
					<Icon
						name="minus"
						size={20}
						stroke={3}
					/>
				</button>
				<button
					class="stepper__step-label"
					onclick={oneditexact}
					disabled={readOnly}
					aria-label="Enter exact value"
					title="Tap to enter exact value"
				>
					{stepLabel}
				</button>
				<button
					class="stepper__btn"
					onclick={onadd}
					use:holdRepeat={onadd}
					disabled={readOnly}
					aria-label="Add {step} to {habit.name}"
				>
					<Icon
						name="plus"
						size={20}
						stroke={3}
					/>
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	/*
	 * A habit is a color field in its own hue (v1.12.0). Nothing logged yet:
	 * hazard stripes. The +/- strip is one ruled ink bar at the bottom.
	 */
	.habit-card {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--field);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
	}

	/* Goal hit: the tile jolts and flashes paper once. */
	.habit-card--just-done {
		animation: goal-hit 520ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}

	@keyframes goal-hit {
		0% {
			transform: scale(1);
		}
		20% {
			transform: scale(1.06) rotate(-1deg);
			box-shadow:
				var(--press-offset) var(--press-offset) 0 var(--color-paper),
				0 0 0 var(--rule) var(--color-paper);
		}
		55% {
			transform: scale(0.98);
		}
		100% {
			transform: none;
		}
	}

	.habit-card--empty {
		background: var(--field-empty);
		color: var(--color-paper);
		border: var(--rule) dashed var(--color-paper);
	}

	.habit-card__head {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2);
	}

	/* Index code label. */
	.habit-card__name {
		min-inline-size: 0;
		overflow-wrap: break-word;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;

		.habit-card--empty & {
			background: var(--color-ink);
			padding: 1px 4px;
		}
	}

	.habit-card__unit {
		font-weight: 500;
	}

	.habit-card__center-btn {
		display: flex;
		align-items: baseline;
		gap: 2px;
		color: inherit;
		flex-shrink: 0;

		&:disabled {
			cursor: default;
		}

		.habit-card--empty & {
			background: var(--color-ink);
			padding: 0 4px;
		}
	}

	.habit-card__value {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 22cqi, 2.75rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.04em;
	}

	.habit-card__value--bool {
		font-size: 1.125rem;
		text-transform: uppercase;
		flex-shrink: 0;

		.habit-card--empty & {
			background: var(--color-ink);
			padding: 0 4px;
		}
	}

	.habit-card__goal {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 800;
		line-height: 1;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 100%;
		block-size: 52px;
		padding-inline: var(--space-2);
		background: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		color: var(--color-paper);
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		text-transform: uppercase;
		cursor: pointer;
		user-select: none;

		&.toggle-label--on {
			background: transparent;
			color: var(--color-ink);
		}

		&:active {
			background: var(--color-paper);
			color: var(--color-ink);
		}

		&:has(input:focus-visible) {
			outline: var(--rule) solid var(--color-paper);
			outline-offset: 2px;
		}

		&:has(input:disabled) {
			opacity: 0.4;
			cursor: default;
		}
	}

	.stepper {
		display: grid;
		grid-template-columns: minmax(36px, 0.8fr) minmax(0, 1.6fr) minmax(36px, 0.8fr);
		block-size: 52px;
		background: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
	}

	.stepper__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-paper);

		&:not(:disabled):active {
			background: var(--color-paper);
			color: var(--color-ink);
		}
		&:disabled {
			opacity: 0.3;
		}
	}

	.stepper__step-label {
		min-inline-size: 0;
		border-inline: var(--rule) solid var(--color-paper);
		padding-inline: 2px;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-paper);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		&:not(:disabled):active {
			background: var(--color-paper);
			color: var(--color-ink);
		}
		&:disabled {
			opacity: 0.4;
			cursor: default;
		}
	}
</style>
