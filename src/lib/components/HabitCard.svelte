<script lang="ts">
	import type { Habit } from '$lib/db/types';
	import ProgressRing from './ProgressRing.svelte';
	import Icon from './Icon.svelte';

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
	}: {
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
	} = $props();

	let unitLabel = $derived(habit.type === 'minutes' ? 'min' : habit.unit);
	let stepLabel = $derived(habit.type === 'minutes' ? `${step} min` : habit.unit ? `${step} ${habit.unit}` : `${step}`);
</script>

<div class="habit-card" class:habit-card--done={done}>
	<div class="habit-card__ring">
		<ProgressRing done={pct} total={100} complete={done} size={120} strokeWidth={7} dimUntilComplete>
			{#if habit.type === 'boolean'}
				<span class="habit-card__value habit-card__value--bool" class:habit-card__value--done={done}>
					{done ? 'Yes' : 'No'}
				</span>
			{:else}
				<button
					class="habit-card__center-btn"
					onclick={oneditexact}
					disabled={readOnly}
					aria-label="Enter exact value for {habit.name}"
					title="Tap to enter exact value"
				>
					<span class="habit-card__value" class:habit-card__value--done={done}>{value}</span>
					{#if !done && habit.dailyGoal}
						<span class="habit-card__goal">/ {habit.dailyGoal}</span>
					{/if}
					{#if unitLabel}
						<span class="habit-card__unit">{unitLabel}</span>
					{/if}
				</button>
			{/if}
		</ProgressRing>
	</div>

	<p class="habit-card__name">{habit.name}</p>

	<div class="habit-card__actions">
		{#if habit.type === 'boolean'}
			<label class="toggle-label" class:toggle-label--on={done}>
				<input
					class="sr-only"
					type="checkbox"
					checked={done}
					disabled={readOnly}
					onchange={ontoggle}
					aria-label={habit.name}
				/>
				{done ? '✓ Done' : 'Mark done'}
			</label>
		{:else}
			<div class="stepper">
				<button
					class="stepper__btn"
					onclick={onsubtract}
					disabled={readOnly || value < step}
					aria-label="Subtract {step} from {habit.name}"
				>
					<Icon name="minus" size={18} stroke={2.5} />
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
				<button class="stepper__btn" onclick={onadd} disabled={readOnly} aria-label="Add {step} to {habit.name}">
					<Icon name="plus" size={18} stroke={2.5} />
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.habit-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-4) var(--space-4);
		background: var(--color-surface-2);
		border: 1.5px solid var(--color-border);
		border-radius: var(--r-2xl);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out);
	}

	.habit-card--done {
		border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
		background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-2));
	}

	.habit-card__ring {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.habit-card__center-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
		padding: var(--space-2);
		border-radius: var(--radius-full);
		transition: background var(--duration-fast) var(--ease-out);

		&:not(:disabled):hover {
			background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		}
		&:disabled {
			cursor: default;
		}
	}

	.habit-card__value {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-text-primary);
		line-height: 1;
		letter-spacing: -0.03em;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.habit-card__value--done {
		color: var(--color-accent);
	}

	.habit-card__value--bool {
		font-size: 1.25rem;
	}

	.habit-card__goal {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
		line-height: 1;
	}

	.habit-card__unit {
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		line-height: 1;
	}

	.habit-card__name {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-align: center;
		letter-spacing: -0.01em;
		line-height: 1.2;
	}

	.habit-card__actions {
		inline-size: 100%;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 100%;
		block-size: 48px;
		border-radius: var(--radius-full);
		border: 1.5px solid var(--color-border);
		background: var(--color-surface-3);
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-text-secondary);
		letter-spacing: 0.01em;
		cursor: pointer;
		user-select: none;
		transition:
			background var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);

		&.toggle-label--on {
			background: var(--color-accent);
			border-color: var(--color-accent);
			color: var(--color-accent-ink);
		}

		&:has(input:focus-visible) {
			outline: 2px solid var(--color-accent);
			outline-offset: 2px;
		}

		&:has(input:disabled) {
			opacity: 0.4;
			cursor: default;
		}
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.stepper__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 48px;
		block-size: 48px;
		flex-shrink: 0;
		border-radius: var(--radius-full);
		border: 1.5px solid var(--color-border);
		background: var(--color-surface-3);
		color: var(--color-accent);
		transition: background var(--duration-fast) var(--ease-out);

		&:not(:disabled):active {
			background: color-mix(in srgb, var(--color-accent) 15%, var(--color-surface-3));
		}
		&:disabled {
			opacity: 0.25;
		}
	}

	.stepper__step-label {
		flex: 1;
		block-size: 48px;
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-accent);
		letter-spacing: 0.02em;
		line-height: 1.2;
		white-space: nowrap;
		transition: background var(--duration-fast) var(--ease-out);

		&:hover {
			background: color-mix(in srgb, var(--color-accent) 14%, transparent);
		}
		&:disabled {
			opacity: 0.4;
			cursor: default;
		}
	}
</style>
