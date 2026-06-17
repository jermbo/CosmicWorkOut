# Implementation Status

What's built today vs. what's still requirements-only. Updated to match the codebase.

---

## v1.1.0 — Core Workout Flows

| Feature | Status | Notes |
|---------|--------|-------|
| Today view + start session | ✅ Built | Home card navigates to `/workout`; workout page handles start/edit |
| Session logging — smart tap (instant or first-time entry) | ✅ Built | Instant if weight known; opens sheet for first-time weight entry |
| Session logging — adjust completed set | ✅ Built | Tap any completed tile to reopen sheet; cascades forward |
| Weight remembered across sessions (exerciseLastUsed) | ✅ Built | Pre-fills on session start |
| Per-exercise weight increment (2.5 / 5 / 10) | ✅ Built | Configured on exercise form; weights round to nearest 2.5 |
| Finish / abandon session | ✅ Built | Finish saves completed sets only; abandon has confirm dialog |
| Crash recovery | ✅ Built | Resume/discard banner on boot |
| Session complete overlay | ✅ Built | Stats, confetti (configurable) |
| Program view + week progress | ✅ Built | Workout cards from week 1 templates |
| Workout editor | ✅ Built | Edit exercises, add new workouts |
| Exercise library browser | ✅ Built | Category-filtered sheet in editor |
| Calendar + day summary | ✅ Built | Month grid, tap completed days |
| IndexedDB persistence | ✅ Built | Raw API wrapper, seed data |
| Preferences store | ✅ Built | Accent, density, roundness, completion feel, weight unit |
| Settings UI | ✅ Built | `/settings` — accent color, weight unit, completion feel, density, roundness |
| Program selection screen | ✅ Built | Bottom sheet; built-in programs use "Use copy" (deep-clones before activating) |
| Create new program | ✅ Built | 2-step full-screen flow — details then workout names; scaffolds all weeks |
| Copy built-in before editing | ✅ Built | Guard dialog prompts copy+switch when editing a built-in program |
| Custom exercise CRUD | ✅ Built | Create/edit/delete in ExerciseLibrarySheet; built-in exercises are read-only |
| Browse all program weeks | ✅ Built | Week picker chevrons on program page |
| Weekly consistency streak | ✅ Built | Consecutive weeks where sessions ≥ daysPerWeek; shown on home + calendar |
| Scheduled/skipped day status | ✅ Built | Calendar infers training days-of-week from session history |

---

## v1.2.0 — Daily Dashboard & Habits

| Feature | Status | Notes |
|---------|--------|-------|
| Home screen as overview dashboard | ✅ Built | 4 summary cards: Habits, Workout, Activity, Journal (placeholder) |
| Global date context | ✅ Built | `loggingContext` store; date picker on home taps to any past day |
| Activity log page (`/log`) | ✅ Built | List, add, edit, delete activities; date-filtered |
| Dedicated workout page (`/workout`) | ✅ Built | Full session UI moved from home; back button to home |
| Habit log page (`/habits`) | ✅ Built | Progress rings, stepped +/− inputs, boolean toggles, exact-value modal |
| Mood tracking | ✅ Built | Inline always-visible mood strip on `/habits`; separate from habit grid |
| Habit progress rings | ✅ Built | SVG rings fill based on logged / goal; smart step increments |
| Pre-seeded habits | ✅ Built | Meditation (20 min), Writing (500 words), Reading (20 pages), Water (8 cups), Coffee (3 cups), Alcohol (boolean), Mood |
| DB migration for existing habits | ✅ Built | `initDB()` patches `dailyGoal` onto pre-existing records missing it |
| Program complete state | ✅ Built | Shown on `/workout` page with CTA to choose new program |
| Habit creation / management | 🚧 Partial | Built-in habits work; no Settings UI to add/edit/delete/reorder custom habits |
| Habit history in calendar | ❌ Not built | Heatmap integration not started |

---

## Not Built Yet

| Feature | Status | Doc reference |
|---------|--------|---------------|
| Service worker / PWA | ❌ Not built | [Offline Strategy](../architecture/offline-strategy.md) |
| Custom habit CRUD in Settings | ❌ Not built | US-009 |
| Habit history heatmap on Calendar | ❌ Not built | US-010 |
| Journal page | ❌ Not built | Home card shows "Coming soon" |

---

## Built-In Content

- **1 program:** Strength Foundation (12 weeks, 3 days/week, workouts A/B/C)
- **31 exercises** across 8 categories (Hinge, Squat, Push, Pull, Lateral, Rotational, Power, Carry)
- **7 habits:** Meditation, Writing, Reading, Water, Coffee, Alcohol, Mood
- All seeded from `src/lib/db/seed.ts`; exercises upserted on every boot, habits and programs only on first run

---

## Related

- [How It Works](behavior.md) — Full behavioral mental model
- [App Structure](app-structure.md) — Routes and layout
- [State Management](state.md) — Store details
- [v1.2.0 Features](../features/v1.2.0/README.md) — Current sprint stories
