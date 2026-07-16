import type { Item, Routine, Week } from '$lib/db/types';
import type {
	GoalPlan,
	GoalTarget,
	GoalTemplateRoutine,
	ProgressionBlock,
	SupportingBaseline,
	WaveWeek,
} from '$lib/goalPlans/types';
import {
	generateBlocks,
	totalPlanWeeks,
	effectivePlanWeek,
	isPlanFinished,
	focusTargetForWeek,
	blockForWeek,
	countOffsetForRepeat,
	WEEKS_PER_BLOCK,
} from '$lib/goalPlans/generator';
import { buildGoalProgram } from '$lib/goalPlans/buildProgram';
import { prescribedTargetsForWeek, type PrescribedTarget } from '$lib/goalPlans/prescribed';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import { STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
import { programStore } from './program.svelte';

const DEFAULT_INCREMENT = 5;

export interface CreatePlanInput {
	templateId: string;
	name: string;
	focusItemId: string;
	goal: GoalTarget;
	start: GoalTarget;
	/** Template routines after the user's exercise-list adjustments. */
	routines: GoalTemplateRoutine[];
	daysPerWeek: number;
}

export type { PrescribedTarget };

function hasNumericWeight(item: Item | undefined): boolean {
	return item?.unit === 'lb' || item?.unit === 'kg';
}

class GoalPlanStore {
	plans = $state<GoalPlan[]>([]);
	loaded = $state(false);

	activePlan = $derived(this.plans.find((p) => p.status === 'active') ?? null);

	/** Newest first — each stint is its own record. */
	instances = $derived([...this.plans].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

	pausedPlans = $derived(this.instances.filter((p) => p.status === 'paused'));
	completedPlans = $derived(this.instances.filter((p) => p.status === 'completed'));

	async load(): Promise<void> {
		this.plans = await db.goalPlans.getAll();
		this.loaded = true;
	}

	planById(id: string): GoalPlan | undefined {
		return this.plans.find((p) => p.id === id);
	}

	planForProgram(programId: string): GoalPlan | undefined {
		return this.plans.find((p) => p.programId === programId);
	}

	// ── Creation ──────────────────────────────────────────────────────

	/**
	 * Generate the wave blocks, build the backing Program record (same A/B/C x
	 * weeks shape the rotation engine already understands), and store the plan.
	 * The plan starts paused; call activatePlan() to make it the running plan.
	 */
	async createPlan(input: CreatePlanInput): Promise<GoalPlan> {
		const focusItem = programStore.getItemById(input.focusItemId);
		const focusIncrement = focusItem?.weightIncrement ?? DEFAULT_INCREMENT;
		const blocks = generateBlocks(input.start, input.goal, focusIncrement);
		const durationWeeks = totalPlanWeeks(blocks);
		const programId = generateId();
		const createdAt = new Date().toISOString();

		const program = buildGoalProgram({
			name: input.name,
			goal: input.goal,
			routines: input.routines,
			daysPerWeek: input.daysPerWeek,
			durationWeeks,
			programId,
			createdAt,
			makeRoutineId: (weekNumber, routineIndex) =>
				`w${weekNumber}-${generateId().slice(0, 8)}${routineIndex}`,
		});
		await programStore.upsertProgram(program);

		const plan: GoalPlan = {
			id: generateId(),
			disciplineId: STRENGTH_DISCIPLINE_ID,
			programId,
			templateId: input.templateId,
			name: input.name,
			focusItemId: input.focusItemId,
			goal: { ...input.goal },
			start: { ...input.start },
			focusIncrement,
			blocks,
			supporting: await this.buildSupportingBaselines(input),
			daysPerWeek: input.daysPerWeek,
			status: 'paused',
			countOffset: 0,
			repeatEvents: [],
			createdAt,
		};

		await db.goalPlans.put($state.snapshot(plan) as GoalPlan);
		this.plans = [...this.plans, plan];
		return plan;
	}

	/** Weekly-increment baselines for every weighted non-focus exercise. */
	private async buildSupportingBaselines(input: CreatePlanInput): Promise<SupportingBaseline[]> {
		const baselines: SupportingBaseline[] = [];
		const seen = new Set<string>([input.focusItemId]);

		for (const routine of input.routines) {
			for (const slot of routine.slots) {
				if (seen.has(slot.itemId)) continue;
				seen.add(slot.itemId);

				const item = programStore.getItemById(slot.itemId);
				if (!hasNumericWeight(item)) continue;

				const lastUsed = await db.itemLastUsed.get(slot.itemId);
				const startWeight = typeof lastUsed?.weight === 'number' ? lastUsed.weight : 0;
				baselines.push({
					itemId: slot.itemId,
					startWeight,
					weightIncrement: item?.weightIncrement ?? DEFAULT_INCREMENT,
				});
			}
		}

		return baselines;
	}

	// ── Lifecycle ─────────────────────────────────────────────────────

	/** One goal plan may be active at a time; returns false when another already is. */
	async activatePlan(id: string): Promise<boolean> {
		const plan = this.planById(id);
		if (!plan || plan.status === 'active') return plan?.status === 'active';
		if (this.activePlan) return false;

		plan.status = 'active';
		plan.pausedAt = undefined;
		await this.persist(plan);
		programStore.setActiveProgram(plan.programId);
		return true;
	}

	async pausePlan(id: string): Promise<void> {
		const plan = this.planById(id);
		if (!plan || plan.status !== 'active') return;
		plan.status = 'paused';
		plan.pausedAt = new Date().toISOString();
		await this.persist(plan);
		programStore.deactivateProgram(plan.programId);
	}

	async completePlan(id: string): Promise<void> {
		const plan = this.planById(id);
		if (!plan || plan.status === 'completed') return;
		plan.status = 'completed';
		plan.completedAt = new Date().toISOString();
		await this.persist(plan);
		programStore.deactivateProgram(plan.programId);
	}

	async renamePlan(id: string, name: string): Promise<void> {
		const plan = this.planById(id);
		const trimmed = name.trim();
		if (!plan || !trimmed) return;
		plan.name = trimmed;
		await this.persist(plan);

		const program = programStore.programById(plan.programId);
		if (program) {
			await programStore.upsertProgram({ ...program, name: trimmed });
		}
	}

	/**
	 * Re-run the current 4-week block from week 1. Targets rewind via the count
	 * offset; the backing program gains four weeks so the rotation and week math
	 * keep working; completed session history is untouched.
	 */
	async repeatCurrentBlock(id: string): Promise<void> {
		const plan = this.planById(id);
		if (!plan) return;

		const block = this.currentBlock(plan);
		if (!block) return;

		const completed = this.completedCountFor(plan);
		plan.countOffset = countOffsetForRepeat(completed, block.blockNumber, plan.daysPerWeek);
		plan.repeatEvents = [
			...plan.repeatEvents,
			{
				blockNumber: block.blockNumber,
				atCompletedCount: completed,
				repeatedAt: new Date().toISOString(),
			},
		];
		await this.persist(plan);
		await this.extendProgram(plan.programId, WEEKS_PER_BLOCK);
	}

	private async extendProgram(programId: string, extraWeeks: number): Promise<void> {
		const program = programStore.programById(programId);
		if (!program) return;

		const template = program.weeks[0];
		if (!template) return;

		const added: Week[] = Array.from({ length: extraWeeks }, (_, i) => ({
			weekNumber: program.weeks.length + i + 1,
			routines: template.routines.map((r) => ({
				...structuredClone($state.snapshot(r) as Routine),
				id: `w${program.weeks.length + i + 1}-${generateId().slice(0, 8)}`,
			})),
		}));

		await programStore.upsertProgram({
			...program,
			durationWeeks: program.durationWeeks + extraWeeks,
			weeks: [...program.weeks, ...added],
		});
	}

	private async persist(plan: GoalPlan): Promise<void> {
		await db.goalPlans.put($state.snapshot(plan) as GoalPlan);
	}

	// ── Progression readouts ──────────────────────────────────────────

	completedCountFor(plan: GoalPlan): number {
		return programStore.completedCountForProgram(plan.programId);
	}

	totalWeeksFor(plan: GoalPlan): number {
		return totalPlanWeeks(plan.blocks);
	}

	/** The plan week targets are read from (repeat-aware, capped at the last week). */
	currentWeek(plan: GoalPlan): number {
		return effectivePlanWeek(
			this.completedCountFor(plan),
			plan.countOffset,
			plan.daysPerWeek,
			this.totalWeeksFor(plan),
		);
	}

	currentBlock(plan: GoalPlan): ProgressionBlock | null {
		return blockForWeek(plan.blocks, this.currentWeek(plan));
	}

	/** 1-4 within the current block. */
	currentBlockWeek(plan: GoalPlan): number {
		return ((this.currentWeek(plan) - 1) % WEEKS_PER_BLOCK) + 1;
	}

	focusTarget(plan: GoalPlan): WaveWeek | null {
		return focusTargetForWeek(plan.blocks, this.currentWeek(plan));
	}

	/** Every week of every block trained through — time to mark it Completed. */
	isFinished(plan: GoalPlan): boolean {
		return isPlanFinished(
			this.completedCountFor(plan),
			plan.countOffset,
			plan.daysPerWeek,
			this.totalWeeksFor(plan),
		);
	}

	/**
	 * This week's prescribed target per item — the focus follows its wave week,
	 * everything else gets the light weekly increment. Items without a numeric
	 * weight (bodyweight, bands) are not prescribed.
	 */
	prescribedTargets(plan: GoalPlan): Map<string, PrescribedTarget> {
		return prescribedTargetsForWeek(plan, this.currentWeek(plan));
	}
}

export const goalPlanStore = new GoalPlanStore();
