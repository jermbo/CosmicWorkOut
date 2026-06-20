import type { Program, Item, Routine, RoutineItem, RoutineSection, Session, Week, RoutineColor } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import { todayIso } from '$lib/date';
import { computeWeekStreak, computeCombinedStreak } from '$lib/streak';
import { STRENGTH_DISCIPLINE_ID, BELLYDANCE_DISCIPLINE_ID, flattenItems, singleSection, disciplines, emptySections } from '$lib/discipline';

// Per-Discipline active program: disciplineId → programId. Replaces the legacy
// single 'cwout:activeProgramId' so strength and belly dance can be active at once.
const ACTIVE_PROGRAMS_KEY = 'cwout:activeProgramIds';
const LEGACY_ACTIVE_PROGRAM_KEY = 'cwout:activeProgramId';

const ROUTINE_COLORS: RoutineColor[] = ['lime', 'lavender', 'red'];

class ProgramStore {
	programs = $state<Program[]>([]);
	items = $state<Item[]>([]);
	sessions = $state<Session[]>([]);
	// disciplineId → active programId
	activeProgramIds = $state<Record<string, string>>({});
	loaded = $state(false);

	itemMap = $derived.by(() => {
		const map = new Map<string, Item>();
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

	// ── Per-Discipline accessors ────────────────────────────────────
	// These read $state, so they stay reactive when called from $derived or markup.

	activeProgramFor(disciplineId: string): Program | null {
		const id = this.activeProgramIds[disciplineId];
		if (!id) return null;
		return this.programs.find((p) => p.id === id) ?? null;
	}

	programsForDiscipline(disciplineId: string): Program[] {
		return this.programs.filter((p) => p.disciplineId === disciplineId);
	}

	allRoutinesFor(disciplineId: string): Routine[] {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return [];
		return program.weeks.flatMap((w) => w.routines);
	}

	sessionsForDiscipline(disciplineId: string): Session[] {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return [];
		return this.sessions.filter((s) => s.programId === program.id);
	}

	completedCountFor(disciplineId: string): number {
		return this.sessionsForDiscipline(disciplineId).length;
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
			[STRENGTH_DISCIPLINE_ID, BELLYDANCE_DISCIPLINE_ID].map((id) =>
				this.sessionsForDiscipline(id).map((s) => s.date),
			),
			1,
		),
	);

	activeDisciplines = $derived(
		disciplines.filter((d) => this.activeProgramFor(d.id) !== null),
	);

	isProgramCompleteFor(disciplineId: string): boolean {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return false;
		const total = program.durationWeeks * program.daysPerWeek;
		return total > 0 && this.completedCountFor(disciplineId) >= total;
	}

	currentWeekFor(disciplineId: string): number {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return 1;
		return Math.min(
			Math.floor(this.completedCountFor(disciplineId) / program.daysPerWeek) + 1,
			program.durationWeeks,
		);
	}

	currentLetterFor(disciplineId: string): string {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return 'A';
		const posInWeek = this.completedCountFor(disciplineId) % program.daysPerWeek;
		return String.fromCharCode(65 + posInWeek);
	}

	todaysRoutineFor(disciplineId: string): Routine | null {
		const all = this.allRoutinesFor(disciplineId);
		if (all.length === 0) return null;
		return all[this.completedCountFor(disciplineId) % all.length];
	}

	// ── Strength-facing convenience (existing UI consumes these) ────
	// US-018 generalizes Today to iterate Disciplines via the methods above.

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

	suggestedRoutineInCurrentWeekFor(disciplineId: string): Routine | null {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return null;
		const weekRoutines = program.weeks[this.currentWeekFor(disciplineId) - 1]?.routines ?? [];
		const suggested = this.todaysRoutineFor(disciplineId);
		if (weekRoutines.length === 0) return null;
		if (!suggested) return weekRoutines[0];
		const byLetter = weekRoutines.find((r) => r.letter === suggested.letter);
		if (byLetter) return byLetter;
		const byName = weekRoutines.find((r) => r.name === suggested.name);
		return byName ?? weekRoutines[0];
	}

	routinesForCurrentWeekFor(disciplineId: string): Routine[] {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return [];
		const week = program.weeks[this.currentWeekFor(disciplineId) - 1];
		return week?.routines ?? [];
	}

	// Unique routine templates from week 1 (canonical A/B/C definitions)
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

	// Read the per-Discipline active-program map, drop stale ids, and default each
	// Discipline that has programs but no active selection to its first program.
	private resolveActiveProgramIds(programs: Program[]): Record<string, string> {
		const ids: Record<string, string> = {};

		const stored = localStorage.getItem(ACTIVE_PROGRAMS_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as Record<string, string>;
				for (const [disciplineId, programId] of Object.entries(parsed)) {
					if (programs.some((p) => p.id === programId)) ids[disciplineId] = programId;
				}
			} catch {
				// ignore malformed map — fall through to defaults
			}
		} else {
			// One-time fallback from the legacy single-program key.
			const legacy = localStorage.getItem(LEGACY_ACTIVE_PROGRAM_KEY);
			const legacyProgram = legacy ? programs.find((p) => p.id === legacy) : undefined;
			if (legacyProgram) ids[legacyProgram.disciplineId] = legacyProgram.id;
		}

		for (const program of programs) {
			if (!ids[program.disciplineId]) {
				ids[program.disciplineId] = program.id;
			}
		}

		this.persistActiveProgramIds(ids);
		return ids;
	}

