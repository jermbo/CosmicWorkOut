import type { HealthReading, WeightValues, BloodPressureValues } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';
import { isWeightReading, isBloodPressureReading } from '$lib/health/metrics';

class HealthStore {
	readings = $state<HealthReading[]>([]);
	loaded = $state(false);

	async load(): Promise<void> {
		this.readings = await db.healthReadings.getAll();
		this.loaded = true;
	}

	readingsForDate(date: string): HealthReading[] {
		return this.readings.filter((r) => r.date === date);
	}

	/** At most one weight reading per date. */
	weightForDate(date: string): (HealthReading & { values: WeightValues }) | undefined {
		return this.readings.find(
			(r): r is HealthReading & { values: WeightValues } => r.date === date && isWeightReading(r),
		);
	}

	/** All BP readings for a date, ordered by time recorded. */
	bloodPressureForDate(date: string): (HealthReading & { values: BloodPressureValues })[] {
		return this.readings
			.filter((r): r is HealthReading & { values: BloodPressureValues } => r.date === date && isBloodPressureReading(r))
			.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
	}

	hasReadingOnDate(date: string): boolean {
		return this.readings.some((r) => r.date === date);
	}

	latestWeight(): (HealthReading & { values: WeightValues }) | undefined {
		let latest: (HealthReading & { values: WeightValues }) | undefined;
		for (const r of this.readings) {
			if (!isWeightReading(r)) continue;
			if (!latest || r.date > latest.date) latest = r;
		}
		return latest;
	}

	/** Upsert the single weight reading for a date. */
	async logWeight(date: string, value: number): Promise<void> {
		const existing = this.weightForDate(date);
		const reading: HealthReading = {
			id: existing?.id ?? generateId(),
			metricId: 'weight',
			date,
			recordedAt: new Date().toISOString(),
			values: { value },
		};
		await db.healthReadings.put(reading);
		this.readings = [...this.readings.filter((r) => r.id !== reading.id), reading];
	}

	async addBloodPressure(date: string, values: BloodPressureValues): Promise<void> {
		const reading: HealthReading = {
			id: generateId(),
			metricId: 'bloodPressure',
			date,
			recordedAt: new Date().toISOString(),
			values,
		};
		await db.healthReadings.put(reading);
		this.readings = [...this.readings, reading];
	}

	async updateReading(reading: HealthReading): Promise<void> {
		await db.healthReadings.put(reading);
		this.readings = this.readings.map((r) => (r.id === reading.id ? reading : r));
	}

	async deleteReading(id: string): Promise<void> {
		await db.healthReadings.remove(id);
		this.readings = this.readings.filter((r) => r.id !== id);
	}
}

export const healthStore = new HealthStore();
