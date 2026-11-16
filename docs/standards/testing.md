---
name: Testing
description: 'What a unit test in this repo can reach, how to put logic within its reach, and the three rules a test must pass to be worth keeping.'
altitude: part
tags:
  - standards
  - code
parent: working-agreement.md
---

[Wiki](../README.md) / [Project facts](project.md) / [Working agreement](working-agreement.md) / Testing

# Testing

The app is small, so the tests guard only what would hurt a user without anyone seeing it. A test that guards anything else costs time each time the code changes.

## What a test can reach

`npm test` runs Node's own test runner, with types stripped, and no browser. So a test reaches only pure modules, which import nothing at run time except other pure modules. A store or a browser module is out of reach.

When logic worth a test sits behind IndexedDB or the DOM, move the decision into a pure module. The backup code is split this way: the checks before a restore are pure, and the restore steps in `restore.ts` take the databases as an argument, so a test runs them against an in-memory fake that fails on purpose. The `test` script finds every `*.test.ts` file under `src/`, so a new test file in any folder runs with no change to `package.json`.

## What is worth a test

A test earns its place when all three are true:

1. **A bug costs the user.** It loses or corrupts data, or shows a number they trust and act on — a weight target, a streak, a blood pressure zone.
2. **Using the app would not show it.** The bug hides until a rare date, an old backup, or a second device.
3. **It checks behavior, not wording or pixels.** A test that breaks when copy or an animation changes is a cost, not a guard.

So backup and restore, date math, schema upgrades and plan math are tested. Display copy, animation frames, chart axes and colors are not — you see those the moment you open the screen.

## Further reading

- [File backup](../architecture/file-backup.md): the restore steps that the most important tests guard.
- [Project facts](project.md): the `npm test` script.
