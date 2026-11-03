[Wiki](../README.md) / Features

# Features

The record of what shipped, release by release. Each version folder holds a `README.md` — the release summary, with the status of each story — and the user stories (`US-0NN-*.md`) of that release. This folder tells **what and when**. For how the app works today, start at the [wiki home](../README.md); every architecture page tells the system as it is now.

New stories follow the [user story standards](../standards/user-story-standards.md). Work that is not in a release yet is in the [backlog](backlog.md). Notes from one piece of work, such as an audit or a discovery, are in [initiatives](../initiatives/).

## Releases

| Version                      | Theme                                                       | Stories                               |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------- |
| [v1.1.0](v1.1.0/README.md)   | Core workout flows                                          | US-001 – US-006                       |
| [v1.2.0](v1.2.0/README.md)   | Daily dashboard & habits                                    | US-007, 008, 011                      |
| [v1.3.0](v1.3.0/README.md)   | Habit management & calendar history                         | US-009, 010, 013                      |
| [v1.4.0](v1.4.0/README.md)   | Belly dance & the Discipline model                          | US-015 – US-021                       |
| [v1.5.0](v1.5.0/README.md)   | Insights hub                                                | US-022 – US-027                       |
| [v1.6.0](v1.6.0/README.md)   | Belly dance catalog & course programs                       | Backfilled (no per-story files)       |
| [v1.7.0](v1.7.0/README.md)   | Full strength catalog, PWA, health & backup                 | US-028 – US-031                       |
| [v1.8.0](v1.8.0/README.md)   | Granular data clearing                                      | US-032                                |
| [v1.9.0](v1.9.0/README.md)   | Lift plans + Baselines                                      | US-033 – US-036                       |
| [v1.10.0](v1.10.0/README.md) | Baselines & Insights refresh, Settings, one Workout section | US-037 – US-054 (053 – 054 not built) |
| [v1.12.0](v1.12.0/README.md) | Color fields redesign (dark only), tap feel, QR backup      | US-055 – US-058                       |

## What was removed later

A story tells what was built in its release. Some of it was taken out in a later release:

| Removed                                 | In           | Where it is recorded                              |
| --------------------------------------- | ------------ | ------------------------------------------------- |
| Journal page and its speech input       | after v1.3.0 | Commit `0af33ff`; no story                        |
| History calendar (`/calendar`)          | v1.10.0      | [US-047](v1.10.0/US-047-retire-history.md)        |
| Belly Dance Discipline, moves, programs | v1.10.0      | [US-051](v1.10.0/US-051-remove-belly-dance.md)    |
| Separate Practice and Lift plans areas  | v1.10.0      | [US-052](v1.10.0/US-052-one-workout-section.md)   |
| Exercise progress chart                 | v1.10.0      | Commit `9798644`; found missing during v1.10.0    |
| Light mode, accent colour, roundness    | v1.12.0      | [US-055](v1.12.0/US-055-color-fields-redesign.md) |

## Notes

- **The v1.6.0 and v1.7.0 READMEs are backfilled** — rebuilt from git history and the code after the fact, not original design records. They say so.
- There is no v1.11.0.
