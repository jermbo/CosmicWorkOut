<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { journalStore } from '$lib/stores/journal.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { formatLongDate } from '$lib/date';
	import PageHeader from '$lib/components/PageHeader.svelte';

	const MAX_CHARS = 2000;
	const AUTOSAVE_DEBOUNCE_MS = 1500;
	const MAX_SILENCE_RESTARTS = 3;

	// Detect Web Speech API support (webkit-prefixed for Safari)
	const SR: any =
		typeof window !== 'undefined'
			? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null)
			: null;
	const speechSupported = SR !== null;

	let contextDate = $derived(loggingContext.date);
	let entry = $derived(journalStore.entryForDate(contextDate));

	let content = $state('');
	let savedContent = $state('');
	let saving = $state(false);
	let savedIndicator = $state(false);
	let savedIndicatorTimer: ReturnType<typeof setTimeout> | null = null;

	// Speech state
	let isRecording = $state(false);
	let interimText = $state('');
	let speechError = $state<string | null>(null);
	let limitReached = $state(false);
	let limitReachedTimer: ReturnType<typeof setTimeout> | null = null;
	let recognition: any = null;
	let stoppingIntentionally = false;
	let silenceRestarts = 0;

	// Load entry when date changes. Use untrack for the store read so saving
	// doesn't re-trigger this effect and overwrite in-progress edits.
	$effect(() => {
		contextDate;
		const val = untrack(() => journalStore.entryForDate(contextDate)?.content ?? '');
		if (isRecording) {
			stoppingIntentionally = true;
			recognition?.stop();
			isRecording = false;
			interimText = '';
		}
		content = val;
		savedContent = val;
	});

	let isDirty = $derived(content !== savedContent);
	let charsLeft = $derived(MAX_CHARS - content.length);

	// Debounced auto-save — paused while recording so interim text is never persisted
	$effect(() => {
		if (isRecording) return;
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

	function showLimitReached() {
		limitReached = true;
		if (limitReachedTimer) clearTimeout(limitReachedTimer);
		limitReachedTimer = setTimeout(() => (limitReached = false), 4000);
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
		if (isDirty && !isRecording) doSave();
	}

	function appendTranscript(text: string) {
		const trimmed = text.trim();
		if (!trimmed) return;

		const separator = content.length > 0 && !content.endsWith(' ') ? ' ' : '';
		const toAppend = separator + trimmed;
		const available = MAX_CHARS - content.length;

		if (toAppend.length > available) {
			if (available > separator.length) {
				content = content + toAppend.slice(0, available);
			}
			showLimitReached();
		} else {
			content = content + toAppend;
		}

		silenceRestarts = 0;
	}

	function finishRecording() {
		isRecording = false;
		stoppingIntentionally = false;
		silenceRestarts = 0;
		if (isDirty) doSave();
	}

	// Creates a fresh SR instance. Called on first start and on each silence restart.
	function createAndStart() {
		if (!SR) return;

		recognition = new SR();
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onresult = (event: any) => {
			let interim = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) {
					appendTranscript(event.results[i][0].transcript);
				} else {
					interim += event.results[i][0].transcript;
				}
			}
			interimText = interim;
		};

		recognition.onend = () => {
			interimText = '';
			if (!stoppingIntentionally && silenceRestarts < MAX_SILENCE_RESTARTS) {
				silenceRestarts++;
				createAndStart();
			} else {
				finishRecording();
			}
		};

		recognition.onerror = (event: any) => {
			// 'no-speech' is the silence timeout — let onend handle the restart
			if (event.error === 'no-speech') return;
			speechError =
				event.error === 'not-allowed'
					? 'Microphone access is required for dictation.'
					: 'Speech recognition error. Please try again.';
			stoppingIntentionally = true; // prevent restart in onend
		};

		recognition.start();
	}

	function startRecognition() {
		speechError = null;
		stoppingIntentionally = false;
		silenceRestarts = 0;
		isRecording = true;
		createAndStart();
	}

	function stopRecognition() {
		stoppingIntentionally = true;
		recognition?.stop();
	}

	function toggleRecording() {
		if (isRecording) {
			stopRecognition();
		} else {
			startRecognition();
		}
	}

	async function clearEntry() {
		content = '';
		await doSave();
	}

	onDestroy(() => {
		if (isRecording) {
			stoppingIntentionally = true;
			recognition?.stop();
		}
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
				class:journal-textarea--recording={isRecording}
				bind:value={content}
				onblur={handleBlur}
				maxlength={MAX_CHARS}
				placeholder={isRecording ? 'Listening…' : 'Write your thoughts for today…'}
				aria-label="Journal entry"
			></textarea>

			<div class="editor-toolbar">
				{#if speechSupported}
					<button
						class="mic-btn"
						class:mic-btn--recording={isRecording}
						type="button"
						onclick={toggleRecording}
						aria-label={isRecording ? 'Stop dictation' : 'Start dictation'}
						aria-pressed={isRecording}
					>
						<svg
							class="mic-btn__icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
							<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
							<line x1="12" y1="19" x2="12" y2="23" />
							<line x1="8" y1="23" x2="16" y2="23" />
						</svg>
						{#if isRecording}
							<span class="mic-btn__pulse" aria-hidden="true"></span>
						{/if}
					</button>
				{/if}

				<div class="editor-meta">
					{#if savedIndicator}
						<span class="saved-indicator" aria-live="polite">Saved</span>
					{/if}
					<span class="journal-chars" class:journal-chars--warn={charsLeft < 100}>
						{charsLeft}
					</span>
				</div>
			</div>

			{#if interimText}
				<p class="interim-preview" aria-live="polite" aria-atomic="true">
					{interimText}
				</p>
			{/if}

			{#if limitReached}
				<p class="limit-warning" role="alert">
					Character limit reached — some dictated text was cut off.
				</p>
			{/if}

			{#if speechError}
				<div class="speech-error" role="alert">
					<p class="speech-error__msg">{speechError}</p>
					<button
						class="speech-error__dismiss"
						type="button"
						onclick={() => (speechError = null)}
						aria-label="Dismiss error"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			{/if}
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

	.journal-textarea--recording {
		border-color: #ef4444;

		&:focus {
			border-color: #ef4444;
		}
	}

	/* Toolbar row: mic button on the left, meta on the right */
	.editor-toolbar {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: 28px;
	}

	.editor-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-inline-start: auto;
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

	/* Mic button */
	.mic-btn {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);

		&:hover {
			color: var(--color-accent);
			border-color: var(--color-accent);
		}
	}

	.mic-btn--recording {
		background: color-mix(in srgb, #ef4444 12%, transparent);
		border-color: #ef4444;
		color: #ef4444;

		&:hover {
			color: #ef4444;
			border-color: #ef4444;
		}
	}

	.mic-btn__icon {
		inline-size: 16px;
		block-size: 16px;
		position: relative;
		z-index: 1;
	}

	.mic-btn__pulse {
		position: absolute;
		inset: -4px;
		border-radius: var(--radius-full);
		border: 2px solid #ef4444;
		animation: pulse-ring 1.5s ease-out infinite;
		pointer-events: none;
	}

	@keyframes pulse-ring {
		0% {
			transform: scale(1);
			opacity: 0.7;
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	/* Interim preview */
	.interim-preview {
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Limit warning */
	.limit-warning {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-red);
	}

	/* Speech error */
	.speech-error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: color-mix(in srgb, #ef4444 8%, var(--color-surface-2));
		border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
		border-radius: var(--radius-lg);
	}

	.speech-error__msg {
		font-size: 0.875rem;
		color: var(--color-text-primary);
		line-height: 1.4;
	}

	.speech-error__dismiss {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 28px;
		block-size: 28px;
		flex-shrink: 0;
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);

		svg {
			inline-size: 14px;
			block-size: 14px;
		}
	}

	/* Clear button */
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
