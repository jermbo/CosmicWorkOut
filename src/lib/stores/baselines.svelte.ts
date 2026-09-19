import type { Baseline, BaselineDirection, BaselineLog, BaselineMetric } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import { entriesForDate, isCleared, totalsFor } from '$lib/baselines/logic';

export type BaselineMetricDraft = { label: string; target: number };

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

	isClearedOn(baseline: Baseline, date: string): boolean {
		return isCleared(baseline, this.totalsForDate(baseline, date));
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

	loggedCountForDate(date: string): number {
		return this.activeBaselines.filter((b) => this.entriesFor(b.id, date).length > 0).length;
	}

	clearedCountForDate(date: string): number {
		return this.activeBaselines.filter((b) => this.isClearedOn(b, date)).length;
	}

	async addBaseline(data: {
		name: string;
		direction: BaselineDirection;
		metrics: BaselineMetricDraft[];
	}): Promise<Baseline> {
		const maxOrder = this.baselines.reduce((m, b) => Math.max(m, b.sortOrder), -1);
		const baseline: Baseline = {
			id: generateId(),
			name: data.name,
			direction: data.direction,
			metrics: data.metrics.map((m) => ({ id: generateId(), label: m.label, target: m.target })),
			sortOrder: maxOrder + 1,
			active: true,
			createdAt: new Date().toISOString(),
		};
		await db.baselines.put(baseline);
		this.baselines = [...this.baselines, baseline];
		return baseline;
	}

	/**
	 * Name, direction, labels and targets are editable. Metric ids are carried over by
	 * position so existing logs keep pointing at the right metric — the metric count is
	 * fixed at creation and extra drafts are dropped.
	 */
	async updateBaseline(
		id: string,
		data: { name: string; direction: BaselineDirection; metrics: BaselineMetricDraft[] },
	): Promise<void> {
		const existing = this.getBaseline(id);
		if (!existing) return;
		const metrics: BaselineMetric[] = existing.metrics.map((m, i) => ({
			id: m.id,
			label: data.metrics[i]?.label ?? m.label,
			target: data.metrics[i]?.target ?? m.target,
		}));
		await this.putBaseline({ ...existing, name: data.name, direction: data.direction, metrics });
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
