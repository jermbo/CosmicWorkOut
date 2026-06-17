import type { ActivityLog } from '$lib/db/types';
import { formatMinutes } from '$lib/format';

export function activityDisplayName(activity: Pick<ActivityLog, 'type' | 'customType'>): string {
	return activity.type === 'Other' ? activity.customType || 'Other' : activity.type;
}

/** e.g. "Run · 30 min · Moderate" */
export function formatActivitySummary(
	activity: Pick<ActivityLog, 'type' | 'customType' | 'durationMinutes' | 'intensity'>,
): string {
	return `${activityDisplayName(activity)} · ${formatMinutes(activity.durationMinutes)} · ${activity.intensity}`;
}

/** Activity line without intensity, e.g. for compact chips. */
export function formatActivityChip(
	activity: Pick<ActivityLog, 'type' | 'customType' | 'durationMinutes'>,
): string {
	return `${activityDisplayName(activity)} · ${formatMinutes(activity.durationMinutes)}`;
}
