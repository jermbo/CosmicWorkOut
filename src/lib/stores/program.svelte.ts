import type { Program, Exercise, Workout, WorkoutExercise, SessionLog } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';

const ACTIVE_PROGRAM_KEY = 'cwout:activeProgramId';

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
		const found = this.sessions.find(
			(s) => s.date === today && s.programId === this.activeProgram?.id
		);
		if (!found) {
			return null;
		}
		return found;
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
		]);

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

	// Save edited exercises to a workout by name across all weeks
	async saveWorkoutExercises(workoutName: string, exercises: WorkoutExercise[]): Promise<void> {
		if (!this.activeProgram) {
			return;
		}

		const updatedWeeks = this.activeProgram.weeks.map((week) => ({
			...week,
			workouts: week.workouts.map((w) =>
				w.name === workoutName ? { ...w, exercises } : w
			)
		}));

		this.activeProgram = { ...this.activeProgram, weeks: updatedWeeks };
		await db.programs.put($state.snapshot(this.activeProgram));

		// Refresh program list
		this.programs = this.programs.map((p) =>
			p.id === this.activeProgram!.id ? this.activeProgram! : p
		);
	}

	// Add a brand-new workout to all weeks
	async addWorkout(workout: Omit<Workout, 'id'>): Promise<void> {
		if (!this.activeProgram) {
			return;
		}

		const updatedWeeks = this.activeProgram.weeks.map((week) => ({
			...week,
			workouts: [
				...week.workouts,
				{ ...workout, id: `w${week.weekNumber}-${generateId().slice(0, 8)}` }
			]
		}));

		this.activeProgram = { ...this.activeProgram, weeks: updatedWeeks };
		await db.programs.put($state.snapshot(this.activeProgram));

		this.programs = this.programs.map((p) =>
			p.id === this.activeProgram!.id ? this.activeProgram! : p
		);
	}
}

export const programStore = new ProgramStore();
