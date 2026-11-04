---
name: Chart scrolling
description: 'How a chart with a long date range fits on a phone: fixed-width columns, a sideways scroll that opens on the newest day, and value labels that stay in place.'
altitude: mechanism
tags:
  - insights
  - charts
parent: insights.md
---

[Wiki](../README.md) / [Insights](insights.md) / Chart scrolling

# Chart scrolling

A phone screen holds about seven days of bars. A year holds 365. This page tells how a chart shows a long range and stays easy to read.

## The problem with a chart that shrinks

If a chart fits the whole range into the width of the screen, a month gives thin bars, and a year gives lines that you cannot tap or read. The label of each day overlaps the next. So the app does not shrink the chart. It keeps each column the same width and lets the chart grow wider than the screen.

## Fixed columns

Each day — or each week, in a weekly chart — gets one column of 48 pixels. About seven columns fit on a phone. A range of seven days fits with no scroll. A longer range is wider than the screen, and you scroll it sideways with your finger, as you scroll a photo strip.

## It opens on the newest day

When a chart opens, or when you change the range, it scrolls to the right end, to the newest column. The newest days are the ones that you most often want, and to make you scroll a year to reach today would be slow. You scroll left to go back in time.

## The value labels stay in place

The labels of the value axis — 0, 50, 100 — sit in rails outside the part that scrolls. So when you scroll back three months, you still see what a bar of that height means. The rails are drawn by the scroll frame, and each chart turns off its own value axis so that the labels are not drawn twice.

## One scale for the whole range

The value scale covers every value in the range, not only the columns that you see. So a bar keeps its height when you scroll, and two bars in different months compare directly. The scale rounds out to simple steps — 1, 2, or 5, times a power of ten — so the labels are numbers that a person reads at a glance.

### Example

You select YTD in November. Weekly Volume has about 45 week columns. The chart opens on this week, at the right edge. The rails show 0 to 20,000 in steps of 5,000. You scroll left to March, and a bar of 15,000 is as tall as a bar of 15,000 in October.

## Further reading

- [Tech stack](tech-stack.md): the chart library and why it is pinned.
- [Design system](design-system.md): the colours that the charts use.
