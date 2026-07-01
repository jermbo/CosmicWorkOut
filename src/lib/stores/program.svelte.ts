import type { Program, Item, Routine, RoutineItem, RoutineSection, Session, Week, RoutineColor } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import { todayIso } from '$lib/date';
import { computeWeekStreak, computeCombinedStreak } from '$lib/streak';
import { STRENGTH_DISCIPLINE_ID, flattenItems, singleSection, disciplines, emptySections } from '$lib/discipline';
import { practiceGroups, practiceGroupById } from '$lib/practice';
import { SvelteMap } from 'svelte/reactivity';

const ACTIVE_PROGRAMS_KEY = 'cwout:activeProgramIds';
const LEGACY_ACTIVE_PROGRAM_KEY = 'cwout:activeProgramId';

const ROUTINE_COLORS: RoutineColor[] = ['lime', 'lavender', 'red'];

class ProgramStore {
	programs = $state<Program[]>([]);
	items = $state<Item[]>([]);
	sessions = $state<Session[]>([]);
	activeProgramIds = $state<string[]>([]);
	loaded = $state(false);

	itemMap = $derived.by(() => {
		const map = new SvelteMap<string, Item>();
		for (const item of this.items) {
			map.set(item.id, item);
		}
		return map;
	});

	getItemById(id: string): Item | undefined {
		return this.itemMap.get(id);
	}

	itemsForDiscipline(disciplineId: string): Item[] {
		return this.items.filter((i) => i.disciplineId === disciplineId);
	}

	isProgramActive(programId: string): boolean {
		return this.activeProgramIds.includes(programId);
	}

	activePrograms = $derived.by(() =>
		this.activeProgramIds.map((id) => this.programs.find((p) => p.id === id)).filter((p): p is Program => !!p),
	);

	activeProgramsForGroup(groupId: string): Program[] {
		const group = practiceGroupById(groupId);
		if (!group) return [];
		return this.activePrograms.filter((p) => group.disciplineIds.includes(p.disciplineId));
	}

	isGroupActive(groupId: string): boolean {
		return this.activeProgramsForGroup(groupId).length > 0;
	}

	activeGroups = $derived(practiceGroups.filter((g) => this.isGroupActive(g.id)));

	activeProgramsForDiscipline(disciplineId: string): Program[] {
		return this.activePrograms.filter((p) => p.disciplineId === disciplineId);
	}

	activeProgramFor(disciplineId: string): Program | null {
		return this.activeProgramsForDiscipline(disciplineId)[0] ?? null;
	}

	programById(programId: string): Program | undefined {
		return this.programs.find((p) => p.id === programId);
	}

	programsForDiscipline(disciplineId: string): Program[] {
		return this.programs.filter((p) => p.disciplineId === disciplineId);
	}

	allRoutinesForProgram(programId: string): Routine[] {
		const program = this.programById(programId);
		if (!program) return [];
		return program.weeks.flatMap((w) => w.routines);
	}

	allRoutinesFor(disciplineId: string): Routine[] {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return [];
		return this.allRoutinesForProgram(program.id);
	}

	sessionsForProgram(programId: string): Session[] {
		return this.sessions.filter((s) => s.programId === programId);
	}

	sessionsForDiscipline(disciplineId: string): Session[] {
		const activeIds = new Set(this.activeProgramsForDiscipline(disciplineId).map((p) => p.id));
		return this.sessions.filter((s) => activeIds.has(s.programId) || s.disciplineId === disciplineId);
	}

	completedCountForProgram(programId: string): number {
		return this.sessionsForProgram(programId).length;
	}

	completedCountFor(disciplineId: string): number {
		return this.activeProgramsForDiscipline(disciplineId).reduce((n, p) => n + this.completedCountForProgram(p.id), 0);
	}

	weekStreakFor(disciplineId: string): number {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return 0;
		return computeWeekStreak(
			this.sessionsForDiscipline(disciplineId).map((s) => s.date),
			program.daysPerWeek,
		);
	}

	combinedWeekStreak = $derived(
		computeCombinedStreak(
			disciplines.map((d) => this.sessions.filter((s) => s.disciplineId === d.id).map((s) => s.date)),
			1,
		),
	);

