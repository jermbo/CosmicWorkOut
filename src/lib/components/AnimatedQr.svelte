<!--
	Loops through QR frames on a canvas (Send by QR, US-057). Dark modules on white,
	drawn at a whole number of pixels per module and scaled up with pixelated
	rendering, so every square stays sharp for the camera.
-->
<script lang="ts">
	import { frameMatrix } from '$lib/qrBackup/qrMatrix';

	type Props = {
		frames: string[];
		/** Milliseconds each frame stays on screen. */
		intervalMs: number;
		/** Index of the frame showing now. */
		current?: number;
	};

	let { frames, intervalMs, current = $bindable(0) }: Props = $props();

	let canvas = $state<HTMLCanvasElement>();
	const matrices = $derived(frames.map(frameMatrix));

	$effect(() => {
		const count = frames.length;
		current = 0;
		if (count < 2) return;
		const timer = setInterval(() => {
			current = (current + 1) % count;
		}, intervalMs);
		return () => clearInterval(timer);
	});

	$effect(() => {
		const matrix = matrices[current];
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx || !matrix) return;
		const scale = Math.max(1, Math.floor(1024 / matrix.length));
		const size = matrix.length * scale;
		if (canvas.width !== size) canvas.width = canvas.height = size;
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, size, size);
		ctx.fillStyle = '#000000';
		matrix.forEach((row, y) =>
			row.forEach((dark, x) => {
				if (dark) ctx.fillRect(x * scale, y * scale, scale, scale);
			}),
		);
	});
</script>

<div
	class="animated-qr"
	role="img"
	aria-label="QR code {current + 1} of {frames.length}"
>
	<canvas
		bind:this={canvas}
		class="animated-qr__canvas"
	></canvas>
</div>

<style>
	.animated-qr__canvas {
		display: block;
		inline-size: 100%;
		aspect-ratio: 1;
		image-rendering: pixelated;
		background: #ffffff;
	}
</style>
