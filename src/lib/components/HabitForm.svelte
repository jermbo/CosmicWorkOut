<script lang="ts">
	import { untrack } from 'svelte';
	import type { Habit, HabitType } from '$lib/db/types';
	import { habitStore } from '$lib/stores/habits.svelte';
	import { HABIT_TYPES, HABIT_PRESETS, habitTypeLabel } from '$lib/habits';

	type Props = {
		editing?: Habit | null;
		onclose: () => void;
	};

	let { editing = null, onclose }: Props = $props();

	let name = $state(untrack(() => editing?.name ?? ''));
	let unit = $state(untrack(() => editing?.unit ?? ''));
	let type = $state<HabitType>(untrack(() => editing?.type ?? 'times'));
	let goal = $state<number | undefined>(untrack(() => editing?.dailyGoal));
	let saving = $state(false);
	let showPresets = $state(untrack(() => editing === null));

	let typeHasGoal = $derived(type === 'times' || type === 'minutes' || type === 'count');
	let typeRequiresUnit = $derived(type === 'count');

	const titleId = $props.id();

	function applyPreset(preset: (typeof HABIT_PRESETS)[number]) {
		name = preset.name;
		type = preset.type;
		unit = preset.unit;
		goal = undefined;
		showPresets = false;
	}

	function selectType(value: HabitType) {
		type = value;
		if (value !== 'count') unit = '';
	}

	function resolveDailyGoal(): number | undefined {
		if (typeHasGoal && goal && goal > 0) return goal;
		return undefined;
	}

	async function save() {
		if (!name.trim() || saving) return;
		if (typeRequiresUnit && !unit.trim()) return;
		saving = true;
		try {
			const dailyGoal = resolveDailyGoal();
			if (editing) {
				await habitStore.updateHabit({
					...editing,
					name: name.trim(),
					unit: unit.trim(),
					dailyGoal,
				});
			} else {
				await habitStore.addHabit({ name: name.trim(), unit: unit.trim(), type, dailyGoal });
			}
			onclose();
		} finally {
			saving = false;
		}
	}
</script>

<div class="modal-backdrop" role="presentation" onclick={() => !saving && onclose()}></div>
<div class="modal" role="dialog" aria-labelledby={titleId} aria-modal="true">
	<p class="modal__title" id={titleId}>
		{#if editing}Edit Habit{:else}New Habit{/if}
	</p>

	{#if showPresets && !editing}
		<div class="hf-presets">
			<p class="hf-presets__label">Start from a preset</p>
			<div class="hf-presets__grid">
				{#each HABIT_PRESETS as preset}
					<button class="hf-preset-btn" onclick={() => applyPreset(preset)}>{preset.name}</button>
				{/each}
			</div>
			<button class="hf-presets__skip" onclick={() => (showPresets = false)}> Start from scratch </button>
		</div>
	{:else}
		<div class="hf-field">
			<label class="hf-label" for="habit-name">Name <span class="hf-hint">max 40 chars</span></label>
			<input id="habit-name" class="hf-input" type="text" bind:value={name} placeholder="e.g. Water" maxlength={40} />
		</div>

		{#if editing}
			<div class="hf-field">
				<span class="hf-label">Type <span class="hf-hint">locked after creation</span></span>
				<div class="hf-type-locked">{habitTypeLabel(type)}</div>
			</div>
		{:else}
			<div class="hf-field">
				<span class="hf-label">Type</span>
				<div class="hf-types">
					{#each HABIT_TYPES as ht}
						<button
							class="hf-type-btn"
							class:hf-type-btn--active={type === ht.value}
							onclick={() => selectType(ht.value)}
							aria-pressed={type === ht.value}
						>
							<span class="hf-type-btn__label">{ht.label}</span>
							<span class="hf-type-btn__desc">{ht.desc}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		{#if type === 'count'}
			<div class="hf-field">
				<label class="hf-label" for="habit-unit">Unit label <span class="hf-hint">required · max 20 chars</span></label>
				<input
					id="habit-unit"
					class="hf-input"
					type="text"
					bind:value={unit}
					placeholder="e.g. glasses, pages, words"
					maxlength={20}
				/>
			</div>
		{/if}

		{#if typeHasGoal}
			<div class="hf-field">
				<label class="hf-label" for="habit-goal">Daily goal <span class="hf-hint">optional</span></label>
				<input id="habit-goal" class="hf-input" type="number" bind:value={goal} placeholder="e.g. 8" min="1" />
			</div>
		{/if}

		<div class="modal__actions">
			<button class="modal__btn modal__btn--ghost" onclick={onclose} disabled={saving}>Cancel</button>
			<button
				class="modal__btn modal__btn--primary"
				onclick={save}
				disabled={!name.trim() || saving || (typeRequiresUnit && !unit.trim())}
			>
				{#if saving}Saving…{:else}Save{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 90;
	}

	.modal {
		position: fixed;
		inset-inline: var(--space-4);
		inset-block-start: 50%;
		transform: translateY(-50%);
		max-inline-size: 440px;
		max-block-size: 85dvh;
		overflow-y: auto;
		margin-inline: auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--r-xl);
		padding: var(--space-5);
		z-index: 91;
		box-shadow: var(--shadow-lg);
	}

	.modal__title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-4);
	}

	.modal__actions {
		display: flex;
		gap: var(--space-2);
		margin-block-start: var(--space-4);
	}

	.modal__btn {
		flex: 1;
		min-block-size: 48px;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.modal__btn--ghost {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
	}

	.modal__btn--primary {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.hf-field {
		margin-block-end: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.hf-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.hf-hint {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: var(--color-text-muted);
	}

	.hf-input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		outline: none;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus {
			border-color: var(--color-accent);
		}
		&::placeholder {
			color: var(--color-text-muted);
		}
	}

	.hf-type-locked {
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.hf-types {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.hf-type-btn {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.hf-type-btn--active {
		border-color: var(--color-accent);
	}

	.hf-type-btn__label {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.hf-type-btn__desc {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.hf-presets {
		padding-block-end: var(--space-2);
	}

	.hf-presets__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.hf-presets__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.hf-preset-btn {
		padding: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		text-align: center;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}

	.hf-presets__skip {
		display: block;
		inline-size: 100%;
		padding-block: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		font-weight: 600;
	}
</style>
