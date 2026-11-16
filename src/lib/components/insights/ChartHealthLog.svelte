<!-- Log view of the Health card (US-060): every reading in the range, newest first, by date. -->
<script lang="ts">
	import { longDate } from '$lib/charts/theme';
	import type { LogDay } from '$lib/health/bpZones';

	let { days, unit }: { days: LogDay[]; unit: string } = $props();
</script>

<div class="health-log">
	{#each days as day (day.date)}
		<section class="health-log__day">
			<header class="health-log__date">
				<span>{longDate(day.date)}</span>
				{#if day.weight !== null}
					<span class="health-log__weight">{day.weight} {unit}</span>
				{/if}
			</header>
			{#if day.readings.length > 0}
				<table class="health-log__table">
					<thead class="visually-hidden">
						<tr><th>Time</th><th>Blood pressure</th><th>Pulse</th><th>Zone</th></tr>
					</thead>
					<tbody>
						{#each day.readings as r (r.id)}
							<tr>
								<td class="health-log__time">{r.time}</td>
								<td class="health-log__bp">{r.systolic}/{r.diastolic}</td>
								<td class="health-log__pulse">{r.pulse === null ? '' : `♥ ${r.pulse}`}</td>
								<td class="health-log__zone">
									<span
										class="health-log__swatch"
										style:background={r.zone.color}
									></span>{r.zone.label}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</section>
	{/each}
</div>

<style>
	.health-log {
		max-block-size: 320px;
		overflow-y: auto;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	.health-log__day + .health-log__day {
		margin-block-start: var(--space-3);
	}

	.health-log__date {
		display: flex;
		justify-content: space-between;
		padding-block: var(--space-1);
		border-block-end: var(--rule-thin) solid var(--color-border-strong);
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.health-log__weight {
		color: var(--field-health);
	}

	.health-log__table {
		inline-size: 100%;
		border-collapse: collapse;
		color: var(--color-text-secondary);
	}

	.health-log__table td {
		padding-block: var(--space-1);
	}

	.health-log__bp {
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.health-log__zone {
		text-align: end;
		white-space: nowrap;
	}

	.health-log__swatch {
		display: inline-block;
		inline-size: 8px;
		block-size: 8px;
		margin-inline-end: 6px;
	}

	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
