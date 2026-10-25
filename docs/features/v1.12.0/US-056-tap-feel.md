[Wiki](../../README.md) › [Features](../README.md) › [v1.12.0](./README.md) › US-056

# US-056 — Tap Feel: Motion, Haptics & Sound

> **As built:** `src/lib/feedback/` — `patterns.ts` (pure: feedback kinds, vibration patterns, tones, tap-to-kind rules, hold-repeat timing; tested in `src/lib/feedback.test.ts`), `index.ts` (`feedback(kind)`: Vibration API + synthesized Web Audio, each gated by a pref), `press.ts` (one delegated Pointer Events handler installed by the root layout; Web Animations API on `translate` / `scale`), `holdRepeat.ts` (Svelte action on +/- buttons). Removed every CSS `:active` sink rule so presses don't double up. New components `RollingNumber` and `CountUp`. The live exercise's blue field is one plate behind the list in `SessionOverlay`, moved by `plateKeyframes()` (`src/lib/feedback/plate.ts`) — lift, stretch, let go, set down; this replaced a white flash on exercise complete that read as harsh. Before the plate moves, `handoffScrollTop()` scrolls the list so both cards (or at least the next one) are on screen, and the plate waits `PLATE_SCROLL_MS` longer when it had to scroll. New prefs `hapticsEnabled` (default on) and `soundEnabled` (default off) on Personalization → Feedback. Page changes use the View Transitions API via `onNavigate`; the nav has its own `view-transition-name`. No iOS haptic workaround — web standards only, by request.

---

As a **Fitness User**, I want every tap to feel physical and every milestone to feel earned, so that logging a workout is satisfying enough that I keep doing it.

---

## Decisions

| Area          | Decision                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| **Standards** | Web standards only: Pointer Events, Web Animations, View Transitions, Vibration, Web Audio. No libraries. |
| **iOS**       | No haptic workaround. Safari has no Vibration API, so iPhones get motion and sound but no buzz.           |
| **Haptics**   | On by default. The switch only shows where the browser can vibrate.                                       |
| **Sound**     | Off by default. Tones are synthesized — no audio files.                                                   |
| **Hold +/-**  | Holding a +/- button repeats, speeding up. A normal tap still steps once.                                 |

## Feedback vocabulary

| Kind      | When                                                       | Haptic (ms)            |
| --------- | ---------------------------------------------------------- | ---------------------- |
| `tap`     | Any button, card or link                                   | 10                     |
| `select`  | Choosing one of several: nav, tabs, radios, toggles, chips | 6                      |
| `tick`    | Each step of a held +/-                                    | 4                      |
| `success` | Set logged, habit goal hit, a save                         | 14 · 40 · 22           |
| `win`     | Exercise finished, session finished                        | 20 · 50 · 20 · 50 · 45 |
| `warn`    | Delete, danger confirms                                    | 30 · 60 · 30           |

Elements pick their kind from markup; `data-feedback="…"` overrides it, and `data-press="none"` opts an element out of the press motion.

---

## Requirements

1. Press
   a. Every tappable element shall move when pressed: elements with a hard shadow sink into it; flat ones squish.
   b. On release it shall spring back with a small overshoot.
   c. Scrolling shall not leave an element stuck pressed.
2. Haptics and sound
   a. Taps, selections, milestones and destructive actions shall each give their own feedback.
   b. Haptics and sound shall each have an on / off switch; sound starts off.
3. Motion
   a. Changing figures shall roll instead of snapping.
   b. Logging a set shall stamp the tile and fill a progress segment.
   c. Finishing an exercise shall stamp DONE and move the live blue field to the next exercise without a color flash.
   d. If the next exercise is off screen, the list shall scroll it into view before the field moves.
   e. Finishing a session shall play a full-screen burst and count up the stats.
   f. Pages, titles, cards and sheets shall animate in.
4. Hold to repeat
   a. Holding a +/- button shall keep stepping, faster over time, without one extra step on release.
5. Accessibility
   a. With reduced motion on, motion shall be skipped or near-instant; haptics and sound still follow their switches.

---

## Acceptance Criteria

1. Press
   a. Given an Overview card, when the user presses it, then it sinks into its shadow and springs back on release.
   b. Given a list, when the user starts a scroll on a button, then the button returns to rest.
2. Haptics and sound
   a. Given an Android phone with haptics on, when the user logs a set, then the phone buzzes with the success pattern.
   b. Given sound on, when the user finishes a session, then a short rising tone plays.
3. Motion
   a. Given the log-set sheet, when the user taps +, then the weight rolls up.
   b. Given the last set of an exercise, when it's logged, then DONE stamps over the card, and the blue plate lifts, stretches over the next exercise, lets go of the finished one and sets down.
4. Hold to repeat
   a. Given a habit's +, when the user holds it for a second, then the value climbs several steps and does not add one more on release.
5. Accessibility
   a. Given reduced motion, when the user presses a card, then nothing moves.

---

## Related Docs

- [Design System — Motion & feedback](../../architecture/design-system.md#motion--feedback)
- [US-055 — Color Fields Redesign](./US-055-color-fields-redesign.md)
- [Settings & Preferences](../../requirements/settings-preferences.md)
