<!-- A row of preset color swatches, used for habit colors and the accent color. -->
<script lang="ts">
	let {
		value,
		colors,
		label,
		onchange,
		names = {},
	}: {
		value: string;
		colors: readonly string[];
		/** Accessible name for the group, e.g. "Habit color". */
		label: string;
		onchange: (color: string) => void;
		/** Spoken name per color; falls back to the hex value. */
		names?: Record<string, string>;
	} = $props();

	let current = $derived(value.toLowerCase());
</script>

<div
	class="swatches"
	role="radiogroup"
	aria-label={label}
>
	{#each colors as color (color)}
		{@const selected = current === color.toLowerCase()}
		<button
			type="button"
			class="swatches__btn"
			class:swatches__btn--selected={selected}
			style:--swatch={color}
			role="radio"
			aria-checked={selected}
			aria-label={names[color.toLowerCase()] ?? color}
			onclick={() => onchange(color)}
		></button>
	{/each}
</div>

<style>
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.swatches__btn {
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--swatch);
		border: 2px solid transparent;
		box-shadow: inset 0 0 0 2px var(--color-surface-2);
		transition: transform var(--duration-fast) var(--ease-out);

		&:hover {
			transform: scale(1.08);
		}
	}

	.swatches__btn--selected {
		border-color: var(--color-text-primary);
	}
</style>
