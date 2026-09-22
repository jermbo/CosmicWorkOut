import type { LoggedItem, LoggedSet, Program, Session } from '../db/types';
import type { GoalPlan, GoalTemplateRoutine, SupportingBaseline } from './types';
import {
	generateBlocks,
	totalPlanWeeks,
	focusTargetForWeek,
	supportingWeightForWeek,
} from './generator';
import { buildGoalProgram } from './buildProgram';

/**
 * Debug-seed only — not used by the create-plan wizard or live UX.
 *
 * Seeds one completed bench stint and one active mid-plan stint (block 2, week 3),
 * each with its generated program and wave-following sessions. Ids are deterministic
 * so reloading the seed overwrites instead of duplicating. Wired from
 * `database.ts` sample/debug seeding paths only.
 */

const STRENGTH = 'strength';
const FOCUS_ITEM_ID = 'st-bb-bench-press';
const DAYS_PER_WEEK = 3;

/** Fixed A/B/C scaffold for the sample bench-press stint. Not the wizard's path. */
const PRIORITY_ROUTINES: GoalTemplateRoutine[] = [
	{
		letter: 'A',
		name: 'Bench Press — Heavy',
		focus: 'Bench Press · primary',
		estMin: 50,
		slots: [
			{ itemId: FOCUS_ITEM_ID, sets: 4, reps: '8' },
			{ itemId: 'st-incline-db-bench', sets: 3, reps: '10' },
			{ itemId: 'st-pec-deck', sets: 3, reps: '12' },
			{ itemId: 'st-tricep-rope-pushdown', sets: 3, reps: '12' },
		],
	},
	{
		letter: 'B',
		name: 'Bench Press — Volume',
		focus: 'Bench Press · support',
		estMin: 45,
		slots: [
			{ itemId: FOCUS_ITEM_ID, sets: 3, reps: '8' },
			{ itemId: 'st-db-ohp', sets: 3, reps: '10' },
			{ itemId: 'st-lateral-raise', sets: 3, reps: '12' },
			{ itemId: 'st-face-pull', sets: 3, reps: '15' },
		],
	},
	{
		letter: 'C',
		name: 'Bench Press — Assist',
		focus: 'Bench Press · assist',
		estMin: 45,
		slots: [
			{ itemId: FOCUS_ITEM_ID, sets: 3, reps: '10' },
			{ itemId: 'st-bb-bent-over-row', sets: 3, reps: '10' },
			{ itemId: 'st-tricep-rope-pushdown', sets: 3, reps: '12' },
		],
	},
];

/** Supporting start weights (lb) — accessories from the priority bench scaffold. */
const SUPPORTING: Record<string, { start: number; increment: number }> = {
	'st-incline-db-bench': { start: 40, increment: 5 },
	'st-pec-deck': { start: 70, increment: 2.5 },
	'st-tricep-rope-pushdown': { start: 45, increment: 2.5 },
	'st-db-ohp': { start: 35, increment: 5 },
	'st-lateral-raise': { start: 15, increment: 2.5 },
	'st-face-pull': { start: 40, increment: 2.5 },
	'st-bb-bent-over-row': { start: 115, increment: 5 },
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

function buildSampleProgram(
	idPrefix: string,
	name: string,
	goal: { weight: number; reps: number },
	durationWeeks: number,
): Program {
	return buildGoalProgram({
		name,
		goal,
		routines: PRIORITY_ROUTINES,
		daysPerWeek: DAYS_PER_WEEK,
		durationWeeks,
		programId: `${idPrefix}-program`,
		createdAt: new Date().toISOString(),
		makeRoutineId: (weekNumber, i) =>
			`${idPrefix}-w${weekNumber}-${PRIORITY_ROUTINES[i].letter.toLowerCase()}`,
	});
}

/** Log one session following that plan week's prescribed targets. */
function buildSampleSession(
	idPrefix: string,
	plan: GoalPlan,
	sessionIndex: number,
	date: Date,
): Session {
	const planWeek = Math.floor(sessionIndex / DAYS_PER_WEEK) + 1;
	const routineIndex = sessionIndex % DAYS_PER_WEEK;
	const routine = PRIORITY_ROUTINES[routineIndex];
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
			sets.push({
				setNumber: s,
				weight,
				reps,
				completedAt: setTime.toISOString(),
			});
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

	// ── Stint 1 — completed: 135x10 → 185x5 (3 blocks, 12 weeks, all 36 sessions) ──
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
		templateId: 'sample',
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
	const program1 = buildSampleProgram('gp-seed-01', plan1.name, goal1, weeks1);
	const sessions1 = Array.from({ length: sessions1Count }, (_, i) => {
		const week = Math.floor(i / DAYS_PER_WEEK);
		const dayInWeek = [0, 2, 4][i % DAYS_PER_WEEK];
		return buildSampleSession('gp-seed-01', plan1, i, shiftDays(firstDay1, week * 7 + dayInWeek));
	});

	// ── Stint 2 — active, mid-plan: 155x10 → 205x5, currently block 2 week 3 ──
	const start2 = { weight: 155, reps: 10 };
	const goal2 = { weight: 205, reps: 5 };
	const blocks2 = generateBlocks(start2, goal2, 5);

	const plan2: GoalPlan = {
		id: 'gp-seed-02',
		disciplineId: STRENGTH,
		programId: 'gp-seed-02-program',
		templateId: 'sample',
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
		createdAt: shiftDays(today, -90).toISOString(),
	};
	const program2 = buildSampleProgram('gp-seed-02', plan2.name, goal2, totalPlanWeeks(blocks2));

	// 21 completed sessions → week 7 → block 2, week 3. Prefer Mon/Wed/Fri-ish offsets
	// so they rarely collide with the debug seed's Tue/Thu/Sat pattern.
	const start2Base = shiftDays(today, -90);
	const session2Offsets = [
		0, 2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28, 30, 32, 35, 37, 39, 42, 44, 46,
	];
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