	private persistActiveProgramIds(ids: Record<string, string> = this.activeProgramIds): void {
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

	sessionForDisciplineDate(disciplineId: string, date: string): Session | null {
		const program = this.activeProgramFor(disciplineId);
		if (!program) return null;
		return this.sessions.find((s) => s.date === date && s.programId === program.id) ?? null;
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

	// Save routine metadata + items across all weeks (matched by original name).
	// Strength routines are single-section; items write into the lone section.
	async saveRoutine(
		originalName: string,
		updates: { name: string; letter?: string; focus?: string; color?: RoutineColor; items: RoutineItem[] },
	): Promise<void> {
		const program = this.activeProgram;
		if (!program) return;

		const updatedWeeks = program.weeks.map((week) => ({
			...week,
			routines: week.routines.map((r) =>
				r.name === originalName
					? {
							...r,
							name: updates.name,
							letter: updates.letter ?? r.letter,
							focus: updates.focus ?? r.focus,
							color: updates.color ?? r.color,
							sections: singleSection(updates.items),
						}
					: r,
			),
		}));

		await this.commitActiveProgram({ ...program, weeks: updatedWeeks });
	}

	// Save a multi-section routine (belly dance) across every week of a program,
	// matched by the routine's original name. Sections carry their own bookend
	// override flags (US-017); strength keeps the single-section saveRoutine above.
	async saveRoutineSections(
		programId: string,
		originalName: string,
		updates: { name: string; focus?: string; color?: RoutineColor; sections: RoutineSection[] },
	): Promise<void> {
		const program = this.programs.find((p) => p.id === programId);
		if (!program) return;

		const updatedWeeks = program.weeks.map((week) => ({
			...week,
			routines: week.routines.map((r) =>
				r.name === originalName
					? {
							...r,
							name: updates.name,
							focus: updates.focus ?? r.focus,
							color: updates.color ?? r.color,
							sections: structuredClone(updates.sections),
						}
					: r,
			),
		}));

		await this.commitActiveProgram({ ...program, weeks: updatedWeeks });
	}

	// Add a brand-new routine to all weeks
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
		this.programs = this.programs.map((p) => (p.id === updated.id ? updated : p));
	}

	setActiveProgram(programId: string): void {
		const found = this.programs.find((p) => p.id === programId);
		if (!found) return;
		this.activeProgramIds = { ...this.activeProgramIds, [found.disciplineId]: programId };
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
		const defaultSections = disciplineId === STRENGTH_DISCIPLINE_ID ? singleSection([]) : emptySections(disciplineId);
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

	// Item management. Strength items default to the strength Discipline's single
	// section + setsReps; dance (and future Disciplines) pass disciplineId, section,
	// metric, and focus explicitly (US-016).
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
		this.items = this.items.map((i) => (i.id === item.id ? item : i));
	}

	isItemInUse(id: string): boolean {
		return this.programs.some((p) =>
			p.weeks.some((w) => w.routines.some((r) => flattenItems(r).some((ri) => ri.itemId === id))),
		);
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

		// If the deleted program was active for its Discipline, pick another of the
		// same Discipline, or clear the slot if none remain.
		if (this.activeProgramIds[program.disciplineId] === id) {
			const next = this.programs.find((p) => p.disciplineId === program.disciplineId) ?? null;
			const ids = { ...this.activeProgramIds };
			if (next) {
				ids[program.disciplineId] = next.id;
			} else {
				delete ids[program.disciplineId];
			}
			this.activeProgramIds = ids;
			this.persistActiveProgramIds();
		}
	}
}

export const programStore = new ProgramStore();
