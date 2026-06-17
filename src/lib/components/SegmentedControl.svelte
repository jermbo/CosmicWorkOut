<script lang="ts" generics="T extends string">
	let {
		options,
		value,
		onchange,
		ariaLabel,
	}: {
		options: { value: T; label: string }[];
		value: T;
		onchange: (value: T) => void;
		ariaLabel: string;
	} = $props();
</script>

<div class="seg-control" role="radiogroup" aria-label={ariaLabel}>
	{#each options as option}
		<button
			class="seg-control__btn"
			class:seg-control__btn--active={value === option.value}
			role="radio"
			aria-checked={value === option.value}
			onclick={() => onchange(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.seg-control {
		display: flex;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 3px;
		gap: 3px;
	}

	.seg-control__btn {
		flex: 1;
		block-size: 38px;
		border-radius: calc(var(--radius-lg) - 4px);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.seg-control__btn--active {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
	}
</style>
