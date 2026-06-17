<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';

	const COLORS = ['#b2f042', '#b286fd', '#60c6ff', '#ffffff', '#e55733'];
	const COUNT = 64;

	const pieces = Array.from({ length: COUNT }, (_, i) => ({
		id: i,
		color: COLORS[Math.floor(Math.random() * COLORS.length)],
		left: Math.random() * 100,
		delay: Math.random() * 400,
		duration: 1400 + Math.random() * 1400,
		size: 6 + Math.random() * 6,
		startRotation: Math.floor(Math.random() * 360),
		isRect: Math.random() > 0.5,
	}));
</script>

{#if prefsStore.completionFeel !== 'subtle'}
	<div class="confetti" aria-hidden="true">
		{#each pieces as piece (piece.id)}
			<div
				class="confetti__piece"
				style:left="{piece.left}%"
				style:background={piece.color}
				style:width="{piece.size}px"
				style:height="{piece.isRect ? piece.size * 1.6 : piece.size}px"
				style:border-radius={piece.isRect ? '2px' : '50%'}
				style:animation-delay="{piece.delay}ms"
				style:animation-duration="{piece.duration}ms"
				style:--start-rot="{piece.startRotation}deg"
			></div>
		{/each}
	</div>
{/if}

<style>
	@keyframes confetti-fall {
		0% {
			transform: translateY(-20px) rotate(var(--start-rot));
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			transform: translateY(110dvh) rotate(calc(var(--start-rot) + 720deg));
			opacity: 0;
		}
	}

	.confetti {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 350;
		overflow: hidden;
	}

	.confetti__piece {
		position: absolute;
		top: -10px;
		animation: confetti-fall linear forwards;
	}
</style>
