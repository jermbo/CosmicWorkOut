# Glossary

> The shared vocabulary for CosmicWorkOut. When a term here and the code disagree, fix one of them — don't let them drift. Every term below is in the code today.

---

## The big idea: three archetypes, not a list of "types"

Every way a person records movement in this app falls into one of three archetypes. New ideas don't get new architecture — they get **classified** into one of these.

| Archetype      | What it is                                            | Logged how                                          | Examples                          |
| -------------- | ----------------------------------------------------- | --------------------------------------------------- | --------------------------------- |
| **Structured** | A multi-week plan you're guided through, step by step | Start a session, work through routine items, finish | Strength, Belly Dance             |
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

These generalize the original strength model so belly dance (and anything after it) reuses one engine. The model shipped in v1.4.0; the strength-only names below were renamed at that point.

### Discipline

A first-class, data-driven definition of a structured movement practice. A Discipline declares everything that makes it _specific_ while the engine stays _generic_:

- its **sections** and the order they run in,
- the **metric** each section's items are logged with,
- its **built-in content** (seed items + starter programs),
- its display **label, color, and icon**.

Strength and Belly Dance are both Disciplines (seeded, read-only config in `src/lib/discipline.ts`). Adding a third structured practice = authoring a new Discipline config, not forking the engine.

> **Discipline vs. Practice — don't conflate them.** _Discipline_ is the **data-model** term (config in code). _Practice_ (below) is the **UI** term for the place you go to do a session. One Practice destination surfaces sessions from whichever Disciplines are active.

### Practice

The **Practice destination** and page shell for guided sessions (`/practice`). Organized as:

- **Practice groups** — broad buckets like Workout and Dance (UI config, not stored in IndexedDB).
- **Plans** — multi-week Programs the user activates. Many plans can be active at once (one per Discipline).
- **Disciplines** — the data-model layer (strength, bellydance) that powers logging engines inside each group.

Inactive groups and plans are hidden from the main Practice flow; history is always preserved when paused.

### Section

An ordered division of a routine. A Discipline defines its own sections.

- **Strength:** a single implicit section — the exercise list.
- **Belly Dance:** four — `warm-up · conditioning · moves · cool-down`.

Each section is tied to a **metric**, which decides how its items are logged.

### Metric

The rule for how one item is recorded during a session. This is the core flexibility lever — a new Discipline picks from existing metrics or adds one.

| Metric     | Logs                                         | Used by             |
| ---------- | -------------------------------------------- | ------------------- |
| `setsReps` | sets × reps × weight → contributes to volume | strength exercises  |
| `measure`  | a duration or a rep count entered live       | conditioning, moves |
| `check`    | done / not done                              | warm-up, cool-down  |

### Item _(renamed from **Exercise**)_

