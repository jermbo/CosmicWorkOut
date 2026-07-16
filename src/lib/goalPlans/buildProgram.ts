import type { Program, Routine, RoutineColor, Week } from '../db/types.ts';
import type { GoalTarget, GoalTemplateRoutine } from './types.ts';

const STRENGTH_DISCIPLINE_ID = 'strength';
const ROUTINE_COLORS: RoutineColor[] = ['lime', 'lavender', 'red'];

export interface BuildGoalProgramInput {
	name: string;
	goal: GoalTarget;
	routines: GoalTemplateRoutine[];
	daysPerWeek: number;
	durationWeeks: number;
	programId: string;
	createdAt: string;
	/** Stable id for each generated routine slot. */
	makeRoutineId: (weekNumber: number, routineIndex: number) => string;
}

/** Build the backing Program (A/B/C x weeks) a goal plan drives. */
export function buildGoalProgram(input: BuildGoalProgramInput): Program {
	const weeks: Week[] = Array.from({ length: input.durationWeeks }, (_, wi) => {
		const weekNumber = wi + 1;
		return {
			weekNumber,
			routines: input.routines.map(
				(tmpl, i): Routine => ({
					id: input.makeRoutineId(weekNumber, i),
					disciplineId: STRENGTH_DISCIPLINE_ID,
					name: tmpl.name,
					letter: tmpl.letter,
					focus: tmpl.focus,
					color: ROUTINE_COLORS[i % ROUTINE_COLORS.length],
					estMin: tmpl.estMin,
					sections: [
						{
							key: 'exercises',
							items: tmpl.slots.map((s) => ({
								itemId: s.itemId,
								sets: s.sets,
								reps: s.reps,
							})),
						},
					],
				}),
			),
		};
	});

	return {
		id: input.programId,
		disciplineId: STRENGTH_DISCIPLINE_ID,
		name: input.name,
		description: `Goal progression plan — ${input.goal.weight} x ${input.goal.reps}`,
		durationWeeks: input.durationWeeks,
		daysPerWeek: input.daysPerWeek,
		weeks,
		createdAt: input.createdAt,
		isBuiltIn: false,
	};
}
