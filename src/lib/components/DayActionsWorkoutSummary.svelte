<script lang="ts">
	type Props = {
		workoutName: string;
		durationLabel?: string | null;
		variant?: 'strength' | 'dance';
	};

	let { workoutName, durationLabel = null, variant = 'strength' }: Props = $props();
</script>

<div
	class="day-actions-summary"
	class:day-actions-summary--dance={variant === 'dance'}
>
	<span class="day-actions-summary__label">
		{#if variant === 'dance'}Dance logged{:else}Workout logged{/if}
	</span>
	<span class="day-actions-summary__value">{workoutName}</span>
	{#if durationLabel}
		<span class="day-actions-summary__meta">{durationLabel}</span>
	{/if}
</div>

<style>
	.day-actions-summary {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-3) var(--space-4);
		background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface-3));
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
		border-radius: var(--radius-lg);
		margin-block-end: var(--space-4);
	}

	.day-actions-summary__label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.day-actions-summary__value {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.day-actions-summary--dance {
		background: color-mix(in srgb, var(--color-lavender) 8%, var(--color-surface-3));
		border-color: color-mix(in srgb, var(--color-lavender) 25%, var(--color-border));
	}

	.day-actions-summary__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}
</style>
