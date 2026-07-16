import type {
	ActiveSession,
	ActiveItem,
	ActiveSet,
	Session,
	Routine,
	Program,
	Item,
	RoutineItem,
	LoggedItem,
	Metric,
} from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import { todayIso } from '$lib/date';
import { effectiveSections } from '$lib/discipline';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

const ACTIVE_SESSION_KEY = 'cwout:activeSession';

/**
 * Optional per-item weekly targets a plan engine (e.g. goal progression plans)
 * can pass into start(); they take precedence over the last-used prefill.
 */
export type PrescribedTargets = Map<string, { weight: number; reps?: number }>;

function metricForLoggedItem(logged: LoggedItem): Metric {
	if (logged.checked !== undefined) return 'check';
	if (logged.value !== undefined || logged.skipped) return 'measure';
	return 'setsReps';
}

function valueForMeasure(logged: { skipped?: boolean; value?: number | null }): number | null {
	if (logged.skipped) return null;
	return logged.value ?? null;
}

function resolveFinishedAt(
	isEditing: boolean,
	originalFinishedAt: string | undefined,
	now: string,
): string {
	if (isEditing) return originalFinishedAt ?? now;
	return now;
}

function snapshotLog(log: Session): Session {
	return $state.snapshot(log) as Session;
}

function isSetsRepsItem(ai: ActiveItem): boolean {
	return ai.metric === undefined || ai.metric === 'setsReps';
}

class SessionStore {
	active = $state<ActiveSession | null>(null);
	isComplete = $state(false);
	completedSession = $state<Session | null>(null);

	get isActive(): boolean {
		return this.active !== null;
	}

	get activeItems(): ActiveItem[] {
		return this.active?.items ?? [];
	}

	get activeRoutineName(): string {
		return this.active?.routineName ?? '';
	}

	get activeDisciplineId(): string | null {
		return this.active?.disciplineId ?? null;
	}

	checkForRecovery(): boolean {
		const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
		if (!stored) return false;

		try {
			JSON.parse(stored) as ActiveSession;
			return true;
		} catch {
			localStorage.removeItem(ACTIVE_SESSION_KEY);
			return false;
		}
	}

	recoverSession(): void {
		const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
		if (!stored) return;
		try {
			this.active = JSON.parse(stored) as ActiveSession;
		} catch {
			localStorage.removeItem(ACTIVE_SESSION_KEY);
		}
	}

	private async buildStrengthItem(
		ri: RoutineItem,
		item: Item,
		prescribed?: { weight: number; reps?: number },
	): Promise<ActiveItem> {
		const lastUsed = await db.itemLastUsed.get(ri.itemId);
		const defaultWeight: number | string = prescribed?.weight ?? lastUsed?.weight ?? 0;

		const targetReps =
			prescribed?.reps != null ? String(prescribed.reps) : (ri.reps ?? item.defaultReps ?? '8');
		let defaultReps = parseInt(targetReps.split('-')[0], 10) || 8;
		if (prescribed?.reps != null) {
			defaultReps = prescribed.reps;
		} else if (lastUsed?.reps) {
			defaultReps = lastUsed.reps;
		}

		const setCount = ri.sets ?? item.defaultSets ?? 1;
		const sets: ActiveSet[] = [];
		for (let i = 0; i < setCount; i++) {
			sets.push({
				setNumber: i + 1,
				targetReps,
				weight: defaultWeight,
				reps: defaultReps,
				completed: false,
				completedAt: null,
			});
		}

		return {
			itemId: item.id,
			unit: item.unit ?? 'bodyweight',
			sets,
			metric: 'setsReps',
			section: 'exercises',
		};
	}

	private buildCheckItem(item: Item, sectionKey: string): ActiveItem {
		return {
			itemId: item.id,
			unit: 'bodyweight',
			sets: [],
			metric: 'check',
			section: sectionKey,
			checked: false,
		};
	}

	private buildMeasureItem(item: Item, sectionKey: string): ActiveItem {
		return {
			itemId: item.id,
			unit: 'bodyweight',
			sets: [],
			metric: 'measure',
			section: sectionKey,
			value: null,
			measureMode: 'duration',
			skipped: false,
		};
	}

	private async buildActiveItems(
		routine: Routine,
		program: Program,
		itemMap: Map<string, Item>,
		prescribed?: PrescribedTargets,
	): Promise<ActiveItem[]> {
		const activeItems: ActiveItem[] = [];
		const sections = effectiveSections(program, routine);

		for (const section of sections) {
			for (const ri of section.items) {
				const item = itemMap.get(ri.itemId);
				if (!item) continue;

				if (section.metric === 'setsReps') {
					activeItems.push(await this.buildStrengthItem(ri, item, prescribed?.get(ri.itemId)));
				} else if (section.metric === 'check') {
					activeItems.push(this.buildCheckItem(item, section.key));
				} else {
					activeItems.push(this.buildMeasureItem(item, section.key));
				}
			}
		}

		return activeItems;
	}

