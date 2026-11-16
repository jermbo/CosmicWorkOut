[Wiki](../../README.md) › [Backlog](../../features/backlog.md) › Mascot › Decision log

# Decision log: Mascot

The owner wants a small pet in the app, inspired by the Claude crab: it shows on the loading screen, dances when you do something good, and can grow over time. This page records the decisions for it.

## The state of today

| Part                | Fact                                                                                                                                                  | Where                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Loading screen      | A spinner with "Loading…". The app shows no screen until the database, settings and stores are ready. On a phone this is often under a second          | `src/routes/+layout.svelte`, [Boot](../../architecture/boot.md) |
| Moments of success  | Named feedback kinds: `success` (a set is logged; a habit reaches its goal) and `win` (an exercise is done; the session is done)                      | [Tap feel](../../architecture/tap-feel.md)       |
| Big moments         | A stamp when an exercise is done; five coloured bars sweep the screen when a session is done                                                           | [Tap feel](../../architecture/tap-feel.md)       |
| Reduced motion      | When the device asks for it, motion does not run                                                                                                      | [Tap feel](../../architecture/tap-feel.md)       |
| Streak              | The week streak on the Overview: weeks in a row with a session. The current week cannot break it, so it never punishes Monday                         | [Week streak](../../architecture/week-streak.md) |
| "Goal"              | In the glossary, a goal is a target on a plan (one focus lift at a weight × reps). A habit also has a "daily goal"                                    | [Glossary](../../glossary.md)                    |
| Mascot or pet       | None. No art assets except the app icons                                                                                                              | `static/`                                       |
| The vision limits   | "A personal notebook, not a fitness product". Small surface area: remove a thing before you add one. Tactile feedback "is why people continue to log" | [Vision](../../vision.md), [Principles](../../principles.md) |

## Decisions

### The character

1. **The mascot is an original character of CosmicWorkOut.** Its style is inspired by the Claude crab (simple shapes, small and friendly), but it is not a crab and not a copy. An alien or a flame are the ideas so far. The reason: it must fit this app, and the crab belongs to Anthropic. An option that was rejected: a crab.
2. **The mascot is also the face of the app.** It is the favicon, the image in the header, and it shows in other places. The reason: the owner wants one character across the whole app.
3. **The part that you interact with has its own toggle.** The image in the favicon and the header always shows. The reason: some users want a calm app, but the brand stays the same.

### Mood and growth

4. **The pet never dies, but it can be sad.** Its model mixes a streak (it resets) with needs (it reacts to how you care for it). The reason: being sad pushes you to come back, and death is too harsh for a personal notebook. Options that were rejected: growth only, which never shows sadness; a pet that dies.

### Screens

5. **The change from one screen to the next gets a livelier animation.** The reason: the owner feels that the screens "jump around" today, and the app should feel alive.

## Choices that are not confirmed

None yet.
