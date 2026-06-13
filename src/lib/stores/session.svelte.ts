import type {
	ActiveSession,
	ActiveExercise,
	ActiveSet,
	SessionLog,
	Workout,
	Program,
	Exercise
} from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';

const ACTIVE_SESSION_KEY = 'cwout:activeSession';

class SessionStore {
	active = $state<ActiveSession | null>(null);
	isComplete = $state(false);
	completedSession = $state<SessionLog | null>(null);

	get isActive(): boolean {
		return this.active !== null;
	}

	checkForRecovery(): boolean {
		const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
		if (!stored) return false;

		try {
			const session = JSON.parse(stored) as ActiveSession;
			const today = new Date().toISOString().split('T')[0];
			if (session.date !== today) {
				localStorage.removeItem(ACTIVE_SESSION_KEY);
				return false;
			}
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

	async start(workout: Workout, program: Program, exerciseMap: Map<string, Exercise>): Promise<void> {
		const today = new Date().toISOString().split('T')[0];
		const now = new Date().toISOString();

		const exercises: ActiveExercise[] = [];

		for (const we of workout.exercises) {
			const exercise = exerciseMap.get(we.exerciseId);
			if (!exercise) {
				continue;
			}

			const lastUsed = await db.exerciseLastUsed.get(we.exerciseId);
			const defaultWeight: number | string = lastUsed?.weight ?? 0;

			let defaultReps = parseInt(we.reps.split('-')[0], 10);
			if (lastUsed?.reps) {
				defaultReps = lastUsed.reps;
			}

			const sets: ActiveSet[] = [];
			for (let i = 0; i < we.sets; i++) {
				sets.push({
					setNumber: i + 1,
					targetReps: we.reps,
					weight: defaultWeight,
					reps: defaultReps,
					completed: false,
					completedAt: null
				});
			}

			exercises.push({
				exerciseId: exercise.id,
				unit: exercise.unit,
				sets
			});
		}

		this.active = {
			id: generateId(),
			date: today,
			workoutId: workout.id,
			workoutName: workout.name,
			programId: program.id,
			startedAt: now,
			exercises
		};

		this.persist();
	}

	async completeSet(exerciseIndex: number, setIndex: number): Promise<void> {
		if (!this.active) return;
		const exercise = this.active.exercises[exerciseIndex];
		if (!exercise) return;
		const set = exercise.sets[setIndex];
		if (!set || set.completed) return;
		await this.logSet(exerciseIndex, setIndex, set.weight, set.reps);
	}

	async logSet(
		exerciseIndex: number,
		setIndex: number,
		weight: number | string,
		reps: number
	): Promise<void> {
		if (!this.active) {
			return;
		}

		const exercise = this.active.exercises[exerciseIndex];
		if (!exercise) {
			return;
		}

		const set = exercise.sets[setIndex];
		if (!set) {
			return;
		}

		set.weight = weight;
		set.reps = reps;
		set.completed = true;
		set.completedAt = set.completedAt ?? new Date().toISOString();

		// cascade new weight to all subsequent uncompleted sets
		for (let i = setIndex + 1; i < exercise.sets.length; i++) {
			if (!exercise.sets[i].completed) {
				exercise.sets[i].weight = weight;
			}
		}

		try {
			await db.exerciseLastUsed.put($state.snapshot({
				exerciseId: exercise.exerciseId,
				weight,
				reps
			}));
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

		const loggedExercises = this.active.exercises.map((ae) => ({
			exerciseId: ae.exerciseId,
			sets: ae.sets
				.filter((s) => s.completed)
				.map((s, i) => ({
					setNumber: i + 1,
					weight: s.weight,
					reps: s.reps,
					completedAt: s.completedAt ?? now
				}))
		}));

		let totalVolume = 0;
		let totalSets = 0;
		for (const ex of loggedExercises) {
			totalSets += ex.sets.length;
			for (const s of ex.sets) {
				if (typeof s.weight === 'number') {
					totalVolume += s.weight * s.reps;
				}
			}
		}

		const elapsed =
			durationSeconds ??
			Math.round((Date.now() - new Date(this.active.startedAt).getTime()) / 1000);

		const sessionLog: SessionLog = {
			id: this.active.id,
			date: this.active.date,
			workoutId: this.active.workoutId,
			programId: this.active.programId,
			startedAt: this.active.startedAt,
			finishedAt: now,
			durationSeconds: elapsed,
			totalVolume,
			totalSets,
			exercises: loggedExercises
		};

		try {
			await db.sessions.put($state.snapshot(sessionLog));
		} catch (e) {
			console.error('Failed to save session:', e);
			throw e;
		}
		localStorage.removeItem(ACTIVE_SESSION_KEY);

		this.completedSession = sessionLog;
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
