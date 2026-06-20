# Glossary

> The shared vocabulary for CosmicWorkOut. When a term here and the code disagree, fix one of them — don't let them drift.
>
> **Legend:** ✅ in code today · 🟡 agreed direction, not built yet (v1.4.0)

---

## The big idea: two archetypes, not a list of "types"

Every way a person records movement in this app falls into one of three archetypes. New ideas don't get new architecture — they get **classified** into one of these.

| Archetype | What it is | Logged how | Examples |
| --- | --- | --- | --- |
| **Structured** | A multi-week plan you're guided through, step by step | Start a session, work through routine items, finish | Strength, Belly Dance |
| **Quick-log** | A thing you did that you just want on the record | One short entry: type + duration + intensity | Run, Bike, Pickleball, Swim, Hike |
| **Habit** | A daily recurring value | Tap a counter / toggle / mood | Water, Mood, Steps |

### The litmus test 🟡

When you think of the *next* thing (mobility flow, kickboxing, a hike), ask one question:

> **Do I want to be _guided through a repeatable routine_, or do I just want to _record that I did it_?**

- **Guided routine →** it's a new **Discipline**. That's *config + seed data*, not a new model.
- **Just record it →** it's an **Activity type**. That's *one line of config*.

Pickleball is already an Activity type — it cost zero architecture. That's the test working.

---

## Structured archetype terms

These generalize the strength model so belly dance (and anything after it) reuses one engine. Where a term renames something that exists today, the old name is noted.

### Discipline 🟡

A first-class, data-driven definition of a structured movement practice. A Discipline declares everything that makes it *specific* while the engine stays *generic*:

- its **sections** and the order they run in,
- the **metric** each section's items are logged with,
- its **built-in content** (seed items + a starter program),
- its display **label, color, and icon**.

Strength and Belly Dance are both Disciplines. Adding a third structured practice = authoring a new Discipline config, not forking the engine.

> **Discipline vs. Practice — don't conflate them.** *Discipline* is the **data-model** term (an entity in code). *Practice* (below) is the **UI** term for the place you go to do a session. One Practice destination surfaces sessions from whichever Disciplines are active.

### Practice 🟡

The **UI surface and bottom-nav destination** where you do a guided session — the screen formerly labeled "Workout." It is Discipline-agnostic: on a strength day it opens the strength session, on a dance day the dance session, and when both are available it lets you choose. "Practice" is a *label and a route*, **not** a data entity — there is no `Practice` type. The underlying data is always a Discipline's Program → Routine → Session.

### Section 🟡

An ordered division of a routine. A Discipline defines its own sections.

- **Strength:** a single implicit section — the exercise list.
- **Belly Dance:** four — `warm-up · conditioning · moves · cool-down`.

Each section is tied to a **metric**, which decides how its items are logged.

### Metric 🟡

The rule for how one item is recorded during a session. This is the core flexibility lever — a new Discipline picks from existing metrics or adds one.

| Metric | Logs | Used by |
| --- | --- | --- |
| `setsReps` | sets × reps × weight → contributes to volume | strength exercises |
| `measure` | a duration or a rep count entered live | conditioning, moves |
| `check` | done / not done | warm-up, cool-down |

### Item 🟡 _(generalizes **Exercise** ✅)_

The atomic unit of any routine — one movement. Belongs to a Discipline, carries a **section/type** tag, **focus** tag(s), optional cue text, and a logging metric. Ships built-in (seeded, read-only) or custom (user-created).

> Today this is `Exercise`, scoped to strength only. Generalizing it = Items scoped per Discipline.

### Focus 🟡

A descriptive tag on an item for filtering — _Hips · Core · Arms · Hamstrings_. Independent of section/metric. Multiple per item.

### Program ✅ _(becomes Discipline-scoped 🟡)_

A multi-week plan within **one** Discipline: name, duration in weeks, days per week, and its routines. Ships built-in (read-only; edit = copy-first) or custom. Today every Program is strength; the change is that each Program belongs to a Discipline.

### Routine 🟡 _(generalizes **Workout** ✅)_

A single training day within a program — lettered **A / B / C**, an ordered set of sections of items. The app suggests the next one by linear progression: `completedSessions % routineCount`.

> Today this is `Workout`. Renamed because "workout" reads as strength-only and we now have dance days too.

### Session 🟡 _(generalizes **SessionLog** ✅)_

A completed, recorded instance of a routine on a given date. Written on finish. What gets stored per item depends on that item's metric.

### Bookends 🟡

The shared warm-up and cool-down sections. Routine **A** defines the canonical lists; **B** and **C** inherit until overridden. A Discipline-level pattern, generalizing template inheritance.

---

## Quick-log archetype terms

### Activity ✅ _(`ActivityLog`)_

A lightweight record of a non-structured physical activity: a **type** (Run · Bike · Pickleball · Swim · Hike · Yoga · …), a **duration**, and an **intensity** (Easy · Moderate · Hard). No program, no routine, no session flow. This is where cardio and sports live — and where most "next things" will land.

### Activity type ✅

One value in the Activity type list. Adding one (e.g. Kayaking) is a config change, not architecture.

---

## Habit archetype terms

### Habit ✅

A daily trackable behavior with a **type** (`times · minutes · count · boolean · mood`), optional daily goal, and unit label.

### Habit log ✅

One day's value for one habit. Exactly one record per (habit, date); upserted on every tap. Mood uses a **−5…+5** scale.

---

## Cross-cutting terms

| Term | ✅/🟡 | Meaning |
| --- | --- | --- |
| **Global date context** | ✅ | The selected date on Today that workouts, habits, and (soon) practice all read from. Backdating requires confirmation. |
| **Active session** | ✅ | An in-progress session held in memory + localStorage for crash recovery. Becomes a Session/SessionLog on finish. |
| **Linear progression** | ✅ | "Today's routine" is chosen by count of completed sessions, **not** the calendar: `index = completedCount % routineCount`. |
| **Built-in vs custom** | ✅ | Built-in content is seeded and read-only (edit = copy-first); custom is user-created and fully editable. |
| **Seed** | ✅ | Built-in content upserted on every boot (`src/lib/db/seed.ts`). |

---

## Naming map (old → generalized)

For the v1.4.0 generalization. Old terms keep working in shipped strength code until migrated.

| Today ✅ | Generalized 🟡 | Why |
| --- | --- | --- |
| Exercise | Item | Items exist in any Discipline, not just strength |
| Workout | Routine | "Workout" reads as strength-only |
| SessionLog | Session | One concept across all Disciplines |
| Program _(strength)_ | Program _(Discipline-scoped)_ | Now belongs to a Discipline |
| — | Discipline, Section, Metric, Focus | New in the generalized model |

---

## Related

- [North Star](vision/north-star.md) — product identity
- [Data Model](architecture/data-model.md) — the entities behind these terms
- [v1.4.0 — Belly Dance](features/v1.4.0/README.md) — first Discipline beyond strength
