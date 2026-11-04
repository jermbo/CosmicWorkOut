---
name: Styling layers
description: 'Where a style goes in this repo: tokens, small shared components, or scoped styles, and why a global class for a pattern does not work.'
altitude: part
tags:
  - standards
  - styling
parent: working-agreement.md
---

[Wiki](../README.md) / [Project facts](project.md) / [Working agreement](working-agreement.md) / Styling layers

# Styling layers

A style written in two places has a winner that you did not pick. In Svelte, a scoped rule always wins over a global class. So each style in this repo has one place, and this page tells which.

## Use the first layer that fits

1. **Tokens.** Colours, spacing, corners, and timing are CSS custom properties in `src/app.css`. Never type a value that a token already gives, because a token is what the density setting and the [design system](../architecture/design-system.md) change.
2. **Small shared components.** A pattern that recurs, such as a button, a chip, or a sheet header, becomes a component with its own scoped styles.
3. **Scoped styles.** Everything that belongs to one component stays in that component.

## What the global stylesheet holds

The global stylesheet holds only tokens, the reset, the focus ring, the app shell, and keyframes. A global class for a pattern does not work here: any scoped rule beats it, so the pattern breaks in the first component that styles the same element.

## A parent cannot style its child

Scoped styles reach only the markup of their own component. So a shared component needs a real prop for each thing that a caller must change. A class that the caller passes through does nothing.

### Example

You build a new card with a coral field and a row of progress blocks. The coral comes from the token of the Habits field, not from a hex value. The row of blocks is the shared component that the habit tiles use. The card needs a little more space under its title, so that rule goes in the scoped styles of the card. When you need the blocks to be smaller, you add a size prop to the shared component, not a class from the card.

## Further reading

- [Tech stack](../architecture/tech-stack.md): why there is no CSS-in-JS.
