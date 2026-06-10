# Packet — Developer Handoff

> Offline-first workout tracker for pickleball players following a structured 3-month strength program.

## Overview

Packet is a mobile-first PWA. The name comes from the physical training packets coaches hand out: stapled pages, each one a self-contained block with a purpose and a clear arc.

The primary action is **logging a workout set in under 5 seconds, one-handed, after a pickleball session**. Every design decision flows from this constraint.

---

## About the Design Files

The files in `packet/` are **high-fidelity design references built in HTML + React (Babel)**. They are interactive prototypes showing exact intended look, feel, and behavior — not production code to ship directly.

**Your task:** Recreate these designs in your target codebase (React Native / Expo, or a web stack) using its established patterns, libraries, and conventions. Pixel accuracy matters on colors, typography, spacing, and animation timing. All values are specified in `Packet Design Handoff.html`.

Open `packet/Packet.html` in a browser to see the full interactive prototype before reading further.

---

## Fidelity

**High fidelity.** The mocks are pixel-complete with final colors, typography, spacing, motion curves, and micro-interactions. Implement to spec. The Tweaks panel in the prototype (toolbar top-right) lets you explore accent colors, logging modes, completion feel, density, and roundness.

---

## Screens (in order)

| # | Screen | Route / Layer | Entry |
|---|--------|--------------|-------|
| 01 | Today View | `/` tab 1 | Default |
| 02 | Active Session | Full-screen overlay | "Start session" CTA |
| 03 | Log Set Sheet | Bottom sheet | Set tile tap |
| 04 | Session Complete | Full-screen overlay | "Finish session" |
| 05 | Calendar / History | `/calendar` tab 3 | Bottom nav |
| 06 | Day Summary | Bottom sheet | Completed day tap |
| 07 | Program View | `/program` tab 2 | Bottom nav |
| 08 | Workout Editor | Full-screen overlay | "Edit" on workout card |
| 09 | Exercise Library | Bottom sheet | "Browse library" in editor |

Full spec for each screen: see `Packet Design Handoff.html` § Screens.

---

## Core UX Principles

1. **5-second set log.** Default mode is instant-tap: one tap logs the set at last-used weight + target reps. No sheet required. User can switch to stepper or numpad in settings.
2. **Tactile and satisfying.** Set tile completion has a spring pop animation + haptic. Exercise completion has a ring fill + ripple + confetti (configurable intensity).
3. **Notebook aesthetic.** The packet hero card has ruled line texture, a colored staple-tab row, dashed exercise list separators — evoking a physical training page.
4. **Dark mode only.** No light mode. Background: `#101010`. Accent: `#B2F042` (lime) by default, user-configurable.

---

## Key Interactions

### Set tile tap (instant mode)
```
tap → scale(0.93) immediately →
  white flash overlay (opacity 0.4→0, 280ms) →
  tile bg transitions to accent (220ms ease-out) →
  tilePop keyframe: 0→scale(0.93)→scale(1.06)→scale(1), 220ms ease-spring →
  weight/reps text fades in
```

### Exercise completion
```
last set logged →
  card border pulses accent (ripple: scale 1→1.04, opacity 0.8→0, 600ms) →
  checkmark fades in (scale 0.5→1, 220ms ease-spring) →
  card bg tints 7% accent →
  haptic: navigator.vibrate([12, 40, 18])
```

### Session complete
```
"Finish session" tap →
  full-screen overlay fades in (220ms) →
  check circle pops: scale 0→1.12→1, 380ms ease-spring →
  confetti: 64 pieces, 1.4–2.8s fall, stagger 0–400ms
  (skip if completionFeel === 'subtle')
```

---

## Data Model

See full TypeScript interfaces in `Packet Design Handoff.html` § Data Model.

**Summary:**
- `Exercise` — id, name, cue, sets, reps (string), unit (lb/band/bw)
- `Workout` — packet/week/letter, exercises[]
- `SessionLog` — uuid, date, exercises with sets logged, volume
- `TrainingDay` — date, status (done/today/scheduled/skipped/rest)
- `UserPrefs` — accent, loggingMode, completionFeel, showEmoji, density, roundness

---

## Offline & Persistence

| Store | Data | When |
|-------|------|------|
| IndexedDB `sessions` | All `SessionLog` records | Write immediately on set confirm |
| IndexedDB `program` | User's workout definitions | Write on editor save |
| IndexedDB `exerciseLastUsed` | Last weight/reps per exercise | Write on set confirm |
| `localStorage:packet:prefs` | `UserPrefs` JSON | Write on every preference change |
| `localStorage:packet:activeSession` | In-progress session state | Write on every set confirm (crash recovery) |

