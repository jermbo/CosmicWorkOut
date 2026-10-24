<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Routine, Item } from '$lib/db/types';
	import { formatMinutes } from '$lib/format';
	import { programStore } from '$lib/stores/program.svelte';
	import { flattenItems } from '$lib/discipline';

	type Props = {
		workout: Routine;
		exerciseMap: Map<string, Item>;
		onStart: () => Promise<void>;
		/** Weekly targets from a plan goal; shown next to each exercise. */
		prescribed?: Map<string, { weight: number; reps?: number }>;
		/** Wave position from a plan goal; shown as a header chip. */
		goalContext?: {
			programId: string;
			blockNumber: number;
			totalBlocks: number;
			blockWeek: number;
			phase: string;
		} | null;
	};

	let { workout, exerciseMap, onStart, prescribed, goalContext = null }: Props = $props();

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

	let focusChips = $derived.by(() => {
		if (workout.focus) return workout.focus.split(' · ');
		return [];
	});
</script>

<article
	class="packet-card"
	style:--workout-accent={accentColor}
>
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
		<span class="packet-card__tab packet-card__tab--ghost">Wk {programStore.currentWeekNumber}</span
		>
		<span class="packet-card__tab packet-card__tab--letter">
			{workout.letter ?? programStore.currentRoutineLetter}
		</span>
		{#if goalContext}
			<a
				class="packet-card__tab packet-card__tab--wave"
				href={resolve(`/workout/plan/${goalContext.programId}`)}
				aria-label="View plan goal"
			>
				B{goalContext.blockNumber} · {goalContext.phase}
			</a>
		{/if}
	</div>

	<h2 class="packet-card__title">{workout.name}</h2>

	<div class="packet-card__meta">
		{#each focusChips as chip (chip)}
			<span class="packet-card__chip">
				<span
					class="packet-card__chip-dot"
					aria-hidden="true"
				></span>
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
					<circle
						cx="12"
						cy="12"
						r="10"
					/>
					<polyline points="12 6 12 12 16 14" />
				</svg>
				~{formatMinutes(workout.estMin)}
			</span>
		{/if}
	</div>

	<ul
		class="packet-card__exercises"
		role="list"
		aria-label="Exercises in this workout"
	>
		{#each flattenItems(workout) as we, i (we.itemId)}
			{@const exercise = exerciseMap.get(we.itemId)}
			{#if exercise}
				{@const target = prescribed?.get(we.itemId)}
				<li class="packet-card__exercise">
					<span
						class="packet-card__exercise-ix"
						aria-hidden="true">{i + 1}</span
					>
					<span class="packet-card__exercise-name">{exercise.name}</span>
					{#if target && target.weight > 0}
						<span class="packet-card__exercise-target">{target.weight} {exercise.unit ?? 'lb'}</span
						>
					{/if}
					<span class="packet-card__exercise-sets">{we.sets}×{target?.reps ?? we.reps}</span>
				</li>
			{/if}
		{/each}
	</ul>

	<button
		class="packet-card__start"
		onclick={handleStart}
		disabled={starting}
		aria-busy={starting}
	>
		{#if starting}
			<svg
				class="packet-card__start-spinner"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				aria-hidden="true"
			>
				<circle
					cx="12"
					cy="12"
					r="10"
				/>
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
	/* The Training color field (v1.12.0): ink on blue, hard shadow, black START bar. */
	.packet-card {
		container-type: inline-size;
		container-name: workout-card;
		position: relative;
		inline-size: 100%;
		padding: var(--space-3);
		--field: var(--field-train);
		background: var(--field);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard);
	}

	.packet-card__tabs {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		margin-block-end: var(--space-3);
		min-inline-size: 0;
	}

	.packet-card__tab {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding-inline: var(--space-2);
		block-size: 24px;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		white-space: nowrap;
		flex-shrink: 0;
		border: var(--rule-thin) solid var(--color-ink);
	}

	.packet-card__tab--active {
		background: var(--color-ink);
		color: var(--field);
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

	/* The routine's own color (A / B / C) survives as a swatch on its letter. */
	.packet-card__tab--letter {
		background: var(--workout-accent);
	}

	.packet-card__tab--wave {
		color: var(--color-ink);
		text-decoration: none;

		&:active {
			background: var(--color-ink);
			color: var(--field);
		}
	}

	.packet-card__staple {
		inline-size: 12px;
		block-size: 12px;
		flex-shrink: 0;
	}

	.packet-card__title {
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1.625rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 0.95;
		margin-block-end: var(--space-3);
		overflow-wrap: anywhere;
	}

	.packet-card__meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		margin-block-end: var(--space-3);
	}

	.packet-card__chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding-inline: var(--space-2);
		block-size: 22px;
		border: var(--rule-thin) solid var(--color-ink);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;

		svg {
			inline-size: 12px;
			block-size: 12px;
		}
	}

	.packet-card__chip-dot {
		inline-size: 6px;
		block-size: 6px;
		background: var(--color-ink);
	}

	.packet-card__exercises {
		display: flex;
		flex-direction: column;
		margin-block-end: var(--space-3);
		border-block-start: var(--rule) solid var(--color-ink);
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
		gap: var(--space-2);
		padding-block: var(--space-2);
		border-block-end: var(--rule-thin) solid var(--color-ink);
	}

	.packet-card__exercise-ix {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		inline-size: 20px;
		flex-shrink: 0;

		&::before {
			content: 'T';
		}
	}

	.packet-card__exercise-name {
		flex: 1;
		min-inline-size: 0;
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.packet-card__exercise-sets {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.packet-card__exercise-target {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 800;
		padding-inline: 4px;
		background: var(--color-ink);
		color: var(--field);
		flex-shrink: 0;
	}

	.packet-card__start {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		inline-size: 100%;
		min-block-size: 56px;
		padding-inline: var(--space-4);
		background: var(--color-ink);
		color: var(--field);
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1rem;
		font-weight: 800;
		transition: transform var(--duration-press) linear;

		svg {
			order: 2;
			inline-size: 18px;
			block-size: 18px;
		}

		&:not(:disabled):active {
			transform: translate(3px, 3px);
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
