<script lang="ts">
	import { RANGE_OPTIONS, type RangeKey } from '$lib/chart-utils';
	import { toLocalIso } from '$lib/date';
	import { SvelteDate } from 'svelte/reactivity';

	let {
		rangeKey = $bindable<RangeKey>('last-7'),
		customStart = $bindable(''),
		customEnd = $bindable(''),
	}: {
		rangeKey?: RangeKey;
		customStart?: string;
		customEnd?: string;
	} = $props();

	const todayStr = toLocalIso(new SvelteDate());

	function handleSelect(key: RangeKey) {
		if (key === 'custom' && !customStart) {
			const today = new SvelteDate();
			customEnd = toLocalIso(today);
			const s = new SvelteDate(today);
			s.setDate(s.getDate() - 29);
			customStart = toLocalIso(s);
		}
		rangeKey = key;
	}
</script>

<div class="range-bar">
	<div class="range-chips" role="group" aria-label="Date range">
		{#each RANGE_OPTIONS as opt (opt.key)}
			<button
				class="range-chip"
				class:range-chip--active={rangeKey === opt.key}
				onclick={() => handleSelect(opt.key)}
				aria-pressed={rangeKey === opt.key}
			>
				{opt.label}
			</button>
		{/each}
	</div>

	{#if rangeKey === 'custom'}
		<div class="range-custom">
			<label class="range-custom__label">
				From
				<input class="range-custom__input" type="date" bind:value={customStart} max={customEnd || todayStr} />
			</label>
			<span class="range-custom__sep" aria-hidden="true">→</span>
			<label class="range-custom__label">
				To
				<input class="range-custom__input" type="date" bind:value={customEnd} min={customStart} max={todayStr} />
			</label>
		</div>
	{/if}
</div>

<style>
	.range-bar {
		padding: var(--space-3) var(--page-gutter) var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.range-chips {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.range-chips::-webkit-scrollbar {
		display: none;
	}

	.range-chip {
		flex-shrink: 0;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		transition:
			color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
		cursor: pointer;
	}

	.range-chip--active {
		color: var(--color-accent-ink);
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.range-custom {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.range-custom__label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.range-custom__input {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		padding: var(--space-2) var(--space-3);
		font-size: 0.875rem;
		font-family: var(--font-body);
		color-scheme: dark;
	}

	.range-custom__input:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.range-custom__sep {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-block-start: var(--space-4);
	}
</style>
