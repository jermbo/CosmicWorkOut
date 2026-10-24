<script lang="ts">
	type Props = {
		label: string;
		description?: string;
		checked: boolean;
		onchange: (checked: boolean) => void;
	};

	let { label, description, checked, onchange }: Props = $props();

	const labelId = $props.id();
</script>

<div class="settings-toggle-row">
	<div class="settings-toggle-row__text">
		<span
			class="settings-toggle-row__label"
			id={labelId}>{label}</span
		>
		{#if description}
			<span class="settings-toggle-row__desc">{description}</span>
		{/if}
	</div>
	<button
		class="settings-toggle-row__toggle"
		class:settings-toggle-row__toggle--active={checked}
		onclick={() => onchange(!checked)}
		role="switch"
		aria-checked={checked}
		aria-labelledby={labelId}
	>
		<span class="settings-toggle-row__thumb"></span>
	</button>
</div>

<style>
	.settings-toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-block-size: 56px;
		padding-inline: var(--space-4);
		padding-block: var(--space-3);
		background: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
	}

	.settings-toggle-row__text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-inline-size: 0;
	}

	.settings-toggle-row__label {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-text-primary);
	}

	.settings-toggle-row__desc {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.settings-toggle-row__toggle {
		position: relative;
		flex-shrink: 0;
		inline-size: 52px;
		block-size: 28px;
		background: var(--field-empty);
		border: var(--rule) solid var(--color-paper);
	}

	.settings-toggle-row__toggle--active {
		background: var(--color-accent);
	}

	.settings-toggle-row__thumb {
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		inline-size: 22px;
		background: var(--color-paper);
		border-inline-end: var(--rule) solid var(--color-ink);
		transition: transform var(--duration-press) linear;

		.settings-toggle-row__toggle--active & {
			transform: translateX(24px);
			border-inline-end: none;
			border-inline-start: var(--rule) solid var(--color-ink);
		}
	}
</style>
