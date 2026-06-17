import { todayIso } from '$lib/date';

class LoggingContextStore {
	date = $state(todayIso());
	workoutId = $state<string | null>(null);

	setDate(date: string): void {
		this.date = date;
		this.workoutId = null;
	}

	setWorkoutId(workoutId: string | null): void {
		this.workoutId = workoutId;
	}

	resetToToday(): void {
		this.date = todayIso();
		this.workoutId = null;
	}

	get isToday(): boolean {
		return this.date === todayIso();
	}
}

export const loggingContext = new LoggingContextStore();
