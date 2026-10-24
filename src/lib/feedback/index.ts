import { prefsStore } from '$lib/stores/prefs.svelte';
import { TONES, VIBRATION, type FeedbackKind } from './patterns';

export type { FeedbackKind } from './patterns';

/*
 * Haptics + sound for a named moment (v1.12.0). Web standards only: the
 * Vibration API (Android browsers; silently absent elsewhere) and Web Audio
 * (tones are synthesized — no audio files to ship or cache).
 */

let audio: AudioContext | null = null;

function vibrate(kind: FeedbackKind): void {
	if (!prefsStore.hapticsEnabled) return;
	try {
		navigator.vibrate?.(VIBRATION[kind]);
	} catch {
		// Unsupported or blocked — feedback is a nicety, never an error.
	}
}

function play(kind: FeedbackKind): void {
	if (!prefsStore.soundEnabled) return;
	try {
		// Created lazily inside a user gesture, so autoplay rules allow it.
		audio ??= new AudioContext();
		if (audio.state === 'suspended') void audio.resume();
		const now = audio.currentTime;
		for (const tone of TONES[kind]) {
			const start = now + tone.at / 1000;
			const end = start + tone.ms / 1000;
			const osc = audio.createOscillator();
			const gain = audio.createGain();
			osc.type = 'square';
			osc.frequency.setValueAtTime(tone.freq, start);
			gain.gain.setValueAtTime(0.0001, start);
			gain.gain.exponentialRampToValueAtTime(0.06, start + 0.004);
			gain.gain.exponentialRampToValueAtTime(0.0001, end);
			osc.connect(gain).connect(audio.destination);
			osc.start(start);
			osc.stop(end + 0.02);
		}
	} catch {
		// No Web Audio — stay silent.
	}
}

/** Fire the haptic and sound for one moment, each gated by its own pref. */
export function feedback(kind: FeedbackKind): void {
	vibrate(kind);
	play(kind);
}

/** Whether this browser can vibrate at all — Settings hides the switch if not. */
export function canVibrate(): boolean {
	return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function prefersReducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
