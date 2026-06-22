import type { ActivityLog } from '$lib/db/types';
import { formatMinutes } from '$lib/format';

export function activityDisplayName(activity: Pick<ActivityLog, 'type' | 'customType'>): string {
	if (activity.type === 'Other') return activity.customType || 'Other';
	return activity.type;
}

export function formatActivitySummary(
	activity: Pick<ActivityLog, 'type' | 'customType' | 'durationMinutes' | 'intensity'>,
): string {
	return `${activityDisplayName(activity)} · ${formatMinutes(activity.durationMinutes)} · ${activity.intensity}`;
}

export function formatActivityChip(activity: Pick<ActivityLog, 'type' | 'customType' | 'durationMinutes'>): string {
	return `${activityDisplayName(activity)} · ${formatMinutes(activity.durationMinutes)}`;
}
