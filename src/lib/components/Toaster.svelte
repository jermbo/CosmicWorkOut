<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import Icon from './Icon.svelte';
</script>

<div class="toaster" aria-live="polite">
	{#each toastStore.toasts as toast (toast.id)}
		<div class="toast" class:toast--error={toast.kind === 'error'} role={toast.kind === 'error' ? 'alert' : 'status'}>
			<span class="toast__message">{toast.message}</span>
			<button class="toast__close" onclick={() => toastStore.dismiss(toast.id)} aria-label="Dismiss">
				<Icon name="close" size={14} />
			</button>
		</div>
	{/each}
</div>

<style>
	.toaster {
		position: fixed;
		inset-block-start: calc(var(--safe-top) + var(--space-3));
		inset-inline: var(--space-4);
		margin-inline: auto;
		max-inline-size: var(--max-width);
		z-index: 200;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		pointer-events: auto;
		animation: slide-up var(--duration-normal) var(--ease-out) both;
	}

	.toast--error {
		border-color: var(--color-red);
	}

	.toast__message {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.4;
	}

	.toast__close {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 28px;
		block-size: 28px;
		flex-shrink: 0;
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);

		&:hover {
			color: var(--color-text-primary);
		}
	}
</style>
