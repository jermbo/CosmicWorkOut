<script lang="ts">
	import type { Habit } from '$lib/db/types';
	import { habitStore } from '$lib/stores/habits.svelte';

	let durationTarget = $state<Habit | null>(null);
	let durationInput = $state('');

	function getValue(habit: Habit): number {
		return habitStore.getLog(habit.id)?.value ?? 0;
	}

	function isComplete(habit: Habit): boolean {
		const val = getValue(habit);
		if (habit.type === 'boolean') return val === 1;
		if (habit.dailyGoal) return val >= habit.dailyGoal;
		return false;
	}

	function progressLabel(habit: Habit): string {
		const val = getValue(habit);
		if (habit.type === 'boolean') return val ? 'Done' : habit.unit || 'No';
		if (habit.dailyGoal) return `${val} / ${habit.dailyGoal}${habit.unit ? ' ' + habit.unit : ''}`;
		return `${val}${habit.unit ? ' ' + habit.unit : ''}`;
	}

	async function handleTap(habit: Habit) {
		if (habit.type === 'count') {
			await habitStore.increment(habit.id);
		} else if (habit.type === 'boolean') {
			await habitStore.toggle(habit.id);
		} else if (habit.type === 'minutes') {
			durationInput = String(getValue(habit) || '');
			durationTarget = habit;
		}
	}

	async function saveDuration() {
		if (!durationTarget) return;
		const val = parseInt(durationInput, 10);
		if (!isNaN(val) && val >= 0) {
			await habitStore.setMinutes(durationTarget.id, val);
		}
		durationTarget = null;
	}
</script>

<div class="habit-widgets">
	<div class="habit-widgets__scroll" role="list" aria-label="Habit widgets">
		{#each habitStore.activeHabits as habit (habit.id)}
			{@const done = isComplete(habit)}
			{@const pct =
				habit.dailyGoal && habit.type !== 'boolean'
					? Math.min(100, (getValue(habit) / habit.dailyGoal) * 100)
					: done
						? 100
						: 0}
			<button
				class="hw"
				class:hw--done={done}
				onclick={() => handleTap(habit)}
				aria-label="{habit.name}: {progressLabel(habit)}"
			>
				<div class="hw__ring" aria-hidden="true">
					<svg viewBox="0 0 36 36">
						<circle class="hw__track" cx="18" cy="18" r="15" />
						{#if pct > 0}
							<circle class="hw__fill" cx="18" cy="18" r="15" style:stroke-dasharray="{(pct / 100) * 94.25} 94.25" />
						{/if}
						{#if done}
							<polyline class="hw__check" points="12 18 16 22 24 14" />
						{/if}
					</svg>
				</div>
				<span class="hw__name">{habit.name}</span>
				<span class="hw__value">{progressLabel(habit)}</span>
			</button>
		{/each}
	</div>
</div>

{#if durationTarget}
	<div class="dur-backdrop" role="presentation" onclick={() => (durationTarget = null)}></div>
	<div class="dur-popup" role="dialog" aria-labelledby="dur-title" aria-modal="true">
		<p class="dur-popup__title" id="dur-title">{durationTarget.name}</p>
		<div class="dur-popup__field">
			<input
				class="dur-popup__input"
				type="number"
				bind:value={durationInput}
				min="0"
				max="480"
				placeholder="0"
				aria-label="Minutes"
				onkeydown={(e) => e.key === 'Enter' && saveDuration()}
			/>
			<span class="dur-popup__unit">min</span>
		</div>
		<div class="dur-popup__actions">
			<button class="dur-popup__save" onclick={saveDuration}>Save</button>
			<button class="dur-popup__cancel" onclick={() => (durationTarget = null)}>Cancel</button>
		</div>
	</div>
{/if}

<style>
	.habit-widgets {
		margin-block-end: var(--space-1);
	}

	.habit-widgets__scroll {
		display: flex;
		gap: var(--space-3);
		overflow-x: auto;
		scrollbar-width: none;
		padding-block: var(--space-1);

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.hw {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
		inline-size: 72px;
		padding-block: var(--space-2);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);

		&:active {
			transform: scale(0.94);
		}
	}

	.hw--done {
		border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
		background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-2));
	}

	.hw__ring {
		inline-size: 40px;
		block-size: 40px;

		svg {
			inline-size: 100%;
			block-size: 100%;
			transform: rotate(-90deg);
		}
	}

	.hw__track {
		fill: none;
		stroke: var(--color-surface-3);
		stroke-width: 3;
	}

	.hw__fill {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 3;
		stroke-linecap: round;
		transition: stroke-dasharray 200ms var(--ease-out);
	}

	.hw__check {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		transform: rotate(90deg);
		transform-origin: 18px 18px;
	}

	.hw__name {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-secondary);
		text-align: center;
		line-height: 1.2;
		max-inline-size: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.hw__value {
		font-size: 0.625rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-inline-size: 100%;
	}

	/* Duration popup */
	.dur-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 90;
	}

	.dur-popup {
		position: fixed;
		inset-inline: var(--space-6);
		inset-block-start: 50%;
		transform: translateY(-50%);
		max-inline-size: 300px;
		margin-inline: auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--r-xl);
		padding: var(--space-5);
		z-index: 91;
		box-shadow: var(--shadow-lg);
	}

	.dur-popup__title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-4);
	}

	.dur-popup__field {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.dur-popup__input {
		flex: 1;
		block-size: 52px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-family: var(--font-mono);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-align: center;
		outline: none;

		&:focus {
			border-color: var(--color-accent);
		}
		&::placeholder {
			color: var(--color-text-muted);
			font-size: 1rem;
			font-weight: 400;
		}
	}

	.dur-popup__unit {
		font-size: 1rem;
		color: var(--color-text-secondary);
		font-weight: 600;
	}

	.dur-popup__actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.dur-popup__save {
		block-size: 48px;
		border-radius: var(--radius-md);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.dur-popup__cancel {
		block-size: 44px;
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		font-weight: 600;
	}
</style>
