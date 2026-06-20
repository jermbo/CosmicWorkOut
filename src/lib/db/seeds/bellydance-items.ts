import type { Item, Metric } from '../types';
import { BELLYDANCE_DISCIPLINE_ID } from '$lib/discipline';
import { bellyDanceMoveSeeds } from './bellydance-moves';
import { bellyDanceBookendSeeds } from './bellydance-bookends';

function metricForSection(section: string): Metric {
	if (section === 'warm-up' || section === 'cool-down') return 'check';
	return 'measure';
}

function toItem(seed: {
	id: string;
	name: string;
	cue: string;
	danceCat: string;
	focus: string[];
	movementType: Item['movementType'];
	difficulty: Item['difficulty'];
	section: string;
}): Item {
	return {
		id: seed.id,
		disciplineId: BELLYDANCE_DISCIPLINE_ID,
		name: seed.name,
		cue: seed.cue,
		section: seed.section,
		metric: metricForSection(seed.section),
		focus: seed.focus,
		danceCat: seed.danceCat,
		movementType: seed.movementType,
		difficulty: seed.difficulty,
		isBuiltIn: true,
	};
}

export const bellyDanceItems: Item[] = [
	...bellyDanceMoveSeeds.map((m) => toItem({ ...m, section: 'moves' })),
	...bellyDanceBookendSeeds.map((b) => toItem(b)),
];
