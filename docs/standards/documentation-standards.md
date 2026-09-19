[Wiki](../README.md) › [Standards](../README.md#standards) › Documentation Standards

# Documentation Standards

How docs in this wiki are written and structured. For the story format specifically, see
[User Story Guide](user-story-standards.md).

---

## Language tightens as you descend

Precision matters more the closer a doc sits to the code. A metaphor that makes the North Star
memorable becomes a liability in an acceptance criterion.

| Altitude                       | Voice                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| **30k** — vision               | Loose. Metaphor, analogy and opinion are welcome. This is where the _why_ has to land emotionally. |
| **15k** — architecture, maps   | Mostly plain. Explain trade-offs in prose; name the alternatives rejected.                         |
| **5k** — requirements          | Tight. Short declarative sentences. One idea per sentence.                                         |
| **Ground** — stories, code map | Tightest. No metaphor, no idiom, no hedging. A reader should not have to interpret.                |

At 5k and below, apply these rules:

- **One concept, one term.** Use the [Glossary](../glossary.md) word, every time. Never introduce a synonym for variety.
- **Active voice.** "The store writes the session", not "the session is written".
- **Present tense** for behavior that exists. Reserve _shall_ / _will_ for unbuilt work.
- **One instruction per sentence.** Split on "and then".
- **Name the actor.** Say which store, component or function does the thing.
- **State the unhappy path**, not only the happy one.

These borrow from [ASD-STE100](https://www.asd-ste100.org/) (Simplified Technical English)
without adopting it wholesale. Full STE bans the metaphor and voice that make the 30k layer
worth reading. The rule that matters most here is the first one.

---

## The glossary is enforceable

The [Glossary](../glossary.md) is not a reference list — it is the authority.

- If a doc uses a different word for a glossary term, **the doc is wrong**.
- If the product genuinely needs a new term, add it to the glossary in the same change.
- When a term is renamed, record the old name in the glossary's **Naming map** and update every doc.
- **Code identifiers may lag a UI rename.** That is allowed, but the glossary must say so
  explicitly (see [Lift plan](../glossary.md#lift-plan)). Prose has no such excuse.

---

## One complete thought per file

A guideline, not a word count. The test while writing:

> **Does this detail belong here, or does it deserve its own file?**

If a section starts answering a different question than the page title asks, split it and link.
A long page that answers one question is fine. A short page that answers three is not.

---

## Page anatomy

Every page follows the same shape, so a reader always knows where they are and where they can go.

```
[Wiki](README.md) › [Section](path/) › Page Name      <- breadcrumb, line 1

# Page Name

One or two sentences of scope.                        <- what this page answers

> Optional status or as-built callout.

---

...body...

---

## Related                                            <- always last
- [Sibling](...) — why you would go there
- [Parent](...) — the wider context
```

Rules:

1. **Breadcrumb on line 1**, above the title. It is the upward path — the only reliable way to climb out of a deep page.
2. **A `Related` section last**, on every page. It carries siblings and parents, not just children.
3. **Inline links throughout.** No page is a dead end. If a page has no outbound links, it is not finished.
4. Each `Related` entry says **why** you would follow it, not just where it goes.

---

## Three ways in

The structure exists to support three reading paths. When adding a page, check all three still work.

| Path                 | Looks like                                                   | Depends on                                                     |
| -------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| **Top to bottom**    | New reader starts at the North Star and descends             | Ladders, `Related`                                             |
| **Bottom to top**    | Reader lands on a story and needs the reasoning behind it    | Breadcrumbs, upward links                                      |
| **Middle to middle** | Reader half-knows the topic and discovers the adjacent thing | [Maps of content](../README.md#maps-of-content), lateral links |

---

## Conventions

- **No emojis.** They read as unprofessional and do not survive every renderer. Use words.
- **Status labels** are plain text: **Built** / **Shipped** / **Done**, **Planned**, **Removed**, **Not built**.
- **Diagrams use [mermaid](https://mermaid.js.org/).** Every coloured node sets a dark fill with `color:#ffffff`.
  Palette: vision `#3b3f8c`, architecture/stores `#1f6f6f`, requirements/data `#7a4f9e`,
  implementation/neutral `#465569`, shipped/done `#2f7d4f`, planned/triggers `#9a6a1f`.
- **Run `npm run docs:links`** before committing. It checks relative links, heading anchors and orphans.

---

## Related

- [User Story Guide](user-story-standards.md) — persona, story format, acceptance-criteria template
- [Glossary](../glossary.md) — the vocabulary these standards enforce
- [Wiki index](../README.md) — the two ladders, the code axis, and the maps
- [Documenting decisions](../README.md#documenting-decisions) — when and where a decision gets recorded
- [Working Agreement](../implementation/dev-guide.md#conventions-working-agreement) — how code gets written here
