/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Unique cache name per deploy — `version` changes on every build, so a new
// service worker activates and evicts the previous shell automatically.
const CACHE = `cwout-cache-${version}`;

// App shell: the built JS/CSS bundles plus anything in static/ (icons, manifest…).
const PRECACHE = [...build, ...files];

self.addEventListener('install', (event) => {
	const e = event as ExtendableEvent;
	e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
	(self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

self.addEventListener('activate', (event) => {
	const e = event as ExtendableEvent;
	e.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await (self as unknown as ServiceWorkerGlobalScope).clients.claim();
		})(),
	);
});

self.addEventListener('fetch', (event) => {
	const e = event as FetchEvent;
	const { request } = e;

	// Only handle same-origin GETs. Cross-origin (Google Fonts, etc.) falls
	// through to the network so we never cache opaque third-party responses.
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== location.origin) return;

	e.respondWith(
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
				const cached = await cache.match(request);
				if (cached) return cached;
				const shell = await cache.match('/');
				if (shell) return shell;
				throw new Error('offline and no cached response');
			}
		})(),
	);
});
