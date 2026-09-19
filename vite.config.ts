import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
			},

			// Static SPA build: the app is client-only (ssr=false), so emit a single
			// fallback shell that the service worker can serve for any route offline.
			// See https://svelte.dev/docs/kit/adapter-static
			adapter: adapter({ fallback: 'index.html' }),
		}),
	],
});
