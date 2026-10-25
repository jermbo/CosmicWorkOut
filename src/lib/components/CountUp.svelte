<!--
	Counts a whole number up from 0 on mount (v1.12.0) — the session-complete
	stats tally themselves. Shows the final value at once under reduced motion.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from '$lib/feedback';

	let {
		value,
		delay = 0,
		duration = 700,
	}: { value: number; delay?: number; duration?: number } = $props();

	let shown = $state(0);

	onMount(() => {
		if (prefersReducedMotion() || value <= 0) {
			shown = value;
			return;
		}
		let frame = 0;
		const start = performance.now() + delay;
		const tick = (now: number) => {
			const t = Math.min(1, Math.max(0, (now - start) / duration));
			// Ease out: fast at first, settling onto the number.
			shown = Math.round(value * (1 - Math.pow(1 - t, 3)));
			if (t < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});
</script>

{shown}
