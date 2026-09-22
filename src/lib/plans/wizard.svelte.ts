import type { Item, Program } from '$lib/db/types';
import type { GoalTemplateRoutine } from '$lib/goalPlans/types';
import {
	SCRATCH_TEMPLATE_ID,
	blankGoalRoutines,
	routinesFromTemplate,
} from '$lib/goalPlans/templates';
import { generateBlocks, totalPlanWeeks, estimateMonths } from '$lib/goalPlans/generator';
import { unitLabel } from '$lib/goalPlans/format';
import { db } from '$lib/db/database';
import { programStore } from '$lib/stores/program.svelte';
import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
import { buildGoalProgram } from '$lib/goalPlans/buildProgram';
import { generateId } from '$lib/utils';
import { SvelteSet, SvelteDate } from 'svelte/reactivity';
import { activatePlan } from './actions';

/**
 * One "New plan" flow for both a plain plan and one with a goal (v1.10.0,
 * US-052 — Practice and Lift plans are the same idea with an optional target).
 */
export type PlanWizardStep = 'start' | 'routines' | 'goal' | 'review';

export const PLAN_WIZARD_STEPS: PlanWizardStep[] = ['start', 'routines', 'goal', 'review'];

export const PLAN_WIZARD_STEP_LABELS: Record<PlanWizardStep, string> = {
	start: 'Start from',
	routines: 'Routines',
	goal: 'Goal',
	review: 'Review',
};

/** Fixed at 3, matching every built-in template — see US-052 "Proposed" P5. */
export const DAYS_PER_WEEK = 3;
const DEFAULT_INCREMENT = 5;

export class PlanWizard {
	step = $state<PlanWizardStep>('start');

	// ── Start ──────────────────────────────────────────────────────────
	templateId = $state<string | null>(null);
	name = $state('');
	nameTouched = $state(false);
	durationWeeks = $state(12);
	routines = $state<GoalTemplateRoutine[]>([]);
	addingToLetter = $state<'A' | 'B' | 'C' | null>(null);

	// ── Goal ───────────────────────────────────────────────────────────
	hasGoal = $state<boolean | null>(null);
	focusItemId = $state<string | null>(null);
	goalWeight = $state<number | null>(null);
	goalReps = $state<number | null>(null);
	startWeight = $state<number | null>(null);
	startReps = $state<number | null>(null);
	startFromHistory = $state(false);
	private prefillLoadedFor = $state<string | null>(null);

	creating = $state(false);

	stepIndex = $derived(PLAN_WIZARD_STEPS.indexOf(this.step));
	isScratch = $derived(this.templateId === SCRATCH_TEMPLATE_ID);

	focusItem = $derived(this.focusItemId ? programStore.getItemById(this.focusItemId) : undefined);
	unit = $derived(unitLabel(this.focusItem?.unit));
	focusIncrement = $derived(this.focusItem?.weightIncrement ?? DEFAULT_INCREMENT);

	/** Only exercises already in the routines can be the focus lift — US-052 P2. */
	focusCandidates = $derived.by((): Item[] => {
		const ids = new SvelteSet(this.routines.flatMap((r) => r.slots.map((s) => s.itemId)));
		return [...ids]
			.map((id) => programStore.getItemById(id))
			.filter((i): i is Item => !!i && (i.unit === 'lb' || i.unit === 'kg'));
	});

	routinesValid = $derived(
		this.routines.length > 0 && this.routines.every((r) => r.slots.length > 0),
	);

	goalTargetValid = $derived(
		this.focusItemId !== null && (this.goalWeight ?? 0) > 0 && (this.goalReps ?? 0) >= 1,
	);
	startValid = $derived((this.startWeight ?? 0) > 0 && (this.startReps ?? 0) >= 1);

	/** Whether the review step may proceed to create. */
	reviewValid = $derived(this.hasGoal === false || (this.goalTargetValid && this.startValid));

	previewBlocks = $derived.by(() => {
		if (this.hasGoal !== true || !this.goalTargetValid || !this.startValid) return [];
		return generateBlocks(
			{ weight: this.startWeight!, reps: this.startReps! },
			{ weight: this.goalWeight!, reps: this.goalReps! },
			this.focusIncrement,
		);
	});
	previewWeeks = $derived(totalPlanWeeks(this.previewBlocks));
	previewMonths = $derived(estimateMonths(this.previewBlocks));

