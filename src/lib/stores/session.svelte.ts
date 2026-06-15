import type {
	ActiveSession,
	ActiveExercise,
	ActiveSet,
	SessionLog,
	Workout,
	Program,
	Exercise,
	WorkoutExercise,
	LoggedExercise
} from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';

const ACTIVE_SESSION_KEY = 'cwout:activeSession';

function todayIso(): string {
	return new Date().toISOString().split('T')[0];
}

function snapshotLog(log: SessionLog): SessionLog {
	return $state.snapshot(log) as SessionLog;
}

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

	private async buildActiveExercises(
		workout: Workout,
		exerciseMap: Map<string, Exercise>
	): Promise<ActiveExercise[]> {
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

		return exercises;
	}

	private buildEditExerciseList(
		workout: Workout,
		log: SessionLog
	): Array<{ exerciseId: string; template?: WorkoutExercise; logged: LoggedExercise }> {
		const loggedById = new Map(log.exercises.map((e) => [e.exerciseId, e]));
		const seen = new Set<string>();
		const result: Array<{ exerciseId: string; template?: WorkoutExercise; logged: LoggedExercise }> =
			[];

		for (const we of workout.exercises) {
			seen.add(we.exerciseId);
			result.push({
				exerciseId: we.exerciseId,
				template: we,
				logged: loggedById.get(we.exerciseId) ?? { exerciseId: we.exerciseId, sets: [] }
			});
		}

		for (const logged of log.exercises) {
			if (!seen.has(logged.exerciseId)) {
				result.push({ exerciseId: logged.exerciseId, logged });
			}
		}

		return result;
	}

	private hydrateSetFromLog(
		loggedSet: LoggedExercise['sets'][number],
		setNumber: number,
		targetReps: string
	): ActiveSet {
		return {
			setNumber,
			targetReps,
			weight: loggedSet.weight,
			reps: loggedSet.reps,
			completed: true,
			completedAt: loggedSet.completedAt
		};
	}

	async start(
		workout: Workout,
		program: Program,
		exerciseMap: Map<string, Exercise>,
		options?: { date?: string }
	): Promise<void> {
		const date = options?.date ?? todayIso();
		const now = new Date().toISOString();
		const exercises = await this.buildActiveExercises(workout, exerciseMap);

		this.active = {
			id: generateId(),
			date,
			workoutId: workout.id,
			workoutName: workout.name,
			programId: program.id,
			startedAt: now,
			exercises,
			isEditing: false
		};

		this.persist();
	}

	async editSession(
		log: SessionLog,
		workout: Workout,
		exerciseMap: Map<string, Exercise>
	): Promise<void> {
		const snapshot = snapshotLog(log);
		const exercises: ActiveExercise[] = [];
		const editList = this.buildEditExerciseList(workout, snapshot);

		for (const entry of editList) {
			const exercise = exerciseMap.get(entry.exerciseId);
			if (!exercise) continue;

			const template = entry.template;
			const loggedEx = entry.logged;
			const setCount = Math.max(template?.sets ?? 0, loggedEx.sets.length, 1);
			const targetReps = template?.reps ?? String(loggedEx.sets[0]?.reps ?? 8);
			const sets: ActiveSet[] = [];

			for (let i = 0; i < setCount; i++) {
				const loggedSet =
					loggedEx.sets.find((s) => s.setNumber === i + 1) ?? loggedEx.sets[i];
				if (loggedSet) {
					sets.push(this.hydrateSetFromLog(loggedSet, i + 1, targetReps));
				} else {
					const lastUsed = await db.exerciseLastUsed.get(entry.exerciseId);
					sets.push({
						setNumber: i + 1,
						targetReps,
						weight: lastUsed?.weight ?? 0,
						reps: lastUsed?.reps ?? (parseInt(targetReps.split('-')[0], 10) || 8),
						completed: false,
						completedAt: null
					});
				}
			}

			exercises.push({
				exerciseId: exercise.id,
				unit: exercise.unit,
				sets
			});
		}

		this.active = {
			id: snapshot.id,
			date: snapshot.date,
			workoutId: snapshot.workoutId,
			workoutName: workout.name,
			programId: snapshot.programId,
			startedAt: snapshot.startedAt,
			exercises,
			isEditing: true,
			originalFinishedAt: snapshot.finishedAt,
			originalDurationSeconds: snapshot.durationSeconds
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

		for (let i = setIndex + 1; i < exercise.sets.length; i++) {
			if (!exercise.sets[i].completed) {
				exercise.sets[i].weight = weight;
			}
		}

		try {
			await db.exerciseLastUsed.put(
				$state.snapshot({
					exerciseId: exercise.exerciseId,
					weight,
					reps
				})
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

		const loggedExercises = this.active.exercises
			.map((ae) => ({
				exerciseId: ae.exerciseId,
				sets: ae.sets
					.filter((s) => s.completed)
					.map((s, i) => ({
						setNumber: i + 1,
						weight: s.weight,
						reps: s.reps,
						completedAt: s.completedAt ?? now
					}))
			}))
			.filter((ex) => ex.sets.length > 0);

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

		const elapsed = isEditing
			? (this.active.originalDurationSeconds ??
				Math.round((Date.now() - new Date(this.active.startedAt).getTime()) / 1000))
			: (durationSeconds ??
				Math.round((Date.now() - new Date(this.active.startedAt).getTime()) / 1000));

		const sessionLog: SessionLog = {
			id: this.active.id,
			date: this.active.date,
			workoutId: this.active.workoutId,
			programId: this.active.programId,
			startedAt: this.active.startedAt,
			finishedAt: isEditing ? (this.active.originalFinishedAt ?? now) : now,
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
