import type {
	HealthMetricId,
	HealthReading,
	WeightValues,
	BloodPressureValues,
} from '$lib/db/types';
import { addDays } from '$lib/date';

export type MetricCardinality = 'single' | 'multiple';

export interface HealthMetricDef {
	id: HealthMetricId;
	label: string;
	cardinality: MetricCardinality;
}

/**
 * App-defined catalog of health metrics. Definitions live in code (versioned with
 * the app), not IndexedDB — no user-created metrics. Add a row + reading shape to
 * extend; no schema fork.
 */
export const HEALTH_METRICS: HealthMetricDef[] = [
	{ id: 'weight', label: 'Weight', cardinality: 'single' },
	{ id: 'bloodPressure', label: 'Blood Pressure', cardinality: 'multiple' },
];

export function getMetricDef(id: HealthMetricId): HealthMetricDef | undefined {
	return HEALTH_METRICS.find((m) => m.id === id);
}

export function isWeightReading(
	reading: HealthReading,
): reading is HealthReading & { values: WeightValues } {
	return reading.metricId === 'weight';
}

export function isBloodPressureReading(
	reading: HealthReading,
): reading is HealthReading & { values: BloodPressureValues } {
	return reading.metricId === 'bloodPressure';
}

export interface BloodPressureDailyAverage {
	date: string;
	systolic: number;
	diastolic: number;
	pulse: number | null;
}

/**
 * Collapse a list of BP readings into one average row per date. Used by Insights
 * charts and summary stats. Readings without pulse are excluded from the pulse
 * average; a date with no pulse readings yields `pulse: null`.
 */
export function bloodPressureDailyAverages(readings: HealthReading[]): BloodPressureDailyAverage[] {
	const byDate = new Map<string, BloodPressureValues[]>();
	for (const r of readings) {
		if (!isBloodPressureReading(r)) continue;
		const list = byDate.get(r.date) ?? [];
		list.push(r.values);
		byDate.set(r.date, list);
	}

	const result: BloodPressureDailyAverage[] = [];
	for (const [date, values] of byDate) {
		const sys = values.reduce((sum, v) => sum + v.systolic, 0) / values.length;
		const dia = values.reduce((sum, v) => sum + v.diastolic, 0) / values.length;
		const pulses = values.map((v) => v.pulse).filter((p): p is number => typeof p === 'number');
		const pulse = pulses.length > 0 ? pulses.reduce((s, p) => s + p, 0) / pulses.length : null;
		result.push({
			date,
			systolic: Math.round(sys),
			diastolic: Math.round(dia),
			pulse: pulse === null ? null : Math.round(pulse),
		});
	}

	return result.sort((a, b) => a.date.localeCompare(b.date));
}

/** Average of the last `days` of BP daily averages, or null when no data in window. */
export function rollingBpAverage(
	readings: HealthReading[],
	days: number,
	today: string,
): { systolic: number; diastolic: number } | null {
	const cutoffStr = addDays(today, -(days - 1));

	const dailies = bloodPressureDailyAverages(readings).filter(
		(d) => d.date >= cutoffStr && d.date <= today,
	);
	if (dailies.length === 0) return null;

	const sys = dailies.reduce((s, d) => s + d.systolic, 0) / dailies.length;
	const dia = dailies.reduce((s, d) => s + d.diastolic, 0) / dailies.length;
	return { systolic: Math.round(sys), diastolic: Math.round(dia) };
}
