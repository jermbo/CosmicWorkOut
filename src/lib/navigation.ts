import { resolve } from '$app/paths';

const resolvePath = resolve as (route: string) => string;

/** Resolve dynamic in-app paths (route helpers, props) for href/goto. */
export function resolveHref(path: string): string {
	return resolvePath(path);
}
