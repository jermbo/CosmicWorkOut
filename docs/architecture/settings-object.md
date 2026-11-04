---
name: Settings object
description: 'The exact fields of the settings object in cwout:prefs: the values that each field takes, its default, and where you set it.'
altitude: exact
tags:
  - settings
  - storage
parent: local-storage-keys.md
---

[Wiki](../README.md) / [System](system.md) / [Storage](storage.md) / [localStorage keys](local-storage-keys.md) / Settings object

# Settings object

Every setting of the app is one field of one JSON object, stored in `cwout:prefs`. This page is the contract for that object. Use it to read the stored value in the browser tools, or to check a new setting.

## The fields

| Field                  | Values                               | Default                                                 | Where you set it     |
| ---------------------- | ------------------------------------ | ------------------------------------------------------- | -------------------- |
| `habitsEnabled`        | `true`, `false`                      | `false`                                                 | Settings → Habits    |
| `activityLogEnabled`   | `true`, `false`                      | `false`                                                 | Settings → Activity  |
| `practiceEnabled`      | `true`, `false`                      | `false`                                                 | Settings → Workout   |
| `healthMetricsEnabled` | `true`, `false`                      | `false`                                                 | Settings → Health    |
| `baselinesEnabled`     | `true`, `false`                      | `false`                                                 | Settings → Baselines |
| `weightUnit`           | `lb`, `kg`                           | `lb`                                                    | Personalization      |
| `density`              | `compact`, `comfortable`, `spacious` | `comfortable`                                           | Personalization      |
| `hapticsEnabled`       | `true`, `false`                      | `true`                                                  | Personalization      |
| `soundEnabled`         | `true`, `false`                      | `false`                                                 | Personalization      |
| `homeCardOrder`        | A list of card ids                   | `habits`, `practice`, `activity`, `baselines`, `health` | Personalization      |
| `hiddenCharts`         | A list of chart ids                  | Empty                                                   | Settings → Insights  |

```json
{
	"habitsEnabled": true,
	"practiceEnabled": true,
	"weightUnit": "kg",
	"density": "compact",
	"homeCardOrder": ["practice", "habits", "activity", "baselines", "health"],
	"hiddenCharts": ["day-of-week"]
}
```

## Rules

- A field that is missing takes its default. So the object above is valid, and the five fields that it leaves out take their defaults.
- The app reads only the fields on this page. A field that it does not know is ignored, and the next save drops it.
- The card id `practice` names the Workout card.
- The docs check fails when a field in the code is not on this page. So a new setting cannot ship without its row.

## Further reading

- [Feature toggles](feature-toggles.md): what the five `Enabled` fields do.
- [Personalization](personalization.md): what each of the other options does.
