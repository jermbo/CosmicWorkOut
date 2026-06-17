<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		done,
		total,
		complete = false,
		size = 42,
		strokeWidth = 3,
		dimUntilComplete = false,
		children,
	}: {
		done: number;
		total: number;
		complete?: boolean;
		size?: number;
		strokeWidth?: number;
		dimUntilComplete?: boolean;
		children?: Snippet;
	} = $props();

	let radius = $derived(size / 2 - strokeWidth - 1);
	let circumference = $derived(2 * Math.PI * radius);
	let ratio = $derived(total > 0 ? Math.min(1, done / total) : 0);
	let dashOffset = $derived(circumference - ratio * circumference);
	let center = $derived(size / 2);
</script>

<span class="progress-ring" style:inline-size="{size}px" style:block-size="{size}px">
	<svg class="progress-ring__svg" viewBox="0 0 {size} {size}" aria-hidden="true">
		<circle class="progress-ring__track" cx={center} cy={center} r={radius} stroke-width={strokeWidth} />
		{#if ratio > 0}
			<circle
				class="progress-ring__fill"
				class:progress-ring__fill--complete={complete}
				class:progress-ring__fill--dim={dimUntilComplete && !complete}
				cx={center}
				cy={center}
				r={radius}
				stroke-width={strokeWidth}
				style:stroke-dashoffset={dashOffset}
				style:stroke-dasharray={circumference}
			/>
		{/if}
	</svg>
	{#if children}
		<span class="progress-ring__center">{@render children()}</span>
	{/if}
</span>

<style>
	.progress-ring {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.progress-ring__svg {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		transform: rotate(-90deg);
		overflow: visible;
	}

	.progress-ring__track {
		fill: none;
		stroke: var(--color-surface-3);
	}

	.progress-ring__fill {
		fill: none;
		stroke: var(--color-accent);
		stroke-linecap: round;
		transition: stroke-dashoffset 400ms var(--ease-spring);
	}

	.progress-ring__fill--dim {
		opacity: 0.65;
	}

	.progress-ring__center {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1px;
		text-align: center;
	}
</style>
