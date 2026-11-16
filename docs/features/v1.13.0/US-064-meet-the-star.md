[Wiki](../../README.md) › [Features](../README.md) › [v1.13.0](./README.md) › US-064

# US-064 — Meet the Star

> **Status:** Built — waiting on hands-on testing · **Persona:** Growth-minded user · **Depends on:** none
>
> **As built:** the frames of the gallery prototype are in `src/lib/mascot/sprite.ts`; `Mascot.svelte` draws them as SVG rects and plays idle, actions and talk, and stands still under reduced motion. `npm run icons` (`scripts/build-icons.ts`, Node's zlib, no packages) writes `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.png` and `favicon.ico` from the same maps. The star sits in the Overview header through PageHeader's new `aside` snippet.
>
> **Scope:** [Mascot spec](../../initiatives/mascot/spec.md), in scope 1, 2, 3, 4 a, 10 a. Reasons are in its [decision log](../../initiatives/mascot/decision-log.md).

As a **growth-minded user**, I want a small pixel star that lives in the app, on my home screen and in the Overview header, so that the app feels like a friend that is glad I came back, not only a form.

---

## Requirements

1. The drawing
   a. The star shall be an original pixel star in the yellow of Health, with two eyes and a mouth, lit from the top left.
   b. Each pose and each face shall be a drawn pixel map, rendered sharp at every size.
   c. The star shall move only by changing drawn frames, and by whole pixels of its own grid; it shall never be rotated, squashed, or stretched.
2. Where it shows
   a. The favicon, the home-screen app icon, and the Overview header shall show the star.
   b. The icons and the header shall come from the same drawing.
   c. The header image shall show at all times; no switch hides it.
3. Idle
   a. In the Overview header, the star shall breathe in two frames, one every 700 ms.
   b. At random times, between 1.8 s and 4.6 s apart, it shall blink (110 ms) or look left or right (900 ms).
4. Reduced motion
   a. When the device asks for reduced motion, the star shall show its still standing frame, with no idle.

---

## Acceptance Criteria

1. The drawing
   a. Given the Overview is open, when the user looks at the star at 3× and at 8×, then both are sharp, with square pixels.
2. Where it shows
   a. Given the app is installed on a phone, when the user looks at the home screen, then its icon is the star.
   b. Given the app is open in a browser tab, when the user looks at the tab, then its icon is the star.
3. Idle
   a. Given the Overview is open for 10 s, when the user watches the star, then it breathes and blinks at least once.
4. Reduced motion
   a. Given reduced motion is on, when the Overview opens, then the star stands still.

---

## Related Docs

- [Mascot](../../architecture/mascot.md): the page that this story wrote
- [Overview screen](../../architecture/overview-screen.md)
- [Design system](../../architecture/design-system.md): the star and the app icons
- [Tap feel](../../architecture/tap-feel.md): reduced motion
- [Glossary](../../glossary.md): "Mascot" is new
