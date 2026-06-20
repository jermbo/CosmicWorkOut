# US-014 — Journal Speech Input & Auto-Save

> **Status: ❌ Planned — v1.3.0**
>
> Extends the Journal page (US-012) with two related improvements: fully automatic saving (removing the manual Save button) and dictation support via the browser's native Web Speech API. Auto-save amends the behavior shipped in US-012. No third-party packages required for either feature.

As a **health-conscious user**, I want to dictate my journal entry by voice and have it save automatically
so that I can capture thoughts right after a workout without fumbling to type or remembering to hit save.

---

## Amendments to US-012

The following behaviors from US-012 are superseded by this story:

| US-012 behavior                    | Replacement                                                             |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Manual Save button present on page | Removed — saving is fully automatic                                     |
| Auto-save triggered only on blur   | Replaced by debounced save after typing stops (blur remains a fallback) |
| Clear button present               | Retained — clearing is still an intentional action, not automatic       |

---

## Requirements

1. Auto-save
   a. The journal page shall save the entry automatically after the user stops typing for **1.5 seconds**, with no manual action required.
   b. The Save button shall be removed. There is no explicit save action.
   c. A subtle, non-blocking saved indicator shall appear after each successful auto-save (e.g. "Saved" text that fades out after ~2 seconds). It shall not steal focus or interrupt typing.
   d. Auto-save shall also trigger on page blur (user switches app, taps the browser bar, etc.) as a safety net for fast navigators.
   e. If the entry content has not changed since the last save, no save operation shall be performed.
   f. If the user clears all content and the debounce fires, the entry shall be deleted from storage — an empty auto-save shall not write a blank record.

