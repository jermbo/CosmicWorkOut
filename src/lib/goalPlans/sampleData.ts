import type { LoggedItem, LoggedSet, Program, Routine, Session, Week } from '../db/types';
import type { GoalPlan, SupportingBaseline } from './types';
import { generateBlocks, totalPlanWeeks, focusTargetForWeek, supportingWeightForWeek } from './generator';
import { goalPlanTemplateById } from './templates';

/**
 * Debug-seed sample data for goal progression plans: one completed bench stint and
 * one active stint currently mid-plan (block 2, week 2), each with its generated
 * program and wave-following sessions. Ids are deterministic so reloading the seed
 * overwrites instead of duplicating.
 */

const STRENGTH = 'strength';
const TEMPLATE_ID = 'gp-big-three';
const FOCUS_ITEM_ID = 'st-bb-bench-press';
const DAYS_PER_WEEK = 3;

/** Supporting start weights (lb) — increments mirror the built-in item defaults. */
const SUPPORTING: Record<string, { start: number; increment: number }> = {
	'st-incline-db-bench': { start: 40, increment: 5 },
	'st-pec-deck': { start: 70, increment: 2.5 },
	'st-tricep-rope-pushdown': { start: 45, increment: 2.5 },
	'st-bb-squat': { start: 165, increment: 5 },
	'st-leg-press': { start: 200, increment: 5 },
	'st-leg-curl': { start: 75, increment: 2.5 },
	'st-standing-calf-raise': { start: 90, increment: 2.5 },
	'st-bb-deadlift': { start: 205, increment: 5 },
	'st-bb-bent-over-row': { start: 115, increment: 5 },
	'st-lat-pulldown-wide': { start: 100, increment: 5 },
	'st-db-curl': { start: 25, increment: 2.5 },
	'st-face-pull': { start: 40, increment: 2.5 },
};

