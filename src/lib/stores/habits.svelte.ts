import type { Habit, HabitLog, HabitType } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';

const TODAY_KEY = 'cwout:habitDay';

class HabitStore {
	habits = $state<Habit[]>([]);
	logs = $state<HabitLog[]>([]);
	loaded = $state(false);

	activeHabits = $derived(
		[...this.habits]
			.filter((h) => h.active)
			.sort((a, b) => a.sortOrder - b.sortOrder)
	);

	todayStr(): string {
		return new Date().toISOString().split('T')[0];
	}

	todayLogs = $derived.by(() => {
		const today = new Date().toISOString().split('T')[0];
		return this.logs.filter((l) => l.date === today);
	});

	getLog(habitId: string, date?: string): HabitLog | undefined {
		const d = date ?? this.todayStr();
		return this.logs.find((l) => l.habitId === habitId && l.date === d);
	}

	logsForDate(date: string): HabitLog[] {
		return this.logs.filter((l) => l.date === date);
	}

	loggedCountForDate(date: string): number {
		const logs = this.logsForDate(date);
		return this.activeHabits.filter((h) => {
			const log = logs.find((l) => l.habitId === h.id);
			if (!log) return false;
			if (h.type === 'boolean') return log.value === 1;
			if (h.type === 'mood') return true;
			if (h.dailyGoal) return log.value >= h.dailyGoal;
			return log.value > 0;
		}).length;
	}

	// For calendar heat map: ratio of completed habits 0–1
	completionRatioForDate(date: string): number {
		const total = this.activeHabits.length;
		if (total === 0) return 0;
		return this.loggedCountForDate(date) / total;
	}

	async load(): Promise<void> {
		const [habits, logs] = await Promise.all([
			db.habits.getAll(),
			db.habitLogs.getAll()
		]);
		// Migrate legacy 'duration' type → 'minutes'
		const normalized = habits.map((h) =>
			(h.type as string) === 'duration' ? { ...h, type: 'minutes' as HabitType } : h
		);
		this.habits = normalized.sort((a, b) => a.sortOrder - b.sortOrder);
		this.logs = logs;
		this.loaded = true;

		localStorage.setItem(TODAY_KEY, this.todayStr());
	}

	async addHabit(data: {
		name: string;
		unit: string;
		type: HabitType;
		dailyGoal?: number;
	}): Promise<Habit> {
		const maxOrder = this.habits.reduce((m, h) => Math.max(m, h.sortOrder), -1);
		const habit: Habit = {
			id: generateId(),
			name: data.name,
			unit: data.unit,
			type: data.type,
			dailyGoal: data.dailyGoal,
			active: true,
			sortOrder: maxOrder + 1,
			createdAt: new Date().toISOString()
		};
		await db.habits.put(habit);
		this.habits = [...this.habits, habit];
		return habit;
	}

	async updateHabit(habit: Habit): Promise<void> {
		await db.habits.put(habit);
		this.habits = this.habits.map((h) => (h.id === habit.id ? habit : h));
	}

	async toggleActive(id: string): Promise<void> {
		const habit = this.habits.find((h) => h.id === id);
		if (!habit) return;
		await this.updateHabit({ ...habit, active: !habit.active });
	}

	async reorder(orderedIds: string[]): Promise<void> {
		const updated = this.habits.map((h) => {
			const idx = orderedIds.indexOf(h.id);
			return idx >= 0 ? { ...h, sortOrder: idx } : h;
		});
		await Promise.all(updated.map((h) => db.habits.put(h)));
		this.habits = updated.sort((a, b) => a.sortOrder - b.sortOrder);
	}

	async deleteHabit(id: string): Promise<void> {
		await db.habits.remove(id);
		this.habits = this.habits.filter((h) => h.id !== id);
		// Keep historical logs — don't delete them
	}

	async logValue(habitId: string, value: number, date?: string): Promise<void> {
		const d = date ?? this.todayStr();
		const logId = `${habitId}:${d}`;
		const entry: HabitLog = { id: logId, habitId, date: d, value };
		await db.habitLogs.put(entry);
		this.logs = [
			...this.logs.filter((l) => l.id !== logId),
			entry
		];
	}

	async increment(habitId: string, date?: string): Promise<void> {
		const existing = this.getLog(habitId, date);
		await this.logValue(habitId, (existing?.value ?? 0) + 1, date);
	}

	async toggle(habitId: string, date?: string): Promise<void> {
		const existing = this.getLog(habitId, date);
		await this.logValue(habitId, existing?.value ? 0 : 1, date);
	}

	async setMinutes(habitId: string, minutes: number, date?: string): Promise<void> {
		await this.logValue(habitId, minutes, date);
	}

	// Legacy alias
	async setDuration(habitId: string, minutes: number): Promise<void> {
		await this.logValue(habitId, minutes);
	}

	async correctValue(habitId: string, value: number, date?: string): Promise<void> {
		await this.logValue(habitId, Math.max(0, value), date);
	}

	async logMood(habitId: string, value: number, date?: string): Promise<void> {
		// Mood value clamped to -5..+5
		await this.logValue(habitId, Math.max(-5, Math.min(5, value)), date);
	}
}

export const habitStore = new HabitStore();
