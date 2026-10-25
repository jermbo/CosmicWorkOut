<!--
	A row of progress squares (v1.12.0): one per unit, the first `on` filled.
	Drawn in currentColor, so it reads on any color field. Decorative — callers
	carry the real count in text or an aria-label.
-->
<script lang="ts">
	type Props = {
		total: number;
		on: number;
	};

	let { total, on }: Props = $props();
</script>

<div
	class="blocks"
	aria-hidden="true"
>
	{#each { length: total }, i (i)}
		<span
			class="blocks__cell"
			class:blocks__cell--on={i < on}
			style:--i={i}
		></span>
	{/each}
</div>

<style>
	.blocks {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 4px;
	}

	.blocks__cell {
		block-size: 14px;
		border: var(--rule-thin) solid currentColor;
	}

	/* Filled cells clunk in one after another. */
	.blocks__cell--on {
		background: currentColor;
		animation: cell-in 260ms cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
		animation-delay: calc(var(--i) * 45ms);
	}

	@keyframes cell-in {
		from {
			transform: scaleY(0.2);
			opacity: 0;
		}
	}
</style>
