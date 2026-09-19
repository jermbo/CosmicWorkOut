// Goal progression plans (US-033) — self-contained module types.
// Runtime imports inside this module stay relative so the pure parts run under `node --test`.

export type GoalPlanStatus = 'active' | 'paused' | 'completed';

export type WavePhase = 'build' | 'peak' | 'deload';

/** A weight x reps pair — the unit is the focus item's unit (lb/kg). */
export interface GoalTarget {
	weight: number;
	reps: number;
}

/** One week of the focus exercise's wave. */
export interface WaveWeek {
	/** 1-based week within the whole plan (aligned to program week numbers). */
	planWeek: number;
	/** 1-4 within the block. */
	blockWeek: number;
	phase: WavePhase;
	weight: number;
	reps: number;
}

/** A 4-week build → build → peak → deload cycle for the focus exercise. */
export interface ProgressionBlock {
	blockNumber: number;
	/** Week-1 target; week 4 (deload) returns to this. */
	baseline: GoalTarget;
	/** Always 4 entries. */
	weeks: WaveWeek[];
}

/** Weekly-increment baseline for a non-focus exercise, captured at generation. */
export interface SupportingBaseline {
	itemId: string;
	/** Week-1 weight (last-used history at generation, else 0). */
	startWeight: number;
	/** The item's weightIncrement at generation time. */
	weightIncrement: number;
}

/** Recorded when the user repeats the current block; kept for future visualizations. */
export interface BlockRepeatEvent {
	blockNumber: number;
	/** Program's completed-session count at the moment of the repeat. */
	atCompletedCount: number;
	repeatedAt: string;
}

/**
 * One plan instance ("stint"). Each stint is its own record — Bench Goal 01 and
 * Bench Goal 02 are separate rows with independent timelines.
 */
export interface GoalPlan {
	id: string;
	disciplineId: string;
	/** The generated Program record this plan drives (rotation/session engine is unchanged). */
	programId: string;
	templateId: string;
	name: string;
	focusItemId: string;
	goal: GoalTarget;
	start: GoalTarget;
	/** Focus item's weightIncrement at generation time. */
	focusIncrement: number;
	blocks: ProgressionBlock[];
	supporting: SupportingBaseline[];
	daysPerWeek: number;
	status: GoalPlanStatus;
	/**
	 * Session-count offset from block repeats. The plan week that targets are read
	 * from uses `completedCount - countOffset`, so repeating a block replays its
	 * targets without touching session history.
	 */
	countOffset: number;
	repeatEvents: BlockRepeatEvent[];
	createdAt: string;
	completedAt?: string;
	pausedAt?: string;
}

/** An exercise slot inside a goal plan template routine. */
export interface GoalTemplateSlot {
	itemId: string;
	sets: number;
	reps: string;
}

export interface GoalTemplateRoutine {
	letter: 'A' | 'B' | 'C';
	name: string;
	focus: string;
	estMin: number;
	slots: GoalTemplateSlot[];
}

/** Built-in starter template that scaffolds routines A/B/C for a new plan. */
export interface GoalPlanTemplate {
	id: string;
	name: string;
	description: string;
	daysPerWeek: number;
	routines: [GoalTemplateRoutine, GoalTemplateRoutine, GoalTemplateRoutine];
}
