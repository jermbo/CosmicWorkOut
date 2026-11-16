/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';
import { resolve } from '$app/paths';
import { self } from '$app/service-worker';

// Unique cache name per deploy — `version` changes on every build, so a new
// service worker activates and evicts the previous shell automatically.
const CACHE = `cwout-cache-${version}`;

// SPA shell entry — `/` only; dev has no `/index.html` file (static build does).
const SHELL = [resolve('/')];

// `immutable`/`assets` paths are relative to the base path — resolve them to
// absolute pathnames that match `url.pathname` in the fetch handler.
const PRECACHE = [
	...immutable.map((entry) => resolve(entry.path)),
	...assets.map((entry) => resolve(entry.path)),
	...SHELL,
];

async function serveShell(cache: Cache): Promise<Response | undefined> {
	return (await cache.match(SHELL[0]!)) ?? (await cache.match('/index.html')) ?? undefined;
}

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await self.clients.claim();
		})(),
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Only handle same-origin GETs.
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Precached shell assets are immutable for this version — serve cache-first.
			if (PRECACHE.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}

			// Everything else (navigations included): network-first, fall back to
			// cache when offline. For SPA navigations the static fallback shell is
			// in the cache, so cold offline launches still boot.
			try {
				const response = await fetch(request);
				if (response.ok) cache.put(request, response.clone());
				return response;
			} catch {
				if (request.mode === 'navigate') {
					const shell = await serveShell(cache);
					if (shell) return shell;
				}
				const cached = await cache.match(request);
				if (cached) return cached;
				const shell = await serveShell(cache);
				if (shell) return shell;
				throw new Error('offline and no cached response');
			}
		})(),
	);
});
