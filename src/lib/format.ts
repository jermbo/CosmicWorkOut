/** Rounded minutes from seconds. compact: "42m", default: "42 min". */
export function formatDuration(seconds: number, compact = false): string {
	const minutes = Math.round(seconds / 60);
	return compact ? `${minutes}m` : `${minutes} min`;
}

/** Compact weight volume. zero: "dash" shows "—", "zero" shows "0". */
export function formatVolume(volume: number, zero: 'dash' | 'zero' = 'dash'): string {
	if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`;
	if (volume > 0) return String(volume);
	return zero === 'zero' ? '0' : '—';
}
