<!--
	One streak badge (US-065): the tracker's code, the count, and D or W, in the colour of
	its tracker. At 0 it is empty: diagonal stripes, a dashed border, "A 0".
-->
<script lang="ts">
	import type { TrackerStreak } from '$lib/stores/streaks.svelte';
	import { badgeLabel, badgeText } from '$lib/mascot/lines';

	type Props = {
		streak: TrackerStreak;
		onclick: () => void;
	};

	let { streak, onclick }: Props = $props();
</script>

<button
	type="button"
	class="streak-badge"
	class:streak-badge--empty={streak.count === 0}
	style:--field="var(--field-{streak.field})"
	data-streak-badge
	aria-label={badgeLabel(streak)}
	{onclick}
>
	{badgeText(streak)}
</button>

<style>
	.streak-badge {
		display: inline-flex;
		align-items: center;
		block-size: 30px;
		padding-inline: var(--space-2);
		background: var(--field);
		color: var(--color-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.02em;
		white-space: nowrap;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		&:active {
			transform: translate(2px, 2px);
			box-shadow: none;
		}
	}

	.streak-badge--empty {
		background: var(--field-empty);
		color: var(--color-text-secondary);
		border: var(--rule) dashed var(--field);
		box-shadow: none;
	}
</style>
