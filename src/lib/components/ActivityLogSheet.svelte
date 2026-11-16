<script lang="ts">
	import { holdRepeat } from '#lib/feedback/holdRepeat';
	import { untrack } from 'svelte';
	import type { ActivityLog, ActivityIntensity } from '#lib/db/types';
	import { activityStore, type ActivityTypeChoice } from '#lib/stores/activities.svelte';
	import { todayIso } from '#lib/date';
	import { formatMinutes } from '#lib/format';
	import BottomSheet from './BottomSheet.svelte';
	import SheetHeader from './SheetHeader.svelte';
	import SheetBody from './SheetBody.svelte';

	/** Other is not a type: it is the way to add one (US-061). */
	const OTHER = 'other';

	const INTENSITIES: ActivityIntensity[] = ['Easy', 'Moderate', 'Hard'];

	type Props = {
		editing?: ActivityLog | null;
		initialDate?: string;
		onClose: () => void;
		onSave?: () => void;
	};

	let { editing = null, initialDate, onClose, onSave }: Props = $props();

	const todayStr = todayIso();

	// The picker order is fixed while the sheet is open, so a save never reshuffles it.
	// An entry of a hidden type keeps its type in the list while it is edited.
	const choices = untrack(() => {
		const list = [...activityStore.pickerTypes];
		const own = editing ? activityStore.typesById.get(editing.typeId) : undefined;
		if (own && !list.some((t) => t.id === own.id)) list.push(own);
		return list;
	});

	let selected = $state<string>(
		untrack(() => editing?.typeId ?? activityStore.lastUsedTypeId ?? OTHER),
	);
	let otherName = $state('');
	let durationMinutes = $state(untrack(() => editing?.durationMinutes ?? 30));
	let intensity = $state<ActivityIntensity>(untrack(() => editing?.intensity ?? 'Moderate'));
	let date = $state(untrack(() => editing?.date ?? initialDate ?? todayStr));
	let saving = $state(false);
	let confirming = $state(false);

	let otherInput: HTMLInputElement | undefined = $state();

	// Picking Other opens the name field; put the cursor in it.
	$effect(() => {
		if (selected === OTHER) otherInput?.focus();
	});

	/** Save stays off until Other has a name (US-061 3b). */
	let canSave = $derived(selected !== OTHER || otherName.trim().length > 0);

	let deleteAriaLabel = $derived.by(() => {
		if (confirming) return 'Tap again to confirm delete';
		return 'Delete this activity';
	});

	function choice(): ActivityTypeChoice {
		if (selected === OTHER) return { otherName: otherName.trim() };
		return { typeId: selected };
	}

	async function handleSave() {
		if (saving || !canSave) return;
		saving = true;
		try {
			if (editing) {
				await activityStore.update({ ...editing, durationMinutes, intensity, date }, choice());
			} else {
				await activityStore.add({ date, type: choice(), durationMinutes, intensity });
			}
			onSave?.();
			onClose();
		} finally {
			saving = false;
		}
	}

	function adjustDuration(delta: number) {
		durationMinutes = Math.max(1, Math.min(300, durationMinutes + delta));
	}

	async function handleDelete() {
		if (!editing) return;
		if (!confirming) {
			confirming = true;
			return;
		}
		try {
			await activityStore.remove(editing.id);
			onClose();
		} catch {
			confirming = false;
		}
	}
</script>

<BottomSheet
	onclose={onClose}
	maxHeight="80dvh"
