import type { Program, Routine, Session } from '$lib/db/types';

/**
 * What the Overview Workout card shows. With one active plan enforced
 * (v1.10.0, US-052) this is a single program's status, not a group/plan count.
 */
export type WorkoutNextUp = {
	headline: string;
	detail: string;
	program: Program | null;
	live: boolean;
	completedCount: number;
};

type Input = {
	activeProgram: Program | null;
	contextDate: string;
	isLive: boolean;
	liveRoutineName: string | null;
	sessionForProgram: (programId: string, date: string) => Session | null;
	suggestedRoutineForProgram: (programId: string) => Routine | null;
};

export function computeWorkoutNextUp(input: Input): WorkoutNextUp {
	const {
		activeProgram,
		contextDate,
		isLive,
		liveRoutineName,
		sessionForProgram,
		suggestedRoutineForProgram,
	} = input;

	if (!activeProgram) {
		return {
			headline: 'No active plan',
			detail: 'Add a plan to get started.',
			program: null,
			live: false,
			completedCount: 0,
		};
	}

	const session = sessionForProgram(activeProgram.id, contextDate);
	const completedCount = session ? 1 : 0;

	if (isLive) {
		return {
			headline: liveRoutineName ? `Live: ${liveRoutineName}` : 'Live session',
			detail: activeProgram.name,
			program: activeProgram,
			live: true,
			completedCount,
		};
	}

	if (session) {
		return {
			headline: activeProgram.name,
			detail: 'Logged for today',
			program: activeProgram,
			live: false,
			completedCount,
		};
	}

	const suggested = suggestedRoutineForProgram(activeProgram.id);
	if (suggested) {
		return {
			headline: suggested.name,
			detail: activeProgram.name,
			program: activeProgram,
			live: false,
			completedCount,
		};
	}

	return {
		headline: 'Ready to train',
		detail: activeProgram.name,
		program: activeProgram,
		live: false,
		completedCount,
	};
}
