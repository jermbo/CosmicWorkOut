<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Item } from '$lib/db/types';
	import type { GoalTemplateRoutine } from '$lib/goalPlans/types';
	import {
		goalPlanTemplates,
		SCRATCH_TEMPLATE_ID,
		blankGoalRoutines,
		cloneTemplateRoutines,
		goalPlanTemplateById,
	} from '$lib/goalPlans/templates';
	import { generateBlocks, totalPlanWeeks, estimateMonths } from '$lib/goalPlans/generator';
	import { autoPlanName } from '$lib/goalPlans/naming';
	import { db } from '$lib/db/database';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { programStore } from '$lib/stores/program.svelte';
	import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ExerciseLibrarySheet from '$lib/components/ExerciseLibrarySheet.svelte';

	type Step = 'template' | 'exercises' | 'goal' | 'start' | 'preview';
	const STEPS: Step[] = ['template', 'exercises', 'goal', 'start', 'preview'];
	const STEP_LABELS: Record<Step, string> = {
		template: 'Template',
		exercises: 'Exercises',
		goal: 'Focus & goal',
		start: 'Starting point',
		preview: 'Review',
	};

	let step = $state<Step>('template');
	/** Built-in template id, or SCRATCH_TEMPLATE_ID when starting empty. */
	let templateId = $state<string | null>(null);
	/** Editable A/B/C lists — cloned from a template or blank. */
	let routines = $state<GoalTemplateRoutine[]>([]);
	let daysPerWeek = $state(3);
	let addingToLetter = $state<'A' | 'B' | 'C' | null>(null);
	let focusItemId = $state<string | null>(null);
	let goalWeight = $state<number | null>(null);
	let goalReps = $state<number | null>(null);
	let startWeight = $state<number | null>(null);
	let startReps = $state<number | null>(null);
	let startFromHistory = $state(false);
	let prefillLoadedFor = $state<string | null>(null);
	let planName = $state('');
	let nameTouched = $state(false);
	let creating = $state(false);

	let stepIndex = $derived(STEPS.indexOf(step));
	let isScratch = $derived(templateId === SCRATCH_TEMPLATE_ID);

	/** Weighted exercises in the plan — the focus candidates. */
	let focusChoices = $derived.by((): Item[] => {
		const seen = new Set<string>();
		const items: Item[] = [];
		for (const routine of routines) {
			for (const slot of routine.slots) {
				if (seen.has(slot.itemId)) continue;
				seen.add(slot.itemId);
				const item = programStore.getItemById(slot.itemId);
				if (item && (item.unit === 'lb' || item.unit === 'kg')) items.push(item);
			}
		}
		return items;
	});

	let focusItem = $derived(focusItemId ? programStore.getItemById(focusItemId) : undefined);
	let unitLabel = $derived(focusItem?.unit === 'kg' ? 'kg' : 'lb');
	let focusIncrement = $derived(focusItem?.weightIncrement ?? 5);

	let goalValid = $derived(focusItemId !== null && (goalWeight ?? 0) > 0 && (goalReps ?? 0) >= 1);
	let startValid = $derived((startWeight ?? 0) > 0 && (startReps ?? 0) >= 1);
	let exercisesValid = $derived(routines.length > 0 && routines.every((r) => r.slots.length > 0));

	let previewBlocks = $derived.by(() => {
		if (!goalValid || !startValid) return [];
		return generateBlocks(
			{ weight: startWeight!, reps: startReps! },
			{ weight: goalWeight!, reps: goalReps! },
			focusIncrement,
		);
	});
	let previewWeeks = $derived(totalPlanWeeks(previewBlocks));
	let previewMonths = $derived(estimateMonths(previewBlocks));

	function clearFocusIfMissing() {
		if (focusItemId && !focusChoices.some((i) => i.id === focusItemId)) {
			focusItemId = null;
		}
	}

	function pickTemplate(id: string) {
		const tmpl = goalPlanTemplateById(id);
		if (!tmpl) return;
		templateId = id;
		daysPerWeek = tmpl.daysPerWeek;
		routines = cloneTemplateRoutines(tmpl);
		focusItemId = null;
		step = 'exercises';
	}

	function pickScratch() {
		templateId = SCRATCH_TEMPLATE_ID;
		daysPerWeek = 3;
		routines = blankGoalRoutines();
		focusItemId = null;
		step = 'exercises';
	}

	function removeSlot(letter: 'A' | 'B' | 'C', itemId: string) {
		routines = routines.map((r) => {
			if (r.letter !== letter) return r;
			return { ...r, slots: r.slots.filter((s) => s.itemId !== itemId) };
		});
		clearFocusIfMissing();
	}

	function addExercise(item: Item) {
		const letter = addingToLetter;
		addingToLetter = null;
		if (!letter) return;

		routines = routines.map((r) => {
			if (r.letter !== letter) return r;
			if (r.slots.some((s) => s.itemId === item.id)) return r;
			return {
				...r,
				slots: [
					...r.slots,
					{
						itemId: item.id,
						sets: item.defaultSets ?? 3,
						reps: item.defaultReps ?? '10',
					},
				],
			};
		});
	}

	/** Propose the starting point from session history (last-used) when it exists. */
	async function goToStart() {
		if (!goalValid || !focusItemId) return;
		if (prefillLoadedFor !== focusItemId) {
			const lastUsed = await db.itemLastUsed.get(focusItemId);
			if (typeof lastUsed?.weight === 'number' && lastUsed.weight > 0) {
				startWeight = lastUsed.weight;
				startReps = lastUsed.reps || null;
				startFromHistory = true;
			} else {
				startWeight = null;
				startReps = null;
				startFromHistory = false;
			}
			prefillLoadedFor = focusItemId;
		}
		step = 'start';
	}

	function goToPreview() {
		if (!startValid || !focusItem) return;
		if (!nameTouched) {
			planName = autoPlanName(focusItem.name, focusItem.id, goalPlanStore.plans);
		}
		step = 'preview';
	}

	async function handleCreate() {
		if (creating || !templateId || !focusItemId || !goalValid || !startValid || !planName.trim()) return;
		if (!exercisesValid) return;
		creating = true;
		try {
			const plan = await goalPlanStore.createPlan({
				templateId,
				name: planName.trim(),
				focusItemId,
				goal: { weight: goalWeight!, reps: goalReps! },
				start: { weight: startWeight!, reps: startReps! },
				routines,
				daysPerWeek,
			});
			const activated = await goalPlanStore.activatePlan(plan.id);
			if (activated) {
				toastStore.show(`${plan.name} is live. Follow the wave!`, 'info');
			} else {
				toastStore.show('Plan created as paused — another goal plan is already active.', 'info');
			}
			goto(resolve('/goals'));
		} catch (e) {
			console.error('Failed to create goal plan:', e);
			toastStore.error("Couldn't create the plan. Please try again.");
			creating = false;
		}
	}

	function back() {
		if (stepIndex > 0) step = STEPS[stepIndex - 1];
	}
