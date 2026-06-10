# Program Management

Defining, selecting, and editing fitness programs.

**Tied to:** [Data Model — Program & Workout](../architecture/data-model.md) | [North Star](../vision/north-star.md)

---

## Goal

Users can follow any structured fitness program — one they select from built-in options or one they build themselves. A program is a multi-week plan with a defined number of training days per week and specific exercises per day.

---

## Built-In Programs

The app ships with a small set of ready-to-use programs. These act as starting points — users should be able to copy and modify them, not just run them as-is.

Initial built-in plans:
- **3-Month Strength (3 days/week)** — the original inspiration; full-body compound movements
- At least one shorter plan (e.g., 4-week intro, 2 days/week) to demonstrate flexibility

Built-in programs are read-only. To modify one, the user copies it first.

---

## User Stories

### Selecting a Program

> As a user, I want to see what programs are available and activate one, so I know what to do each week.

- On first launch (or when no program is active), I'm shown a program selection screen
- I can see the name, duration, and days/week at a glance
- Selecting a program makes it "active" — it drives the Today view and Calendar
- I can switch programs; my past session history is preserved regardless

---

### Viewing a Program

> As a user, I want to browse my active program's full schedule, so I understand what's coming up.

- I can see all weeks and workouts in the program
- Each workout shows its exercises, sets, and reps
- I can navigate between weeks

---

### Creating a Program

> As a user, I want to build a custom program from scratch, so I'm not limited to built-in options.

- I can create a new program with a name, total weeks, and days per week
- The app scaffolds empty workout slots (e.g., "Week 1 – Day A, B, C")
- I fill each slot with exercises from the exercise library
- I can name each workout however I want ("Push", "Pull", "Legs", or "Monday")

---

### Editing a Program

> As a user, I want to modify my active program, so I can adjust it as my fitness evolves.

- I can edit any workout in my program: add exercises, remove exercises, change sets/reps
- Editing a built-in program prompts me to create a copy first
- Changes are saved immediately; no publish/draft concept
- Editing does not retroactively change historical session logs

---

### Managing the Exercise Library

> As a user, I want to add my own exercises, so I'm not limited to what ships with the app.

- I can create a custom exercise: name, unit (lb/kg/band/bodyweight), default sets/reps
- I can edit or delete custom exercises
- Built-in exercises cannot be deleted (but can be excluded from programs)
- When adding exercises to a workout, I can browse and search the library

---

## Constraints

- A program must have at least 1 week and 1 training day per week
- Maximum is not defined — don't artifically cap it
- A workout must have at least 1 exercise
- Programs can coexist in storage; only one is "active" at a time

---

## Open Questions

- Can a user run two programs simultaneously (e.g., strength + mobility)? Or always one active?
- If a user skips a week, does the program shift forward or does that week's workouts just show as "skipped"?
- When editing a program mid-cycle, does the current week's completed sessions count toward the new structure?

---

## Related

- [Data Model](../architecture/data-model.md) — Program, Week, Workout, Exercise types
- [Session Logging](session-logging.md) — How programs drive the logging flow
- [History & Calendar](history-calendar.md) — How program completion is visualized
