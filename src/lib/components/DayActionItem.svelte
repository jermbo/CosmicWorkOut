<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		icon: IconName;
		label: string;
		description: string;
		secondary?: boolean;
		onclick: () => void;
	};

	let { icon, label, description, secondary = false, onclick }: Props = $props();
</script>

<button
	class="day-action-item"
	class:day-action-item--secondary={secondary}
	type="button"
	{onclick}
>
	<span class="day-action-item__icon" aria-hidden="true">
		<Icon name={icon} size={20} />
	</span>
	<span class="day-action-item__text">
		<span class="day-action-item__label">{label}</span>
		<span class="day-action-item__desc">{description}</span>
	</span>
	<Icon name="chevron-right" size={18} />
</button>

<style>
	.day-action-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		inline-size: 100%;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		color: inherit;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.day-action-item--secondary {
		background: transparent;
	}

	.day-action-item__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		color: var(--color-accent);
	}

	.day-action-item__text {
		flex: 1;
		min-inline-size: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.day-action-item__label {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.day-action-item__desc {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.day-action-item :global(svg:last-child) {
		flex-shrink: 0;
		color: var(--color-text-muted);
	}
</style>
