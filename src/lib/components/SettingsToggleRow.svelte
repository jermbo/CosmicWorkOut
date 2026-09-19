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
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
	}

	.settings-toggle-row__text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-inline-size: 0;
	}

	.settings-toggle-row__label {
		font-size: 0.9375rem;
		font-weight: 600;
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
		inline-size: 40px;
		block-size: 24px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.settings-toggle-row__toggle--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.settings-toggle-row__thumb {
		position: absolute;
		inset-block: 2px;
		inset-inline-start: 2px;
		inline-size: 18px;
		block-size: 18px;
		border-radius: var(--radius-full);
		background: white;
		transition: transform var(--duration-fast) var(--ease-out);

		.settings-toggle-row__toggle--active & {
			transform: translateX(16px);
		}
	}
</style>
