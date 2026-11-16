---
name: Health card
description: 'The Health Summary card on Insights: the headline numbers, the Readings, Trend and Log views of blood pressure, the zones, and the weight line.'
altitude: part
tags:
  - health
  - insights
  - charts
parent: insights.md
---

[Wiki](../README.md) / [Insights](insights.md) / Health card

# Health card

A nurse reads home blood pressure in a set way: each reading as a pair, next to the standard zones, with the time of day. The Health Summary card on Insights shows it that way. Weight sits in the same card, so you see both together.

## Headline numbers

The top of the card shows the last weight in the range and how much it changed since the first weight in the range. Next to it is the average of every blood-pressure reading in the range, with its zone. A number with no data in the range is left out, not shown as zero.

## Three views of blood pressure

A switch picks the view. The card remembers it on this device, in `healthChartView` of the [settings object](settings-object.md).

- **Readings** is the default. Each reading is one bar, from the diastolic up to the systolic, in the colour of its zone. Two readings on one date are two bars, in time order, so morning and evening sit side by side. Dashed lines mark 120 and 80, the top of Normal.
- **Trend** draws the daily averages of systolic, diastolic and pulse as lines.
- **Log** lists every reading in the range, newest first, grouped by date, with the time, the values, the pulse and the zone. A date with a weight shows it.

Under Readings and Trend, a small line shows the weight on the same dates. Log leaves it out, because the weight of each date is already in the list.

## The zones

The zones are the categories of the American Heart Association. A reading takes the higher zone of its two numbers.

| Zone     | Systolic  |     | Diastolic |
| -------- | --------- | --- | --------- |
| Normal   | under 120 | and | under 80  |
| Elevated | 120 – 129 | and | under 80  |
| Stage 1  | 130 – 139 | or  | 80 – 89   |
| Stage 2  | 140 or up | or  | 90 or up  |
| Severe   | over 180  | or  | over 120  |

The zones are labels, not advice. The card names their source, and a Severe reading raises no alert. The chart colours each bar rather than drawing bands behind it, because the systolic and diastolic cut-offs overlap on one axis: 95 is Stage 2 for a diastolic, but Normal for a systolic.

### Example

On Monday you log 128/82 at 07:00 and 122/78 at 21:00. Readings shows two bars on Monday: the first is Stage 1, because 82 is over 80, and the second is Elevated. Trend shows one point of 125 and one of 80. The headline reads 125/80, Stage 1.

## Further reading

- [Health metrics](health-metrics.md): how the readings are stored.
- [Insights](insights.md): the date range that the card uses.
