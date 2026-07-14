<script lang="ts">
	type Props = {
		label: string;
		description: string;
		buttonLabel?: string;
		onclick: () => void;
		danger?: boolean;
	};

	let { label, description, buttonLabel = 'Clear', onclick, danger = true }: Props = $props();
</script>

<div class="settings-action-row">
	<div class="settings-action-row__text">
		<span class="settings-action-row__label">{label}</span>
		<span class="settings-action-row__desc">{description}</span>
	</div>
	<button
		class="settings-action-row__btn"
		class:settings-action-row__btn--danger={danger}
		{onclick}
		type="button"
	>
		{buttonLabel}
	</button>
</div>

<style>
	.settings-action-row {
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

	.settings-action-row__text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-inline-size: 0;
	}

	.settings-action-row__label {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.settings-action-row__desc {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.settings-action-row__btn {
		flex-shrink: 0;
		padding-inline: var(--space-3);
		padding-block: var(--space-2);
		border-radius: var(--radius-md);
		font-size: 0.8125rem;
		font-weight: 700;
		background: var(--color-surface-3);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.settings-action-row__btn--danger {
		color: var(--color-red);
		border-color: var(--color-red);
	}
</style>
