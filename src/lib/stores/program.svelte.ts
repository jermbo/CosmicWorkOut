import type { Program, Exercise, Workout, WorkoutExercise, SessionLog, Week, ExerciseCat, WeightUnit } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';

const ACTIVE_PROGRAM_KEY = 'cwout:activeProgramId';

const WORKOUT_COLORS: ('lime' | 'lavender' | 'red')[] = ['lime', 'lavender', 'red'];

function isoWeekKey(d: Date): string {
	const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const day = utc.getUTCDay() || 7;
	utc.setUTCDate(utc.getUTCDate() + 4 - day);
	const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((utc.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
	return `${utc.getUTCFullYear()}-W${week}`;
}

class ProgramStore {
	programs = $state<Program[]>([]);
	exercises = $state<Exercise[]>([]);
	activeProgram = $state<Program | null>(null);
	sessions = $state<SessionLog[]>([]);
	loaded = $state(false);

	exerciseMap = $derived.by(() => {
		const map = new Map<string, Exercise>();
		for (const exercise of this.exercises) {
			map.set(exercise.id, exercise);
		}
		return map;
	});

	allWorkouts = $derived.by(() => {
		if (!this.activeProgram) {
			return [] as Workout[];
		}
		return this.activeProgram.weeks.flatMap((w) => w.workouts);
	});

	weekStreak = $derived.by(() => {
		if (!this.activeProgram || this.sessions.length === 0) return 0;
		const programSessions = this.sessions.filter((s) => s.programId === this.activeProgram!.id);
		if (programSessions.length === 0) return 0;
		const daysPerWeek = this.activeProgram.daysPerWeek;

		const weekCounts = new Map<string, number>();
		for (const s of programSessions) {
			const d = new Date(s.date + 'T00:00:00');
			const key = isoWeekKey(d);
			weekCounts.set(key, (weekCounts.get(key) ?? 0) + 1);
		}

		const today = new Date();
		let streak = 0;
		let check = new Date(today);

		// If current week is already complete, count it; then walk back
		if ((weekCounts.get(isoWeekKey(check)) ?? 0) >= daysPerWeek) {
			streak++;
			check.setDate(check.getDate() - 7);
		} else {
			check.setDate(check.getDate() - 7);
		}

		while ((weekCounts.get(isoWeekKey(check)) ?? 0) >= daysPerWeek) {
			streak++;
			check.setDate(check.getDate() - 7);
		}

		return streak;
	});

	completedSessionCount = $derived.by(() => {
		if (!this.activeProgram) {
			return 0;
		}
		return this.sessions.filter((s) => s.programId === this.activeProgram!.id).length;
	});

	currentWeekNumber = $derived.by(() => {
		if (!this.activeProgram) return 1;
		return Math.min(
			Math.floor(this.completedSessionCount / this.activeProgram.daysPerWeek) + 1,
			this.activeProgram.durationWeeks
		);
	});

	currentWorkoutLetter = $derived.by(() => {
		if (!this.activeProgram) return 'A';
		const posInWeek = this.completedSessionCount % this.activeProgram.daysPerWeek;
		return String.fromCharCode(65 + posInWeek); // 0→A, 1→B, 2→C
	});

	todaysWorkout = $derived.by(() => {
		if (this.allWorkouts.length === 0) {
			return null as Workout | null;
		}
		const index = this.completedSessionCount % this.allWorkouts.length;
		return this.allWorkouts[index];
	});

	todaySession = $derived.by(() => {
		const today = new Date().toISOString().split('T')[0];
		return this.sessionForDate(today);
	});

	workoutsForCurrentWeek = $derived.by(() => {
		if (!this.activeProgram) return [] as Workout[];
		const week = this.activeProgram.weeks[this.currentWeekNumber - 1];
		return week?.workouts ?? [];
	});

	suggestedWorkoutInCurrentWeek = $derived.by(() => {
		const weekWorkouts = this.workoutsForCurrentWeek;
		const suggested = this.todaysWorkout;
		if (weekWorkouts.length === 0) return null as Workout | null;
		if (!suggested) return weekWorkouts[0];
		const byLetter = weekWorkouts.find((w) => w.letter === suggested.letter);
		if (byLetter) return byLetter;
		const byName = weekWorkouts.find((w) => w.name === suggested.name);
		return byName ?? weekWorkouts[0];
	});

	// Get unique workout templates from week 1 (canonical definitions)
	uniqueWorkouts = $derived.by(() => {
		if (!this.activeProgram || this.activeProgram.weeks.length === 0) {
			return [] as Workout[];
		}
		return this.activeProgram.weeks[0].workouts;
	});

	async load(): Promise<void> {
		const [programs, exercises, sessions] = await Promise.all([
			db.programs.getAll(),
			db.exercises.getAll(),
			db.sessions.getAll()
		]).catch((e) => {
			console.error('Failed to load data from IndexedDB:', e);
			throw e;
		});

		this.programs = programs;
		this.exercises = exercises;
		this.sessions = sessions;

		const activeProgramId = localStorage.getItem(ACTIVE_PROGRAM_KEY);

		if (activeProgramId) {
			const found = programs.find((p) => p.id === activeProgramId);
			if (found) {
				this.activeProgram = found;
			}
		}

		if (!this.activeProgram && programs.length > 0) {
			this.activeProgram = programs[0];
			localStorage.setItem(ACTIVE_PROGRAM_KEY, this.activeProgram.id);
		}

		this.loaded = true;
	}

	async refreshSessions(): Promise<void> {
		this.sessions = await db.sessions.getAll();
	}

	getWorkoutById(workoutId: string): Workout | undefined {
		return this.allWorkouts.find((w) => w.id === workoutId);
	}

	getWorkoutForSession(log: SessionLog): Workout | null {
		const direct = this.getWorkoutById(log.workoutId);
		if (direct) return direct;

		// Fallback: match by letter suffix (e.g. w5-lower → lower)
		const suffix = log.workoutId.split('-').slice(1).join('-');
		if (suffix) {
			const bySuffix = this.allWorkouts.find((w) => w.id.endsWith(`-${suffix}`));
			if (bySuffix) return bySuffix;
		}

		if (log.exercises.length === 0) return null;

		// Last resort: build a minimal workout from the logged data
		return {
			id: log.workoutId,
			name: 'Logged workout',
			exercises: log.exercises.map((le) => ({
				exerciseId: le.exerciseId,
				sets: le.sets.length,
				reps: String(le.sets[0]?.reps ?? 8)
			}))
		};
	}

	sessionForDate(date: string): SessionLog | null {
		if (!this.activeProgram) return null;
		return (
			this.sessions.find(
				(s) => s.date === date && s.programId === this.activeProgram!.id
			) ?? null
		);
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

	// Save workout metadata + exercises across all weeks (matched by original name)
	async saveWorkout(
		originalName: string,
		updates: { name: string; letter?: string; focus?: string; color?: 'lime' | 'lavender' | 'red'; exercises: WorkoutExercise[] }
	): Promise<void> {
		if (!this.activeProgram) return;

		const updatedWeeks = this.activeProgram.weeks.map((week) => ({
			...week,
			workouts: week.workouts.map((w) =>
				w.name === originalName
					? { ...w, name: updates.name, letter: updates.letter ?? w.letter, focus: updates.focus ?? w.focus, color: updates.color ?? w.color, exercises: updates.exercises }
					: w
			)
		}));

		this.activeProgram = { ...this.activeProgram, weeks: updatedWeeks };
		try {
			await db.programs.put($state.snapshot(this.activeProgram));
		} catch (e) {
			console.error('Failed to save workout:', e);
			throw e;
		}
		this.programs = this.programs.map((p) =>
			p.id === this.activeProgram!.id ? this.activeProgram! : p
		);
	}

	// Add a brand-new workout to all weeks
	async addWorkout(workout: Omit<Workout, 'id'>): Promise<void> {
		if (!this.activeProgram) return;

		const updatedWeeks = this.activeProgram.weeks.map((week) => ({
			...week,
			workouts: [
				...week.workouts,
				{ ...workout, id: generateId() }
			]
		}));

		this.activeProgram = { ...this.activeProgram, weeks: updatedWeeks };
		try {
			await db.programs.put($state.snapshot(this.activeProgram));
		} catch (e) {
			console.error('Failed to add workout:', e);
			throw e;
		}
		this.programs = this.programs.map((p) =>
			p.id === this.activeProgram!.id ? this.activeProgram! : p
		);
	}

	setActiveProgram(programId: string): void {
		const found = this.programs.find((p) => p.id === programId);
		if (!found) return;
		this.activeProgram = found;
		localStorage.setItem(ACTIVE_PROGRAM_KEY, programId);
	}

	async copyProgram(program: Program): Promise<Program> {
		const snap = $state.snapshot(program) as Program;
		const copy: Program = {
			...structuredClone(snap),
			id: generateId(),
			name: `${snap.name} (Copy)`,
			isBuiltIn: false,
			createdAt: new Date().toISOString()
		};
		copy.weeks = copy.weeks.map((week) => ({
			...week,
			workouts: week.workouts.map((w) => ({ ...w, id: generateId() }))
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
		workoutTemplates: { name: string; focus: string }[];
	}): Promise<Program> {
		const weeks: Week[] = Array.from({ length: data.durationWeeks }, (_, wi) => ({
			weekNumber: wi + 1,
			workouts: data.workoutTemplates.map((tmpl, i) => ({
				id: `w${wi + 1}-${generateId().slice(0, 8)}`,
				name: tmpl.name,
				letter: String.fromCharCode(65 + i),
				focus: tmpl.focus,
				color: WORKOUT_COLORS[i % WORKOUT_COLORS.length],
				exercises: []
			}))
		}));

		const program: Program = {
			id: generateId(),
			name: data.name,
			description: data.description,
			durationWeeks: data.durationWeeks,
			daysPerWeek: data.daysPerWeek,
			weeks,
			createdAt: new Date().toISOString(),
			isBuiltIn: false
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

	// Exercise management
	async addExercise(exercise: Omit<Exercise, 'id' | 'isBuiltIn'>): Promise<Exercise> {
		const newEx: Exercise = { ...exercise, id: generateId(), isBuiltIn: false };
		try {
			await db.exercises.put(newEx);
		} catch (e) {
			console.error('Failed to add exercise:', e);
			throw e;
		}
		this.exercises = [...this.exercises, newEx];
		return newEx;
	}

	async updateExercise(exercise: Exercise): Promise<void> {
		try {
			await db.exercises.put(exercise);
		} catch (e) {
			console.error('Failed to update exercise:', e);
			throw e;
		}
		this.exercises = this.exercises.map((e) => (e.id === exercise.id ? exercise : e));
	}

	isExerciseInUse(id: string): boolean {
		return this.programs.some((p) =>
			p.weeks.some((w) =>
				w.workouts.some((wo) =>
					wo.exercises.some((we) => we.exerciseId === id)
				)
			)
		);
	}

	async deleteExercise(id: string): Promise<void> {
		if (this.isExerciseInUse(id)) {
			throw new Error('Exercise is used in one or more programs. Remove it from all workouts first.');
		}
		try {
			await db.exercises.remove(id);
		} catch (e) {
			console.error('Failed to delete exercise:', e);
			throw e;
		}
		this.exercises = this.exercises.filter((e) => e.id !== id);
	}

	async removeWorkout(workoutName: string): Promise<void> {
		if (!this.activeProgram) return;

		const firstWeek = this.activeProgram.weeks[0];
		if (!firstWeek || firstWeek.workouts.length <= 1) return;

		const updatedWeeks = this.activeProgram.weeks.map((week) => ({
			...week,
			workouts: week.workouts.filter((w) => w.name !== workoutName)
		}));

		this.activeProgram = { ...this.activeProgram, weeks: updatedWeeks };
		try {
			await db.programs.put($state.snapshot(this.activeProgram));
		} catch (e) {
			console.error('Failed to remove workout:', e);
			throw e;
		}
		this.programs = this.programs.map((p) =>
			p.id === this.activeProgram!.id ? this.activeProgram! : p
		);
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
		if (this.activeProgram?.id === id) {
			const next = this.programs[0] ?? null;
			this.activeProgram = next;
			if (next) {
				localStorage.setItem(ACTIVE_PROGRAM_KEY, next.id);
			} else {
				localStorage.removeItem(ACTIVE_PROGRAM_KEY);
			}
		}
	}
}

export const programStore = new ProgramStore();