	private buildEditItemList(
		routine: Routine,
		program: Program,
		log: Session,
	): Array<{
		itemId: string;
		template?: RoutineItem;
		logged: LoggedItem;
		metric: Metric;
		section: string;
	}> {
		const loggedById = new SvelteMap(log.items.map((e) => [e.itemId, e]));
		const seen = new SvelteSet<string>();
		const result: Array<{
			itemId: string;
			template?: RoutineItem;
			logged: LoggedItem;
			metric: Metric;
			section: string;
		}> = [];

		for (const section of effectiveSections(program, routine)) {
			for (const ri of section.items) {
				seen.add(ri.itemId);
				result.push({
					itemId: ri.itemId,
					template: ri,
					logged: loggedById.get(ri.itemId) ?? { itemId: ri.itemId, sets: [] },
					metric: section.metric,
					section: section.key,
				});
			}
		}

		for (const logged of log.items) {
			if (!seen.has(logged.itemId)) {
				const item = { itemId: logged.itemId, sets: logged.sets ?? [] };
				const metric = metricForLoggedItem(logged);
				result.push({
					itemId: logged.itemId,
					logged: item,
					metric,
					section: '',
				});
			}
		}

		return result;
	}

	private hydrateSetFromLog(
		loggedSet: LoggedItem['sets'][number],
		setNumber: number,
		targetReps: string,
	): ActiveSet {
		return {
			setNumber,
			targetReps,
			weight: loggedSet.weight,
			reps: loggedSet.reps,
			completed: true,
			completedAt: loggedSet.completedAt,
		};
	}

	async start(
		routine: Routine,
		program: Program,
		itemMap: Map<string, Item>,
		options?: { date?: string; prescribed?: PrescribedTargets },
	): Promise<void> {
		const date = options?.date ?? todayIso();
		const now = new Date().toISOString();
		const items = await this.buildActiveItems(routine, program, itemMap, options?.prescribed);

		this.active = {
			id: generateId(),
			disciplineId: program.disciplineId,
			date,
			routineId: routine.id,
			routineName: routine.name,
			programId: program.id,
			startedAt: now,
			items,
			isEditing: false,
		};

		this.persist();
	}

	async editSession(
		log: Session,
		routine: Routine,
		program: Program,
		itemMap: Map<string, Item>,
	): Promise<void> {
		const snapshot = snapshotLog(log);
		const items: ActiveItem[] = [];
		const editList = this.buildEditItemList(routine, program, snapshot);

		for (const entry of editList) {
			const item = itemMap.get(entry.itemId);
			if (!item) continue;

			if (entry.metric === 'check') {
				items.push({
					itemId: item.id,
					unit: 'bodyweight',
					sets: [],
					metric: 'check',
					section: entry.section,
					checked: entry.logged.checked ?? false,
				});
				continue;
			}

			if (entry.metric === 'measure') {
				items.push({
					itemId: item.id,
					unit: 'bodyweight',
					sets: [],
					metric: 'measure',
					section: entry.section,
					value: valueForMeasure(entry.logged),
					measureMode: entry.logged.measureMode ?? 'duration',
					skipped: entry.logged.skipped ?? false,
				});
				continue;
			}

			const template = entry.template;
			const loggedItem = entry.logged;
			const setCount = Math.max(template?.sets ?? 0, loggedItem.sets.length, 1);
			const targetReps = template?.reps ?? String(loggedItem.sets[0]?.reps ?? 8);
			const sets: ActiveSet[] = [];

			for (let i = 0; i < setCount; i++) {
				const loggedSet = loggedItem.sets.find((s) => s.setNumber === i + 1) ?? loggedItem.sets[i];
				if (loggedSet) {
					sets.push(this.hydrateSetFromLog(loggedSet, i + 1, targetReps));
				} else {
					const lastUsed = await db.itemLastUsed.get(entry.itemId);
					sets.push({
						setNumber: i + 1,
						targetReps,
						weight: lastUsed?.weight ?? 0,
						reps: lastUsed?.reps ?? (parseInt(targetReps.split('-')[0], 10) || 8),
						completed: false,
						completedAt: null,
					});
				}
			}

			items.push({
				itemId: item.id,
				unit: item.unit ?? 'bodyweight',
				sets,
				metric: 'setsReps',
				section: entry.section || 'exercises',
			});
		}

		this.active = {
			id: snapshot.id,
			disciplineId: snapshot.disciplineId,
			date: snapshot.date,
			routineId: snapshot.routineId,
			routineName: routine.name,
			programId: snapshot.programId,
			startedAt: snapshot.startedAt,
			items,
			isEditing: true,
			originalFinishedAt: snapshot.finishedAt,
			originalDurationSeconds: snapshot.durationSeconds,
		};

		this.persist();
	}