function toDateStr(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function shiftDays(base: Date, n: number): Date {
	const d = new Date(base);
	d.setDate(d.getDate() + n);
	return d;
}

function supportingBaselines(offset = 0): SupportingBaseline[] {
	return Object.entries(SUPPORTING).map(([itemId, s]) => ({
		itemId,
		startWeight: s.start + offset,
		weightIncrement: s.increment,
	}));
}

function buildSampleProgram(idPrefix: string, name: string, durationWeeks: number): Program {
	const template = goalPlanTemplateById(TEMPLATE_ID)!;
	const weeks: Week[] = Array.from({ length: durationWeeks }, (_, wi) => ({
		weekNumber: wi + 1,
		routines: template.routines.map(
			(tmpl, i): Routine => ({
				id: `${idPrefix}-w${wi + 1}-${tmpl.letter.toLowerCase()}`,
				disciplineId: STRENGTH,
				name: tmpl.name,
				letter: tmpl.letter,
				focus: tmpl.focus,
				color: (['lime', 'lavender', 'red'] as const)[i % 3],
				estMin: tmpl.estMin,
				sections: [{ key: 'exercises', items: tmpl.slots.map((s) => ({ itemId: s.itemId, sets: s.sets, reps: s.reps })) }],
			}),
		),
	}));

	return {
		id: `${idPrefix}-program`,
		disciplineId: STRENGTH,
		name,
		description: 'Goal progression plan (debug sample)',
		durationWeeks,
		daysPerWeek: DAYS_PER_WEEK,
		weeks,
		createdAt: new Date().toISOString(),
		isBuiltIn: false,
	};
}

/** Log one session following that plan week's prescribed targets. */
function buildSampleSession(
	idPrefix: string,
	plan: GoalPlan,
	sessionIndex: number,
	date: Date,
): Session {
	const template = goalPlanTemplateById(TEMPLATE_ID)!;
	const planWeek = Math.floor(sessionIndex / DAYS_PER_WEEK) + 1;
	const routineIndex = sessionIndex % DAYS_PER_WEEK;
	const routine = template.routines[routineIndex];
	const focus = focusTargetForWeek(plan.blocks, planWeek);
	const baselineByItem = new Map(plan.supporting.map((b) => [b.itemId, b]));

	const startedAt = new Date(date);
	startedAt.setHours(17, 15, 0, 0);
	let setTime = new Date(startedAt);

	let totalVolume = 0;
	let totalSets = 0;

	const items: LoggedItem[] = routine.slots.map((slot) => {
		let weight = 0;
		let reps = parseInt(slot.reps, 10) || 10;

		if (slot.itemId === plan.focusItemId && focus) {
			weight = focus.weight;
			reps = focus.reps;
		} else {
			const baseline = baselineByItem.get(slot.itemId);
			if (baseline) weight = supportingWeightForWeek(baseline, planWeek);
		}

		const sets: LoggedSet[] = [];
		for (let s = 1; s <= slot.sets; s++) {
			setTime = new Date(setTime.getTime() + 150 * 1000);
			if (weight > 0) totalVolume += weight * reps;
			totalSets++;
			sets.push({ setNumber: s, weight, reps, completedAt: setTime.toISOString() });
		}
		return { itemId: slot.itemId, sets };
	});

	const durationSeconds = Math.round((setTime.getTime() - startedAt.getTime()) / 1000) + 300;

	return {
		id: `${idPrefix}-s${sessionIndex}`,
		disciplineId: STRENGTH,
		date: toDateStr(date),
		routineId: `${idPrefix}-w${planWeek}-${routine.letter.toLowerCase()}`,
		programId: `${idPrefix}-program`,
		startedAt: startedAt.toISOString(),
		finishedAt: new Date(startedAt.getTime() + durationSeconds * 1000).toISOString(),
		durationSeconds,
		totalVolume,
		totalSets,
		items,
	};
}

export function generateGoalPlanSampleData(): {
	goalPlans: GoalPlan[];
	programs: Program[];
	sessions: Session[];
	/** Program id of the active sample plan — activated so /workout picks it up. */
	activeProgramId: string;
} {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// ── Stint 1 — completed: 135×10 → 185×5 (3 blocks, 12 weeks, all 36 sessions) ──
	const start1 = { weight: 135, reps: 10 };
	const goal1 = { weight: 185, reps: 5 };
	const blocks1 = generateBlocks(start1, goal1, 5);
	const weeks1 = totalPlanWeeks(blocks1);
	const sessions1Count = weeks1 * DAYS_PER_WEEK;
	const firstDay1 = shiftDays(today, -70 - weeks1 * 7);

	const plan1: GoalPlan = {
		id: 'gp-seed-01',
		disciplineId: STRENGTH,
		programId: 'gp-seed-01-program',
		templateId: TEMPLATE_ID,
		name: 'Barbell Bench Press Goal 01',
		focusItemId: FOCUS_ITEM_ID,
		goal: goal1,
		start: start1,
		focusIncrement: 5,
		blocks: blocks1,
		supporting: supportingBaselines(-10),
		daysPerWeek: DAYS_PER_WEEK,
		status: 'completed',
		countOffset: 0,
		repeatEvents: [],
		createdAt: shiftDays(firstDay1, -2).toISOString(),
		completedAt: shiftDays(today, -69).toISOString(),
	};
	const program1 = buildSampleProgram('gp-seed-01', plan1.name, weeks1);
	const sessions1 = Array.from({ length: sessions1Count }, (_, i) => {
		const week = Math.floor(i / DAYS_PER_WEEK);
		const dayInWeek = [0, 2, 4][i % DAYS_PER_WEEK];
		return buildSampleSession('gp-seed-01', plan1, i, shiftDays(firstDay1, week * 7 + dayInWeek));
	});

	// ── Stint 2 — active, mid-plan: 155×10 → 205×5, currently block 2 week 2 ──
	const start2 = { weight: 155, reps: 10 };
	const goal2 = { weight: 205, reps: 5 };
	const blocks2 = generateBlocks(start2, goal2, 5);

	const plan2: GoalPlan = {
		id: 'gp-seed-02',
		disciplineId: STRENGTH,
		programId: 'gp-seed-02-program',
		templateId: TEMPLATE_ID,
		name: 'Barbell Bench Press Goal 02',
		focusItemId: FOCUS_ITEM_ID,
		goal: goal2,
		start: start2,
		focusIncrement: 5,
		blocks: blocks2,
		supporting: supportingBaselines(0),
		daysPerWeek: DAYS_PER_WEEK,
		status: 'active',
		countOffset: 0,
		repeatEvents: [],
		createdAt: shiftDays(today, -44).toISOString(),
	};
	const program2 = buildSampleProgram('gp-seed-02', plan2.name, totalPlanWeeks(blocks2));

	// 16 completed sessions → week 6 → block 2, week 2. Days avoid the generic
	// debug seed's strength-session offsets so no date carries two workouts.
	const start2Base = shiftDays(today, -45);
	const session2Offsets = [2, 4, 6, 9, 11, 14, 16, 18, 22, 24, 26, 28, 32, 35, 39, 42];
	const sessions2 = session2Offsets.map((offset, i) =>
		buildSampleSession('gp-seed-02', plan2, i, shiftDays(start2Base, offset)),
	);

	return {
		goalPlans: [plan1, plan2],
		programs: [program1, program2],
		sessions: [...sessions1, ...sessions2],
		activeProgramId: program2.id,
	};
}
