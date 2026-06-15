<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { Workout, WorkoutExercise, Exercise } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import ExerciseLibrarySheet from './ExerciseLibrarySheet.svelte';

	let {
		workout: initWorkout,
		onBack
	}: {
		workout: Workout | null;
		onBack: () => void;
	} = $props();

	// Snapshot prop at open time — editor data is intentionally frozen
	const snap = untrack(() => ({
		isNew: initWorkout === null,
		name: initWorkout?.name ?? 'New Workout',
		letter: initWorkout?.letter ?? 'D',
		focus: initWorkout?.focus ?? '',
		exercises: initWorkout?.exercises.map((e, i) => ({ ...e, _key: i })) ?? []
	}));

	const isNew = snap.isNew;

	let title = $state(snap.name);
	let letter = $state(snap.letter);
	let focus = $state(snap.focus);
	let exercises = $state<(WorkoutExercise & { _key: number })[]>(snap.exercises);
	let editingIndex = $state<number | null>(null);
	let showLibrary = $state(false);
	let editingTitle = $state(false);
	let saving = $state(false);

	let keyCounter = untrack(() => exercises.length);
	let titleInputEl = $state<HTMLInputElement | null>(null);

	function moveExercise(i: number, dir: number) {
		const j = i + dir;
		if (j < 0 || j >= exercises.length) {
			return;
		}
		const arr = exercises.slice();
		[arr[i], arr[j]] = [arr[j], arr[i]];
		exercises = arr;
	}

	function removeExercise(i: number) {
		exercises = exercises.filter((_, idx) => idx !== i);
		if (editingIndex === i) {
			editingIndex = null;
		}
	}

	function addFromLibrary(ex: Exercise) {
		keyCounter++;
		exercises = [
			...exercises,
			{
				exerciseId: ex.id,
				sets: ex.defaultSets,
				reps: ex.defaultReps,
				_key: keyCounter
			}
		];
		showLibrary = false;
	}

	function updateExerciseSets(i: number, sets: number, reps: string) {
		exercises = exercises.map((e, idx) => (idx === i ? { ...e, sets, reps } : e));
		editingIndex = null;
	}

	async function handleSave() {
		if (saving) {
			return;
		}
		saving = true;

		const clean: WorkoutExercise[] = exercises.map(({ _key, ...rest }) => rest);

		if (isNew) {
			await programStore.addWorkout({
				name: title,
				letter,
				focus,
				color: 'lime',
				exercises: clean
			});
		} else {
			await programStore.saveWorkout(initWorkout!.name, {
				name: title,
				letter,
				focus,
				color: initWorkout!.color ?? 'lime',
				exercises: clean
			});
		}

		saving = false;
		onBack();
	}

	let dialog: HTMLDialogElement;

	onMount(() => {
		dialog.showModal();
	});
</script>

<dialog
	bind:this={dialog}
	class="workout-editor"
	oncancel={(e) => {
		e.preventDefault();
		onBack();
	}}
	aria-labelledby="editor-title"
	aria-modal="true"
