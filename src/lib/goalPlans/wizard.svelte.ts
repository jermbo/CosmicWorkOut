import type { Item } from '$lib/db/types';
import type { GoalTemplateRoutine } from '$lib/goalPlans/types';
import {
	SCRATCH_TEMPLATE_ID,
	PRIORITY_TEMPLATE_ID,
	FOCUS_ONLY_TEMPLATE_ID,
	FOCUS_QUICK_PICK_IDS,
	blankRoutinesWithFocus,
	buildPriorityRoutines,
	buildFocusOnlyRoutines,
} from '$lib/goalPlans/templates';
import { generateBlocks, totalPlanWeeks, estimateMonths } from '$lib/goalPlans/generator';
import { autoPlanName } from '$lib/goalPlans/naming';
import { unitLabel } from '$lib/goalPlans/format';
import { db } from '$lib/db/database';
import { programStore } from '$lib/stores/program.svelte';
import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
import { toastStore } from '$lib/stores/toast.svelte';

export type WizardStep = 'focus' | 'setup' | 'exercises' | 'start' | 'preview';

export type SetupKind =
	| typeof PRIORITY_TEMPLATE_ID
	| typeof FOCUS_ONLY_TEMPLATE_ID
	| typeof SCRATCH_TEMPLATE_ID;

export const WIZARD_STEPS: WizardStep[] = ['focus', 'setup', 'exercises', 'start', 'preview'];

export const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
	focus: 'Focus & goal',
	setup: 'Setup',
	exercises: 'Exercises',
	start: 'Starting point',
	preview: 'Review',
};

/**
 * Create-plan wizard state. Owns step navigation, validation, and create —
 * the page mounts this and passes slices into step components.
 */
export class GoalWizard {
	step = $state<WizardStep>('focus');
	templateId = $state<string | null>(null);
	routines = $state<GoalTemplateRoutine[]>([]);
	daysPerWeek = $state(3);
	addingToLetter = $state<'A' | 'B' | 'C' | null>(null);
	pickingFocus = $state(false);
	focusItemId = $state<string | null>(null);
	goalWeight = $state<number | null>(null);
	goalReps = $state<number | null>(null);
	startWeight = $state<number | null>(null);
	startReps = $state<number | null>(null);
	startFromHistory = $state(false);
	prefillLoadedFor = $state<string | null>(null);
	planName = $state('');
	nameTouched = $state(false);
	creating = $state(false);

	stepIndex = $derived(WIZARD_STEPS.indexOf(this.step));
	isScratch = $derived(this.templateId === SCRATCH_TEMPLATE_ID);

	focusItem = $derived(this.focusItemId ? programStore.getItemById(this.focusItemId) : undefined);
	unit = $derived(unitLabel(this.focusItem?.unit));
	focusIncrement = $derived(this.focusItem?.weightIncrement ?? 5);

	quickPicks = $derived(
		FOCUS_QUICK_PICK_IDS.map((id) => programStore.getItemById(id)).filter((i): i is Item => !!i),
	);

	goalValid = $derived(
		this.focusItemId !== null &&
			(this.focusItem?.unit === 'lb' || this.focusItem?.unit === 'kg') &&
			(this.goalWeight ?? 0) > 0 &&
			(this.goalReps ?? 0) >= 1,
	);
	startValid = $derived((this.startWeight ?? 0) > 0 && (this.startReps ?? 0) >= 1);
	focusInPlan = $derived(
		!!this.focusItemId &&
			this.routines.some((r) => r.slots.some((s) => s.itemId === this.focusItemId)),
	);
	exercisesValid = $derived(
		this.routines.length > 0 && this.routines.every((r) => r.slots.length > 0) && this.focusInPlan,
	);

