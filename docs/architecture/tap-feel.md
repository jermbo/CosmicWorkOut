---
name: Tap feel
description: 'How a tap feels in CosmicWorkOut: the press motion, the six kinds of feedback, haptics, sound, hold to repeat, and reduced motion.'
altitude: mechanism
tags:
  - design
  - feedback
  - motion
parent: design-system.md
---

[Wiki](../README.md) / [System](system.md) / [Design system](design-system.md) / Tap feel

# Tap feel

You log a set in a gym, with sweat on your hands and your eyes on the bar. So each tap must tell you that it counted, by motion, by a buzz, and by an optional sound. This page tells how.

## Every press moves

One handler on the page watches every press. When your finger goes down on a thing that has a shadow, the thing sinks into its shadow. When your finger goes up, it springs back with a small overshoot. A thing with no shadow squishes a little instead. The handler uses the Web Animations API, because the CSS active state is not reliable on a touch screen.

The motion is mechanical: fast in, a hard stop, a small overshoot, like a part that seats in a machine.

## Six kinds of feedback

One short list of named moments drives both the buzz and the sound. So a tap feels and sounds the same in every screen.

| Kind      | When                                               | Buzz pattern (ms)  |
| --------- | -------------------------------------------------- | ------------------ |
| `tap`     | A plain press                                      | 10                 |
| `select`  | You select one of several: a tab, a chip, a toggle | 6                  |
| `tick`    | One step of a hold to repeat                       | 4                  |
| `success` | A set is logged; a habit reaches its goal          | 14, pause 40, 22   |
| `win`     | An exercise is done; the session is done           | 20, 50, 20, 50, 45 |
| `warn`    | A thing that you must check                        | 30, 60, 30         |

The kind of a plain tap comes from the markup: a tab, a radio, or a toggle gives `select`, and anything else gives `tap`. A component can name a different kind, or none.

## Haptics and sound

Haptics use the Vibration API. Android browsers have it; iPhone browsers do not, so the switch for haptics hides where the browser cannot vibrate. Haptics are on by default. Sound is off by default. Each sound is a short tone that the app makes at run time, so there are no audio files.

## Hold to repeat

When you hold a plus or minus button, it waits 420 ms, and then repeats faster and faster, down to one step every 45 ms. Each step gives a `tick`.

## Moments that need more

When an exercise is done, a stamp lands, and the blue plate behind the list slides down to the next exercise. When the session is done, five coloured bars sweep the screen and the totals count up. A figure that changes rolls up when it grows and down when it shrinks.

## Reduced motion

When your device asks for reduced motion, the press motion, the page transitions, and the count-ups do not run, and each CSS animation ends at once. Haptics and sound still follow their switches.

## Further reading

- [Set logging](set-logging.md): which taps log a set.
- [Personalization](personalization.md): the switches for haptics and sound.
