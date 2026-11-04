---
name: Working agreement
description: 'How code is written in this repo, for a person or an agent: the code rules and why each one exists, what a unit test can reach, and how to add built-in content.'
altitude: part
tags:
  - standards
  - code
parent: project.md
---

[Wiki](../README.md) / [Project facts](project.md) / Working agreement

# Working agreement

These rules keep the code small and the same in each file. They apply to each contributor, a person or an agent.

## The code rules

- **Clean, modern code.** Use Svelte 5 runes and the current idioms. Match the style of the file that you change, so that a reader sees one way to do each thing.
- **No new dependencies.** Solve the problem with what is already in `package.json`. Each package is code that you must trust and update, so a new one needs a strong reason, and you discuss it first.
- **Small components.** Prefer many small components to one large one. A small component is short to read, and a pattern that recurs becomes one that each screen shares.
- **Styles in three layers.** Tokens first, then small shared components, then scoped styles, as [styling layers](styling-layers.md) tells.
- **Do the work, then show it.** For a task with many steps, do all of it and show it for review at the end. One review of the whole is faster than many stops. Stop to ask only when a decision blocks you and has no clear answer.
- **The docs are the memory.** When a decision is made or a behavior changes, change the page that tells it, in the same commit. An agent forgets each session, so a decision that is not in the docs is lost. A new feature gets its page first.

## What a unit test can reach

`npm test` runs Node's own test runner, with types stripped, and no browser. So a test reaches only pure modules, which import nothing at run time except other pure modules. A store or a browser module is out of reach.

When logic worth a test sits behind IndexedDB or the DOM, move the decision into a pure module. The backup code is split this way: the checks before a restore are pure and tested. A new test folder needs its glob in the `test` script.

## Add a built-in exercise

Add the entry to the catalog in `src/lib/db/seeds/strength-exercises.ts`. The app writes built-in items again on each start, so no migration is needed. To put it in a template, add it to a routine in `src/lib/db/seeds/strength-programs.ts`.

## Further reading

- [Tech stack](../architecture/tech-stack.md): the tools that these rules assume.
- [Design system](../architecture/design-system.md): what the tokens look like.
