/**
 * A "plan" (v1.10.0, US-052) is a Program, optionally paired with a GoalPlan.
 * Storage stays exactly as it was — this module only makes the two stores act
 * like one thing where the UI needs that: activating, pausing, and restarting
 * whichever kind of plan `programId` turns out to be.
 */
import type { Program } from '$lib/db/types';
import type { GoalPlan } from '$lib/goalPlans/types';
import { STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
import { programStore } from '$lib/stores/program.svelte';
import { goalPlanStore } from '$lib/stores/goalPlans.svelte';

export type PlanMeta = {
	program: Program;
	goal: GoalPlan | null;
	isActive: boolean;
};

/** Every plan, active or not, newest first. */
export function allPlans(): PlanMeta[] {
	return programStore.programs
		.filter((p) => p.disciplineId === STRENGTH_DISCIPLINE_ID)
		.map((program) => ({
			program,
			goal: goalPlanStore.planForProgram(program.id) ?? null,
			isActive: programStore.isProgramActive(program.id),
		}))
		.sort((a, b) => b.program.createdAt.localeCompare(a.program.createdAt));
}

export function metaForProgram(programId: string): PlanMeta | null {
	const program = programStore.programById(programId);
	if (!program) return null;
	return {
		program,
		goal: goalPlanStore.planForProgram(programId) ?? null,
		isActive: programStore.isProgramActive(programId),
	};
}

/**
 * Make `programId` the one active plan. Exactly one plan is ever active
 * (Topic 12) — whatever else was active, goal-bearing or plain, is paused first
 * so `GoalPlan.status` stays in sync with `activeProgramIds`.
 */
export async function activatePlan(programId: string): Promise<void> {
	const currentGoal = goalPlanStore.activePlan;
	if (currentGoal && currentGoal.programId !== programId) {
		await goalPlanStore.pausePlan(currentGoal.id);
	}
	const goal = goalPlanStore.planForProgram(programId);
	if (goal) {
		await goalPlanStore.activatePlan(goal.id);
	} else {
		programStore.setActiveProgram(programId);
	}
}

/** Pause `programId`, whichever kind of plan it turns out to be. */
export async function pausePlan(programId: string): Promise<void> {
	const goal = goalPlanStore.planForProgram(programId);
	if (goal) {
		await goalPlanStore.pausePlan(goal.id);
	} else {
		programStore.deactivateProgram(programId);
	}
}

/**
 * A finished plan's "Run it again" (Topic 12). A goal plan repeats its final
 * block in place; a plain plan gets a fresh copy (same name, week 1) so logged
 * sessions stay attached to the original as history.
 */
export async function runItAgain(program: Program): Promise<void> {
	const goal = goalPlanStore.planForProgram(program.id);
	if (goal) {
		await goalPlanStore.repeatCurrentBlock(goal.id);
		return;
	}
	const restarted = await programStore.restartProgram(program);
	await activatePlan(restarted.id);
}
