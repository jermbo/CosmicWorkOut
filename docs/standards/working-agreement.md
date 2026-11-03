---
name: Working agreement
description: 'How code is written in this repo, for a person or an agent: the code rules, the three layers of styling, what a unit test can reach, and how to add built-in content.'
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

- **Clean, modern code.** Use Svelte 5 runes and the current idioms. Match the style of the file that you change.
- **No new dependencies.** Solve the problem with what is already in `package.json`. A new package needs a strong reason, and you discuss it first.
- **Small components.** Prefer many small components to one large one.
- **Do the work, then show it.** For a task with many steps, do all of it and show it for review at the end. Stop to ask only when a decision blocks you and has no clear answer.
- **The docs are the memory.** When a decision is made or a behavior changes, change the page that tells it, in the same commit. A new feature gets its page first.

## Three layers of styling

Use the first layer that fits:

1. **Tokens.** Colours, spacing, corners, and timing are CSS custom properties in `src/app.css`. Never type a value that a token already gives.
2. **Small shared components.** A pattern that recurs, such as a button, a chip, or a sheet header, becomes a component with its own scoped styles.
3. **Scoped styles.** Everything that belongs to one component stays in that component.

The global stylesheet holds only tokens, the reset, the focus ring, the app shell, and keyframes. A global class for a pattern does not work here, because a scoped rule always wins over it.

A parent cannot style the markup of a child component. So a shared component needs a real prop for each thing that a caller must change; a pass-through class does nothing.

## What a unit test can reach

`npm test` runs Node's own test runner, with types stripped, and no browser. So a test reaches only pure modules, which import nothing at run time except other pure modules. A store or a browser module is out of reach.

When logic worth a test sits behind IndexedDB or the DOM, move the decision into a pure module. The backup code is split this way: the checks before a restore are pure and tested. A new test folder needs its glob in the `test` script.

## Add a built-in exercise

Add the entry to the catalog in `src/lib/db/seeds/strength-exercises.ts`. The app writes built-in items again on each start, so no migration is needed. To put it in a template, add it to a routine in `src/lib/db/seeds/strength-programs.ts`.

## Further reading

- [Tech stack](../architecture/tech-stack.md): the tools that these rules assume.
- [Design system](../architecture/design-system.md): what the tokens look like.
