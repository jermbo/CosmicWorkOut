<script lang="ts">
	import { onMount } from 'svelte';
	import { programStore } from '$lib/stores/program.svelte';

	import { STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
	import FieldLabel from './FieldLabel.svelte';

	type Props = { onClose: () => void; disciplineId?: string };

	let { onClose, disciplineId = STRENGTH_DISCIPLINE_ID }: Props = $props();

	type Step = 'details' | 'workouts';

	let step = $state<Step>('details');
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});
	let dialog: HTMLDialogElement;

	let name = $state('');
	let description = $state('');
	let durationWeeks = $state(12);
	let daysPerWeek = $state(3);

	let templates = $state<{ name: string; focus: string }[]>([]);

	onMount(() => {
		dialog.showModal();
	});

	function goToWorkouts() {
		const e: Record<string, string> = {};
		if (!name.trim()) e.name = 'Program name is required';
		if (durationWeeks < 1 || durationWeeks > 52) e.weeks = 'Must be 1–52 weeks';
		if (daysPerWeek < 1 || daysPerWeek > 7) e.days = 'Must be 1–7 days';
		errors = e;
		if (Object.keys(e).length > 0) return;

		templates = Array.from({ length: daysPerWeek }, (_, i) => ({
			name: `Workout ${String.fromCharCode(65 + i)}`,
			focus: '',
		}));
		step = 'workouts';
	}

	async function handleCreate() {
		if (saving) return;
		saving = true;
		try {
			const program = await programStore.createProgram({
				name: name.trim(),
				description: description.trim(),
				durationWeeks,
				daysPerWeek,
				routineTemplates: templates,
				disciplineId,
			});

			programStore.setActiveProgram(program.id);
			onClose();
		} finally {
			saving = false;
		}
	}

	function updateTemplate(i: number, field: 'name' | 'focus', value: string) {
		templates = templates.map((t, idx) => {
			if (idx === i) return { ...t, [field]: value };
			return t;
		});
	}
</script>

<dialog
	bind:this={dialog}
	class="create-overlay"
	oncancel={(e) => {
		e.preventDefault();
		onClose();
	}}
	aria-labelledby="create-title"
	aria-modal="true"