2. Microphone button
   a. The journal page shall display a microphone button alongside the text entry area.
   b. The button shall only be rendered when the browser supports the Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`). On unsupported browsers, it shall be absent — no disabled state, no error message.
   c. The button shall have two visible states: idle and recording. The recording state shall be clearly distinguishable (e.g. pulsing indicator, color change).
   d. Tapping the button while idle shall start dictation. Tapping it while recording shall stop dictation immediately.

3. Dictation behavior
   a. While the user is speaking, an interim transcript shall be shown as a real-time preview. It shall be visually distinct from committed content (e.g. muted color, italic).
   b. When the speech engine finalizes a result, the transcript shall be appended to the existing committed content. A single space shall be inserted as a separator if the existing content does not already end with whitespace.
   c. Dictation shall run in continuous mode — the session shall not end after a single phrase. The user controls when it ends by tapping the mic button again.
   d. If the browser's engine stops listening on its own after a silence timeout, the app shall automatically restart recognition up to **3 times** before stopping. Each restart shall be seamless to the user — no flicker, no need to re-tap.
   e. If the speech engine produces an empty or whitespace-only transcript, the entry content shall remain unchanged.
   f. If the appended transcript would cause the entry to exceed the 2,000-character limit, the transcript shall be truncated to fit the remaining space. The user shall be notified inline that the character limit was reached.

4. Auto-save interaction with dictation
   a. While dictation is active, the 1.5-second auto-save debounce shall be paused. The interim transcript is not finalized content and shall never be auto-saved.
   b. When a final transcript result is committed (appended to content), the auto-save debounce shall restart from zero — treating the commit as equivalent to the user finishing a keystroke.
   c. When the user stops dictation (taps mic to stop), any finalized content shall be saved immediately rather than waiting for the debounce.
   d. If the user navigates away while dictation is active, dictation shall stop, any finalized transcript shall be committed and saved, and interim-only text shall be discarded before navigation completes.

5. Permissions and errors
   a. If microphone permission has not been granted, the browser's native permission prompt shall appear when the user taps the mic button. The app shall not pre-request permission on page load.
   b. If permission is denied, an inline error message shall appear. It shall be dismissible and shall not affect entry content.
   c. If the speech engine encounters an error (network failure, hardware unavailable, aborted), an inline error message shall appear. It shall be dismissible and shall not clear any content.
   d. Tapping the mic button to retry shall clear any existing error message before the new attempt begins.
   e. Auto-save errors (IndexedDB write failure) shall show the existing app-level toast — no additional error UI is needed on the journal page itself.

---

## Acceptance Criteria

1. Auto-save
   a. Given the user types "Big day today" and stops typing, when 1.5 seconds elapse, then the entry is saved automatically and a brief "Saved" indicator appears.
   b. Given the user is typing continuously, when they have not paused for 1.5 seconds, then no save occurs mid-flow.
   c. Given the entry reads "Hello" and the user types " world" and immediately navigates away, when the page unloads, then the entry "Hello world" is saved before navigation completes.
   d. Given the saved content matches the current content, when the debounce fires, then no write to storage occurs.
   e. Given the user clears all content and waits 1.5 seconds, when the debounce fires, then the entry is deleted from storage and no blank record remains.
   f. Given the page is loaded and no Save button is present, when the user inspects the journal page, then there is no Save button.

2. Microphone button
   a. Given the browser supports `SpeechRecognition`, when the user opens the journal page, then the microphone button is visible.
   b. Given the browser does not support `SpeechRecognition`, when the user opens the journal page, then no microphone button appears and no error is shown.
   c. Given the mic button is idle, when the user taps it, then it enters the recording state with a pulsing or otherwise distinct visual indicator.
   d. Given the mic button is recording, when the user taps it again, then dictation stops and the button returns to idle.

3. Dictation behavior
   a. Given the user is speaking, when words are detected, then interim text appears in a visually distinct (muted/italic) style, separate from committed content.
   b. Given the engine finalizes "went for a run today", when the result is committed, then that phrase is appended to existing content with a space separator.
   c. Given the entry reads "Felt great." and the user dictates "Good workout.", when the phrase is committed, then the entry reads "Felt great. Good workout."
   d. Given the user speaks but nothing is recognized, when the result is received, then the entry content is unchanged.
   e. Given the browser's engine stops after 10 seconds of silence, when this happens fewer than 3 times in a row, then the app silently restarts recognition and the mic button remains in recording state.
   f. Given the browser's engine has stopped and restarted 3 times without the user speaking, when the third timeout occurs, then dictation stops, the mic button returns to idle, and the user is not shown an error.
   g. Given the entry has 1,980 characters and the user dictates 40 characters, when it is committed, then only 20 characters are appended and an inline message notifies the user the limit was reached.

4. Auto-save interaction with dictation
   a. Given dictation is active and 1.5 seconds have passed since the last keystroke, when the debounce would normally fire, then no save occurs while the mic is recording.
   b. Given the engine commits a final result, when the commit happens, then the auto-save debounce resets and saves 1.5 seconds later if no further input occurs.
   c. Given dictation is active, when the user taps the mic button to stop, then the entry is saved immediately without waiting for the debounce.
   d. Given dictation is active with interim text visible, when the user navigates back, then interim text is discarded, finalized content is saved, and the user lands on the previous page.

5. Permissions and errors
   a. Given no mic permission has been granted, when the user taps the mic button, then the browser's native permission dialog appears.
   b. Given the user denies mic permission, when the denial is received, then an inline message states that microphone access is needed and no dictation starts.
   c. Given a permission-denied error is showing, when the user taps the mic button again, then the error clears first, then the permission prompt appears.
   d. Given dictation is active and a network error occurs, when the error is returned by the engine, then dictation stops, an inline error message appears, and all previously committed content is intact.
   e. Given an auto-save fails, when the error occurs, then the app-level error toast appears — no additional message is shown on the journal page.

---

## Open Questions

All resolved.

| Question                    | Decision                                                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interim text placement      | Separate read-only preview area below the textarea. Simpler state management; textarea always holds committed content only.                                            |
| Language / locale           | Browser default locale. No in-app setting for v1.4.0.                                                                                                                  |
| Auto-save debounce duration | 1.5 seconds, defined as a named constant (`AUTOSAVE_DEBOUNCE_MS`) at the top of the journal page so it can be found and tuned without hunting through component logic. |

---

## Browser Compatibility

The `SpeechRecognition` API is a native browser API, but browsers implement it by routing audio to cloud transcription services — Chrome/Edge to Google, Safari to Apple. There is no on-device processing path available through this API. Truly local speech recognition in the browser requires WASM-based ML models (e.g. Whisper WASM), which are 40 MB+ downloads and require additional packages — out of scope for this project.

| Browser            | Status                          | Notes                                                                                                                      |
| ------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Chrome / Edge      | ✅ Full support                 | Audio routed to Google's servers. Recommended for testing and use.                                                         |
| Safari (iOS/macOS) | ✅ Supported                    | Audio routed to Apple's servers. Uses `webkitSpeechRecognition`; works on mobile.                                          |
| Brave              | ⚠️ API present, non-functional  | Blocks Google's speech servers for privacy. Mic button appears (API is detected) but audio is never transcribed — silent failure. |
| Firefox            | ❌ Not supported                | `SpeechRecognition` not implemented; mic button is hidden automatically.                                                   |

---

## Out of Scope

| Item                                   | Notes                                         |
| -------------------------------------- | --------------------------------------------- |
| Custom wake word / always-on listening | Privacy concern; not appropriate here         |
| Transcription of audio files           | Live microphone only                          |
| Language / locale selector             | Browser default for now                       |
| Offline speech recognition             | Controlled by the browser engine, not the app |
| Conflict resolution (two tabs open)    | Single-device, single-tab assumption          |

---

## Related Docs

- [US-012 — Journal Page](./US-012-journal-page.md)
- [App Structure](../../implementation/app-structure.md)
- [Tech Stack](../../architecture/tech-stack.md)