	isDisciplineActive(disciplineId: string): boolean {
		return this.activeProgramsForDiscipline(disciplineId).length > 0;
	}

	activeDisciplines = $derived(disciplines.filter((d) => this.isDisciplineActive(d.id)));

	isProgramCompleteForProgram(programId: string): boolean {
		const program = this.programById(programId);
		if (!program) return false;
		const total = program.durationWeeks * program.daysPerWeek;
		return total > 0 && this.completedCountForProgram(programId) >= total;
	}

	isProgramCompleteFor(disciplineId: string): boolean {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return false;
		return this.isProgramCompleteForProgram(program.id);
	}

	currentWeekForProgram(programId: string): number {
		const program = this.programById(programId);
		if (!program) return 1;
		return Math.min(
			Math.floor(this.completedCountForProgram(programId) / program.daysPerWeek) + 1,
			program.durationWeeks,
		);
	}

	currentWeekFor(disciplineId: string): number {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return 1;
		return this.currentWeekForProgram(program.id);
	}

	currentLetterForProgram(programId: string): string {
		const program = this.programById(programId);
		if (!program) return 'A';
		const posInWeek = this.completedCountForProgram(programId) % program.daysPerWeek;
		return String.fromCharCode(65 + posInWeek);
	}

	currentLetterFor(disciplineId: string): string {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return 'A';
		return this.currentLetterForProgram(program.id);
	}

	todaysRoutineForProgram(programId: string): Routine | null {
		const all = this.allRoutinesForProgram(programId);
		if (all.length === 0) return null;
		return all[this.completedCountForProgram(programId) % all.length];
	}

	todaysRoutineFor(disciplineId: string): Routine | null {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return null;
		return this.todaysRoutineForProgram(program.id);
	}

	activeProgram = $derived(this.activeProgramFor(STRENGTH_DISCIPLINE_ID));
	allRoutines = $derived(this.allRoutinesFor(STRENGTH_DISCIPLINE_ID));
	weekStreak = $derived(this.weekStreakFor(STRENGTH_DISCIPLINE_ID));
	completedSessionCount = $derived(this.completedCountFor(STRENGTH_DISCIPLINE_ID));
	isProgramComplete = $derived(this.isProgramCompleteFor(STRENGTH_DISCIPLINE_ID));
	currentWeekNumber = $derived(this.currentWeekFor(STRENGTH_DISCIPLINE_ID));
	currentRoutineLetter = $derived(this.currentLetterFor(STRENGTH_DISCIPLINE_ID));
	todaysRoutine = $derived(this.todaysRoutineFor(STRENGTH_DISCIPLINE_ID));

	todaySession = $derived.by(() => {
		return this.sessionForDate(todayIso());
	});

	routinesForCurrentWeek = $derived.by(() => {
		const program = this.activeProgram;
		if (!program) return [] as Routine[];
		const week = program.weeks[this.currentWeekNumber - 1];
		return week?.routines ?? [];
	});

	suggestedRoutineInCurrentWeek = $derived.by(() => {
		return this.suggestedRoutineInCurrentWeekFor(STRENGTH_DISCIPLINE_ID);
	});

	suggestedRoutineInCurrentWeekForProgram(programId: string): Routine | null {
		const program = this.programById(programId);
		if (!program) return null;
		const weekRoutines = program.weeks[this.currentWeekForProgram(programId) - 1]?.routines ?? [];
		const suggested = this.todaysRoutineForProgram(programId);
		if (weekRoutines.length === 0) return null;
		if (!suggested) return weekRoutines[0];
		const byLetter = weekRoutines.find((r) => r.letter === suggested.letter);
		if (byLetter) return byLetter;
		const byName = weekRoutines.find((r) => r.name === suggested.name);
		return byName ?? weekRoutines[0];
	}

	suggestedRoutineInCurrentWeekFor(disciplineId: string): Routine | null {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return null;
		return this.suggestedRoutineInCurrentWeekForProgram(program.id);
	}

	routinesForCurrentWeekForProgram(programId: string): Routine[] {
		const program = this.programById(programId);
		if (!program) return [];
		const week = program.weeks[this.currentWeekForProgram(programId) - 1];
		return week?.routines ?? [];
	}

