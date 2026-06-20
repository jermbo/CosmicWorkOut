<script lang="ts">
	import { untrack } from 'svelte';
	import type { ActivityLog, ActivityType, ActivityIntensity } from '$lib/db/types';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { todayIso } from '$lib/date';
	import { formatMinutes } from '$lib/format';
	import BottomSheet from './BottomSheet.svelte';

	const ACTIVITY_TYPES: ActivityType[] = [
		'Run',
		'Walk',
		'Bike',
		'Swim',
		'Hike',
		'Pickleball',
		'Tennis',
		'Basketball',
		'Yoga',
		'Stretching',
		'Cardio',
		'Other',
	];

	const INTENSITIES: ActivityIntensity[] = ['Easy', 'Moderate', 'Hard'];

	type Props = {
		editing?: ActivityLog | null;
		initialDate?: string;
		onClose: () => void;
		onSave?: () => void;
	};

	let { editing = null, initialDate, onClose, onSave }: Props = $props();

	const todayStr = todayIso();

	// Form is seeded from props once; the sheet is recreated on each open.
	let selectedType = $state<ActivityType>(untrack(() => editing?.type ?? activityStore.lastUsedType));
	let customType = $state(untrack(() => editing?.customType ?? ''));
	let durationMinutes = $state(untrack(() => editing?.durationMinutes ?? 30));
	let intensity = $state<ActivityIntensity>(untrack(() => editing?.intensity ?? 'Moderate'));
	let date = $state(untrack(() => editing?.date ?? initialDate ?? todayStr));
	let saving = $state(false);
	let confirming = $state(false);

	async function handleSave() {
		if (saving) return;
		saving = true;
		try {
			if (editing) {
				await activityStore.update({
					...editing,
					type: selectedType,
					customType: selectedType === 'Other' ? customType.trim() || undefined : undefined,
					durationMinutes,
					intensity,
					date,
				});
			} else {
				await activityStore.add({
					date,
					type: selectedType,
					customType: selectedType === 'Other' ? customType.trim() || undefined : undefined,
					durationMinutes,
					intensity,
				});
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

<BottomSheet onclose={onClose} maxHeight="80dvh">
	<div class="act-sheet">
		<div class="act-sheet__header">
			<h2 class="act-sheet__title">{editing ? 'Edit Activity' : 'Log Activity'}</h2>
			<button class="act-sheet__close" onclick={onClose} aria-label="Close">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="act-sheet__body">
			<!-- Activity type -->
			<div class="act-field">
				<span class="act-field__label">Activity</span>
				<div class="act-type-grid" role="radiogroup" aria-label="Activity type">
					{#each ACTIVITY_TYPES as type}
						<button
							class="act-type-btn"
							class:act-type-btn--active={selectedType === type}
							role="radio"
							aria-checked={selectedType === type}
							onclick={() => {
								selectedType = type;
							}}>{type}</button
						>
					{/each}
				</div>
				{#if selectedType === 'Other'}
					<input
						class="act-custom-input"
						type="text"
						placeholder="Describe your activity…"
						bind:value={customType}
						maxlength={50}
						aria-label="Custom activity name"
					/>
				{/if}
			</div>

			<!-- Duration -->
			<div class="act-field">
				<span class="act-field__label">Duration</span>
				<div class="act-stepper" aria-label="Duration in minutes">
					<button onclick={() => adjustDuration(-5)} aria-label="Decrease 5 minutes">−</button>
					<span class="act-stepper__val">{formatMinutes(durationMinutes)}</span>
					<button onclick={() => adjustDuration(5)} aria-label="Increase 5 minutes">+</button>
				</div>
			</div>

			<!-- Intensity -->
			<div class="act-field">
				<span class="act-field__label">Intensity</span>
				<div class="act-intensity" role="radiogroup" aria-label="Intensity">
					{#each INTENSITIES as lvl}
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

			<!-- Date -->
			<div class="act-field">
				<label class="act-field__label" for="act-date">Date</label>
				<input id="act-date" class="act-date-input" type="date" bind:value={date} max={todayStr} />
			</div>
		</div>

		<div class="act-sheet__footer">
			<button class="act-sheet__save-btn" onclick={handleSave} disabled={saving} aria-busy={saving}>
				{saving ? 'Saving…' : editing ? 'Save changes' : 'Log activity'}
			</button>
			{#if editing}
				<button
					class="act-sheet__delete-btn"
					class:act-sheet__delete-btn--confirm={confirming}
					onclick={handleDelete}
					aria-label={confirming ? 'Tap again to confirm delete' : 'Delete this activity'}
				>
					{confirming ? 'Tap to confirm delete' : 'Delete'}
				</button>
			{/if}
		</div>
	</div>
</BottomSheet>

<style>
	.act-sheet {
		display: flex;
		flex-direction: column;
		padding-block-start: var(--space-2);
	}

	.act-sheet__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--space-5);
		padding-block-end: var(--space-4);
	}

	.act-sheet__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.act-sheet__close {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);

		svg {
			inline-size: 16px;
			block-size: 16px;
		}
	}

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
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.act-type-btn--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.act-custom-input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-2);
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

	.act-stepper {
		display: flex;
		align-items: center;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
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
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.act-intensity-btn--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.act-date-input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-2);
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
	}

	.act-sheet__footer {
		padding: var(--space-4) var(--space-5);
		padding-block-end: max(var(--space-4), env(safe-area-inset-bottom));
		border-block-start: 1px solid var(--color-border);
		margin-block-start: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.act-sheet__save-btn {
		inline-size: 100%;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 1rem;
		font-weight: 700;
		transition: opacity var(--duration-fast) var(--ease-out);

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
		border: 1px solid color-mix(in srgb, #ef4444 40%, transparent);
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
