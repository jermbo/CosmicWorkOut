<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	interface Props {
		title: string;
		confirmLabel?: string;
		confirmBusyLabel?: string;
		cancelLabel?: string;
		danger?: boolean;
		busy?: boolean;
		error?: string | null;
		onconfirm: () => void;
		oncancel: () => void;
		children?: Snippet;
	}

	let {
		title,
		confirmLabel = 'Confirm',
		confirmBusyLabel,
		cancelLabel = 'Cancel',
		danger = false,
		busy = false,
		error = null,
		onconfirm,
		oncancel,
		children,
	}: Props = $props();

	const titleId = $props.id();

	let confirmText = $derived.by(() => {
		if (busy) return confirmBusyLabel ?? confirmLabel;
		return confirmLabel;
	});
</script>

<div
	class="confirm-backdrop"
	role="presentation"
	onclick={() => !busy && oncancel()}
></div>
<div
	class="confirm"
	role="alertdialog"
	aria-labelledby={titleId}
	aria-modal="true"
>
	<p
		class="confirm__title"
		id={titleId}
	>
		{title}
	</p>
	{#if children}
		<div class="confirm__body">{@render children()}</div>
	{/if}
	{#if error}
		<p class="confirm__error">{error}</p>
	{/if}
	<div class="confirm__actions">
		<Button
			variant="ghost"
			grow
			bold
			onclick={oncancel}
			disabled={busy}
		>
			{cancelLabel}
		</Button>
		<Button
			variant={danger ? 'danger' : 'primary'}
			grow
			bold
			onclick={onconfirm}
			disabled={busy}
		>
			{confirmText}
		</Button>
	</div>
</div>

<style>
	.confirm-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 90;
	}

	.confirm {
		position: fixed;
		inset-inline: var(--space-4);
		inset-block-start: 50%;
		transform: translateY(-50%);
		max-inline-size: 400px;
		margin-inline: auto;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--r-xl);
		padding: var(--space-5);
		z-index: 91;
		box-shadow: var(--shadow-lg);
	}

	.confirm__title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.confirm__body {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-4);
		line-height: 1.5;
	}

	.confirm__error {
		font-size: 0.875rem;
		color: var(--color-red);
		margin-block-end: var(--space-4);
		line-height: 1.5;
	}

	.confirm__actions {
		display: flex;
		gap: var(--space-2);
	}
</style>
