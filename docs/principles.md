---
name: Design principles
description: 'The six rules that decide product and technical questions, each with the test that you apply.'
altitude: overview
tags:
  - vision
  - principles
parent: vision.md
---

[Wiki](README.md) / [Vision](vision.md) / Design principles

# Design principles

When a decision is not clear, test it against these six rules. Each rule comes from the vision, and each has one test that you can apply in a minute.

## Speed over completeness

The main action is to log a set, so it must take no thought. A set at the last weight and the target reps is one tap. To change the weight, or to add detail, is one step deeper, never the default.

**Test:** can you log a set in five seconds, with one hand, with only a glance at the screen?

## Offline first, always

No connection is the normal case, not an edge case. The app writes each record on the device at once, and there is no step that saves to a server.

**Test:** turn off the network. Does each screen still work?

## Flexibility without complexity

A plan can have any number of weeks, any days per week, and any exercises. The built-in plans are a place to start, not the product.

**Test:** can you build a plan of five weeks, two days per week, with only the screens of the app?

## Tactile and satisfying

The app looks like a piece of gym equipment, and it is dark only. A thing that can be pressed has a hard shadow, and it sinks into the shadow when you tap it. So you feel that the set is done. This is not decoration: good feedback is why people continue to log.

**Test:** does a logged set feel better than a line in a notes app?

## Small surface area

The app is for a small group of known people. Each screen, option, and field costs time and attention. So you remove a thing before you add one, and you never add a thing "just in case".

**Test:** if you remove it, does the main use get worse?

## Web technology, web idioms

The app uses HTML, CSS, TypeScript, and Svelte. It feels native because of CSS and the browser, not because of a native framework. To install it on a phone is a bonus, not a limit on the design.

**Test:** does the change need anything that a browser does not give?

## Further reading

- [Design system](architecture/design-system.md): how "tactile" becomes colours, rules, and shadows.
- [Offline](architecture/offline.md): how the app works with no network.