**Crash recovery:** On app boot, if `activeSession` key exists and date = today, offer to resume. On finish or abandon, clear the key.

No network dependency after initial load. Service worker required for PWA offline.

---

## Design Tokens

All tokens are in `packet/tokens.css`. Key values:

| Token | Value |
|-------|-------|
| `--color-bg` | `#101010` |
| `--color-surface-2` | `#1E1E1E` (cards) |
| `--color-surface-3` | `#252525` (inputs, tiles) |
| `--color-lime` | `#B2F042` (default accent) |
| `--color-lavender` | `#B286FD` |
| `--color-red` | `#E55733` |
| `--font-display` | Space Grotesk 700 |
| `--font-body` | Inter |
| `--font-mono` | JetBrains Mono |
| `--radius-tile` | 14px (set tiles) |
| `--ease-spring` | cubic-bezier(0.34,1.56,0.64,1) |
| `--duration-normal` | 220ms |

---

## Technical Requirements

- **Platform:** PWA installable on iOS/Android. Web primary for v1.
- **Viewport:** Mobile-first, max-width 460px, centered. Portrait only.
- **Offline:** Fully functional after initial load. Cache API + Service Worker.
- **Tap targets:** Minimum 44×44px on all interactive elements.
- **Safe areas:** All fixed elements use `env(safe-area-inset-*)`.
- **Haptics:** `navigator.vibrate()` wrapped in try/catch.
- **Reduced motion:** Respect `prefers-reduced-motion`. Show end-state immediately, skip keyframe animations.
- **Animations:** Use `transform` + `opacity` only. No layout-triggering properties.
- **Accent ink:** When accent is light (luminance > 140): black ink `#101010`. Dark: white `#ffffff`. Formula: `(r*299 + g*587 + b*114) / 1000`.

---

## Feature Concepts (v2)

Nine features are fully designed in `packet/Feature Exploration.html`. Open it in a browser and click any artboard to focus fullscreen. Specs for all 9 are in `Packet Design Handoff.html` § Feature Concepts.

| # | Feature | Priority | Section |
|---|---------|----------|---------|
| F1 | Rest Timer | High | In the Gym |
| F2 | Progressive Overload Nudge | High | In the Gym |
| F3 | Personal Records (PR badge) | High | In the Gym |
| F4 | Volume Trend Sparkline | Medium | In the Gym |
| F5 | Post-Match Logging | Medium | Before You Start |
| F6 | Readiness Check | Medium | Before You Start |
| F7 | Streak & Consistency Heatmap | High | Progress & Sharing |
| F8 | Packet 2 Preview | Medium | Progress & Sharing |
| F9 | Session Share Card | Low | Progress & Sharing |

### Key data model additions required

- `Exercise.defaultRestSec` — for rest timer durations
- `Exercise.incrementLb` — for overload nudge suggestions
- `SessionLog.gameRating` / `gameNote` — for post-match logging
- `SessionLog.readiness` — for readiness check scores
- IndexedDB `prs` table — for personal record tracking
- Multi-packet support: `Packet[]` array with per-packet accent color

---

## Open Questions for Product

1. **Rest timer** — auto-start between sets? Duration per exercise type?
2. **Plate calculator** — sheet from weight stepper, barbell lifts only?
3. **Program sync** — local only or backend sync? (affects data layer)
4. **Multiple packets** — does the app manage progression to Packet 2+?
5. **Skipped days** — manually marked or inferred after midnight?
6. **Progress tracking** — volume graphs, PRs, trends in a future version?

---

## Files in This Package

```
design_handoff_packet/
  README.md                      ← This file
  Packet Design Handoff.html     ← Full visual spec (open in browser)

packet/
  Packet.html                    ← Interactive prototype — all core screens
  Feature Exploration.html       ← 9 feature concept mockups (design canvas)
  tokens.css                     ← All CSS custom properties
  app.css                        ← Full app stylesheet
  data.jsx                       ← Mock data + exercise library (31 exercises)
  components.jsx                 ← Icon set, ProgressRing, confetti
  today.jsx                      ← Today view
  session.jsx                    ← Active session + LogSheet
  calendar.jsx                   ← Calendar + DaySummary
  program.jsx                    ← Program view + WorkoutEditor + ExerciseLibrary
```