>
	<div class="create-overlay__inner">
		<div class="create-overlay__top">
			<div class="create-overlay__bar">
				{#if step === 'workouts'}
					<button
						class="icon-btn"
						onclick={() => (step = 'details')}
						aria-label="Back"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
				{:else}
					<button
						class="icon-btn"
						onclick={onClose}
						aria-label="Cancel"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<line
								x1="18"
								y1="6"
								x2="6"
								y2="18"
							/>
							<line
								x1="6"
								y1="6"
								x2="18"
								y2="18"
							/>
						</svg>
					</button>
				{/if}
				<div class="create-overlay__titles">
					<h1
						class="create-overlay__title"
						id="create-title"
					>
						{#if step === 'details'}New Program{:else}Name Your Workouts{/if}
					</h1>
					<p class="create-overlay__subtitle">
						{#if step === 'details'}
							Step 1 of 2 — Program details
						{:else}
							Step 2 of 2 — {daysPerWeek} workout{#if daysPerWeek !== 1}s{/if}/week
						{/if}
					</p>
				</div>
				{#if step === 'details'}
					<button
						class="create-overlay__next-btn"
						onclick={goToWorkouts}
					>
						Next →
					</button>
				{:else}
					<button
						class="create-overlay__next-btn"
						onclick={handleCreate}
						disabled={saving}
						aria-busy={saving}
					>
						{#if saving}Creating…{:else}Create{/if}
					</button>
				{/if}
			</div>
		</div>

		<div class="create-overlay__scroll">
			{#if step === 'details'}
				<div class="create-form">
					<div
						class="form-field"
						class:form-field--error={errors.name}
					>
						<FieldLabel for="prog-name">Program name</FieldLabel>
						<input
							id="prog-name"
							class="form-field__input"
							type="text"
							bind:value={name}
							placeholder="e.g. My Strength Block"
							autocomplete="off"
						/>
						{#if errors.name}<span class="form-field__error">{errors.name}</span>{/if}
					</div>

					<div class="form-field">
						<FieldLabel
							for="prog-desc"
							hint="optional">Description</FieldLabel
						>
						<textarea
							id="prog-desc"
							class="form-field__textarea"
							bind:value={description}
							placeholder="What's this program about?"
							rows="3"
						></textarea>
					</div>

					<div
						class="form-field"
						class:form-field--error={errors.weeks}
					>
						<FieldLabel for="prog-weeks">Duration (weeks)</FieldLabel>
						<div class="stepper">
							<button
								type="button"
								onclick={() => {
									if (durationWeeks > 1) durationWeeks--;
								}}
								aria-label="Decrease weeks">−</button
							>
							<span id="prog-weeks">{durationWeeks}</span>
							<button
								type="button"
								onclick={() => {
									if (durationWeeks < 52) durationWeeks++;
								}}
								aria-label="Increase weeks">+</button
							>
						</div>
						{#if errors.weeks}<span class="form-field__error">{errors.weeks}</span>{/if}
					</div>

					<div
						class="form-field"
						class:form-field--error={errors.days}
					>
						<FieldLabel id="days-label">Days per week</FieldLabel>
						<div
							class="days-chips"
							role="radiogroup"
							aria-labelledby="days-label"
						>
							{#each [1, 2, 3, 4, 5, 6, 7] as d (d)}
								<button
									type="button"
									class="days-chip"
									class:days-chip--active={daysPerWeek === d}
									role="radio"
									aria-checked={daysPerWeek === d}
									onclick={() => (daysPerWeek = d)}>{d}</button
								>
							{/each}
						</div>
						{#if errors.days}<span class="form-field__error">{errors.days}</span>{/if}
					</div>
				</div>
			{:else}
				<div class="create-form">
					<p class="create-form__hint">
						Give each workout a name. You can add exercises after the program is created.
					</p>
					{#each templates as tmpl, i (i)}
						<div class="workout-template">
							<span class="workout-template__letter">{String.fromCharCode(65 + i)}</span>
							<div class="workout-template__fields">
								<input
									class="form-field__input"
									type="text"
									value={tmpl.name}
									placeholder="Workout name"
									oninput={(e) => updateTemplate(i, 'name', (e.target as HTMLInputElement).value)}
									aria-label="Workout {String.fromCharCode(65 + i)} name"
								/>
								<input
									class="form-field__input form-field__input--sm"
									type="text"
									value={tmpl.focus}
									placeholder="Focus (optional, e.g. Lower body)"
									oninput={(e) => updateTemplate(i, 'focus', (e.target as HTMLInputElement).value)}
									aria-label="Workout {String.fromCharCode(65 + i)} focus"
								/>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</dialog>

<style>
	.create-overlay {
		position: fixed;
		inset: 0;
		inline-size: 100%;
		max-inline-size: var(--max-width);
		margin-inline: auto;
		block-size: 100dvh;
		background: var(--color-bg);
		border: none;
		padding: 0;
		overflow: hidden;
		z-index: 200;
		display: flex;
		flex-direction: column;

		&::backdrop {
			background: rgba(0, 0, 0, 0.8);
		}
	}

	@container app (inline-size >= 720px) {
		.create-overlay {
			inset-inline-start: var(--side-nav-width);
			margin-inline-start: 0;
			margin-inline-end: auto;
		}
	}

	.create-overlay__inner {
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.create-overlay__top {
		flex-shrink: 0;
		border-block-end: 1px solid var(--color-border);
		padding-block-start: calc(var(--safe-top) + var(--space-3));
		padding-block-end: var(--space-3);
	}

	.create-overlay__bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-inline: var(--space-4);
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		flex-shrink: 0;

		svg {
			inline-size: 20px;
			block-size: 20px;
		}
	}

	.create-overlay__titles {
		flex: 1;
		min-inline-size: 0;
	}

	.create-overlay__title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.create-overlay__subtitle {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.create-overlay__next-btn {
		padding-inline: var(--space-4);
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.875rem;
		font-weight: 700;
		flex-shrink: 0;
		transition: opacity var(--duration-fast) var(--ease-out);

		&:disabled {
			opacity: 0.6;
			cursor: default;
		}
	}

	.create-overlay__scroll {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.create-form {
		padding: var(--space-5) var(--space-4) 120px;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.create-form__hint {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-field--error .form-field__input,
	.form-field--error .stepper {
		border-color: var(--color-red);
	}

	.form-field__input {
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

	.form-field__input--sm {
		block-size: 38px;
		font-size: 0.875rem;
	}

	.form-field__textarea {
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		outline: none;
		resize: none;
		line-height: 1.5;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus {
			border-color: var(--color-accent);
		}
		&::placeholder {
			color: var(--color-text-muted);
		}
	}

	.form-field__error {
		font-size: 0.75rem;
		color: var(--color-red);
	}

	.stepper {
		display: flex;
		align-items: center;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		block-size: 52px;
		transition: border-color var(--duration-fast) var(--ease-out);

		button {
			inline-size: 56px;
			font-size: 1.5rem;
			color: var(--color-text-secondary);
			transition: background-color var(--duration-fast) var(--ease-out);

			&:hover {
				background: var(--color-surface-3);
			}
		}

		span {
			flex: 1;
			text-align: center;
			font-family: var(--font-mono);
			font-size: 1.5rem;
			font-weight: 700;
		}
	}

	.days-chips {
		display: flex;
		gap: var(--space-2);
	}

	.days-chip {
		flex: 1;
		block-size: 44px;
		border-radius: var(--radius-md);
		font-size: 1rem;
		font-weight: 700;
		font-family: var(--font-mono);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.days-chip--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.workout-template {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
	}

	.workout-template__letter {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 40px;
		block-size: 44px;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent-text);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.workout-template__fields {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
