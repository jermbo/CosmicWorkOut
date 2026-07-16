import type { BellyDanceMoveSeed } from './bellydance-moves';

/** Session bookends — warm-up, conditioning drills, cool-down (not in the move glossary). */
export type BellyDanceBookendSeed = BellyDanceMoveSeed & {
	section: 'warm-up' | 'conditioning' | 'cool-down';
};

export const bellyDanceBookendSeeds: BellyDanceBookendSeed[] = [
	// ── WARM-UP (check) ──────────────────────────────────────────────
	{
		id: 'bd-wu-neck-shoulders',
		name: 'Neck & Shoulder Rolls',
		cue: 'Slow circles — loosen the upper body before isolations',
		danceCat: 'Warm-up',
		section: 'warm-up',
		focus: ['shoulders', 'head', 'posture'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
	{
		id: 'bd-wu-hip-circles',
		name: 'Hip Circles (Warm-up)',
		cue: 'Big, smooth circles from the hips — prep for isolations',
		danceCat: 'Warm-up',
		section: 'warm-up',
		focus: ['hips'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
	{
		id: 'bd-wu-rib-slides',
		name: 'Rib Cage Slides',
		cue: 'Isolate the ribs side to side — wake up the torso',
		danceCat: 'Warm-up',
		section: 'warm-up',
		focus: ['core', 'chest', 'posture'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
	{
		id: 'bd-wu-wrist-circles',
		name: 'Wrist & Arm Circles',
		cue: 'Loosen wrists and elbows before snake arms and shimmies',
		danceCat: 'Warm-up',
		section: 'warm-up',
		focus: ['arms', 'shoulders'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
	// ── CONDITIONING (measure) ───────────────────────────────────────
	{
		id: 'bd-con-core-hold',
		name: 'Dancer Core Hold',
		cue: 'Long spine, engaged center — hold steady',
		danceCat: 'Conditioning',
		section: 'conditioning',
		focus: ['core', 'posture'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
	{
		id: 'bd-con-releve-holds',
		name: 'Relevé Holds',
		cue: 'Rise tall on demi-pointe, steady balance',
		danceCat: 'Conditioning',
		section: 'conditioning',
		focus: ['feet', 'legs', 'posture'],
		movementType: 'sharp',
		difficulty: 'beginner',
	},
	{
		id: 'bd-con-plie-holds',
		name: 'Plie Holds',
		cue: 'Soft knees, engaged core — hold at bottom of plie',
		danceCat: 'Conditioning',
		section: 'conditioning',
		focus: ['legs', 'hips'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
	// ── COOL-DOWN (check) ────────────────────────────────────────────
	{
		id: 'bd-cd-side-stretch',
		name: 'Side Body Stretch',
		cue: 'Lengthen one side, then the other',
		danceCat: 'Cool-down',
		section: 'cool-down',
		focus: ['full-body'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
	{
		id: 'bd-cd-deep-breathing',
		name: 'Deep Breathing',
		cue: 'Slow breaths, soften the shoulders',
		danceCat: 'Cool-down',
		section: 'cool-down',
		focus: ['posture', 'chest'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
	{
		id: 'bd-cd-hip-openers',
		name: 'Hip Openers',
		cue: 'Gentle hip circles and stretches to release the lower body',
		danceCat: 'Cool-down',
		section: 'cool-down',
		focus: ['hips'],
		movementType: 'smooth',
		difficulty: 'beginner',
	},
];

/** Shared warm-up and cool-down lists used by every course program. */
export const SHARED_WARM_UP = [
	'bd-wu-neck-shoulders',
	'bd-wu-hip-circles',
	'bd-wu-rib-slides',
	'bd-wu-wrist-circles',
];
export const SHARED_COOL_DOWN = ['bd-cd-side-stretch', 'bd-cd-deep-breathing', 'bd-cd-hip-openers'];
