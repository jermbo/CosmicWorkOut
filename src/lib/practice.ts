import type { Program, Routine, Session } from '$lib/db/types';
import { BELLYDANCE_DISCIPLINE_ID, STRENGTH_DISCIPLINE_ID } from '$lib/discipline';

export const WORKOUT_GROUP_ID = 'workout';
export const DANCE_GROUP_ID = 'dance';

export type PracticeGroup = {
	id: string;
	label: string;
	description: string;
	disciplineIds: string[];
	color: 'lime' | 'lavender';
};

/** Broad UI buckets that organize plans. Groups are config, not user data. */
export const practiceGroups: PracticeGroup[] = [
	{
		id: WORKOUT_GROUP_ID,
		label: 'Workout',
		description: 'Strength, cardio, conditioning, and more',
		disciplineIds: [STRENGTH_DISCIPLINE_ID],
		color: 'lime',
	},
	{
		id: DANCE_GROUP_ID,
		label: 'Dance',
		description: 'Structured dance practice and routines',
		disciplineIds: [BELLYDANCE_DISCIPLINE_ID],
		color: 'lavender',
	},
];

export function practiceGroupById(id: string): PracticeGroup | undefined {
	return practiceGroups.find((g) => g.id === id);
}

export function practiceGroupForDiscipline(disciplineId: string): PracticeGroup | undefined {
	return practiceGroups.find((g) => g.disciplineIds.includes(disciplineId));
}

export function sessionRouteForDiscipline(disciplineId: string): string {
	return disciplineId === BELLYDANCE_DISCIPLINE_ID ? '/practice/dance' : '/workout';
}

export function sessionRouteForProgram(program: Program): string {
	return `${sessionRouteForDiscipline(program.disciplineId)}?program=${program.id}`;
}

export function programRouteForDiscipline(disciplineId: string): string {
	return `/program?discipline=${disciplineId}`;
}

export type PracticeNextUp = {
	headline: string;
	detail: string;
	program: Program | null;
	live: boolean;
	completedCount: number;
	groupCount: number;
	planCount: number;
};

type NextUpInput = {
	activePrograms: Program[];
	contextDate: string;
	liveDisciplineId: string | null;
	liveRoutineName: string | null;
	sessionsForProgram: (programId: string, date: string) => Session | null;
	suggestedRoutineForProgram: (programId: string) => Routine | null;
};

/** Live session → incomplete today → suggested routine. */
export function computePracticeNextUp(input: NextUpInput): PracticeNextUp {
	const {
		activePrograms,
		contextDate,
		liveDisciplineId,
		liveRoutineName,
		sessionsForProgram,
		suggestedRoutineForProgram,
	} = input;

	const activeGroups = practiceGroups.filter((g) =>
		activePrograms.some((p) => g.disciplineIds.includes(p.disciplineId)),
	);
	const planCount = activePrograms.length;
	const groupCount = activeGroups.length;

	const completedCount = activePrograms.filter((p) => sessionsForProgram(p.id, contextDate)).length;

	if (liveDisciplineId) {
		const liveProgram = activePrograms.find((p) => p.disciplineId === liveDisciplineId);
		return {
			headline: liveRoutineName ? `Live: ${liveRoutineName}` : 'Live session',
			detail: countLine(groupCount, planCount),
			program: liveProgram ?? null,
			live: true,
			completedCount,
			groupCount,
			planCount,
		};
	}

	for (const program of activePrograms) {
		if (!sessionsForProgram(program.id, contextDate)) {
			const suggested = suggestedRoutineForProgram(program.id);
			if (suggested) {
				return {
					headline: suggested.name,
					detail: countLine(groupCount, planCount),
					program,
					live: false,
					completedCount,
					groupCount,
					planCount,
				};
			}
		}
	}

	for (const program of activePrograms) {
		const session = sessionsForProgram(program.id, contextDate);
		if (session) {
			return {
				headline: program.name,
				detail: countLine(groupCount, planCount),
				program,
				live: false,
				completedCount,
				groupCount,
				planCount,
			};
		}
	}

	if (planCount > 0) {
		return {
			headline: 'Ready to practice',
			detail: countLine(groupCount, planCount),
			program: null,
			live: false,
			completedCount,
			groupCount,
			planCount,
		};
	}

	return {
		headline: 'No active plans',
		detail: 'Add a practice to get started.',
		program: null,
		live: false,
		completedCount: 0,
		groupCount: 0,
		planCount: 0,
	};
}

function countLine(groupCount: number, planCount: number): string {
	if (planCount === 0) return 'Add a practice to get started.';
	const groupPart = `${groupCount} ${groupCount === 1 ? 'group' : 'groups'}`;
	const planPart = `${planCount} active ${planCount === 1 ? 'plan' : 'plans'}`;
	return `${groupPart} · ${planPart}`;
}
