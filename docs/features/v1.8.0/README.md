# v1.8.0 — Granular Data Clearing

## Design North Star

> "Clear what you mean, keep what you don't."

---

## What's Shipping

| Area                    | Detail                                                                                                                                                                               | Source                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Per-section clear       | Independent "Clear custom exercises," "Clear custom programs," "Clear workout sessions," "Clear activity log," "Clear habits," and "Clear health data" actions on `/settings/data`   | `src/routes/settings/data/+page.svelte`, `src/lib/db/database.ts`                      |
| Exercise-in-use warning | Bulk-clearing custom exercises warns (but doesn't block) when exercises are used in a program                                                                                        | `src/lib/stores/program.svelte.ts`                                                     |
| Clear everything        | Single action that clears all sections at once, replacing today's implicit all-or-nothing button                                                                                     | `src/lib/db/database.ts`                                                               |
| Compact clear list      | Per-section actions render as scannable rows (`SettingsActionRow`), not six identical full-width danger buttons; "Clear everything" stays visually distinct in its own "Danger zone" | `src/lib/components/SettingsActionRow.svelte`, `src/routes/settings/data/+page.svelte` |

---

## Key Decisions

- **No schema change.** IndexedDB object stores already map 1:1 to domains (exercises, programs, sessions, activities, habits, health); clearing becomes a matter of scoping which stores a `.clear()`/filtered-delete transaction touches, not restructuring storage.
- **Workouts split into four:** custom exercises, custom programs, workout sessions, and activity log clear independently of each other — not one "Workouts" bucket. Sessions and activities are separate stores, so they're separate actions too.
- **Warn-and-allow, not block**, for bulk-clearing exercises in use — the opposite of the existing single-exercise delete, which hard-blocks. Programs are left with a dangling exercise reference the UI must display gracefully.
- **"Everything" keeps the existing full-DB-delete path** rather than looping over each per-section clear — same effect, less code.
- **Compact row list, not identical buttons.** Six near-identical full-width danger buttons made the page hard to scan and didn't signal that "Clear everything" is more severe than the rest. Per-section actions became small labeled rows in a `SettingsGroup`; "Clear everything" kept its own prominent button in a separate "Danger zone" section.

## Planned

| ID                                           | Title                  | Status  | Notes                                                                                                                                                      |
| -------------------------------------------- | ---------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [US-032](./US-032-granular-data-clearing.md) | Granular Data Clearing | Planned | Splits today's single "Clear workout data" action into Custom exercises / Custom programs / Workout sessions / Activity log / Habits / Health / Everything |

---

## Related

- [Data Model](../../architecture/data-model.md)
- [Implementation Status](../../implementation/status.md)
- [US-030 — Settings Hub Restructure](../v1.7.0/US-030-settings-restructure.md)
- [US-032 — Granular Data Clearing](./US-032-granular-data-clearing.md)
