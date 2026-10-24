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
		background: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
	}

	/* Cells split by 3px rules; the selected cell is filled paper (like the nav). */
	.segmented__btn {
		block-size: 44px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-primary);

		& + & {
			border-inline-start: var(--rule) solid var(--color-paper);
		}
	}

	.segmented__btn--on {
		background: var(--color-paper);
		color: var(--color-ink);
	}
</style>
