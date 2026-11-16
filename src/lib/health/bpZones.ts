/*
 * Pure logic behind the Health card on Insights (v1.13.0, US-060): blood-pressure
 * zones, the readings of a range, and the headline numbers. No stores, no DOM —
 * tested in src/lib/health/bpZones.test.ts. See docs/architecture/health-card.md.
 */
import type { BloodPressureValues, HealthReading, WeightValues } from '#lib/db/types';

export type BpZoneId = 'normal' | 'elevated' | 'stage1' | 'stage2' | 'severe';

export interface BpZoneDef {
	id: BpZoneId;
	label: string;
	/** Hex, because SVG presentation attributes don't resolve CSS variables. */
	color: string;
}

/** American Heart Association categories, lowest first. */
export const BP_ZONES: readonly BpZoneDef[] = [
	{ id: 'normal', label: 'Normal', color: '#5aca94' },
	{ id: 'elevated', label: 'Elevated', color: '#eed059' },
	{ id: 'stage1', label: 'Stage 1', color: '#e5a14b' },
	{ id: 'stage2', label: 'Stage 2', color: '#ff6557' },
	{ id: 'severe', label: 'Severe', color: '#e8458b' },
];

/** The top of Normal, drawn as dashed guide lines. */
export const BP_NORMAL_LIMIT = { systolic: 120, diastolic: 80 } as const;

/** A reading takes the higher zone of its two numbers. */
export function bpZone(systolic: number, diastolic: number): BpZoneDef {
	let id: BpZoneId = 'normal';
	if (systolic > 180 || diastolic > 120) id = 'severe';
	else if (systolic >= 140 || diastolic >= 90) id = 'stage2';
	else if (systolic >= 130 || diastolic >= 80) id = 'stage1';
	else if (systolic >= 120) id = 'elevated';
	return BP_ZONES.find((z) => z.id === id) as BpZoneDef;
}

export interface BpRow {
	id: string;
	date: string;
	recordedAt: string;
	/** Local time of day, `07:05`. */
	time: string;
	systolic: number;
	diastolic: number;
	pulse: number | null;
	zone: BpZoneDef;
}

/** `2026-09-21T07:05:00.000Z` → local `HH:MM`; empty when the value is not a date. */
export function timeOfDay(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function isBp(r: HealthReading): r is HealthReading & { values: BloodPressureValues } {
	return r.metricId === 'bloodPressure';
}

function isWeight(r: HealthReading): r is HealthReading & { values: WeightValues } {
	return r.metricId === 'weight';
}

/** Every blood-pressure reading on the given dates, oldest first (date, then time). */
export function bpReadingsIn(
	readings: readonly HealthReading[],
	dates: readonly string[],
): BpRow[] {
	const inRange = new Set(dates);
	return readings
		.filter(isBp)
		.filter((r) => inRange.has(r.date))
		.sort((a, b) => a.date.localeCompare(b.date) || a.recordedAt.localeCompare(b.recordedAt))
		.map((r) => ({
			id: r.id,
			date: r.date,
			recordedAt: r.recordedAt,
			time: timeOfDay(r.recordedAt),
			systolic: r.values.systolic,
			diastolic: r.values.diastolic,
			pulse: typeof r.values.pulse === 'number' ? r.values.pulse : null,
			zone: bpZone(r.values.systolic, r.values.diastolic),
		}));
}

/** Average of every reading (not of daily averages), rounded, with its zone. */
export function averageBp(
	rows: readonly BpRow[],
): { systolic: number; diastolic: number; zone: BpZoneDef } | null {
	if (rows.length === 0) return null;
	const systolic = Math.round(rows.reduce((s, r) => s + r.systolic, 0) / rows.length);
	const diastolic = Math.round(rows.reduce((s, r) => s + r.diastolic, 0) / rows.length);
	return { systolic, diastolic, zone: bpZone(systolic, diastolic) };
}

export interface WeightRow {
	date: string;
	value: number;
}

/** One weight per date on the given dates, oldest first. */
export function weightsIn(
	readings: readonly HealthReading[],
	dates: readonly string[],
): WeightRow[] {
	const byDate = new Map<string, number>();
	for (const r of readings) {
		if (isWeight(r)) byDate.set(r.date, r.values.value);
	}
	return dates.flatMap((date) => {
		const value = byDate.get(date);
		return value === undefined ? [] : [{ date, value }];
	});
}

/** The last weight and its change since the first weight of the range. */
export function weightChange(
	rows: readonly WeightRow[],
): { latest: number; change: number | null } | null {
	if (rows.length === 0) return null;
	const latest = rows[rows.length - 1].value;
	const change = rows.length < 2 ? null : Math.round((latest - rows[0].value) * 10) / 10;
	return { latest, change };
}

export interface LogDay {
	date: string;
	weight: number | null;
	readings: BpRow[];
}

/** Log view: dates with a weight or a reading, newest first; readings newest first. */
export function healthLog(bp: readonly BpRow[], weights: readonly WeightRow[]): LogDay[] {
	const days = new Map<string, LogDay>();
	const day = (date: string) => {
		let d = days.get(date);
		if (!d) {
			d = { date, weight: null, readings: [] };
			days.set(date, d);
		}
		return d;
	};
	for (const w of weights) day(w.date).weight = w.value;
	for (const r of bp) day(r.date).readings.push(r);
	return [...days.values()]
		.sort((a, b) => b.date.localeCompare(a.date))
		.map((d) => ({ ...d, readings: [...d.readings].reverse() }));
}
