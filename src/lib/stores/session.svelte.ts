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
} from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import { todayIso } from '$lib/date';
import { flattenItems } from '$lib/discipline';

const ACTIVE_SESSION_KEY = 'cwout:activeSession';

function snapshotLog(log: Session): Session {
	return $state.snapshot(log) as Session;
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

	private async buildActiveItems(routine: Routine, itemMap: Map<string, Item>): Promise<ActiveItem[]> {
		const activeItems: ActiveItem[] = [];

		for (const ri of flattenItems(routine)) {
			const item = itemMap.get(ri.itemId);
			if (!item) {
				continue;
			}

			const lastUsed = await db.itemLastUsed.get(ri.itemId);
			const defaultWeight: number | string = lastUsed?.weight ?? 0;

			let defaultReps = parseInt(ri.reps.split('-')[0], 10);
			if (lastUsed?.reps) {
				defaultReps = lastUsed.reps;
			}

			const sets: ActiveSet[] = [];
			for (let i = 0; i < ri.sets; i++) {
				sets.push({
					setNumber: i + 1,
					targetReps: ri.reps,
					weight: defaultWeight,
					reps: defaultReps,
					completed: false,
					completedAt: null,
				});
			}

			activeItems.push({
				itemId: item.id,
				unit: item.unit,
				sets,
			});
		}

		return activeItems;
	}

	private buildEditItemList(
		routine: Routine,
		log: Session,
	): Array<{ itemId: string; template?: RoutineItem; logged: LoggedItem }> {
		const loggedById = new Map(log.items.map((e) => [e.itemId, e]));
		const seen = new Set<string>();
		const result: Array<{ itemId: string; template?: RoutineItem; logged: LoggedItem }> = [];

		for (const ri of flattenItems(routine)) {
			seen.add(ri.itemId);
			result.push({
				itemId: ri.itemId,
				template: ri,
				logged: loggedById.get(ri.itemId) ?? { itemId: ri.itemId, sets: [] },
			});
		}

		for (const logged of log.items) {
			if (!seen.has(logged.itemId)) {
				result.push({ itemId: logged.itemId, logged });
			}
		}

		return result;
	}

	private hydrateSetFromLog(loggedSet: LoggedItem['sets'][number], setNumber: number, targetReps: string): ActiveSet {
		return {
			setNumber,
			targetReps,
			weight: loggedSet.weight,
			reps: loggedSet.reps,
			completed: true,
			completedAt: loggedSet.completedAt,
		};
	}

	async start(routine: Routine, program: Program, itemMap: Map<string, Item>, options?: { date?: string }): Promise<void> {
		const date = options?.date ?? todayIso();
		const now = new Date().toISOString();
		const items = await this.buildActiveItems(routine, itemMap);

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

	async editSession(log: Session, routine: Routine, itemMap: Map<string, Item>): Promise<void> {
		const snapshot = snapshotLog(log);
		const items: ActiveItem[] = [];
		const editList = this.buildEditItemList(routine, snapshot);

		for (const entry of editList) {
			const item = itemMap.get(entry.itemId);
			if (!item) continue;

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
				unit: item.unit,
				sets,
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

	async logSet(itemIndex: number, setIndex: number, weight: number | string, reps: number): Promise<void> {
		if (!this.active) {
			return;
		}

		const item = this.active.items[itemIndex];
		if (!item) {
			return;
		}

		const set = item.sets[setIndex];
		if (!set) {
			return;
		}

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

	async finish(durationSeconds?: number): Promise<void> {
		if (!this.active) {
			return;
		}

		const now = new Date().toISOString();
		const isEditing = this.active.isEditing === true;

		const loggedItems = this.active.items
			.map((ai) => ({
				itemId: ai.itemId,
				sets: ai.sets
					.filter((s) => s.completed)
					.map((s, i) => ({
						setNumber: i + 1,
						weight: s.weight,
						reps: s.reps,
						completedAt: s.completedAt ?? now,
					})),
			}))
			.filter((item) => item.sets.length > 0);

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
			: (durationSeconds ?? Math.round((Date.now() - new Date(this.active.startedAt).getTime()) / 1000));

		const session: Session = {
			id: this.active.id,
			disciplineId: this.active.disciplineId,
			date: this.active.date,
			routineId: this.active.routineId,
			programId: this.active.programId,
			startedAt: this.active.startedAt,
			finishedAt: isEditing ? (this.active.originalFinishedAt ?? now) : now,
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
		if (!this.active) {
			return;
		}
		localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(this.active));
	}
}

export const sessionStore = new SessionStore();
