<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Program } from '$lib/db/types';

	type Props = {
		program: Program;
		weekNumber: number;
		todayName: string;
		todayMeta: string | null;
		finished: boolean;
		onPause: () => void;
		onRunItAgain: () => void;
	};

	let { program, weekNumber, todayName, todayMeta, finished, onPause, onRunItAgain }: Props =
		$props();
</script>

<section
	class="plan-card"
	aria-label="Active plan"
>
	<header class="plan-card__header">
		<h2 class="plan-card__name">{program.name}</h2>
		<p class="plan-card__meta">Week {weekNumber} of {program.durationWeeks}</p>
	</header>

	{#if finished}
		<div class="plan-card__finished">
			<p>You've finished every week. Run it again, or start something new.</p>
			<div class="plan-card__finished-actions">
				<button
					type="button"
					class="plan-card__action plan-card__action--primary"
					onclick={onRunItAgain}
				>
					Run it again
				</button>
				<a
					class="plan-card__action"
					href={resolve('/workout/new')}
				>
					New plan
				</a>
			</div>
		</div>
	{:else}
		<div class="plan-card__now">
			<p class="plan-card__now-name">{todayName}</p>
			{#if todayMeta}
				<p class="plan-card__now-meta">{todayMeta}</p>
			{/if}
		</div>

		<div class="plan-card__actions">
			<a
				class="plan-card__cta"
				href={resolve(`/workout/today?program=${program.id}`)}
			>
				Start today's workout
			</a>
			<button
				class="plan-card__action"
				type="button"
				onclick={onPause}
			>
				Pause
			</button>
		</div>
	{/if}
</section>

<style>
	.plan-card {
		background: var(--color-surface-2);
		border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
		border-radius: var(--r-2xl);
		padding: var(--space-5);
		margin-block-end: var(--space-6);
	}

	.plan-card__name {
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.plan-card__meta {
		margin-block-start: var(--space-1);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.plan-card__finished {
		margin-block-start: var(--space-4);
		padding: var(--space-4);
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		border-radius: var(--radius-lg);
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-primary);
	}

	.plan-card__finished-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-3);
	}

	.plan-card__now {
		margin-block-start: var(--space-4);
		padding: var(--space-4);
		background: var(--color-surface-3);
		border-radius: var(--radius-lg);
	}

	.plan-card__now-name {
		font-size: 1.0625rem;
		font-weight: 700;
	}

	.plan-card__now-meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.plan-card__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-4);
	}

	.plan-card__cta {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.875rem;
		font-weight: 700;
	}

	.plan-card__action {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			color: var(--color-text-primary);
		}
	}

	.plan-card__action--primary {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
	}
</style>