	previewBlocks = $derived.by(() => {
		if (!this.goalValid || !this.startValid) return [];
		return generateBlocks(
			{ weight: this.startWeight!, reps: this.startReps! },
			{ weight: this.goalWeight!, reps: this.goalReps! },
			this.focusIncrement,
		);
	});
	previewWeeks = $derived(totalPlanWeeks(this.previewBlocks));
	previewMonths = $derived(estimateMonths(this.previewBlocks));

	setFocus(item: Item) {
		if (item.unit !== 'lb' && item.unit !== 'kg') {
			toastStore.error('Pick a weighted lift for your focus.');
			return;
		}
		const changed = this.focusItemId !== item.id;
		this.focusItemId = item.id;
		this.pickingFocus = false;
		if (changed) {
			// Changing focus invalidates a previously chosen week scaffold.
			this.templateId = null;
			this.routines = [];
			this.prefillLoadedFor = null;
			this.startWeight = null;
			this.startReps = null;
			this.startFromHistory = false;
			if (!this.nameTouched) this.planName = '';
		}
	}

	pickSetup(kind: SetupKind) {
		if (!this.focusItem) return;
		this.templateId = kind;
		this.daysPerWeek = 3;
		if (kind === PRIORITY_TEMPLATE_ID) {
			this.routines = buildPriorityRoutines(this.focusItem);
		} else if (kind === FOCUS_ONLY_TEMPLATE_ID) {
			this.routines = buildFocusOnlyRoutines(this.focusItem);
		} else {
			this.routines = blankRoutinesWithFocus(this.focusItem);
		}
		this.step = 'exercises';
	}

	removeSlot(letter: 'A' | 'B' | 'C', itemId: string) {
		this.routines = this.routines.map((r) => {
			if (r.letter !== letter) return r;
			return { ...r, slots: r.slots.filter((s) => s.itemId !== itemId) };
		});
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
					{
						itemId: item.id,
						sets: item.defaultSets ?? 3,
						reps: item.defaultReps ?? '10',
					},
				],
			};
		});
	}

	async goToStart() {
		if (!this.goalValid || !this.focusItemId || !this.exercisesValid) return;
		if (this.prefillLoadedFor !== this.focusItemId) {
			const lastUsed = await db.itemLastUsed.get(this.focusItemId);
			if (typeof lastUsed?.weight === 'number' && lastUsed.weight > 0) {
				this.startWeight = lastUsed.weight;
				this.startReps = lastUsed.reps || null;
				this.startFromHistory = true;
			} else {
				this.startWeight = null;
				this.startReps = null;
				this.startFromHistory = false;
			}
			this.prefillLoadedFor = this.focusItemId;
		}
		this.step = 'start';
	}

	goToPreview() {
		if (!this.startValid || !this.focusItem) return;
		if (!this.nameTouched) {
			this.planName = autoPlanName(this.focusItem.name, this.focusItem.id, goalPlanStore.plans);
		}
		this.step = 'preview';
	}

	async createPlan(): Promise<{ name: string; activated: boolean } | null> {
		if (
			this.creating ||
			!this.templateId ||
			!this.focusItemId ||
			!this.goalValid ||
			!this.startValid ||
			!this.planName.trim() ||
			!this.exercisesValid
		) {
			return null;
		}
		this.creating = true;
		try {
			const plan = await goalPlanStore.createPlan({
				templateId: this.templateId,
				name: this.planName.trim(),
				focusItemId: this.focusItemId,
				goal: { weight: this.goalWeight!, reps: this.goalReps! },
				start: { weight: this.startWeight!, reps: this.startReps! },
				routines: this.routines,
				daysPerWeek: this.daysPerWeek,
			});
			const activated = await goalPlanStore.activatePlan(plan.id);
			return { name: plan.name, activated };
		} catch (e) {
			console.error('Failed to create lift plan:', e);
			this.creating = false;
			throw e;
		}
	}

	back() {
		if (this.stepIndex > 0) this.step = WIZARD_STEPS[this.stepIndex - 1];
	}

	goToSetup() {
		this.step = 'setup';
	}
}
