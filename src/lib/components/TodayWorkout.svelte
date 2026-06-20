<script lang="ts">
	import type { Routine, Item } from '$lib/db/types';
	import { formatMinutes } from '$lib/format';
	import { programStore } from '$lib/stores/program.svelte';
	import { flattenItems } from '$lib/discipline';

	type Props = {
		workout: Routine;
		exerciseMap: Map<string, Item>;
		onStart: () => Promise<void>;
	};

	let { workout, exerciseMap, onStart }: Props = $props();

	let starting = $state(false);

	const ACCENT_MAP: Record<string, string> = {
		lime: 'var(--color-lime)',
		lavender: 'var(--color-lavender)',
		red: 'var(--color-red)',
	};

	let accentColor = $derived(ACCENT_MAP[workout.color ?? 'lime'] ?? 'var(--color-accent)');

	async function handleStart() {
		if (starting) {
			return;
		}
		starting = true;
		await onStart();
		starting = false;
	}

	let focusChips = $derived(workout.focus ? workout.focus.split(' · ') : []);
</script>

<article class="packet-card" style:--workout-accent={accentColor}>
	<!-- Ruled texture overlay -->
	<div class="packet-card__ruled" aria-hidden="true"></div>

	<!-- Staple-tab row -->
	<div class="packet-card__tabs">
		<span class="packet-card__tab packet-card__tab--active">
			<svg
				class="packet-card__staple"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.4"
				stroke-linecap="round"
				aria-hidden="true"
			>
				<path d="M5 8v8M9 6v10M13 8v8M17 6v10" />
			</svg>
			<span class="packet-card__tab-text">{programStore.activeProgram?.name ?? 'Program'}</span>
		</span>
		<span class="packet-card__tab packet-card__tab--ghost">Wk {programStore.currentWeekNumber}</span>
		<span class="packet-card__tab packet-card__tab--ghost">
			{workout.letter ?? programStore.currentRoutineLetter}
		</span>
	</div>

	<!-- Workout title -->
	<h2 class="packet-card__title">{workout.name}</h2>

	<!-- Focus chips + estimated time -->
	<div class="packet-card__meta">
		{#each focusChips as chip}
			<span class="packet-card__chip">
				<span class="packet-card__chip-dot" aria-hidden="true"></span>
				{chip}
			</span>
		{/each}
		{#if workout.estMin}
			<span class="packet-card__chip">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="10" />
					<polyline points="12 6 12 12 16 14" />
				</svg>
				~{formatMinutes(workout.estMin)}
			</span>
		{/if}
	</div>

	<!-- Exercise list -->
	<ul class="packet-card__exercises" role="list" aria-label="Exercises in this workout">
		{#each flattenItems(workout) as we, i}
			{@const exercise = exerciseMap.get(we.itemId)}
			{#if exercise}
				<li class="packet-card__exercise">
					<span class="packet-card__exercise-ix" aria-hidden="true">{i + 1}</span>
					<span class="packet-card__exercise-name">{exercise.name}</span>
					<span class="packet-card__exercise-sets">{we.sets}×{we.reps}</span>
				</li>
			{/if}
		{/each}
	</ul>

	<!-- Start CTA -->
	<button class="packet-card__start" onclick={handleStart} disabled={starting} aria-busy={starting}>
		{#if starting}
			<svg
				class="packet-card__start-spinner"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="10" />
			</svg>
			Starting…
		{:else}
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polygon points="5 3 19 12 5 21 5 3" />
			</svg>
			Start session
		{/if}
	</button>
</article>

<style>
	.packet-card {
		container-type: inline-size;
		container-name: workout-card;
		position: relative;
		inline-size: 100%;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-2xl);
		padding: var(--space-5);
		overflow: hidden;
		animation: slide-up var(--duration-normal) var(--ease-out) both;
	}

	/* Notebook ruled lines */
	.packet-card__ruled {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			transparent,
			transparent 33px,
			rgba(255, 255, 255, 0.018) 33px,
			rgba(255, 255, 255, 0.018) 34px
		);
		mask-image: linear-gradient(to bottom, transparent 0, black 120px);
		pointer-events: none;
	}

	/* Tabs */
	.packet-card__tabs {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-block-end: var(--space-4);
		position: relative;
		z-index: 1;
		min-inline-size: 0;
	}

	.packet-card__tab {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding-inline: var(--space-3);
		block-size: 28px;
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.01em;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.packet-card__tab--active {
		background: var(--workout-accent);
		color: #101010;
		flex-shrink: 1;
		min-inline-size: 0;
		max-inline-size: 52cqi;
	}

	.packet-card__tab-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-inline-size: 0;
	}

	.packet-card__tab--ghost {
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
	}

	.packet-card__staple {
		inline-size: 14px;
		block-size: 14px;
		opacity: 0.6;
		flex-shrink: 0;
	}

	/* Title */
	.packet-card__title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
		margin-block-end: var(--space-3);
		position: relative;
		z-index: 1;
	}

	/* Focus chips */
	.packet-card__meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-end: var(--space-4);
		position: relative;
		z-index: 1;
	}

	.packet-card__chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding-inline: var(--space-2);
		block-size: 24px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);

		svg {
			inline-size: 12px;
			block-size: 12px;
		}
	}

	.packet-card__chip-dot {
		inline-size: 5px;
		block-size: 5px;
		border-radius: var(--radius-full);
		background: var(--workout-accent);
	}

	/* Exercise list */
	.packet-card__exercises {
		display: flex;
		flex-direction: column;
		margin-block-end: var(--space-5);
		position: relative;
		z-index: 1;
	}

	@container workout-card (inline-size >= 520px) {
		.packet-card__exercises {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			column-gap: var(--space-5);
		}
	}

	.packet-card__exercise {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-2);
		border-block-end: 1px dashed var(--color-border);

		&:last-child {
			border-block-end: none;
		}
	}

	.packet-card__exercise-ix {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--color-text-muted);
		inline-size: 16px;
		text-align: center;
		flex-shrink: 0;
	}

	.packet-card__exercise-name {
		flex: 1;
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.packet-card__exercise-sets {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	/* Start CTA */
	.packet-card__start {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		inline-size: 100%;
		padding-block: var(--space-4);
		background: var(--workout-accent);
		color: #101010;
		border-radius: var(--radius-full);
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
		min-block-size: 56px;
		box-shadow: var(--shadow-lime);
		transition: transform var(--duration-fast) var(--ease-out);
		position: relative;
		z-index: 1;

		svg {
			inline-size: 18px;
			block-size: 18px;
		}

		&:not(:disabled):active {
			transform: scale(0.97);
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.packet-card__start-spinner {
		animation: spin 700ms linear infinite;
	}
</style>
