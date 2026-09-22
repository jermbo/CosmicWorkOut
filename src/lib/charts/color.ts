/** `#rrggbb` + alpha → `rgba(...)`. Non-hex input is returned unchanged. Pure. */
export function withAlpha(color: string, alpha: number): string {
	const hex = color.trim().replace('#', '');
	if (!/^[0-9a-f]{6}$/i.test(hex)) return color;
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}
