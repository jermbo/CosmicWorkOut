[Wiki](README.md) › Glossary

# Glossary

> The shared vocabulary for CosmicWorkOut. When a term here and the code disagree, fix one of them — don't let them drift. Every term below is in the code today.

---

## The big idea: three archetypes, not a list of "types"

Every way a person records movement in this app falls into one of three archetypes. New ideas don't get new architecture — they get **classified** into one of these.

| Archetype      | What it is                                            | Logged how                                          | Examples                          |
| -------------- | ----------------------------------------------------- | --------------------------------------------------- | --------------------------------- |
| **Structured** | A multi-week plan you're guided through, step by step | Start a session, work through routine items, finish | Strength                          |
| **Quick-log**  | A thing you did that you just want on the record      | One short entry: type + duration + intensity        | Run, Bike, Pickleball, Swim, Hike |
| **Habit**      | A daily recurring value                               | Tap a counter / toggle / mood                       | Water, Mood, Steps                |

### The litmus test

When you think of the _next_ thing (mobility flow, kickboxing, a hike), ask one question:

> **Do I want to be _guided through a repeatable routine_, or do I just want to _record that I did it_?**

- **Guided routine →** it's a new **Discipline**. That's _config + seed data_, not a new model.
- **Just record it →** it's an **Activity type**. That's _one line of config_.

Pickleball is already an Activity type — it cost zero architecture. That's the test working.

---

## Structured archetype terms

These generalize the original strength model so a future structured practice can reuse one engine instead of forking it. The model shipped in v1.4.0 with a second Discipline, Belly Dance, which was removed in v1.10.0 ([US-051](features/v1.10.0/US-051-remove-belly-dance.md)) — nobody used it, and it fit better as its own app. The engine itself stayed; only its second occupant left.

### Discipline

<span id="discipline"></span>

A first-class, data-driven definition of a structured movement practice. A Discipline declares everything that makes it _specific_ while the engine stays _generic_:

- its **sections** and the order they run in,
- the **metric** each section's items are logged with,
- its **built-in content** (seed items + starter programs),
- its display **label, color, and icon**.

**Strength is the only registered Discipline today** (seeded, read-only config in `src/lib/discipline.ts`). Adding a second structured practice = authoring a new Discipline config, not forking the engine — that's the whole point of keeping the model general even with one occupant.

> **Discipline vs. Workout — don't conflate them.** _Discipline_ is the **data-model** term (config in code). _Workout_ (below) is the **UI** term for the place you go to follow a plan. With one Discipline, the two line up closely today; the split still matters if a second Discipline ever returns.

### Workout

<span id="workout"></span>

