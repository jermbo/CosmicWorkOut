<!-- A small single-choice row of buttons (Personalization settings). -->
<script
	lang="ts"
	generics="T extends string"
>
	let {
		options,
		value,
		label,
		onchange,
	}: {
		options: readonly { value: T; label: string }[];
		value: T;
		/** Accessible name for the group. */
		label: string;
		onchange: (value: T) => void;
	} = $props();
</script>

<div
	class="segmented"
	role="radiogroup"
	aria-label={label}
>
	{#each options as option (option.value)}
		<button
			class="segmented__btn"
			class:segmented__btn--on={value === option.value}
			role="radio"
			aria-checked={value === option.value}
			onclick={() => onchange(option.value)}>{option.label}</button
		>
	{/each}
</div>

<style>
	.segmented {
		display: grid;
		grid-auto-columns: 1fr;
		grid-auto-flow: column;
		gap: 4px;
		padding: 4px;
		border-radius: var(--radius-lg);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
	}

	.segmented__btn {
		block-size: 36px;
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.segmented__btn--on {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}
</style>
