<!--
	Fixed-spacing chart that scrolls sideways instead of squeezing (US-040).

	Each column (a day or a week) is COLUMN_WIDTH wide. When the columns don't fit,
	the plot scrolls natively and opens on the newest column; the value labels sit
	in rails outside the scroller so they stay pinned. The caller's definition must
	hide its own y axes and use PLOT_MARGIN — this component draws the rails from the
	same NiceAxis so labels and grid lines line up exactly.
-->
<script lang="ts">
	import { Chart } from '@tanstack/charts/svelte';
	import type { DomChartDefinition } from '@tanstack/charts';
	import { COLUMN_WIDTH, PLOT_MARGIN } from './theme';
	import { valueToOffset, formatTick, type AxisRail } from './scale';

	let {
		columns,
		definition,
		ariaLabel,
		height = 240,
		columnWidth = COLUMN_WIDTH,
		startAt = 'end',
		left,
		right,
	}: {
		/** Number of x columns in the full range. */
		columns: number;
		/**
		 * Built for the given content width. `any`: TanStack definitions are invariant
		 * in their datum type (tooltip callbacks take it as input), so a wrapper that
		 * accepts every chart can't name one.
		 */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		definition: (contentWidth: number) => DomChartDefinition<any, any, any>;
		ariaLabel: string;
		height?: number;
		/** Pixel width of one column; defaults to COLUMN_WIDTH (~7 on a phone). */
		columnWidth?: number;
		/** Which edge to show first. Day charts open on the newest column. */
		startAt?: 'end' | 'start';
		left?: AxisRail;
		right?: AxisRail;
	} = $props();

	let viewport: HTMLDivElement | undefined = $state();
	let viewportWidth = $state(0);
	let scrollLeft = $state(0);
	let maxScroll = $state(0);

	let contentWidth = $derived(Math.max(viewportWidth, columns * columnWidth));
	let scrollable = $derived(contentWidth > viewportWidth + 1);
	let built = $derived(viewportWidth > 0 ? definition(contentWidth) : null);
	let plotHeight = $derived(height - PLOT_MARGIN.top - PLOT_MARGIN.bottom);

	// Open on the newest column whenever the range (or the space) changes.
	$effect(() => {
		void contentWidth;
		void columns;
		const el = viewport;
		const toEnd = startAt === 'end';
		if (!el) return;
		requestAnimationFrame(() => {
			el.scrollLeft = toEnd ? el.scrollWidth : 0;
			syncScroll();
		});
	});

	function syncScroll() {
		if (!viewport) return;
		scrollLeft = viewport.scrollLeft;
		maxScroll = viewport.scrollWidth - viewport.clientWidth;
	}

	function railTicks(rail: AxisRail): { key: string; label: string; top: number }[] {
		if (rail.categories) {
			const step = plotHeight / Math.max(1, rail.categories.length);
			return rail.categories.map((name, i) => ({
				key: `${i}:${name}`,
				label: name,
				top: PLOT_MARGIN.top + (i + 0.5) * step,
			}));
		}
		if (!rail.axis) return [];
		const { domain, ticks } = rail.axis;
		const format = rail.format ?? formatTick;
		return ticks.map((t) => ({
			key: String(t),
			label: format(t),
			top: PLOT_MARGIN.top + valueToOffset(t, domain, plotHeight),
		}));
	}
</script>

<div
	class="scroll-chart"
	style:height="{height}px"
