<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Baseline, BaselineLog } from '$lib/db/types';
	import { baselineStore } from '$lib/stores/baselines.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { isMetricCleared, metricProgressPct, targetLabel } from '$lib/baselines/logic';
	import { buildDatesBetween, computeRange, xLabelsFor, type RangeKey } from '$lib/chart-utils';
	import { formatTime } from '$lib/date';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import RangeBar from '$lib/components/insights/RangeBar.svelte';
	import BaselineChart from '$lib/components/BaselineChart.svelte';
	import BaselineEntryDialog from '$lib/components/BaselineEntryDialog.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let contextDate = $derived(loggingContext.date);
	let baselines = $derived(baselineStore.activeBaselines);

	let expandedId = $state<string | null>(null);
	let addingFor = $state<Baseline | null>(null);
	let editingEntry = $state<{ baseline: Baseline; entry: BaselineLog } | null>(null);
	let confirmDeleteEntryId = $state<string | null>(null);

	let rangeKey = $state<RangeKey>('last-7');
	let customStart = $state('');
	let customEnd = $state('');

	let range = $derived(computeRange(rangeKey, customStart, customEnd));
	let chartDates = $derived(
		range.start && range.end ? buildDatesBetween(range.start, range.end) : [],
	);
	let chartLabels = $derived(xLabelsFor(chartDates));

	function toggleExpanded(id: string) {
		if (expandedId === id) expandedId = null;
		else expandedId = id;
	}

	function openAdd(baseline: Baseline) {
		addingFor = baseline;
	}

	async function saveNewEntry(values: Record<string, number>) {
		if (!addingFor) return;
		await baselineStore.addEntry(addingFor.id, contextDate, values);
	}

	async function saveEditedEntry(values: Record<string, number>) {
		if (!editingEntry) return;
		await baselineStore.updateEntry(editingEntry.entry.id, values);
	}

	async function deleteEntry(id: string) {
		if (confirmDeleteEntryId !== id) {
			confirmDeleteEntryId = id;
			return;
		}
		confirmDeleteEntryId = null;
		await baselineStore.deleteEntry(id);
	}

	function entrySummary(baseline: Baseline, entry: BaselineLog): string {
		return baseline.metrics
			.filter((m) => typeof entry.values[m.id] === 'number')
			.map((m) => `${entry.values[m.id]} ${m.label}`)
			.join(' · ');
	}
</script>

