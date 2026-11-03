[Wiki](../README.md) / [Features](README.md) / Backlog

# Backlog

Work that is not in a release yet. This page is a plan, not a wiki page, so it may tell what is planned. When an item starts, it gets a story in `features/<version>/`, and the architecture page that it changes is written first.

## Training

| Item                          | Notes                                                                                                                     | Spec                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Personal records              | Tell the user when a lift beats every earlier session                                                                     | [US-053](v1.10.0/US-053-personal-records.md) (designed) |
| Plan comparison               | Compare two runs of a goal, such as Bench Goal 01 and 02. The data is already stored                                      | [US-033](v1.9.0/US-033-goal-progression-plans.md)       |
| Plan-switching handoff        | Better flow when you start a new plan while one is active                                                                 | [US-033](v1.9.0/US-033-goal-progression-plans.md)       |
| Goal templates by a coach     | Starting points written by a professional                                                                                 | —                                                       |
| Template preview              | Show each week of a template before you start from it                                                                     | [US-001](v1.1.0/US-001-program-library.md) req 1c       |
| Per-item session notes        | A note on one exercise in one session                                                                                     | —                                                       |
| Rest timer                    | A timer between sets                                                                                                      | —                                                       |
| Overload nudges               | Suggest a heavier weight on a plain plan when the last sessions were easy                                                 | —                                                       |
| Confirm an early finish       | Ask before a finish that drops unlogged sets. Today the finish has no question                                            | —                                                       |
| Show the weight on open tiles | An open set tile shows "+" or "Now". Showing the weight it will log would remove a guess                                  | —                                                       |
| Completion feel               | An option to tone down the finish animation, apart from the system's reduced motion                                       | —                                                       |
| More Disciplines              | The engine supports more. A second one needs a decision on one active plan per Discipline, and on the name of the section | —                                                       |
| Day-of-week scheduling        | Not planned. The next routine stays count-driven by design                                                                | —                                                       |

## Insights

| Item                     | Notes                                                            | Spec                                                      |
| ------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------- |
| This month card          | A headline summary at the top of Insights, with the record count | [US-054](v1.10.0/US-054-this-month-card.md); after US-053 |
| Activity distance / pace | Distance and pace for cardio, on the Activity log                | —                                                         |
| Health history view      | A dedicated history of health readings, beyond the logging date  | [US-029](v1.7.0/US-029-health-metrics.md)                 |

## Data

| Item               | Notes                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| CSV export         | For analysis only; it cannot round-trip                                    |
| Automatic backup   | The File System Access API, or a reminder to export                        |
| Reset all settings | The settings store can reset to defaults, but no screen offers it          |
| Health clear row   | The Health data clear row shows while Health is off; every other row hides |

## Exercise catalog

The catalog could grow richer: muscle diagrams, muscle filters, more templates. Public sites are useful to see which exercises are worth having, but their diagrams and text are copyrighted; any diagram here is drawn in-house.

| Item                   | Notes                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Structured muscle data | The muscles of an item are one display string. A list of primary and secondary muscles comes first, before diagrams or filters      |
| Muscle diagram         | One shared front and back body SVG, tinted from that data. Not an image per exercise, which would bloat the offline copy            |
| Body-type toggle       | Only a choice of which body SVG to draw. The exercise list does not change                                                          |
| More templates         | Seed data in the existing shape. The cheapest item here                                                                             |
| Exercise video links   | Not planned. A link fails offline, which breaks [offline first](../principles.md), and links rot between updates                    |
| SQLite in WASM         | Not planned. The catalog is about 120 rows of seed data in the bundle; a 1 MB WASM file and its migrations cost more than they give |

## Not planned

| Item                 | Why                                                          |
| -------------------- | ------------------------------------------------------------ |
| Cloud sync, accounts | The app has no server, by design ([vision](../vision.md))    |
| Nutrition tracking   | Outside what the product is                                  |
| Journal              | Shipped in v1.3 and removed. It comes back only if users ask |

## How to add an item

1. Add a row to the right section, or a new section.
2. If it needs a full design, start an initiative in `docs/initiatives/<slug>/` and link it.
3. When work starts, write the story in `docs/features/<version>/` and the architecture page that it changes.
