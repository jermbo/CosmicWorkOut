---
name: Boot
description: 'What the app does between the tap on its icon and the first screen, in order, and what occurs when a step fails.'
altitude: mechanism
tags:
  - system
  - boot
parent: system.md
---

[Wiki](../README.md) / [System](system.md) / Boot

# Boot

Before the first screen, the app must have its database ready, your settings applied, and every store loaded. This page gives the steps in order.

## Why the app waits before it draws

A screen that draws before its store loads shows empty data for a moment, and a tap in that moment can write to the wrong place. So the app shows nothing until each step is done, and then it draws the first screen in one pass.

## The steps

1. **Open the database.** If the version on the device is lower, the browser runs the [schema upgrade](schema-upgrades.md) first.
2. **Write the built-in content.** The app writes the built-in items and templates again, and it adds the built-in habits if the habit store is empty.
3. **Load your settings.** The app reads your settings from localStorage and applies the spacing density to the page. If the stored value is damaged, the app uses the defaults and continues.
4. **Load every store at the same time.** The plans, habits, activities, health readings, goals, and baselines load in parallel. Each store loads even when its feature toggle is off, so your data is ready when you turn the toggle on.
5. **Look for a session in progress.** This step runs only when Workout is on. If localStorage holds a session in progress, the app shows a banner: resume it, or discard it.
6. **Show the app.**

## When a step fails

If a step throws an error, the app does not show a spinner that never stops. It shows a message and a button to reload. The error goes to the console. Damaged settings do not count as a failure, because step 3 falls back to the defaults.

## Example

You close the browser in the middle of a session on Monday. On Tuesday you open the app. Steps 1 to 4 run. Step 5 finds Monday's session in localStorage and shows the banner. You tap Resume, and the session overlay opens with the sets that you logged on Monday. If Workout is off, step 5 does not run, and the old session stays hidden until you turn Workout on.

## Further reading

- [Session lifecycle](session-lifecycle.md): what resume and discard do.
- [Storage](storage.md): what each store holds.
