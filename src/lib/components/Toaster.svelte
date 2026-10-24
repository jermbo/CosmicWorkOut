<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import Icon from './Icon.svelte';

	function roleForKind(kind: string): 'alert' | 'status' {
		if (kind === 'error') return 'alert';
		return 'status';
	}
</script>

<div
	class="toaster"
	aria-live="polite"
>
	{#each toastStore.toasts as toast (toast.id)}
		<div
			class="toast"
			class:toast--error={toast.kind === 'error'}
			role={roleForKind(toast.kind)}
		>
			<span class="toast__message">{toast.message}</span>
			<button
				class="toast__close"
				onclick={() => toastStore.dismiss(toast.id)}
				aria-label="Dismiss"
			>
				<Icon
					name="close"
					size={14}
				/>
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
		background: var(--color-paper);
		border: var(--rule) solid var(--color-ink);
		box-shadow: 4px 4px 0 var(--color-accent);
		pointer-events: auto;
		animation: slide-up var(--duration-normal) var(--ease-out) both;
	}

	.toast--error {
		background: var(--color-red);
	}

	.toast__message {
		flex: 1;
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-ink);
		line-height: 1.4;
	}

	.toast__close {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 28px;
		block-size: 28px;
		flex-shrink: 0;
		color: var(--color-ink);
	}
</style>
