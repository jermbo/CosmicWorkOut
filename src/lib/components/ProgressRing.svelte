<script lang="ts">
	let {
		done,
		total,
		complete = false
	}: {
		done: number;
		total: number;
		complete?: boolean;
	} = $props();

	const RADIUS = 17;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

	let dashOffset = $derived(CIRCUMFERENCE - (total > 0 ? done / total : 0) * CIRCUMFERENCE);
</script>

<svg class="progress-ring" viewBox="0 0 42 42" aria-hidden="true">
	<circle class="progress-ring__track" cx="21" cy="21" r={RADIUS} />
	<circle
		class="progress-ring__fill"
		class:progress-ring__fill--complete={complete}
		cx="21"
		cy="21"
		r={RADIUS}
		style:stroke-dashoffset={dashOffset}
		style:stroke-dasharray={CIRCUMFERENCE}
	/>
</svg>

<style>
	.progress-ring {
		inline-size: 42px;
		block-size: 42px;
		transform: rotate(-90deg);
		flex-shrink: 0;
	}

	.progress-ring__track {
		fill: none;
		stroke: var(--color-surface-3);
		stroke-width: 3;
	}

	.progress-ring__fill {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 3;
		stroke-linecap: round;
		transition: stroke-dashoffset 400ms var(--ease-spring);
	}

	.progress-ring__fill--complete {
		stroke: var(--color-accent);
	}
</style>
