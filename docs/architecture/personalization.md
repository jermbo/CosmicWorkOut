---
name: Personalization
description: 'The few options that change how the app feels: weight unit, density, haptics, sound, and the order of the Overview cards, and why there are no more.'
altitude: part
tags:
  - settings
  - personalization
parent: settings.md
---

[Wiki](../README.md) / [Settings](settings.md) / Personalization

# Personalization

Personalization changes how the app feels, not what it tracks. It has five options. This page tells what each one does, and why the list is short.

## Weight unit

You select `lb` or `kg`. The app uses it for each lift and for your body weight. The unit is a label only: the app stores the number that you typed and shows it with the unit that you selected. It does not convert. So if you switch from lb to kg, a stored 135 shows as 135 kg. Select the unit once, at the start.

The reason is safety. A conversion would round each number, and a back-and-forth switch would slowly change your history. A label never changes a stored value.

## Density

You select compact, comfortable, or spacious. The app scales every spacing value of the [design system](design-system.md): compact by 0.75, spacious by 1.25. A small phone gets more on the screen; a large phone gets more room for a thumb. Comfortable is the default.

## Haptics

Haptics are on by default. The switch shows only where the browser can vibrate, which means Android; an iPhone browser cannot, so the switch is not there. The [tap feel](tap-feel.md) page tells which moment gives which buzz.

## Sound

Sound is off by default, because many people train with music or in a quiet room. When it is on, each tap gives a short click that the app makes at run time.

## Overview card order

You drag the cards, or use the arrow buttons, to set the order of the Overview cards. A reset puts back the default order: Habits, Workout, Activity log, Baselines, Health. The editor is also at an older address, kept for old links. The [Overview screen](overview-screen.md) page tells how the app repairs a stored order that is old or damaged.

## What is not here, and why

The app is dark only, with fixed colours for each part and square corners, so there is no theme, accent colour, or corner option. Old stored values for those options are ignored, and the next save drops them. There is no option to turn off the finish animation, and no button to reset all options. Each option has a cost, and these did not earn their place.

### Example

Your friend trains in kg on a small phone. They select `kg` and compact on the first day. Every lift shows in kg, more rows fit on the screen, and their stored numbers are the numbers that they typed.

## Further reading

- [What each toggle hides](toggle-surfaces.md): the stored name and default of each option.