	routinesForCurrentWeekFor(disciplineId: string): Routine[] {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return [];
		return this.routinesForCurrentWeekForProgram(program.id);
	}

	uniqueRoutines = $derived.by(() => {
		const program = this.activeProgram;
		if (!program || program.weeks.length === 0) {
			return [] as Routine[];
		}
		return program.weeks[0].routines;
	});

	async load(): Promise<void> {
		const [programs, items, sessions] = await Promise.all([
			db.programs.getAll(),
			db.items.getAll(),
			db.sessions.getAll(),
		]).catch((e) => {
			console.error('Failed to load data from IndexedDB:', e);
			throw e;
		});

		this.programs = programs;
		this.items = items;
		this.sessions = sessions;
		this.activeProgramIds = this.resolveActiveProgramIds(programs);
		this.loaded = true;
	}

	private resolveActiveProgramIds(programs: Program[]): string[] {
		const valid = new Set(programs.map((p) => p.id));
		const ids: string[] = [];

		const stored = localStorage.getItem(ACTIVE_PROGRAMS_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as unknown;
				if (Array.isArray(parsed)) {
					for (const id of parsed) {
						if (typeof id === 'string' && valid.has(id) && !ids.includes(id)) ids.push(id);
					}
				} else if (parsed && typeof parsed === 'object') {
					for (const programId of Object.values(parsed as Record<string, string>)) {
						if (valid.has(programId) && !ids.includes(programId)) ids.push(programId);
					}
				}
			} catch {
				ids.length = 0;
			}
		} else {
			const legacy = localStorage.getItem(LEGACY_ACTIVE_PROGRAM_KEY);
			if (legacy && valid.has(legacy)) ids.push(legacy);
		}