The atomic unit of any routine — one movement. Belongs to a Discipline, carries a **section** key, **focus** tag(s), an optional cue, and a logging metric. Ships built-in (seeded, read-only) or custom (user-created). Built-in items are **derived from catalog seeds** — see [Data Model](architecture/data-model.md#catalog--item-derivation).

### Focus

A descriptive tag on an item for filtering — _hips · core · arms · legs · …_. Independent of section/metric. Multiple per item (see `FOCUS_TAGS`).

### Program

A multi-week plan within **one** Discipline: name, duration in weeks, days per week, and its routines. Ships built-in (read-only; edit = copy-first) or custom. Every Program belongs to a Discipline.

Two program **flavors** exist for Strength today:

| Flavor                                        | Purpose                                         | Progression                                                                  |
| --------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| **Course program**                            | General syllabus (e.g. Strength Foundation 101) | A/B/C rotation; weight via last-used prefill + manual bump                   |
| **Goal progression plan** _(v1.9.0)_          | Isolated stint toward one focus lift target     | Wave blocks + generator; see [Goal progression plan](#goal-progression-plan) |

### Goal progression plan _(v1.9.0)_

A Strength program type where the user sets a **focus exercise** and a **goal** (weight × reps), confirms a **starting point**, and the app **generates** multi-month **progression blocks**. Each instance (e.g. Bench Goal 01 vs Bench Goal 02) is a separate plan record. Only one may be **active** at a time; while active, its backing program is the sole active Strength program. **Opt-in:** gated by `goalProgressionPlansEnabled` in Settings (default off), same contract as health metrics. Full spec: [v1.9.0 / US-033](features/v1.9.0/US-033-goal-progression-plans.md).

### Progression block

One **4-week wave** within a goal progression plan. Focus exercise pattern: build → build → peak → deload (e.g. 150×10 → 160×8 → 170×6 → 150×10), then the next block starts at a higher baseline. The user may **repeat** the current block without rewinding to earlier blocks.

### Focus exercise

The single lift a goal progression plan is built around. It follows the full wave block schedule. All other exercises in the plan are **supporting** — weekly `weightIncrement` bumps, no deload wave.

### Routine _(renamed from **Workout**)_

A single training day within a program — optionally lettered **A / B / C**, an ordered set of sections of items. The app suggests the next one by linear progression: `completedSessions % routineCount`.

### Session _(renamed from **SessionLog**)_

A completed, recorded instance of a routine on a given date. Written on finish. What gets stored per item depends on that item's metric.

### Bookends

The shared warm-up and cool-down sections. Routine **A** defines the canonical lists; other routines inherit until they set `overridesBookends`. A Discipline-level pattern generalizing template inheritance.

---

## Quick-log archetype terms

### Activity _(`ActivityLog`)_

A lightweight record of a non-structured physical activity: a **type** (Run · Bike · Pickleball · Swim · Hike · Yoga · …), a **duration**, and an **intensity** (Easy · Moderate · Hard). No program, no routine, no session flow. This is where cardio and sports live — and where most "next things" will land.

### Activity type

One value in the Activity type list. Adding one (e.g. Kayaking) is a config change, not architecture.

---

## Habit archetype terms

### Habit

A daily trackable behavior with a **type** (`times · minutes · count · boolean · mood`), optional daily goal, and unit label.

### Habit log

One day's value for one habit. Exactly one record per (habit, date); upserted on every tap. Mood uses a **−5…+5** scale. The built-in **Mood** habit is always active and not user-managed ([US-031](features/v1.7.0/US-031-default-habits-tweak.md)).

---

## Health metrics

> **Not a fourth movement archetype.** Body measurements (weight, blood pressure) are optional wellness tracking — separate from Structured, Quick-log, and Habit. Shipped in [US-029](features/v1.7.0/US-029-health-metrics.md).

### Health metric

An app-defined measurement type in the catalog (`weight`, `bloodPressure`, …). Definitions live in code (`src/lib/health/metrics.ts`), not IndexedDB. New types ship with app updates — users do not create custom metrics.

### Health reading

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

The v1.4.0 generalization renamed the strength-only entities. These old names no longer appear in the code.

| Original             | Current                            | Why                                              |
| -------------------- | ---------------------------------- | ------------------------------------------------ |
| Exercise             | Item                               | Items exist in any Discipline, not just strength |
| Workout              | Routine                            | "Workout" reads as strength-only                 |
| SessionLog           | Session                            | One concept across all Disciplines               |
| Program _(strength)_ | Program _(Discipline-scoped)_      | Now belongs to a Discipline                      |
| —                    | Discipline, Section, Metric, Focus | New in the generalized model                     |

---

## Related

- [North Star](vision/north-star.md) — product identity
- [Data Model](architecture/data-model.md) — the entities behind these terms
- [US-029 — Health Metrics](features/v1.7.0/US-029-health-metrics.md) — optional body measurements
- [v1.4.0 — Belly Dance](features/v1.4.0/README.md) — first Discipline beyond strength
