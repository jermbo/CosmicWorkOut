---
name: Health metrics
description: 'What the Health tracker does: one weight a day, any number of blood-pressure readings with an optional pulse, and why you cannot add a metric.'
altitude: part
tags:
  - health
  - trackers
parent: ../README.md
---

[Wiki](../README.md) / Health metrics

# Health metrics

Some people train to change a number on a scale, or to bring down their blood pressure. The Health screen keeps those numbers next to the rest of the day. It is off until you turn it on in Settings.

## Two metrics with different rules

**Weight** has at most one reading for each date. When you log a weight on a date that already has one, the new value replaces the old one. The reading uses your weight unit from Personalization; the unit is a label, and the app does not convert a stored number.

**Blood pressure** can have many readings on one date, such as one in the morning and one in the evening. Each reading has a systolic and a diastolic value, an optional pulse, and the time that you logged it. The time puts the readings of a day in order.

## How you log

You open the Health screen for the logging date. The Weight block shows the weight of that date or "Not logged"; you tap **Log weight**, set the value, and save. The Blood Pressure block lists the readings of that date; you add one, or you tap **Edit** on one to change it. To fix a past day, you pick the date in the header, as the [logging date](logging-date.md) page tells.

## The metrics are fixed

The app defines the metrics in its code, and you cannot add one. Each has its own rules — one a day or many, which fields, which chart. A new metric comes with an update of the app. A daily number that you define yourself fits in [Baselines](baselines.md).

## Where readings show

The Health card on the Overview shows the weight and the blood pressure of the date. Insights has three charts: a Health Summary with the last weight and seven days of blood pressure, a Weight Trend, and a Blood Pressure chart. Blood pressure charts use the average of each day, so three readings on Monday make one point.

### Example

On Monday morning you log 128/82 with a pulse of 64, and in the evening 122/78. On Tuesday you log a weight of 182.4 lb. The Blood Pressure chart shows one point for Monday: 125/80. The Weight Trend shows 182.4 on Tuesday.

## Further reading

- [Tracker records](tracker-records.md): the fields of a health reading.
- [Insights](insights.md): the date ranges and the charts.