<svelte:head>
	<title>Baselines — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide baselines-page">
	<PageHeader
		title="Baselines"
		showBack
	/>

	{#if !prefsStore.baselinesEnabled}
		<section class="baselines-disabled">
			<p>Baselines are turned off. Your baseline data is kept either way.</p>
			<a href={resolve('/settings')}>Enable them in Settings</a>
		</section>
	{:else if baselines.length === 0}
		<div class="empty-state">
			<p>No baselines yet.</p>
			<a href={resolve('/settings/baselines')}>Go to Settings → Baselines to add one</a>
		</div>
	{:else}
		<div class="baselines-list">
			{#each baselines as baseline (baseline.id)}
				{@const totals = baselineStore.totalsForDate(baseline, contextDate)}
				{@const cleared = baselineStore.isClearedOn(baseline, contextDate)}
				{@const entries = baselineStore.entriesFor(baseline.id, contextDate)}
				{@const expanded = expandedId === baseline.id}
				<section
					class="bl-card"
					class:bl-card--cleared={cleared}
				>
					<div class="bl-card__head">
						<div class="bl-card__title-col">
							<h2 class="bl-card__name">{baseline.name}</h2>
							<p class="bl-card__direction">
								{#if baseline.direction === 'up'}Floor{:else}Ceiling{/if}
								{#if cleared}
									<span class="bl-card__badge">Cleared</span>
								{/if}
							</p>
						</div>
						<button
							class="bl-card__add"
							onclick={() => openAdd(baseline)}
							aria-label="Add entry for {baseline.name}"
						>
							<Icon
								name="plus"
								size={14}
								stroke={2.5}
							/>
							Log
						</button>
					</div>

					<div class="bl-metrics">
						{#each baseline.metrics as metric (metric.id)}
							{@const total = totals[metric.id] ?? 0}
							{@const metricCleared = isMetricCleared(baseline.direction, metric, total)}
							<div class="bl-metric">
								<div class="bl-metric__row">
									<span class="bl-metric__value">
										<strong>{total}</strong>
										<span class="bl-metric__unit">{metric.label}</span>
									</span>
									<span class="bl-metric__target">{targetLabel(baseline.direction, metric)}</span>
								</div>
								<div
									class="bl-metric__bar"
									role="progressbar"
									aria-valuenow={total}
									aria-valuemin={0}
									aria-valuemax={metric.target}
									aria-label="{baseline.name} {metric.label}"
								>
									<span
										class="bl-metric__fill"
										class:bl-metric__fill--cleared={metricCleared}
										class:bl-metric__fill--over={!metricCleared && baseline.direction === 'under'}
										style="inline-size: {metricProgressPct(baseline.direction, metric, total)}%"
									></span>
								</div>
							</div>
						{/each}
					</div>

					<button
						class="bl-card__expand"
						onclick={() => toggleExpanded(baseline.id)}
						aria-expanded={expanded}
					>
						{#if expanded}Hide{:else}Show{/if} entries &amp; chart ({entries.length})
					</button>

					{#if expanded}
						<div class="bl-details">
							<h3 class="bl-details__title">Entries</h3>
							{#if entries.length === 0}
								<p class="bl-details__empty">Nothing logged on this date yet.</p>
							{:else}
								<ul class="bl-entries">
									{#each entries as entry (entry.id)}
										<li class="bl-entry">
											<span class="bl-entry__time">{formatTime(entry.recordedAt)}</span>
											<span class="bl-entry__values">{entrySummary(baseline, entry)}</span>
											<button
												class="bl-entry__btn"
												onclick={() => (editingEntry = { baseline, entry })}
												aria-label="Edit entry"
											>
												<Icon
													name="edit"
													size={13}
												/>
											</button>
											{#if confirmDeleteEntryId === entry.id}
												<button
													class="bl-entry__btn bl-entry__btn--confirm"
													onclick={() => deleteEntry(entry.id)}>Sure?</button
												>
												<button
													class="bl-entry__btn"
													onclick={() => (confirmDeleteEntryId = null)}
													aria-label="Cancel"
												>
													<Icon
														name="close"
														size={13}
													/>
												</button>
											{:else}
												<button
													class="bl-entry__btn bl-entry__btn--delete"
													onclick={() => deleteEntry(entry.id)}
													aria-label="Delete entry"
												>
													<Icon
														name="trash"
														size={13}
													/>
												</button>
											{/if}
										</li>
									{/each}
								</ul>
							{/if}

							<h3 class="bl-details__title">Progress</h3>
							<RangeBar
								bind:rangeKey
								bind:customStart
								bind:customEnd
							/>
							<div class="bl-chart">
								<BaselineChart
									{baseline}
									dates={chartDates}
									xLabels={chartLabels}
								/>
							</div>
						</div>
					{/if}
				</section>
			{/each}
		</div>
	{/if}
</div>

{#if addingFor}
	<BaselineEntryDialog
		baseline={addingFor}
		initialValues={baselineStore.lastValues(addingFor.id) ?? {}}
		mode="add"
		onsave={saveNewEntry}
		onclose={() => (addingFor = null)}
	/>
{/if}

{#if editingEntry}
	<BaselineEntryDialog
		baseline={editingEntry.baseline}
		initialValues={editingEntry.entry.values}
		mode="edit"
		onsave={saveEditedEntry}
		onclose={() => (editingEntry = null)}
	/>
{/if}

<style>
	.baselines-disabled,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-12);
		text-align: center;
		color: var(--color-text-secondary);

		a {
			color: var(--color-accent);
			font-weight: 600;
		}
	}

	.baselines-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.bl-card {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		padding: var(--space-4);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.bl-card--cleared {
		border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-border));
	}

	.bl-card__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		margin-block-end: var(--space-4);
	}

	.bl-card__title-col {
		min-inline-size: 0;
	}

	.bl-card__name {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.bl-card__direction {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-weight: 700;
		color: var(--color-text-muted);
		margin-block-start: 2px;
	}

	.bl-card__badge {
		padding: 1px var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.625rem;
		letter-spacing: 0.06em;
	}

	.bl-card__add {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
		padding-inline: var(--space-3);
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.8125rem;
		font-weight: 700;
	}

	.bl-metrics {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.bl-metric__row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
		margin-block-end: var(--space-2);
	}

	.bl-metric__value {
		display: flex;
		align-items: baseline;
		gap: 4px;

		strong {
			font-family: var(--font-mono);
			font-size: 1.375rem;
			font-weight: 700;
			line-height: 1;
		}
	}

	.bl-metric__unit {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.bl-metric__target {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-align: end;
	}

	.bl-metric__bar {
		block-size: 6px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		overflow: hidden;
	}

	.bl-metric__fill {
		display: block;
		block-size: 100%;
		border-radius: var(--radius-full);
		background: var(--color-text-muted);
		transition: inline-size var(--duration-base) var(--ease-out);
	}

	.bl-metric__fill--cleared {
		background: var(--color-accent);
	}

	.bl-metric__fill--over {
		background: var(--color-red);
	}

	.bl-card__expand {
		inline-size: 100%;
		margin-block-start: var(--space-4);
		padding-block: var(--space-2);
		border-radius: var(--radius-md);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.bl-details {
		margin-block-start: var(--space-4);
		padding-block-start: var(--space-4);
		border-block-start: 1px solid var(--color-border);
	}

	.bl-details__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-2);
	}

	.bl-details__empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-block-end: var(--space-4);
	}

	.bl-entries {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.bl-entry {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-3);
		border-radius: var(--radius-md);
	}

	.bl-entry__time {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--color-text-muted);
	}

	.bl-entry__values {
		flex: 1;
		min-inline-size: 0;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.bl-entry__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		inline-size: 28px;
		block-size: 28px;
		border-radius: var(--radius-sm);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);

		&:hover {
			color: var(--color-text-secondary);
		}
	}

	.bl-entry__btn--delete:hover {
		color: var(--color-red);
	}

	.bl-entry__btn--confirm {
		inline-size: auto;
		padding-inline: var(--space-2);
		background: var(--color-red);
		color: #ffffff;
		font-size: 0.6875rem;
		font-weight: 700;
	}

	.bl-chart {
		block-size: 220px;
	}
</style>
