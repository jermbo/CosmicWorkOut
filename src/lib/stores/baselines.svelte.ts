import type { Baseline, BaselineLog } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import {
	entriesForDate,
	isDone,
	mergeMetrics,
	totalsFor,
	type BaselineMetricDraft,
} from '$lib/baselines/logic';

export type { BaselineMetricDraft };

class BaselineStore {
	baselines = $state<Baseline[]>([]);
	logs = $state<BaselineLog[]>([]);
	loaded = $state(false);

	activeBaselines = $derived(
		[...this.baselines].filter((b) => b.active).sort((a, b) => a.sortOrder - b.sortOrder),
	);

	async load(): Promise<void> {
		const [baselines, logs] = await Promise.all([db.baselines.getAll(), db.baselineLogs.getAll()]);
		this.baselines = baselines.sort((a, b) => a.sortOrder - b.sortOrder);
		this.logs = logs;
		this.loaded = true;
	}

	getBaseline(id: string): Baseline | undefined {
		return this.baselines.find((b) => b.id === id);
	}

	/** Entries for one baseline on one date, oldest first. */
	entriesFor(baselineId: string, date: string): BaselineLog[] {
		return entriesForDate(this.logs, baselineId, date);
	}

	/** metricId → summed total for the date. */
	totalsForDate(baseline: Baseline, date: string): Record<string, number> {
		return totalsFor(baseline, this.entriesFor(baseline.id, date));
	}

	/** Logging anything counts as showing up for the day (US-038). */
	isDoneOn(baseline: Baseline, date: string): boolean {
		return isDone(this.entriesFor(baseline.id, date));
	}

	/** Values from the most recent entry, for prefilling the add form. */
	lastValues(baselineId: string): Record<string, number> | undefined {
		let latest: BaselineLog | undefined;
		for (const log of this.logs) {
			if (log.baselineId !== baselineId) continue;
			if (!latest || log.recordedAt > latest.recordedAt) latest = log;
		}
		return latest ? { ...latest.values } : undefined;
	}

	/** Any baseline logged on the date — drives calendar/week-strip indicators. */
	hasLogOnDate(date: string): boolean {
		return this.logs.some((l) => l.date === date);
	}

	/** Active baselines done (logged) on the date. */
	loggedCountForDate(date: string): number {
		return this.activeBaselines.filter((b) => this.isDoneOn(b, date)).length;
	}

	async addBaseline(data: { name: string; metrics: BaselineMetricDraft[] }): Promise<Baseline> {
		const maxOrder = this.baselines.reduce((m, b) => Math.max(m, b.sortOrder), -1);
		const baseline: Baseline = {
			id: generateId(),
			name: data.name,
			metrics: mergeMetrics([], data.metrics, generateId),
			sortOrder: maxOrder + 1,
			active: true,
			createdAt: new Date().toISOString(),
		};
		await db.baselines.put(baseline);
		this.baselines = [...this.baselines, baseline];
		return baseline;
	}

	/**
	 * Metrics are matched by id: edits keep history attached, new drafts are added,
	 * and metrics left out are marked removed (their logs stay). A metric's measure
	 * is fixed at creation.
	 */
	async updateBaseline(
		id: string,
		data: { name: string; metrics: BaselineMetricDraft[] },
	): Promise<void> {
		const existing = this.getBaseline(id);
		if (!existing) return;
		const metrics = mergeMetrics(existing.metrics, data.metrics, generateId);
		await this.putBaseline({ ...existing, name: data.name, metrics });
	}

	private async putBaseline(baseline: Baseline): Promise<void> {
		await db.baselines.put(baseline);
		this.baselines = this.baselines.map((b) => (b.id === baseline.id ? baseline : b));
	}

	async toggleActive(id: string): Promise<void> {
		const baseline = this.getBaseline(id);
		if (!baseline) return;
		await this.putBaseline({ ...baseline, active: !baseline.active });
	}

	async reorder(orderedIds: string[]): Promise<void> {
		const updated = this.baselines.map((b) => {
			const idx = orderedIds.indexOf(b.id);
			if (idx >= 0) return { ...b, sortOrder: idx };
			return b;
		});
		await Promise.all(updated.map((b) => db.baselines.put(b)));
		this.baselines = updated.sort((a, b) => a.sortOrder - b.sortOrder);
	}

	/** Logs are retained, matching how habit history survives a habit delete. */
	async deleteBaseline(id: string): Promise<void> {
		await db.baselines.remove(id);
		this.baselines = this.baselines.filter((b) => b.id !== id);
	}

	async addEntry(baselineId: string, date: string, values: Record<string, number>): Promise<void> {
		const entry: BaselineLog = {
			id: generateId(),
			baselineId,
			date,
			recordedAt: new Date().toISOString(),
			values,
		};
		await db.baselineLogs.put(entry);
		this.logs = [...this.logs, entry];
	}

	async updateEntry(id: string, values: Record<string, number>): Promise<void> {
		const existing = this.logs.find((l) => l.id === id);
		if (!existing) return;
		const entry: BaselineLog = { ...existing, values };
		await db.baselineLogs.put(entry);
		this.logs = this.logs.map((l) => (l.id === id ? entry : l));
	}

	async deleteEntry(id: string): Promise<void> {
		await db.baselineLogs.remove(id);
		this.logs = this.logs.filter((l) => l.id !== id);
	}
}

export const baselineStore = new BaselineStore();
