import type { DatedStore } from '$lib/db/backupPayload';

const LABELS: Record<DatedStore, [one: string, many: string]> = {
	sessions: ['session', 'sessions'],
	habitLogs: ['habit log', 'habit logs'],
	activities: ['activity', 'activities'],
	healthReadings: ['health reading', 'health readings'],
	baselineLogs: ['baseline entry', 'baseline entries'],
};

export function countLabel(store: DatedStore, count: number): string {
	return `${count} ${LABELS[store][count === 1 ? 0 : 1]}`;
}

/** "24 sessions · 300 habit logs" — zero counts left out. */
export function describeCounts(counts: Record<DatedStore, number>): string {
	const parts = (Object.keys(LABELS) as DatedStore[])
		.filter((store) => counts[store] > 0)
		.map((store) => countLabel(store, counts[store]));
	return parts.length > 0 ? parts.join(' · ') : 'No dated records';
}
