[Wiki](../../README.md) › [Features](../README.md) › [v1.7.0](README.md) › US-031

# US-031 — Default Habits & Mood Scale Tweak

> **Status: Shipped — v1.7.0**
>
> Adjusts built-in habits, default order, mood scale label, and mood immutability.

---

## Changes

| Area               | Before                                         | After                                                            |
| ------------------ | ---------------------------------------------- | ---------------------------------------------------------------- |
| **Built-in count** | 7 (incl. Alcohol)                              | **6** — Alcohol removed                                          |
| **Default order**  | Meditation, Writing, Reading, Water, Coffee, … | **Water, Coffee** first, then Meditation, Writing, Reading, Mood |
| **Reading**        | Count (pages), goal 20                         | **Minutes**, goal 30                                             |
| **Mood**           | Could deactivate / delete in Settings          | **Always on** — listed in Settings as locked; not user-creatable |
| **Mood scale −2**  | Lonely                                         | **Agitated**                                                     |

---

## Default Built-in Habits

| Order | Name       | Type          | Goal          |
| ----- | ---------- | ------------- | ------------- |
| 1     | Water      | Count (cups)  | 8             |
| 2     | Coffee     | Count (cups)  | 3             |
| 3     | Meditation | Minutes       | 20            |
| 4     | Writing    | Count (words) | 500           |
| 5     | Reading    | Minutes       | 30            |
| —     | Mood       | Mood          | — (always on) |

Users may **deactivate any habit except Mood**. Water, Coffee, Meditation, Writing, and Reading can all be turned off in Settings; Mood stays on and is tracked daily on `/habits`.

Mood appears in the Settings habits list as **Always on** (no toggle, edit, or delete). It is excluded from drag-reorder and from home completion counts (`trackableHabits`).

---

## Mood Scale (−2 update)

| Value  | Label        |
| ------ | ------------ |
| +5     | Happy        |
| +4     | Excited      |
| +3     | Focused      |
| +2     | Energized    |
| +1     | Content      |
| 0      | Normal       |
| −1     | Tired        |
| **−2** | **Agitated** |
| −3     | Sad          |
| −4     | Angry        |
| −5     | Stressed     |

Source of truth: `MOOD_SCALE` in `src/lib/db/types.ts`.

---

## Data / upgrades

**No habit migration path** — pre-release only. Built-in habits seed when the `habits` store is empty (`seedHabitsIfEmpty()`). Schema changes use the existing **wipe-and-reseed** `DB_VERSION` bump; real-user migration rules come later when the app has shipped users.

---

## Code Touchpoints

| File                                 | Change                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `src/lib/db/seed.ts`                 | New built-in list                                                       |
| `src/lib/db/database.ts`             | `seedHabitsIfEmpty()` only                                              |
| `src/lib/db/types.ts`                | Mood −2 label                                                           |
| `src/lib/habits.ts`                  | Presets, `isProtectedHabit`, `CREATABLE_HABIT_TYPES`                    |
| `src/lib/stores/habits.svelte.ts`    | `trackableHabits`, guard mood toggle/delete, ensure mood active on load |
| `src/lib/components/HabitRow.svelte` | Locked row — no toggle/delete/drag                                      |
| `src/routes/settings/+page.svelte`   | Mood shown last, not reorderable                                        |
| `src/routes/habits/+page.svelte`     | Mood strip always when mood row exists                                  |
| `src/routes/+page.svelte`            | Completion counts use `trackableHabits`                                 |

---

## Related Docs

- [v1.7.0 README](./README.md)
- [US-009 — Habit Creation](../v1.3.0/US-009-habit-creation.md)
- [v1.2.0 Mood Scale](../v1.2.0/README.md#mood-scale)
- [Data Model — Habit](../../architecture/data-model.md#habit--habitlog)
