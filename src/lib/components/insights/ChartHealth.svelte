<!--
	The Health card on Insights (v1.13.0, US-060): headline numbers, a switch between
	three views of blood pressure, and a weight line on the same dates.
	See docs/architecture/health-card.md.
-->
<script lang="ts">
	import { healthStore } from '#lib/stores/health.svelte';
	import { prefsStore } from '#lib/stores/prefs.svelte';
	import type { HealthChartView } from '#lib/db/types';
	import { averageBp, bpReadingsIn, healthLog, weightChange, weightsIn } from '#lib/health/bpZones';
	import SegmentedControl from '#lib/components/SegmentedControl.svelte';
	import ChartHealthReadings from './ChartHealthReadings.svelte';
	import ChartHealthTrend from './ChartHealthTrend.svelte';
	import ChartHealthLog from './ChartHealthLog.svelte';
	import ChartHealthWeight from './ChartHealthWeight.svelte';

	let { dates }: { dates: string[] } = $props();

	const VIEWS: readonly { value: HealthChartView; label: string }[] = [
		{ value: 'readings', label: 'Readings' },
		{ value: 'trend', label: 'Trend' },
		{ value: 'log', label: 'Log' },
	];

	let unit = $derived(prefsStore.weightUnit);
	let view = $derived(prefsStore.healthChartView);

	let bp = $derived(bpReadingsIn(healthStore.readings, dates));
	let weights = $derived(weightsIn(healthStore.readings, dates));
	let avg = $derived(averageBp(bp));
	let weight = $derived(weightChange(weights));
	let log = $derived(healthLog(bp, weights));

	function signed(n: number): string {
		if (n === 0) return '±0';
		return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
	}
</script>

{#if !avg && !weight}
	<p class="insight-empty">Nothing logged in this range yet.</p>
{:else}
	<div class="health-summary">
		{#if weight}
			<div class="health-summary__stat">
				<span class="health-summary__num"
					>{weight.latest}<span class="health-summary__unit">{unit}</span></span
				>
				<span class="health-summary__label">
					Last weight
					{#if weight.change !== null}
						· <span class="health-summary__change">{signed(weight.change)} {unit}</span>
					{/if}
				</span>
			</div>
		{/if}
		{#if avg}
			<div class="health-summary__stat">
				<span class="health-summary__num"
					>{avg.systolic}/{avg.diastolic}<span class="health-summary__unit">mmHg</span></span
				>
				<span class="health-summary__label">
					Average BP ·
					<span
						class="health-summary__zone"
						style:--zone={avg.zone.color}>{avg.zone.label}</span
					>
				</span>
			</div>
		{/if}
	</div>

	{#if bp.length > 0}
		<div class="health-view">
			<SegmentedControl
				options={VIEWS}
				value={view}
				label="Blood pressure view"
				onchange={(v) => prefsStore.setHealthChartView(v)}
			/>
		</div>

		{#if view === 'readings'}
			<ChartHealthReadings
				{dates}
				rows={bp}
			/>
		{:else if view === 'trend'}
			<ChartHealthTrend {dates} />
		{:else}
			<ChartHealthLog
				days={log}
				{unit}
			/>
		{/if}
	{/if}

	{#if weights.length > 0 && !(view === 'log' && bp.length > 0)}
		<h3 class="health-sub">Weight</h3>
		<ChartHealthWeight
			{dates}
			rows={weights}
			{unit}
		/>
	{/if}

	{#if bp.length > 0}
		<p class="insight-note">
			Zones follow the American Heart Association categories. They are labels, not medical advice.
		</p>
	{/if}
{/if}

<style>
	.health-summary {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4) var(--space-8);
	}

	.health-summary__stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.health-summary__num {
		font-family: var(--font-mono);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.health-summary__unit {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin-inline-start: 4px;
	}

	.health-summary__label {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.health-summary__change {
		font-family: var(--font-mono);
		color: var(--color-text-primary);
	}

	.health-summary__zone {
		font-weight: 700;
		color: var(--zone);
	}

	.health-view {
		margin-block: var(--space-4) var(--space-3);
		max-inline-size: 320px;
	}

	.health-sub {
		margin-block: var(--space-5) var(--space-1);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}
</style>