>
	{#if left}
		<div
			class="scroll-chart__rail scroll-chart__rail--left"
			class:scroll-chart__rail--names={left.categories !== undefined}
			style:flex-basis={left.width ? `${left.width}px` : undefined}
			aria-hidden="true"
		>
			{#if left.unit}<span class="scroll-chart__unit">{left.unit}</span>{/if}
			{#each railTicks(left) as tick (tick.key)}
				<span
					class="scroll-chart__tick"
					style:top="{tick.top}px">{tick.label}</span
				>
			{/each}
		</div>
	{/if}

	<div class="scroll-chart__frame">
		<!-- A scrollable region must be keyboard-reachable so arrow keys can pan it. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="scroll-chart__viewport"
			bind:this={viewport}
			bind:clientWidth={viewportWidth}
			onscroll={syncScroll}
			role="region"
			aria-label={scrollable ? `${ariaLabel}. Scroll sideways for earlier dates.` : ariaLabel}
			tabindex={scrollable ? 0 : -1}
		>
			{#if built}
				<div style:width="{contentWidth}px">
					<Chart
						definition={built}
						width={contentWidth}
						{height}
						{ariaLabel}
					/>
				</div>
			{/if}
		</div>
		{#if scrollable && scrollLeft > 4}
			<div
				class="scroll-chart__cue scroll-chart__cue--start"
				aria-hidden="true"
			>
				‹
			</div>
		{/if}
		{#if scrollable && scrollLeft < maxScroll - 4}
			<div
				class="scroll-chart__cue scroll-chart__cue--end"
				aria-hidden="true"
			>
				›
			</div>
		{/if}
	</div>

	{#if right}
		<div
			class="scroll-chart__rail scroll-chart__rail--right"
			style:flex-basis={right.width ? `${right.width}px` : undefined}
			aria-hidden="true"
		>
			{#if right.unit}<span class="scroll-chart__unit">{right.unit}</span>{/if}
			{#each railTicks(right) as tick (tick.key)}
				<span
					class="scroll-chart__tick"
					style:top="{tick.top}px">{tick.label}</span
				>
			{/each}
		</div>
	{/if}
</div>

<style>
	.scroll-chart {
		display: flex;
		inline-size: 100%;
		color: var(--color-text-secondary);
	}

	.scroll-chart__rail {
		position: relative;
		flex: 0 0 36px;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
	}

	.scroll-chart__rail--names {
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--color-text-primary);
	}

	.scroll-chart__rail--left {
		text-align: end;
		padding-inline-end: 6px;
	}

	.scroll-chart__rail--right {
		text-align: start;
		padding-inline-start: 6px;
	}

	.scroll-chart__tick {
		position: absolute;
		inset-inline: 0;
		transform: translateY(-50%);
		line-height: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.scroll-chart__rail--left .scroll-chart__tick {
		padding-inline-end: 6px;
	}

	.scroll-chart__rail--right .scroll-chart__tick {
		padding-inline-start: 6px;
	}

	.scroll-chart__unit {
		position: absolute;
		inset-block-start: -6px;
		inset-inline: 0;
		font-size: 0.625rem;
		color: var(--color-text-muted);
		line-height: 1;
	}

	.scroll-chart__rail--left .scroll-chart__unit {
		padding-inline-end: 6px;
	}

	.scroll-chart__rail--right .scroll-chart__unit {
		padding-inline-start: 6px;
	}

	.scroll-chart__frame {
		position: relative;
		flex: 1 1 auto;
		min-inline-size: 0;
	}

	.scroll-chart__viewport {
		block-size: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		overscroll-behavior-x: contain;
		scrollbar-width: none;
		touch-action: pan-x pan-y;
	}

	.scroll-chart__viewport::-webkit-scrollbar {
		display: none;
	}

	.scroll-chart__viewport:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.scroll-chart__cue {
		position: absolute;
		inset-block: 0 28px;
		inline-size: 24px;
		display: flex;
		align-items: center;
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		pointer-events: none;
	}

	.scroll-chart__cue--start {
		inset-inline-start: 0;
		justify-content: flex-start;
		background: linear-gradient(to right, var(--color-surface-1), transparent);
	}

	.scroll-chart__cue--end {
		inset-inline-end: 0;
		justify-content: flex-end;
		background: linear-gradient(to left, var(--color-surface-1), transparent);
	}
</style>
