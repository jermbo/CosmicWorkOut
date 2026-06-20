<script lang="ts">
	import { journalStore } from '$lib/stores/journal.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { formatLongDate } from '$lib/date';
	import PageHeader from '$lib/components/PageHeader.svelte';

	const MAX_CHARS = 2000;

	let contextDate = $derived(loggingContext.date);
	let entry = $derived(journalStore.entryForDate(contextDate));

	let content = $state('');
	let savedContent = $state('');
	let saving = $state(false);
	let saved = $state(false);
	let savedTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		const val = entry?.content ?? '';
		content = val;
		savedContent = val;
	});

	let isDirty = $derived(content !== savedContent);
	let charsLeft = $derived(MAX_CHARS - content.length);

	async function handleSave() {
		if (saving) return;
		const trimmed = content.trim();
		saving = true;
		try {
			if (trimmed) {
				await journalStore.save(contextDate, trimmed);
				savedContent = trimmed;
				content = trimmed;
			} else {
				await journalStore.clear(contextDate);
				savedContent = '';
				content = '';
			}
			saved = true;
			if (savedTimer) clearTimeout(savedTimer);
			savedTimer = setTimeout(() => (saved = false), 2000);
		} finally {
			saving = false;
		}
	}

	function handleBlur() {
		if (isDirty) handleSave();
	}
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
			<p class="journal-chars" class:journal-chars--warn={charsLeft < 100}>
				{charsLeft} characters remaining
			</p>
		</div>

		<div class="journal-footer">
			<button
				class="journal-save-btn"
				onclick={handleSave}
				disabled={saving || !isDirty}
				aria-busy={saving}
			>
				{#if saving}
					Saving…
				{:else if saved && !isDirty}
					Saved
				{:else}
					Save entry
				{/if}
			</button>

			{#if entry && !isDirty}
				<button class="journal-clear-btn" onclick={() => { content = ''; handleSave(); }}>
					Clear entry
				</button>
			{/if}
		</div>
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

	.journal-chars {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-align: end;
	}

	.journal-chars--warn {
		color: var(--color-red);
	}

	.journal-footer {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.journal-save-btn {
		inline-size: 100%;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 1rem;
		font-weight: 700;
		transition: opacity var(--duration-fast) var(--ease-out);

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
	}

	.journal-clear-btn {
		inline-size: 100%;
		block-size: 44px;
		border-radius: var(--radius-full);
		background: transparent;
		border: 1px solid color-mix(in srgb, var(--color-red) 40%, transparent);
		color: var(--color-red);
		font-size: 0.9375rem;
		font-weight: 600;
	}
</style>
