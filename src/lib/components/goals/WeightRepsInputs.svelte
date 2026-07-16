<script lang="ts">
	type Props = {
		label: string;
		weight: number | null;
		reps: number | null;
		unit: string;
		weightStep?: number;
		weightPlaceholder?: string;
		repsPlaceholder?: string;
		weightAriaLabel?: string;
		repsAriaLabel?: string;
		hint?: string;
	};

	let {
		label,
		weight = $bindable(null),
		reps = $bindable(null),
		unit,
		weightStep = 5,
		weightPlaceholder = '150',
		repsPlaceholder = '10',
		weightAriaLabel = 'Weight',
		repsAriaLabel = 'Reps',
		hint,
	}: Props = $props();
</script>

<div class="form-field">
	<span class="form-field__label">{label}</span>
	<div class="pair-inputs">
		<label class="pair-inputs__field">
			<input
				class="form-field__input"
				type="number"
				inputmode="decimal"
				min="1"
				step={weightStep}
				bind:value={weight}
				placeholder={weightPlaceholder}
				aria-label={weightAriaLabel}
			/>
			<span class="pair-inputs__unit">{unit}</span>
		</label>
		<span
			class="pair-inputs__times"
			aria-hidden="true">×</span
		>
		<label class="pair-inputs__field">
			<input
				class="form-field__input"
				type="number"
				inputmode="numeric"
				min="1"
				max="30"
				bind:value={reps}
				placeholder={repsPlaceholder}
				aria-label={repsAriaLabel}
			/>
			<span class="pair-inputs__unit">reps</span>
		</label>
	</div>
	{#if hint}
		<p class="form-field__hint">{hint}</p>
	{/if}
</div>

<style>
	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-block-end: var(--space-5);
	}

	.form-field__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.form-field__input {
		block-size: 48px;
		padding-inline: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 1rem;
		color: var(--color-text-primary);
		outline: none;
		inline-size: 100%;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus {
			border-color: var(--color-accent);
		}
		&::placeholder {
			color: var(--color-text-muted);
		}
	}

	.form-field__hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.pair-inputs {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.pair-inputs__field {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.pair-inputs__unit {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.pair-inputs__times {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		color: var(--color-text-muted);
	}
</style>
