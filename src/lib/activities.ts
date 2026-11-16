import type { ActivityLog } from '$lib/db/types';
import { formatMinutes } from '$lib/format';

/** `name` is the entry's type name — `activityStore.nameOf(activity)`. */
export function formatActivitySummary(
	name: string,
	activity: Pick<ActivityLog, 'durationMinutes' | 'intensity'>,
): string {
	return `${name} · ${formatMinutes(activity.durationMinutes)} · ${activity.intensity}`;
}

/** `name` is the entry's type name — `activityStore.nameOf(activity)`. */
export function formatActivityChip(
	name: string,
	activity: Pick<ActivityLog, 'durationMinutes'>,
): string {
	return `${name} · ${formatMinutes(activity.durationMinutes)}`;
}