	// ── Start step ─────────────────────────────────────────────────────

	pickTemplate(program: Program) {
		this.templateId = program.id;
		this.routines = routinesFromTemplate(program);
		this.durationWeeks = program.durationWeeks;
		if (!this.nameTouched) this.name = program.name;
	}

	pickScratch() {
		this.templateId = SCRATCH_TEMPLATE_ID;
		this.routines = blankGoalRoutines();
	}

	goToRoutines() {
		if (!this.templateId || !this.name.trim()) return;
		this.step = 'routines';
	}

	// ── Routines step ──────────────────────────────────────────────────

	removeSlot(letter: 'A' | 'B' | 'C', itemId: string) {
		this.routines = this.routines.map((r) => {
			if (r.letter !== letter) return r;
			return { ...r, slots: r.slots.filter((s) => s.itemId !== itemId) };
		});
		if (this.focusItemId === itemId && !this.focusCandidates.some((i) => i.id === itemId)) {
			this.focusItemId = null;
		}
	}

	addExercise(item: Item) {
		const letter = this.addingToLetter;
		this.addingToLetter = null;
		if (!letter) return;

		this.routines = this.routines.map((r) => {
			if (r.letter !== letter) return r;
			if (r.slots.some((s) => s.itemId === item.id)) return r;
			return {
				...r,
				slots: [
					...r.slots,
					{ itemId: item.id, sets: item.defaultSets ?? 3, reps: item.defaultReps ?? '10' },
				],
			};
		});
	}

	goToGoal() {
		if (!this.routinesValid) return;
		this.step = 'goal';
	}

	// ── Goal step ──────────────────────────────────────────────────────

	setHasGoal(value: boolean) {
		this.hasGoal = value;
		if (!value) {
			this.focusItemId = null;
			this.goalWeight = null;
			this.goalReps = null;
			this.startWeight = null;
			this.startReps = null;
		}
	}

	async setFocus(item: Item) {
		this.focusItemId = item.id;
		if (this.prefillLoadedFor === item.id) return;
		const lastUsed = await db.itemLastUsed.get(item.id);
		if (typeof lastUsed?.weight === 'number' && lastUsed.weight > 0) {
			this.startWeight = lastUsed.weight;
			this.startReps = lastUsed.reps || null;
			this.startFromHistory = true;
		} else {
			this.startWeight = null;
			this.startReps = null;
			this.startFromHistory = false;
		}
		this.prefillLoadedFor = item.id;
	}

	goToReview() {
		if (this.hasGoal === null) return;
		if (this.hasGoal && !(this.goalTargetValid && this.startValid)) return;
		this.step = 'review';
	}

	// ── Create ─────────────────────────────────────────────────────────

	async create(): Promise<{ id: string; name: string } | null> {
		if (this.creating || !this.templateId || !this.name.trim() || !this.routinesValid) return null;
		if (this.hasGoal === null || !this.reviewValid) return null;

		this.creating = true;
		try {
			if (this.hasGoal && this.focusItemId) {
				const plan = await goalPlanStore.createPlan({
					templateId: this.templateId,
					name: this.name.trim(),
					focusItemId: this.focusItemId,
					goal: { weight: this.goalWeight!, reps: this.goalReps! },
					start: { weight: this.startWeight!, reps: this.startReps! },
					routines: this.routines,
					daysPerWeek: DAYS_PER_WEEK,
				});
				await activatePlan(plan.programId);
				return { id: plan.programId, name: plan.name };
			}

			const programId = generateId();
			const createdAt = new SvelteDate().toISOString();
			const program = buildGoalProgram({
				name: this.name.trim(),
				routines: this.routines,
				daysPerWeek: DAYS_PER_WEEK,
				durationWeeks: this.durationWeeks,
				programId,
				createdAt,
				makeRoutineId: (weekNumber, routineIndex) =>
					`w${weekNumber}-${generateId().slice(0, 8)}${routineIndex}`,
			});
			await programStore.upsertProgram(program);
			await activatePlan(program.id);
			return { id: program.id, name: program.name };
		} finally {
			this.creating = false;
		}
	}

	back() {
		if (this.stepIndex > 0) this.step = PLAN_WIZARD_STEPS[this.stepIndex - 1];
	}
}
