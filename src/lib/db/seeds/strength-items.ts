import type { Item } from '../types';
import { STRENGTH_DISCIPLINE_ID } from '$lib/discipline';
import { strengthExerciseSeeds } from './strength-exercises';

export const strengthItems: Item[] = strengthExerciseSeeds.map((e) => ({
	id: e.id,
	disciplineId: STRENGTH_DISCIPLINE_ID,
	name: e.name,
	cue: e.cue,
	section: 'exercises',
	metric: 'setsReps',
	muscles: e.muscles,
	cat: e.cat,
	exerciseType: e.exerciseType,
	equipment: e.equipment,
	difficulty: e.difficulty,
	unit: e.unit,
	defaultSets: e.defaultSets,
	defaultReps: e.defaultReps,
	weightIncrement: e.weightIncrement,
	isBuiltIn: true,
}));