>
	<div class="workout-editor__inner">
		<!-- Header -->
		<div class="workout-editor__top">
			<div class="workout-editor__bar">
				<button class="icon-btn" onclick={onBack} aria-label="Back">
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
				<div class="workout-editor__titles">
					{#if editingTitle}
						<input
							bind:this={titleInputEl}
							class="workout-editor__title-input"
							type="text"
							bind:value={title}
							id="editor-title"
							onblur={() => (editingTitle = false)}
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									editingTitle = false;
								}
							}}
						/>
					{:else}
						<button
							class="workout-editor__title-btn"
							id="editor-title"
							onclick={() => {
								editingTitle = true;
							}}
						>
							<span class="workout-editor__title-text">{title}</span>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								aria-hidden="true"
							>
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
							</svg>
						</button>
					{/if}
					<p class="workout-editor__subtitle">
						Workout {letter} · {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
					</p>
				</div>
				<button
					class="workout-editor__save-btn"
					onclick={handleSave}
					disabled={saving}
					aria-busy={saving}
				>
					{saving ? 'Saving…' : 'Save'}
				</button>
			</div>
		</div>

		<!-- Exercise list -->
		<div class="workout-editor__scroll">
			<div class="workout-editor__list">
				{#if exercises.length === 0}
					<div class="workout-editor__empty">
						<p>No exercises yet — browse the library below.</p>
					</div>
				{/if}

				{#each exercises as ex, i (ex._key)}
					{@const exercise = programStore.exerciseMap.get(ex.exerciseId)}
					<div class="editor-row">
						<div class="editor-row__reorder">
							<button
								class="editor-row__reorder-btn"
								onclick={() => moveExercise(i, -1)}
								disabled={i === 0}
								aria-label="Move up"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<polyline points="18 15 12 9 6 15" />
								</svg>
							</button>
							<button
								class="editor-row__reorder-btn"
								onclick={() => moveExercise(i, 1)}
								disabled={i === exercises.length - 1}
								aria-label="Move down"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</button>
						</div>
						<span class="editor-row__index">{i + 1}</span>
						<div class="editor-row__info">
							<span class="editor-row__name">{exercise?.name ?? ex.exerciseId}</span>
							<span class="editor-row__muscles">{exercise?.muscles ?? ''}</span>
						</div>
						<button
							class="editor-row__sets-btn"
							onclick={() => {
								if (editingIndex === i) {
									editingIndex = null;
								} else {
									editingIndex = i;
								}
							}}
							aria-label="Edit sets and reps for {exercise?.name}"
						>
							<span class="editor-row__sets-label">{ex.sets}×{ex.reps}</span>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								aria-hidden="true"
							>
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
							</svg>
						</button>
						<button
							class="editor-row__del-btn"
							onclick={() => removeExercise(i)}
							aria-label="Remove {exercise?.name}"
						>
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

					{#if editingIndex === i}
						<div class="inline-editor">
							<p class="inline-editor__name">{exercise?.name}</p>
							<div class="inline-editor__fields">
								<div class="inline-editor__field">
									<label class="inline-editor__label" for={`sets-${i}`}>Sets</label>
									<div class="inline-editor__stepper">
										<button
											onclick={() => {
												if (ex.sets > 1) {
													exercises[i] = { ...exercises[i], sets: ex.sets - 1 };
												}
											}}
											aria-label="Decrease sets"
										>−</button>
										<span id={`sets-${i}`} aria-live="polite">{ex.sets}</span>
										<button
											onclick={() => {
												if (ex.sets < 8) {
													exercises[i] = { ...exercises[i], sets: ex.sets + 1 };
												}
											}}
											aria-label="Increase sets"
										>+</button>
									</div>
								</div>
								<div class="inline-editor__field">
									<label class="inline-editor__label" for={`reps-${i}`}>Reps / hold</label>
									<input
										id={`reps-${i}`}
										class="inline-editor__reps-input"
										type="text"
										value={ex.reps}
										placeholder="e.g. 10 ea"
										oninput={(e) => {
											exercises[i] = { ...exercises[i], reps: (e.target as HTMLInputElement).value };
										}}
									/>
								</div>
							</div>
							<button
								class="inline-editor__done"
								onclick={() => {
									editingIndex = null;
								}}
							>
								Done
							</button>
						</div>
					{/if}
				{/each}

				<div class="workout-editor__divider" aria-hidden="true"></div>

				<button class="workout-editor__add-btn" onclick={() => (showLibrary = true)}>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					Browse exercise library
				</button>
			</div>
		</div>
	</div>
</dialog>

{#if showLibrary}
	<ExerciseLibrarySheet
		exercises={programStore.exercises}
		onAdd={addFromLibrary}
		onClose={() => (showLibrary = false)}
	/>
{/if}

<style>
	.workout-editor {
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

		&::backdrop {
			background: rgba(0, 0, 0, 0.8);
		}
	}

	@container app (inline-size >= 720px) {
		.workout-editor {
			inset-inline-start: var(--side-nav-width);
			margin-inline-start: 0;
			margin-inline-end: auto;
		}
	}

	.workout-editor__inner {
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.workout-editor__top {
		flex-shrink: 0;
		border-block-end: 1px solid var(--color-border);
		padding-block-start: calc(var(--safe-top) + var(--space-3));
		padding-block-end: var(--space-3);
	}

	.workout-editor__bar {
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

	.workout-editor__titles {
		flex: 1;
		min-inline-size: 0;
	}

	.workout-editor__title-input {
		inline-size: 100%;
		background: none;
		border: none;
		outline: none;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		border-block-end: 1px solid var(--color-accent);
	}

	.workout-editor__title-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;

		svg {
			inline-size: 14px;
			block-size: 14px;
			color: var(--color-text-muted);
		}
	}

	.workout-editor__title-text {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.workout-editor__subtitle {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.workout-editor__save-btn {
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
		}
	}

	.workout-editor__scroll {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.workout-editor__list {
		padding: var(--space-4) var(--space-4) 120px;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.workout-editor__empty {
		text-align: center;
		padding-block: var(--space-8);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.editor-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-3);
	}

	.editor-row__reorder {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.editor-row__reorder-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 24px;
		block-size: 22px;
		border-radius: 4px;
		color: var(--color-text-muted);
		transition: color var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 14px;
			block-size: 14px;
		}

		&:not(:disabled):hover {
			color: var(--color-text-primary);
		}

		&:disabled {
			opacity: 0.25;
			cursor: default;
		}
	}

	.editor-row__index {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		inline-size: 18px;
		text-align: center;
		flex-shrink: 0;
	}

	.editor-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.editor-row__name {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.editor-row__muscles {
		display: block;
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.editor-row__sets-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding-inline: var(--space-2);
		block-size: 32px;
		flex-shrink: 0;

		svg {
			inline-size: 12px;
			block-size: 12px;
			color: var(--color-text-muted);
		}
	}

	.editor-row__sets-label {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.editor-row__del-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition: color var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 16px;
			block-size: 16px;
		}

		&:hover {
			color: var(--color-red);
		}
	}

	/* Inline editor */
	.inline-editor {
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		margin-block-start: calc(var(--space-2) * -1);
	}

	.inline-editor__name {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.inline-editor__fields {
		display: flex;
		gap: var(--space-3);
		margin-block-end: var(--space-3);
	}

	.inline-editor__field {
		flex: 1;
	}

	.inline-editor__label {
		display: block;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-2);
	}

	.inline-editor__stepper {
		display: flex;
		align-items: center;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;

		button {
			inline-size: 40px;
			block-size: 40px;
			font-size: 1.25rem;
			color: var(--color-text-secondary);
			flex-shrink: 0;
			transition: background-color var(--duration-fast) var(--ease-out);

			&:hover {
				background: var(--color-surface-3);
			}
		}

		span {
			flex: 1;
			text-align: center;
			font-family: var(--font-mono);
			font-size: 1.25rem;
			font-weight: 700;
		}
	}

	.inline-editor__reps-input {
		inline-size: 100%;
		block-size: 40px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding-inline: var(--space-3);
		font: inherit;
		font-family: var(--font-mono);
		font-size: 1rem;
		color: var(--color-text-primary);
		outline: none;

		&:focus {
			border-color: var(--color-accent);
		}
	}

	.inline-editor__done {
		inline-size: 100%;
		block-size: 40px;
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	/* Divider + add button */
	.workout-editor__divider {
		block-size: 1px;
		background: var(--color-border);
		margin-block: var(--space-2);
	}

	.workout-editor__add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		inline-size: 100%;
		padding-block: var(--space-4);
		background: none;
		border: 2px dashed var(--color-border-strong);
		border-radius: var(--radius-xl);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 18px;
			block-size: 18px;
		}

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}
</style>
