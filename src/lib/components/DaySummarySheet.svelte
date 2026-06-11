<script lang="ts">
	import type { SessionLog, Exercise } from '$lib/db/types';
	import BottomSheet from './BottomSheet.svelte';

	let {
		session,
		exerciseMap,
		onClose
	}: {
		session: SessionLog;
		exerciseMap: Map<string, Exercise>;
		onClose: () => void;
	} = $props();

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		const months = [
			'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
			'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
		];
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		return `${days[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()}`;
	}

	function formatDuration(seconds: number): string {
		const m = Math.round(seconds / 60);
		return `${m} min`;
	}

	function formatVolume(volume: number): string {
		if (volume >= 1000) {
			return `${(volume / 1000).toFixed(1)}k`;
		}
		return String(volume);
	}

	let totalSets = $derived(
		session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
	);
</script>

<BottomSheet onclose={onClose}>
	<div class="day-summary">
		<div class="day-summary__date-badge">
			{formatDate(session.date)}
		</div>

		<div class="day-summary__stats">
			<div class="day-summary__stat">
				<span class="day-summary__stat-value">{formatDuration(session.durationSeconds ?? 0)}</span>
				<span class="day-summary__stat-label">Duration</span>
			</div>
			<div class="day-summary__stat-sep" aria-hidden="true"></div>
			<div class="day-summary__stat">
				<span class="day-summary__stat-value">{session.exercises.length}</span>
				<span class="day-summary__stat-label">Exercises</span>
			</div>
			<div class="day-summary__stat-sep" aria-hidden="true"></div>
			<div class="day-summary__stat">
				<span class="day-summary__stat-value">{formatVolume(session.totalVolume)}</span>
				<span class="day-summary__stat-label">lb lifted</span>
			</div>
		</div>

		<div class="day-summary__exercises">
			{#each session.exercises as loggedEx (loggedEx.exerciseId)}
				{@const exercise = exerciseMap.get(loggedEx.exerciseId)}
				{#if exercise}
					<div class="day-summary__exercise">
						<div class="day-summary__exercise-header">
							<span class="day-summary__exercise-name">{exercise.name}</span>
							<span class="day-summary__exercise-sets">{loggedEx.sets.length} sets</span>
						</div>
						{#if loggedEx.sets.length > 0}
							<p class="day-summary__exercise-top">
								{#if typeof loggedEx.sets[0].weight === 'number' && loggedEx.sets[0].weight > 0}
									Top: {Math.max(...loggedEx.sets.filter(s => typeof s.weight === 'number').map(s => s.weight as number))} lb
								{:else if typeof loggedEx.sets[0].weight === 'string'}
									{loggedEx.sets[0].weight}
								{:else}
									{loggedEx.sets[0].reps} reps
								{/if}
							</p>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	</div>
</BottomSheet>

<style>
	.day-summary {
		padding-inline: var(--space-5);
		padding-block-start: var(--space-2);
		padding-block-end: var(--space-4);
	}

	.day-summary__date-badge {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-3);
		block-size: 28px;
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		margin-block-end: var(--space-4);
	}

	.day-summary__stats {
		display: flex;
		align-items: center;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding-block: var(--space-4);
		margin-block-end: var(--space-5);
	}

	.day-summary__stat {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.day-summary__stat-sep {
		inline-size: 1px;
		block-size: 32px;
		background: var(--color-border);
		flex-shrink: 0;
	}

	.day-summary__stat-value {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-accent);
	}

	.day-summary__stat-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.day-summary__exercises {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.day-summary__exercise {
		padding-block: var(--space-3);
		border-block-end: 1px dashed var(--color-border);

		&:last-child {
			border-block-end: none;
		}
	}

	.day-summary__exercise-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.day-summary__exercise-name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.day-summary__exercise-sets {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.day-summary__exercise-top {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}
</style>