		this.persistActiveProgramIds(ids);
		return ids;
	}

	private persistActiveProgramIds(ids: string[] = this.activeProgramIds): void {
		localStorage.setItem(ACTIVE_PROGRAMS_KEY, JSON.stringify(ids));
	}

	async refreshSessions(): Promise<void> {
		this.sessions = await db.sessions.getAll();
	}

	getRoutineById(routineId: string): Routine | undefined {
		for (const program of this.programs) {
			for (const week of program.weeks) {
				const found = week.routines.find((r) => r.id === routineId);
				if (found) return found;
			}
		}
		return undefined;
	}

	getProgramForRoutine(routineId: string): Program | undefined {
		for (const program of this.programs) {
			for (const week of program.weeks) {
				if (week.routines.some((r) => r.id === routineId)) return program;
			}
		}
		return undefined;
	}

	getRoutineForSession(log: Session): Routine | null {
		const program = this.programs.find((p) => p.id === log.programId);
		if (program) {
			for (const week of program.weeks) {
				const direct = week.routines.find((r) => r.id === log.routineId);
				if (direct) return direct;
			}

			const suffix = log.routineId.split('-').slice(1).join('-');
			if (suffix) {
				for (const week of program.weeks) {
					const bySuffix = week.routines.find((r) => r.id.endsWith(`-${suffix}`));
					if (bySuffix) return bySuffix;
				}
			}
		}

		const direct = this.getRoutineById(log.routineId);
		if (direct) return direct;

		if (log.items.length === 0) return null;

		return {
			id: log.routineId,
			disciplineId: log.disciplineId,
			name: 'Logged routine',
			sections: singleSection(
				log.items.map((li) => ({
					itemId: li.itemId,
					sets: li.sets.length,
					reps: String(li.sets[0]?.reps ?? 8),
				})),
			),
		};
	}

	sessionForProgramDate(programId: string, date: string): Session | null {
		return this.sessions.find((s) => s.date === date && s.programId === programId) ?? null;
	}

	sessionForDisciplineDate(disciplineId: string, date: string): Session | null {
		for (const program of this.activeProgramsForDiscipline(disciplineId)) {
			const session = this.sessionForProgramDate(program.id, date);
			if (session) return session;
		}
		return this.sessions.find((s) => s.date === date && s.disciplineId === disciplineId) ?? null;
	}

	sessionsForDate(date: string): Session[] {
		return this.sessions.filter((s) => s.date === date);
	}

	sessionForDate(date: string): Session | null {
		return this.sessionForDisciplineDate(STRENGTH_DISCIPLINE_ID, date);
	}

	async deleteSession(id: string): Promise<void> {
		try {
			await db.sessions.delete(id);
		} catch (e) {
			console.error('Failed to delete session:', e);
			throw e;
		}
		await this.refreshSessions();
	}

	async saveRoutine(
		originalName: string,
		updates: { name: string; letter?: string; focus?: string; color?: RoutineColor; items: RoutineItem[] },
	): Promise<void> {
		const program = this.activeProgram;
		if (!program) return;

		const updatedWeeks = program.weeks.map((week) => ({
			...week,
			routines: week.routines.map((r) => {
				if (r.name !== originalName) return r;
				return {
					...r,
					name: updates.name,
					letter: updates.letter ?? r.letter,
					focus: updates.focus ?? r.focus,
					color: updates.color ?? r.color,
					sections: singleSection(updates.items),
				};
			}),
		}));

		await this.commitActiveProgram({ ...program, weeks: updatedWeeks });
	}

	async saveRoutineSections(
		programId: string,
		originalName: string,
		updates: { name: string; focus?: string; color?: RoutineColor; sections: RoutineSection[] },
	): Promise<void> {
		const program = this.programs.find((p) => p.id === programId);
		if (!program) return;

		const updatedWeeks = program.weeks.map((week) => ({
			...week,
			routines: week.routines.map((r) => {
				if (r.name !== originalName) return r;
				return {
					...r,
					name: updates.name,
					focus: updates.focus ?? r.focus,
					color: updates.color ?? r.color,
					sections: structuredClone(updates.sections),
				};
			}),
		}));

		await this.commitActiveProgram({ ...program, weeks: updatedWeeks });
	}

	async addRoutine(routine: Omit<Routine, 'id'>): Promise<void> {
		const program = this.activeProgram;
		if (!program) return;

		const updatedWeeks = program.weeks.map((week) => ({
			...week,
			routines: [...week.routines, { ...routine, id: generateId() }],
		}));

		await this.commitActiveProgram({ ...program, weeks: updatedWeeks });
	}

	private async commitActiveProgram(updated: Program): Promise<void> {
		try {
			await db.programs.put($state.snapshot(updated));
		} catch (e) {
			console.error('Failed to save program:', e);
			throw e;
		}
		this.programs = this.programs.map((p) => {
			if (p.id === updated.id) return updated;
			return p;
		});
	}

	setActiveProgram(programId: string): void {
		if (!this.programs.some((p) => p.id === programId) || this.isProgramActive(programId)) return;
		this.activeProgramIds = [...this.activeProgramIds, programId];
		this.persistActiveProgramIds();
	}

	deactivateProgram(programId: string): void {
		if (!this.isProgramActive(programId)) return;
		this.activeProgramIds = this.activeProgramIds.filter((id) => id !== programId);
		this.persistActiveProgramIds();
	}

	async copyProgram(program: Program): Promise<Program> {
		const snap = $state.snapshot(program) as Program;
		const copy: Program = {
			...structuredClone(snap),
			id: generateId(),
			name: `${snap.name} (Copy)`,
			isBuiltIn: false,
			createdAt: new Date().toISOString(),
		};
		copy.weeks = copy.weeks.map((week) => ({
			...week,
			routines: week.routines.map((r) => ({ ...r, id: generateId() })),
		}));
		try {
			await db.programs.put(copy);
		} catch (e) {
			console.error('Failed to copy program:', e);
			throw e;
		}
		this.programs = [...this.programs, copy];
		return copy;
	}

	async createProgram(data: {
		name: string;
		description: string;
		durationWeeks: number;
		daysPerWeek: number;
		routineTemplates: { name: string; focus: string }[];
		disciplineId?: string;
	}): Promise<Program> {
		const disciplineId = data.disciplineId ?? STRENGTH_DISCIPLINE_ID;
		const defaultSections = this.defaultSectionsFor(disciplineId);
		const weeks: Week[] = Array.from({ length: data.durationWeeks }, (_, wi) => ({
			weekNumber: wi + 1,
			routines: data.routineTemplates.map((tmpl, i) => ({
				id: `w${wi + 1}-${generateId().slice(0, 8)}`,
				disciplineId,
				name: tmpl.name,
				letter: String.fromCharCode(65 + i),
				focus: tmpl.focus,
				color: ROUTINE_COLORS[i % ROUTINE_COLORS.length],
				sections: structuredClone(defaultSections),
			})),
		}));

		const program: Program = {
			id: generateId(),
			disciplineId,
			name: data.name,
			description: data.description,
			durationWeeks: data.durationWeeks,
			daysPerWeek: data.daysPerWeek,
			weeks,
			createdAt: new Date().toISOString(),
			isBuiltIn: false,
		};

		try {
			await db.programs.put(program);
		} catch (e) {
			console.error('Failed to create program:', e);
			throw e;
		}
		this.programs = [...this.programs, program];
		return program;
	}

	private defaultSectionsFor(disciplineId: string): RoutineSection[] {
		if (disciplineId === STRENGTH_DISCIPLINE_ID) return singleSection([]);
		return emptySections(disciplineId);
	}

	async addItem(
		item: Omit<Item, 'id' | 'isBuiltIn' | 'disciplineId' | 'section' | 'metric'> &
			Partial<Pick<Item, 'disciplineId' | 'section' | 'metric'>>,
	): Promise<Item> {
		const newItem: Item = {
			...item,
			id: generateId(),
			disciplineId: item.disciplineId ?? STRENGTH_DISCIPLINE_ID,
			section: item.section ?? 'exercises',
			metric: item.metric ?? 'setsReps',
			isBuiltIn: false,
		};
		try {
			await db.items.put(newItem);
		} catch (e) {
			console.error('Failed to add item:', e);
			throw e;
		}
		this.items = [...this.items, newItem];
		return newItem;
	}

	async updateItem(item: Item): Promise<void> {
		try {
			await db.items.put(item);
		} catch (e) {
			console.error('Failed to update item:', e);
			throw e;
		}
		this.items = this.items.map((i) => {
			if (i.id === item.id) return item;
			return i;
		});
	}

	programsUsingItem(id: string): Program[] {
		return this.programs.filter((p) =>
			p.weeks.some((w) => w.routines.some((r) => flattenItems(r).some((ri) => ri.itemId === id))),
		);
	}

	isItemInUse(id: string): boolean {
		return this.programsUsingItem(id).length > 0;
	}

	customItemsInUse(): Array<{ item: Item; programs: Program[] }> {
		return this.items
			.filter((i) => !i.isBuiltIn)
			.map((item) => ({ item, programs: this.programsUsingItem(item.id) }))
			.filter((entry) => entry.programs.length > 0);
	}

	async deleteItem(id: string): Promise<void> {
		if (this.isItemInUse(id)) {
			throw new Error('Item is used in one or more programs. Remove it from all routines first.');
		}
		try {
			await db.items.remove(id);
		} catch (e) {
			console.error('Failed to delete item:', e);
			throw e;
		}
		this.items = this.items.filter((i) => i.id !== id);
	}

	async removeRoutine(routineName: string): Promise<void> {
		const program = this.activeProgram;
		if (!program) return;

		const firstWeek = program.weeks[0];
		if (!firstWeek || firstWeek.routines.length <= 1) return;

		const updatedWeeks = program.weeks.map((week) => ({
			...week,
			routines: week.routines.filter((r) => r.name !== routineName),
		}));

		await this.commitActiveProgram({ ...program, weeks: updatedWeeks });
	}

	async deleteProgram(id: string): Promise<void> {
		const program = this.programs.find((p) => p.id === id);
		if (!program || program.isBuiltIn) return;

		try {
			await db.programs.remove(id);
		} catch (e) {
			console.error('Failed to delete program:', e);
			throw e;
		}

		this.programs = this.programs.filter((p) => p.id !== id);

		if (this.isProgramActive(id)) {
			this.activeProgramIds = this.activeProgramIds.filter((pid) => pid !== id);
			this.persistActiveProgramIds();
		}
	}
}

export const programStore = new ProgramStore();