</script>

<svelte:head>
	<title>New goal plan — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide goal-new">
	<PageHeader title="New goal plan" showBack backHref="/goals" />

	{#if !prefsStore.goalProgressionPlansEnabled}
		<section class="goal-new__disabled">
			<p>Goal progression plans are turned off.</p>
			<a href={resolve('/settings')}>Enable them in Settings</a>
		</section>
	{:else}
		<ol class="goal-steps" aria-label="Plan creation steps">
			{#each STEPS as s, i (s)}
				<li
					class="goal-steps__item"
					class:goal-steps__item--active={s === step}
					class:goal-steps__item--done={i < stepIndex}
					aria-current={s === step ? 'step' : undefined}
				>
					<span class="goal-steps__num">{i + 1}</span>
					<span class="goal-steps__label">{STEP_LABELS[s]}</span>
				</li>
			{/each}
		</ol>

		{#if step === 'template'}
			<p class="goal-new__lead">
				Start from a starter template or build empty A/B/C days yourself. You can add and remove exercises on the next
				step.
			</p>
			<div class="template-list">
				<button
					class="template-card"
					class:template-card--selected={templateId === SCRATCH_TEMPLATE_ID}
					onclick={pickScratch}
				>
					<span class="template-card__name">Start from scratch</span>
					<span class="template-card__desc">Empty Day A / B / C — pick every exercise from your library.</span>
					<span class="template-card__meta">3×/week · blank scaffold</span>
				</button>
				{#each goalPlanTemplates as tmpl (tmpl.id)}
					<button
						class="template-card"
						class:template-card--selected={templateId === tmpl.id}
						onclick={() => pickTemplate(tmpl.id)}
					>
						<span class="template-card__name">{tmpl.name}</span>
						<span class="template-card__desc">{tmpl.description}</span>
						<span class="template-card__meta">
							{tmpl.daysPerWeek}×/week · {tmpl.routines.map((r) => r.name).join(' · ')}
						</span>
					</button>
				{/each}
			</div>
		{:else if step === 'exercises' && templateId}
			<p class="goal-new__lead">
				{#if isScratch}
					Add exercises to each day. Your focus lift can be any weighted exercise you include.
				{:else}
					Trim or expand the list. Removed exercises stay out of the plan; adds come from your exercise library.
				{/if}
			</p>
			{#each routines as routine (routine.letter)}
				<section class="routine-group">
					<h2 class="routine-group__title">
						<span class="routine-group__letter">{routine.letter}</span>
						{routine.name}
					</h2>
					<ul class="routine-group__list" role="list">
						{#each routine.slots as slot (slot.itemId)}
							{@const item = programStore.getItemById(slot.itemId)}
							<li class="slot-row">
								<div class="slot-row__info">
									<span class="slot-row__name">{item?.name ?? slot.itemId}</span>
									<span class="slot-row__meta">{slot.sets}×{slot.reps}</span>
								</div>
								<button
									type="button"
									class="slot-row__toggle"
									onclick={() => removeSlot(routine.letter, slot.itemId)}
								>
									Remove
								</button>
							</li>
						{:else}
							<li class="slot-row slot-row--empty">No exercises yet</li>
						{/each}
					</ul>
					<button
						type="button"
						class="routine-group__add"
						onclick={() => (addingToLetter = routine.letter)}
					>
						Add exercise
					</button>
				</section>
			{/each}
			{#if !exercisesValid}
				<p class="goal-new__error">Each day needs at least one exercise.</p>
			{/if}
		{:else if step === 'goal'}
			<p class="goal-new__lead">Choose the one lift this plan builds toward, then set the target.</p>
			<div class="form-field">
				<span class="form-field__label" id="focus-label">Focus exercise</span>
				{#if focusChoices.length === 0}
					<p class="goal-new__error">Add at least one weighted exercise first, then pick it as the focus.</p>
				{:else}
					<div class="focus-list" role="radiogroup" aria-labelledby="focus-label">
						{#each focusChoices as item (item.id)}
							<button
								type="button"
								class="focus-option"
								class:focus-option--selected={focusItemId === item.id}
								role="radio"
								aria-checked={focusItemId === item.id}
								onclick={() => (focusItemId = item.id)}
							>
								<span class="focus-option__name">{item.name}</span>
								<span class="focus-option__meta">{item.cat} · +{item.weightIncrement ?? 5} {item.unit}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<div class="form-field">
				<span class="form-field__label">Goal — weight × reps</span>
				<div class="pair-inputs">
					<label class="pair-inputs__field">
						<input
							class="form-field__input"
							type="number"
							inputmode="decimal"
							min="1"
							step={focusIncrement}
							bind:value={goalWeight}
							placeholder="250"
							aria-label="Goal weight"
						/>
						<span class="pair-inputs__unit">{unitLabel}</span>
					</label>
					<span class="pair-inputs__times" aria-hidden="true">×</span>
					<label class="pair-inputs__field">
						<input
							class="form-field__input"
							type="number"
							inputmode="numeric"
							min="1"
							max="30"
							bind:value={goalReps}
							placeholder="5"
							aria-label="Goal reps"
						/>
						<span class="pair-inputs__unit">reps</span>
					</label>
				</div>
			</div>
		{:else if step === 'start'}
			<p class="goal-new__lead">
				{#if startFromHistory}
					Proposed from your session history — confirm it or adjust to match where you are today.
				{:else}
					No history for {focusItem?.name ?? 'this exercise'} yet. Enter a challenging-but-doable weight × reps to start from.
				{/if}
			</p>
			<div class="form-field">
				<span class="form-field__label">Starting point — weight × reps</span>
				<div class="pair-inputs">
					<label class="pair-inputs__field">
						<input
							class="form-field__input"
							type="number"
							inputmode="decimal"
							min="1"
							step={focusIncrement}
							bind:value={startWeight}
							placeholder="150"
							aria-label="Starting weight"
						/>
						<span class="pair-inputs__unit">{unitLabel}</span>
					</label>
					<span class="pair-inputs__times" aria-hidden="true">×</span>
					<label class="pair-inputs__field">
						<input
							class="form-field__input"
							type="number"
							inputmode="numeric"
							min="1"
							max="30"
							bind:value={startReps}
							placeholder="10"
							aria-label="Starting reps"
						/>
						<span class="pair-inputs__unit">reps</span>
					</label>
				</div>
				{#if startFromHistory}
					<p class="form-field__hint">From your last logged set of {focusItem?.name}.</p>
				{/if}
			</div>
			{#if startValid && goalValid && startWeight! >= goalWeight!}
				<p class="goal-new__hint">Your starting weight already meets the goal — the plan will be a single block.</p>
			{/if}
		{:else if step === 'preview' && focusItem}
			<div class="form-field">
				<label class="form-field__label" for="plan-name">Plan name</label>
				<input
					id="plan-name"
					class="form-field__input"
					type="text"
					bind:value={planName}
					oninput={() => (nameTouched = true)}
					autocomplete="off"
				/>
			</div>

			<section class="preview-summary">
				<p class="preview-summary__line">
					<strong>{focusItem.name}</strong> — {startWeight} × {startReps} → goal {goalWeight} × {goalReps}
					{unitLabel === 'kg' ? '(kg)' : '(lb)'}
				</p>
				<p class="preview-summary__line">
					{previewBlocks.length} blocks · {previewWeeks} weeks · roughly {previewMonths}
					{previewMonths === 1 ? 'month' : 'months'} at {daysPerWeek}×/week
				</p>
				<p class="preview-summary__note">
					Everything that isn't {focusItem.name} climbs by its own small increment each week — no deload wave.
				</p>
			</section>

			<div class="preview-blocks">
				{#each previewBlocks as block (block.blockNumber)}
					<section class="preview-block">
						<h3 class="preview-block__title">Block {String(block.blockNumber).padStart(2, '0')}</h3>
						<div class="preview-block__weeks">
							{#each block.weeks as wk (wk.planWeek)}
								<div class="preview-week" class:preview-week--peak={wk.phase === 'peak'} class:preview-week--deload={wk.phase === 'deload'}>
									<span class="preview-week__label">Wk {wk.planWeek}</span>
									<span class="preview-week__target">{wk.weight}×{wk.reps}</span>
									<span class="preview-week__phase">{wk.phase}</span>
								</div>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		{/if}

		<div class="goal-new__actions">
			{#if stepIndex > 0}
				<button class="goal-new__btn goal-new__btn--ghost" type="button" onclick={back}>Back</button>
			{/if}
			{#if step === 'exercises'}
				<button class="goal-new__btn" type="button" disabled={!exercisesValid} onclick={() => (step = 'goal')}>
					Continue
				</button>
			{:else if step === 'goal'}
				<button class="goal-new__btn" type="button" disabled={!goalValid} onclick={goToStart}>Continue</button>
			{:else if step === 'start'}
				<button class="goal-new__btn" type="button" disabled={!startValid} onclick={goToPreview}>
					Generate plan
				</button>
			{:else if step === 'preview'}
				<button
					class="goal-new__btn"
					type="button"
					disabled={creating || !planName.trim()}
					aria-busy={creating}
					onclick={handleCreate}
				>
					{#if creating}Creating…{:else}Create plan{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>

{#if addingToLetter}
	<ExerciseLibrarySheet
		exercises={programStore.items}
		onAdd={addExercise}
		onClose={() => (addingToLetter = null)}
	/>
{/if}

<style>
	.goal-new__disabled {
		padding: var(--space-8);
		text-align: center;
		color: var(--color-text-secondary);
		background: var(--color-surface-2);
		border-radius: var(--r-xl);
		border: 1px dashed var(--color-border-strong);

		a {
			display: inline-block;
			margin-block-start: var(--space-3);
			color: var(--color-accent);
			font-weight: 700;
		}
	}

	.goal-steps {
		display: flex;
		gap: var(--space-2);
		margin-block-end: var(--space-5);
		list-style: none;
		overflow-x: auto;
		padding-block-end: var(--space-1);
	}

	.goal-steps__item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding-inline: var(--space-3);
		block-size: 30px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.goal-steps__item--active {
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	.goal-steps__item--done {
		color: var(--color-text-secondary);
	}

	.goal-steps__num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 16px;
		block-size: 16px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		font-family: var(--font-mono);
		font-size: 0.625rem;
	}

	.goal-steps__item--active .goal-steps__num {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.goal-new__lead {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-4);
	}

	.goal-new__error {
		font-size: 0.8125rem;
		color: var(--color-red);
		margin-block-start: var(--space-2);
	}

	.goal-new__hint {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-3);
	}

	.template-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.template-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-1);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.template-card--selected {
		border-color: var(--color-accent);
	}

	.template-card__name {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
	}

	.template-card__desc {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		line-height: 1.45;
	}

	.template-card__meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-block-start: var(--space-1);
	}

	.routine-group {
		margin-block-end: var(--space-5);
	}

	.routine-group__title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.routine-group__letter {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 26px;
		block-size: 26px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
		font-size: 0.8125rem;
	}

	.routine-group__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.routine-group__add {
		margin-block-start: var(--space-2);
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		border: 2px dashed var(--color-border-strong);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}

	.slot-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.slot-row--empty {
		justify-content: center;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		border-style: dashed;
	}

	.slot-row__info {
		flex: 1;
		min-inline-size: 0;
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}

	.slot-row__name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.slot-row__meta {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.slot-row__toggle {
		flex-shrink: 0;
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			color: var(--color-red);
			border-color: color-mix(in srgb, var(--color-red) 40%, var(--color-border));
		}
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-block-end: var(--space-5);
	}

	.form-field__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.form-field__input {
		block-size: 48px;
		padding-inline: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 1rem;
		color: var(--color-text-primary);
		outline: none;
		inline-size: 100%;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus {
			border-color: var(--color-accent);
		}
		&::placeholder {
			color: var(--color-text-muted);
		}
	}

	.form-field__hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.focus-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.focus-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-border-strong);
		}
	}

	.focus-option--selected {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-2));
	}

	.focus-option__name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.focus-option__meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.pair-inputs {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.pair-inputs__field {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.pair-inputs__unit {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.pair-inputs__times {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		color: var(--color-text-muted);
	}

	.preview-summary {
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
		border-radius: var(--r-xl);
		margin-block-end: var(--space-5);
	}

	.preview-summary__line {
		font-size: 0.9375rem;
		line-height: 1.55;
	}

	.preview-summary__note {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-2);
		line-height: 1.5;
	}

	.preview-blocks {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-block-end: var(--space-5);
	}

	.preview-block__title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.preview-block__weeks {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.preview-week {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding-block: var(--space-2);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.preview-week--peak {
		border-color: color-mix(in srgb, var(--color-accent) 45%, transparent);
	}

	.preview-week--deload {
		opacity: 0.7;
	}

	.preview-week__label {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.preview-week__target {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.preview-week__phase {
		font-size: 0.625rem;
		color: var(--color-text-muted);
	}

	.goal-new__actions {
		display: flex;
		gap: var(--space-3);
		margin-block-start: var(--space-4);
		padding-block-end: var(--space-6);
	}

	.goal-new__btn {
		flex: 1;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
	}

	.goal-new__btn--ghost {
		flex: 0 0 auto;
		padding-inline: var(--space-5);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}
</style>
