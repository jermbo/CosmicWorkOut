<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { journalStore } from '$lib/stores/journal.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { formatLongDate } from '$lib/date';
	import PageHeader from '$lib/components/PageHeader.svelte';

	const MAX_CHARS = 2000;
	const AUTOSAVE_DEBOUNCE_MS = 1500;

	let contextDate = $derived(loggingContext.date);
	let entry = $derived(journalStore.entryForDate(contextDate));

	let content = $state('');
	let savedContent = $state('');
	let saving = $state(false);
	let savedIndicator = $state(false);
	let savedIndicatorTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		contextDate;
		const val = untrack(() => journalStore.entryForDate(contextDate)?.content ?? '');
		content = val;
		savedContent = val;
	});

	let isDirty = $derived(content !== savedContent);
	let charsLeft = $derived(MAX_CHARS - content.length);

	$effect(() => {
		const snapshot = content;
		if (snapshot === savedContent) return;

		const timer = setTimeout(() => doSave(), AUTOSAVE_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	});

	function showSaved() {
		savedIndicator = true;
		if (savedIndicatorTimer) clearTimeout(savedIndicatorTimer);
		savedIndicatorTimer = setTimeout(() => (savedIndicator = false), 2000);
	}

	async function doSave() {
		if (saving) return;
		const snapshot = content;
		if (snapshot === savedContent) return;
		saving = true;
		try {
			if (snapshot.trim()) {
				await journalStore.save(contextDate, snapshot);
				savedContent = snapshot;
			} else {
				await journalStore.clear(contextDate);
				savedContent = '';
				content = '';
			}
			showSaved();
		} catch {
			// DB errors are surfaced by the app-level toast in the store
		} finally {
			saving = false;
		}
	}

	function handleBlur() {
		if (isDirty) doSave();
	}

	async function clearEntry() {
		content = '';
		await doSave();
	}

	onDestroy(() => {
		if (isDirty) doSave();
	});
</script>

<svelte:head>
	<title>Journal — CosmicWorkOut</title>
</svelte:head>

<div class="page journal-page">
	<PageHeader title="Journal" showBack />

	<div class="journal-body">
		<p class="journal-date">{formatLongDate(contextDate)}</p>

		<div class="journal-editor">
			<textarea
				class="journal-textarea"
				bind:value={content}
				onblur={handleBlur}
				maxlength={MAX_CHARS}
				placeholder="Write your thoughts for today…"
				aria-label="Journal entry"
			></textarea>

			<div class="editor-toolbar">
				{#if savedIndicator}
					<span class="saved-indicator" aria-live="polite">Saved</span>
				{/if}
				<span class="journal-chars" class:journal-chars--warn={charsLeft < 100}>
					{charsLeft}
				</span>
			</div>
		</div>

		{#if entry}
			<button class="journal-clear-btn" type="button" onclick={clearEntry}>
				Clear entry
			</button>
		{/if}
	</div>
</div>

<style>
	.journal-page {
		inline-size: 100%;
	}

	.journal-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-inline-size: 640px;
	}

	.journal-date {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.journal-editor {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.journal-textarea {
		inline-size: 100%;
		min-block-size: 280px;
		padding: var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font: inherit;
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-text-primary);
		resize: vertical;
		outline: none;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:focus {
			border-color: var(--color-accent);
		}

		&::placeholder {
			color: var(--color-text-muted);
		}
	}

	.editor-toolbar {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-3);
		min-block-size: 28px;
	}

	.saved-indicator {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-accent);
		animation: fade-out 2s ease-out forwards;
	}

	@keyframes fade-out {
		0%,
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.journal-chars {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.journal-chars--warn {
		color: var(--color-red);
	}

	.journal-clear-btn {
		inline-size: 100%;
		max-inline-size: 640px;
		block-size: 44px;
		border-radius: var(--radius-full);
		background: transparent;
		border: 1px solid color-mix(in srgb, var(--color-red) 40%, transparent);
		color: var(--color-red);
		font-size: 0.9375rem;
		font-weight: 600;
	}
</style>