>
	<SheetBody>
		<SheetHeader
			title={editing ? 'Edit Activity' : 'Log Activity'}
			{onClose}
		/>

		<div class="act-sheet__body">
			<div class="act-field">
				<span class="act-field__label">Activity</span>
				<div
					class="act-type-grid"
					role="radiogroup"
					aria-label="Activity type"
				>
					{#each choices as type (type.id)}
						<button
							class="act-type-btn"
							class:act-type-btn--active={selected === type.id}
							role="radio"
							aria-checked={selected === type.id}
							onclick={() => {
								selected = type.id;
							}}>{type.name}</button
						>
					{/each}
					<button
						class="act-type-btn"
						class:act-type-btn--active={selected === OTHER}
						role="radio"
						aria-checked={selected === OTHER}
						onclick={() => {
							selected = OTHER;
						}}>Other</button
					>
				</div>
				{#if selected === OTHER}
					<input
						bind:this={otherInput}
						class="act-custom-input"
						type="text"
						placeholder="Name your activity, like Mowing"
						bind:value={otherName}
						maxlength={50}
						aria-label="Custom activity name"
					/>
				{/if}
			</div>

			<div class="act-field">
				<span class="act-field__label">Duration</span>
				<div
					class="act-stepper"
					aria-label="Duration in minutes"
				>
					<button
						onclick={() => adjustDuration(-5)}
						use:holdRepeat={() => adjustDuration(-5)}
						aria-label="Decrease 5 minutes">−</button
					>
					<span class="act-stepper__val">{formatMinutes(durationMinutes)}</span>
					<button
						onclick={() => adjustDuration(5)}
						use:holdRepeat={() => adjustDuration(5)}
						aria-label="Increase 5 minutes">+</button
					>
				</div>
			</div>

			<div class="act-field">
				<span class="act-field__label">Intensity</span>
				<div
					class="act-intensity"
					role="radiogroup"
					aria-label="Intensity"
				>
					{#each INTENSITIES as lvl (lvl)}
						<button
							class="act-intensity-btn"
							class:act-intensity-btn--active={intensity === lvl}
							role="radio"
							aria-checked={intensity === lvl}
							onclick={() => (intensity = lvl)}>{lvl}</button
						>
					{/each}
				</div>
			</div>
		</div>

		<div class="act-sheet__footer">
			<button
				class="act-sheet__save-btn"
				data-feedback="success"
				onclick={handleSave}
				disabled={saving || !canSave}
				aria-busy={saving}
			>
				{#if saving}Saving…{:else if editing}Save changes{:else}Log activity{/if}
			</button>
			{#if editing}
				<button
					class="act-sheet__delete-btn"
					data-feedback="warn"
					class:act-sheet__delete-btn--confirm={confirming}
					onclick={handleDelete}
					aria-label={deleteAriaLabel}
				>
					{#if confirming}Tap to confirm delete{:else}Delete{/if}
				</button>
			{/if}
		</div>
	</SheetBody>
</BottomSheet>

<style>
	.act-sheet__body {
		overflow-y: auto;
		padding-inline: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.act-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.act-field__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
	}

	.act-type-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.act-type-btn {
		padding-inline: var(--space-3);
		block-size: 36px;
		border-radius: var(--radius-full);
		font-size: 0.875rem;
		font-weight: 600;
		background: transparent;
		border: var(--rule-thin) solid var(--color-paper);
		color: var(--color-text-primary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.act-type-btn--active {
		background: var(--field-active);
		border-color: var(--color-ink);
		color: var(--color-ink);
	}

	.act-custom-input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-2);
		border: var(--rule-thin) solid var(--color-border);
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

	.act-stepper {
		display: flex;
		align-items: center;
		background: var(--color-surface-2);
		border: var(--rule-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		block-size: 56px;

		button {
			inline-size: 64px;
			font-size: 1.5rem;
			color: var(--color-text-secondary);
			transition: background-color var(--duration-fast) var(--ease-out);

			&:hover {
				background: var(--color-surface-3);
			}
		}
	}

	.act-stepper__val {
		flex: 1;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 1.5rem;
		font-weight: 700;
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 4px;
	}

	.act-intensity {
		display: flex;
		gap: var(--space-2);
	}

	.act-intensity-btn {
		flex: 1;
		block-size: 44px;
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 600;
		background: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.act-intensity-btn--active {
		background: var(--field-active);
		border-color: var(--color-ink);
		color: var(--color-ink);
	}

	.act-sheet__footer {
		padding: var(--space-4) var(--space-5);
		padding-block-end: max(var(--space-4), env(safe-area-inset-bottom));
		border-block-start: var(--rule-thin) solid var(--color-border);
		margin-block-start: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.act-sheet__save-btn {
		inline-size: 100%;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: var(--field-active);
		color: var(--color-accent-ink);
		font-size: 1rem;
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		&:disabled {
			opacity: 0.6;
			cursor: default;
		}
	}

	.act-sheet__delete-btn {
		inline-size: 100%;
		block-size: 44px;
		border-radius: var(--radius-full);
		background: transparent;
		border: var(--rule-thin) solid var(--color-red);
		color: #ef4444;
		font-size: 0.9375rem;
		font-weight: 600;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.act-sheet__delete-btn--confirm {
		background: color-mix(in srgb, #ef4444 12%, transparent);
		border-color: #ef4444;
	}
</style>
