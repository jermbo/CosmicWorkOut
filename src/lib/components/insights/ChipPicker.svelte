<!-- Single-choice chips for picking what a chart shows (a baseline, a metric, a habit). -->
<script lang="ts">
	let {
		options,
		value,
		label,
		onchange,
	}: {
		options: readonly { id: string; label: string; color?: string }[];
		value: string;
		/** Accessible name for the group. */
		label: string;
		onchange: (id: string) => void;
	} = $props();
</script>

<div
	class="chips"
	role="radiogroup"
	aria-label={label}
>
	{#each options as option (option.id)}
		<button
			class="chips__btn"
			class:chips__btn--on={value === option.id}
			role="radio"
			aria-checked={value === option.id}
			onclick={() => onchange(option.id)}
		>
			{#if option.color}
				<span
					class="chips__dot"
					style:background={option.color}
				></span>
			{/if}
			{option.label}
		</button>
	{/each}
</div>

<style>
	.chips {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		scrollbar-width: none;
		margin-block-end: var(--space-3);
		padding-block-end: 2px;
	}

	.chips::-webkit-scrollbar {
		display: none;
	}

	.chips__btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		padding: 4px var(--space-3);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.chips__btn--on {
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}

	.chips__dot {
		inline-size: 8px;
		block-size: 8px;
		border-radius: var(--radius-full);
	}
</style>
