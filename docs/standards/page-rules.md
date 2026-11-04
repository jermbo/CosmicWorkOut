---
name: Page rules
description: 'The baseline docs-wiki rules that this project changes, with the reason for each change.'
altitude: exact
tags:
  - standards
  - docs
parent: project.md
---

[Wiki](../README.md) / [Project facts](project.md) / Page rules

# Page rules

The pages of this wiki follow the baseline docs-wiki rules. This page lists the rules that the project changes. A rule that is not here stays as the baseline tells it.

## Changes to the baseline

| Rule          | The baseline                     | This project                       |
| ------------- | -------------------------------- | ---------------------------------- |
| `page-length` | About 270 to 350 words           | About 270 to 400 words             |
| `page-length` | The same limit for each altitude | An `exact` page has no lower limit |

## Why the limits change

A page here teaches with a full example: real names, real weights, and real dates, such as a plan of 150 × 10 that climbs to 185 × 5. Such an example needs 50 to 80 words. With the baseline limit, a page drops its example first, and the example is what makes it teach. So the upper limit is 400.

An `exact` page is a contract. Its tables and fenced blocks carry the content, and the rules do not count them. So a short `exact` page is correct, not thin.

## How the check applies them

`npm run docs:links` warns when a page has more than 400 words, or when a page that is not `exact` has fewer than 240. A warning does not fail the check. The glossary is short for the same reason as an `exact` page, so its warning is expected.

## Further reading

- [Working agreement](working-agreement.md): how code is written, next to these rules for docs.
