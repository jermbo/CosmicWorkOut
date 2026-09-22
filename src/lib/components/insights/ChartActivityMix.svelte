<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { defineChart } from '@tanstack/charts';
	import { pie, polar, radialArc } from '@tanstack/charts/polar';
	import { Chart } from '@tanstack/charts/svelte';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { ACTIVITY_PALETTE } from '$lib/chart-utils';
	import { chartTooltip } from '$lib/charts/theme';

	let { dates, rangeLabel }: { dates: string[]; rangeLabel: string } = $props();

	type Slice = { type: string; count: number; color: string };

	let breakdown = $derived.by<Slice[]>(() => {
		if (dates.length === 0) return [];
		const dateSet = new Set(dates);
		const counts = new SvelteMap<string, number>();
		for (const a of activityStore.activities) {
			if (!dateSet.has(a.date)) continue;
			counts.set(a.type, (counts.get(a.type) ?? 0) + 1);
		}
		return [...counts.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([type, count], i) => ({
				type,
				count,
				color: ACTIVITY_PALETTE[i % ACTIVITY_PALETTE.length],
			}));
	});

	let total = $derived(breakdown.reduce((s, a) => s + a.count, 0));

	let definition = $derived.by(() => {
		const slices = pie(breakdown, { value: 'count', gapAngle: 0.02 });
		return defineChart({
			marks: [
				polar({
					inset: 4,
					marks: [
						radialArc(slices, {
							innerRadius: ({ radius }) => radius * 0.6,
							cornerRadius: 3,
							color: 'type',
							key: 'type',
						}),
					],
					scales: { angle: null, radius: null },
				}),
			],
			scales: { x: null, y: null },
			color: {
				domain: breakdown.map((s) => s.type),
				range: breakdown.map((s) => s.color),
			},
			tooltip: chartTooltip<(typeof slices)[number]>(
				(d) => d.type,
				(p) => ({
					label: `${Math.round(p.datum.fraction * 100)}%`,
					value: String(p.datum.count),
				}),
			),
		});
	});
</script>

<div class="activity-mix">
	<div class="activity-mix__chart">
		<Chart
			{definition}
			height={200}
			ariaLabel="Donut chart: activity breakdown — {rangeLabel} ({total} total)"
		/>
	</div>
	<ul class="activity-mix__legend">
		{#each breakdown as slice (slice.type)}
			<li>
				<span
					class="activity-mix__swatch"
					style:background={slice.color}
				></span>
				<span class="activity-mix__name">{slice.type}</span>
				<span class="activity-mix__count">{slice.count}</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.activity-mix {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		color: var(--color-text-secondary);
	}

	@container app (inline-size >= 420px) {
		.activity-mix {
			flex-direction: row;
			align-items: center;
		}

		.activity-mix__chart {
			flex: 1 1 60%;
		}
	}

	.activity-mix__legend {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		font-size: 0.8125rem;
		color: var(--color-text-primary);
	}

	.activity-mix__legend li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.activity-mix__swatch {
		inline-size: 12px;
		block-size: 12px;
		border-radius: 3px;
		flex: none;
	}

	.activity-mix__name {
		flex: 1;
		text-transform: capitalize;
	}

	.activity-mix__count {
		font-family: var(--font-mono);
		color: var(--color-text-secondary);
	}
</style>
