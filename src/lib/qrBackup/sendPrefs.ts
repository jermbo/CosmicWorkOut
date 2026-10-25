/**
 * Per-device settings for Send by QR (US-057). Kept out of `cwout:prefs` on purpose:
 * they describe this device and its camera partner, so they never travel in a backup.
 */
import { DENSITIES, SPEEDS } from './frames';
import type { Density, Speed } from './frames';

const LAST_BACKUP_KEY = 'cwout:lastQrBackupAt';
const OPTIONS_KEY = 'cwout:qrSendOptions';

export interface SendOptions {
	density: Density;
	speed: Speed;
}

const DEFAULT_OPTIONS: SendOptions = { density: 'medium', speed: 'normal' };

/** Local date (YYYY-MM-DD) of the last QR backup this device sent, or null. */
export function lastQrBackupDate(): string | null {
	const value = localStorage.getItem(LAST_BACKUP_KEY);
	return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function saveLastQrBackupDate(date: string): void {
	localStorage.setItem(LAST_BACKUP_KEY, date);
}

export function loadSendOptions(): SendOptions {
	try {
		const raw = JSON.parse(localStorage.getItem(OPTIONS_KEY) ?? '{}') as Partial<SendOptions>;
		return {
			density: raw.density && raw.density in DENSITIES ? raw.density : DEFAULT_OPTIONS.density,
			speed: raw.speed && raw.speed in SPEEDS ? raw.speed : DEFAULT_OPTIONS.speed,
		};
	} catch {
		return { ...DEFAULT_OPTIONS };
	}
}

export function saveSendOptions(options: SendOptions): void {
	localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
}