<!-- prettier-ignore -->
> Was **Practice** through v1.10.0 Topic 12 ([US-052](features/v1.10.0/US-052-one-workout-section.md)) — renamed when Practice (programs) and Lift plans merged into one section with an optional goal. Code identifiers (`practiceEnabled`, `$lib/practice.ts`'s successor `$lib/plans/`) lag the rename, same pattern as [Lift plan](#lift-plan).

The **Workout destination** (`/workout`) where you follow a [Plan](#plan). One plan is active at a time — enforced, not just a default — so there's always exactly one answer to "what am I training right now." Other plans are listed below it, and can be activated (pausing the current one), edited, or deleted.

**Opt-in:** gated by `practiceEnabled` in Settings (default off). Workout is the session engine rather than a single screen, so the flag hides every `/workout*` route, the session overlay, and the session marks on Insights — plans and session history stay in IndexedDB.  See [state.md](implementation/state.md#feature-flags-hide-ui-data-always-persists).

### Plan

<span id="plan"></span>

<!-- prettier-ignore -->
> New term, v1.10.0 ([US-052](features/v1.10.0/US-052-one-workout-section.md)). Replaces the separate "Program" (Practice) and "Lift plan" (Goal progression plan) ideas — they were always the same underlying `Program` record; a plan just may or may not have a [Lift plan](#lift-plan)'s goal attached.

Routines A/B/C over a number of weeks, created from a built-in template (copied) or from scratch, with an optional goal set only at creation. A plan without a goal progresses by beating what you logged last time; a plan with a goal follows the generated wave. Every plan has a length and an end — reaching it offers **Run it again** (same plan, fresh week 1) or **New plan**.

### Section

<span id="section"></span>

An ordered division of a routine. A Discipline defines its own sections. Strength uses a single implicit section — the exercise list — each tied to a **metric**, which decides how its items are logged.

### Metric

<span id="metric"></span>

The rule for how one item is recorded during a session. This is the core flexibility lever — a new Discipline picks from existing metrics or adds one.

| Metric     | Logs                                         | Used by             |
| ---------- | -------------------------------------------- | ------------------- |
| `setsReps` | sets × reps × weight → contributes to volume | strength exercises  |
| `measure`  | a duration or a rep count entered live       | conditioning, moves |
| `check`    | done / not done                              | warm-up, cool-down  |

### Item _(renamed from **Exercise**)_

<span id="item"></span>

The atomic unit of any routine — one movement. Belongs to a Discipline, carries a **section** key, **focus** tag(s), an optional cue, and a logging metric. Ships built-in (seeded, read-only) or custom (user-created). Built-in items are **derived from catalog seeds** — see [Data Model](architecture/data-model.md#catalog--item-derivation).

### Focus

<span id="focus"></span>

A descriptive tag on an item for filtering — _hips · core · arms · legs · …_. Independent of section/metric. Multiple per item (see `FOCUS_TAGS`).

### Program

<span id="program"></span>

A multi-week plan within **one** Discipline: name, duration in weeks, days per week, and its routines. Ships built-in (read-only; edit = copy-first) or custom. Every Program belongs to a Discipline. Since v1.10.0 ([US-052](features/v1.10.0/US-052-one-workout-section.md)) a Program is what the UI calls a [Plan](#plan) — the record didn't change, the concept it's shown as did.

Two program **flavors** exist for Strength today:

| Flavor                   | Purpose                                         | Progression                                                |
| ------------------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| **Course program**       | General syllabus (e.g. Strength Foundation 101) | A/B/C rotation; weight via last-used prefill + manual bump |
| **Lift plan** _(v1.9.0)_ | Isolated stint toward one focus lift target     | Wave blocks + generator; see [Lift plan](#lift-plan)       |

Since v1.10.0 this is a UI distinction, not a stored one: any Program can have a [GoalPlan](#lift-plan) attached, and creating a plan asks "working toward a specific lift?" instead of splitting into two separate flows.

### Lift plan _(v1.9.0)_

<span id="lift-plan"></span>
<span id="goal-progression-plan"></span>

**Preferred name in docs:** Lift plan. Use it in all prose.
**Older name:** Goal progression plan. Still present in three places, by design or by lag:

| Where              | State                                                                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Docs prose         | **Renamed.** Any doc still saying "goal plan" is wrong.                                                                                                                                                                                                                         |
| Code identifiers   | **Lagging, allowed** — `goalPlans` store, `goalPlanStore`, `GoalPlan`, `src/lib/goalPlans/` (storage is unchanged by the v1.10.0 merge). **Actually gone**, not lagging — `goalProgressionPlansEnabled` (folded into `practiceEnabled`) and the `/goals` routes (replaced by `/workout/new`) were both removed in [US-052](features/v1.10.0/US-052-one-workout-section.md). |
| Shipped UI strings | **Renamed** in v1.10.0 ([US-049](features/v1.10.0/US-049-lift-plan-rename.md)); "Lift plan" retires as a separate idea with [US-052](features/v1.10.0/US-052-one-workout-section.md). Programs created before that may still carry the old "Goal progression plan" description. |

Quote a UI string as it actually appears, and say that it is the old name.

A Strength program type where the user sets a **focus exercise** and a lift **target** (weight × reps), confirms a **starting point**, and the app **generates** multi-month **progression blocks**. Each instance (e.g. Bench 01 vs Bench 02) is a separate plan record. Only one may be **active** at a time; while active, its backing program is the sole active Strength program — since v1.10.0 that's just the app's general "exactly one plan is ever active" rule, not a rule specific to goals. **Opt-in:** gated by `practiceEnabled` (the [Workout](#workout) flag) — the separate `goalProgressionPlansEnabled` flag was retired in [US-052](features/v1.10.0/US-052-one-workout-section.md); a goal is now just something any plan may or may not have. A goal can be **removed** from a plan (`goalPlanStore.removeGoal`) — the plan then continues as a plain plan to its original end. Full spec: [v1.9.0 / US-033](features/v1.9.0/US-033-goal-progression-plans.md); the merge: [v1.10.0 / US-052](features/v1.10.0/US-052-one-workout-section.md).

Do **not** confuse with [Baseline](#baseline) — that is daily floor/ceiling tracking across any topic, not a Strength wave plan.

### Progression block

<span id="progression-block"></span>

One **4-week wave** within a lift plan. Focus exercise pattern: build → build → peak → deload (e.g. 150×10 → 160×8 → 170×6 → 150×10), then the next block starts at a higher starting weight. The user may **repeat** the current block without rewinding to earlier blocks.

### Focus exercise

<span id="focus-exercise"></span>

The single lift a lift plan is built around. It follows the full wave block schedule. All other exercises in the plan are **supporting** — weekly `weightIncrement` bumps, no deload wave.

### Routine _(renamed from **Workout**)_

<span id="routine"></span>

A single training day within a program — optionally lettered **A / B / C**, an ordered set of sections of items. The app suggests the next one by linear progression: `completedSessions % routineCount`.

> **Naming collision, read this if confused:** a single training day used to be called "Workout" and was renamed to **Routine** in v1.4.0 to free up the word. In v1.10.0 ([US-052](features/v1.10.0/US-052-one-workout-section.md)) "Workout" came back as the name of the whole [Workout](#workout) destination/tab — a different, higher-altitude thing. "Today's workout" in the UI means a Routine; the Workout tab/section means the destination.

### Session _(renamed from **SessionLog**)_

<span id="session"></span>

A completed, recorded instance of a routine on a given date. Written on finish. What gets stored per item depends on that item's metric.

### Bookends

<span id="bookends"></span>

The shared warm-up and cool-down sections. Routine **A** defines the canonical lists; other routines inherit until they set `overridesBookends`. A Discipline-level pattern generalizing template inheritance.

---

## Quick-log archetype terms

### Activity _(`ActivityLog`)_

<span id="activity"></span>

A lightweight record of a non-structured physical activity: a **type** (Run · Bike · Pickleball · Swim · Hike · Yoga · …), a **duration**, and an **intensity** (Easy · Moderate · Hard). No program, no routine, no session flow. This is where cardio and sports live — and where most "next things" will land.

**Opt-in:** the activity log is gated by `activityLogEnabled` in Settings (default off); logged activities are kept when off.

### Activity type

<span id="activity-type"></span>

One value in the Activity type list. Adding one (e.g. Kayaking) is a config change, not architecture.

---

## Habit archetype terms

### Habit

<span id="habit"></span>

A daily trackable behavior with a **type** (`times · minutes · count · boolean · mood`), optional daily goal, unit label, and a **chart color** (v1.10.0; Mood has a good-day and a bad-day color).

**Opt-in:** gated by `habitsEnabled` in Settings (default off); habits and their logs are kept when off. **Mood has no separate flag** — see [Habit log](#habit-log).

### Habit log

<span id="habit-log"></span>

One day's value for one habit. Exactly one record per (habit, date); upserted on every tap. Mood uses a **−5…+5** scale. The built-in **Mood** habit is always active and not user-managed ([US-031](features/v1.7.0/US-031-default-habits-tweak.md)) — "always active" means it can't be deactivated _within_ Habits, not that it survives the `habitsEnabled` flag. Turning Habits off hides the mood strip, week-strip mood pips, History mood dot, and the Mood vs Habits chart too.

---

## Baselines _(v1.9.0)_

> **Not a fourth movement archetype** and **not** a Habit. Separate daily tracking for growth over time. Built and opt-in (`baselinesEnabled`, default off). Spec: [US-034](features/v1.9.0/US-034-baselines-setup.md) · [US-035](features/v1.9.0/US-035-baselines-logging.md) · [US-036](features/v1.9.0/US-036-baselines-charts.md), reworked in [US-037](features/v1.10.0/US-037-flexible-baseline-metrics.md) · [US-038](features/v1.10.0/US-038-baseline-logging-comparison.md). Origin: [Roadmap — Baselines](roadmap/baselines.md).

### Baseline

<span id="baseline"></span>

A user-defined daily **floor** with **1 to n metrics**, each a **Duration** (time), **Distance** (mi / km / m / yd), or **Count** (user-labelled — reps, words, pages). Logged as many times per day as needed (entries sum). **Logging anything marks the day done**; each metric is then compared to its baseline as a plain signed difference (+20, −2 min) — the app never decides what "better" means. The baseline is set embarrassingly low and stays put. Works for any pursuit — Daily 10, bike ride, reading, meditation, writing, "phone locked away". Distinct from [Habits](#habit) (simple daily check-ins) and from [Lift plans](#lift-plan) (Strength wave-loading). Shape since [v1.10.0](features/v1.10.0/US-037-flexible-baseline-metrics.md).

### Baseline log

<span id="baseline-log"></span>

One entry toward a Baseline on a given day. Many per day; the day’s total(s) are the sum. Stored in IndexedDB (`baselineLogs`, DB version 11); deleting a Baseline retains its logs.

---

## Health metrics

> **Not a fourth movement archetype.** Body measurements (weight, blood pressure) are optional wellness tracking — separate from Structured, Quick-log, and Habit. Shipped in [US-029](features/v1.7.0/US-029-health-metrics.md).

### Health metric

<span id="health-metric"></span>

An app-defined measurement type in the catalog (`weight`, `bloodPressure`, …). Definitions live in code (`src/lib/health/metrics.ts`), not IndexedDB. New types ship with app updates — users do not create custom metrics.

### Health reading

<span id="health-reading"></span>

One logged measurement instance. Stored in IndexedDB (`healthReadings`). Weight: at most one per date. Blood pressure: many per date, each with `recordedAt`. Gated by `UserPrefs.healthMetricsEnabled`.

---

## Cross-cutting terms

| Term                    | Meaning                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Global date context** | The selected date that Today, habits, health metrics, and practice all read from. Backdating requires confirmation.                        |
| **Active session**      | An in-progress session held in memory + localStorage for crash recovery. Becomes a Session on finish.                                      |
| **Linear progression**  | "Today's routine" is chosen by count of completed sessions, **not** the calendar: `index = completedCount % routineCount`, per Discipline. |
| **Built-in vs custom**  | Built-in content is seeded and read-only (edit = copy-first); custom is user-created and fully editable.                                   |
| **Seed**                | Built-in items/programs upserted on every boot (`src/lib/db/seed.ts`); habits seed on first run only.                                      |

---

## Naming map (original → current)

The v1.4.0 generalization renamed the strength-only **data entities**. The old names no longer exist as stored types or interfaces, though "Exercise" and "Workout" still appear as UI copy and component/route identifiers (e.g. `ExerciseCard`, `WorkoutPicker`, `/workout`).

| Original                           | Current                                     | Why                                                                                                                                      |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Exercise                           | Item                                         | Items exist in any Discipline, not just strength                                                                                          |
| Workout                            | Routine                                      | "Workout" reads as strength-only — **the name came back in v1.10.0 for a different thing**, see the [Routine](#routine) collision note   |
| SessionLog                         | Session                                       | One concept across all Disciplines                                                                                                       |
| Program _(strength)_               | Program _(Discipline-scoped)_                | Now belongs to a Discipline                                                                                                               |
| —                                   | Discipline, Section, Metric, Focus            | New in the generalized model                                                                                                             |
| Goal progression plan _(docs/UI)_  | **Lift plan** _(preferred UI name)_          | Avoid clash with [Baseline](#baseline); code ids may still say `goalPlan*`                                                                |
| Practice + Lift plan _(two ideas)_ | **Plan**, with an optional goal _(v1.10.0)_  | [US-052](features/v1.10.0/US-052-one-workout-section.md) — one Workout section, not two                                                   |

---

## Related

- [North Star](vision/north-star.md) — product identity
- [How It Works](implementation/behavior.md) — these terms in everyday app behavior
- [Data Model](architecture/data-model.md) — the entities behind these terms
- [US-033 — Goal Progression Plans](features/v1.9.0/US-033-goal-progression-plans.md) — Lift plans (wave-loading Strength stints)
- [US-034 — Baselines Setup](features/v1.9.0/US-034-baselines-setup.md) — daily floor/ceiling growth tracking
- [US-029 — Health Metrics](features/v1.7.0/US-029-health-metrics.md) — optional body measurements
- [v1.4.0 — Belly Dance](features/v1.4.0/README.md) — first Discipline beyond strength