	async completeSet(itemIndex: number, setIndex: number): Promise<void> {
		if (!this.active) return;
		const item = this.active.items[itemIndex];
		if (!item) return;
		const set = item.sets[setIndex];
		if (!set || set.completed) return;
		await this.logSet(itemIndex, setIndex, set.weight, set.reps);
	}

	async logSet(
		itemIndex: number,
		setIndex: number,
		weight: number | string,
		reps: number,
	): Promise<void> {
		if (!this.active) return;

		const item = this.active.items[itemIndex];
		if (!item) return;

		const set = item.sets[setIndex];
		if (!set) return;

		set.weight = weight;
		set.reps = reps;
		set.completed = true;
		set.completedAt = set.completedAt ?? new Date().toISOString();

		for (let i = setIndex + 1; i < item.sets.length; i++) {
			if (!item.sets[i].completed) {
				item.sets[i].weight = weight;
			}
		}

		try {
			await db.itemLastUsed.put(
				$state.snapshot({
					itemId: item.itemId,
					weight,
					reps,
				}),
			);
		} catch (e) {
			console.error('Failed to save last used weight:', e);
		}

		this.persist();
	}

	toggleCheck(itemIndex: number): void {
		if (!this.active) return;
		const item = this.active.items[itemIndex];
		if (!item || item.metric !== 'check') return;
		item.checked = !item.checked;
		this.persist();
	}

	setMeasure(itemIndex: number, value: number, mode: 'duration' | 'reps'): void {
		if (!this.active) return;
		const item = this.active.items[itemIndex];
		if (!item || item.metric !== 'measure') return;
		item.value = value;
		item.measureMode = mode;
		item.skipped = false;
		this.persist();
	}

	skipItem(itemIndex: number): void {
		if (!this.active) return;
		const item = this.active.items[itemIndex];
		if (!item || item.metric !== 'measure') return;
		item.skipped = true;
		item.value = null;
		this.persist();
	}

	private serializeLoggedItems(activeItems: ActiveItem[], now: string): LoggedItem[] {
		const loggedItems: LoggedItem[] = [];

		for (const ai of activeItems) {
			if (isSetsRepsItem(ai)) {
				const sets = ai.sets
					.filter((s) => s.completed)
					.map((s, i) => ({
						setNumber: i + 1,
						weight: s.weight,
						reps: s.reps,
						completedAt: s.completedAt ?? now,
					}));
				if (sets.length > 0) {
					loggedItems.push({ itemId: ai.itemId, sets });
				}
			} else if (ai.metric === 'check' && ai.checked) {
				loggedItems.push({ itemId: ai.itemId, sets: [], checked: true });
			} else if (ai.metric === 'measure') {
				if (ai.skipped) {
					loggedItems.push({ itemId: ai.itemId, sets: [], skipped: true });
				} else if (ai.value != null) {
					loggedItems.push({
						itemId: ai.itemId,
						sets: [],
						value: ai.value,
						measureMode: ai.measureMode ?? 'duration',
					});
				}
			}
		}

		return loggedItems;
	}

	async finish(durationSeconds?: number): Promise<void> {
		if (!this.active) return;

		const now = new Date().toISOString();
		const isEditing = this.active.isEditing === true;
		const loggedItems = this.serializeLoggedItems(this.active.items, now);

		let totalVolume = 0;
		let totalSets = 0;
		for (const item of loggedItems) {
			totalSets += item.sets.length;
			for (const s of item.sets) {
				if (typeof s.weight === 'number') {
					totalVolume += s.weight * s.reps;
				}
			}
		}

		const elapsed = isEditing
			? (this.active.originalDurationSeconds ??
				Math.round((Date.now() - new Date(this.active.startedAt).getTime()) / 1000))
			: (durationSeconds ??
				Math.round((Date.now() - new Date(this.active.startedAt).getTime()) / 1000));

		const session: Session = {
			id: this.active.id,
			disciplineId: this.active.disciplineId,
			date: this.active.date,
			routineId: this.active.routineId,
			programId: this.active.programId,
			startedAt: this.active.startedAt,
			finishedAt: resolveFinishedAt(isEditing, this.active.originalFinishedAt, now),
			durationSeconds: elapsed,
			totalVolume,
			totalSets,
			items: loggedItems,
		};

		try {
			await db.sessions.put($state.snapshot(session));
		} catch (e) {
			console.error('Failed to save session:', e);
			throw e;
		}
		localStorage.removeItem(ACTIVE_SESSION_KEY);

		this.completedSession = session;
		this.active = null;
		this.isComplete = true;
	}

	abandon(): void {
		localStorage.removeItem(ACTIVE_SESSION_KEY);
		this.active = null;
		this.isComplete = false;
		this.completedSession = null;
	}

	dismissComplete(): void {
		this.isComplete = false;
		this.completedSession = null;
	}

	private persist(): void {
		if (!this.active) return;
		localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(this.active));
	}
}

export const sessionStore = new SessionStore();
