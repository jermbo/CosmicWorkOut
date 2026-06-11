<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		children,
		onclose,
		maxHeight = '90dvh'
	}: {
		children: Snippet;
		onclose: () => void;
		maxHeight?: string;
	} = $props();

	let dialog: HTMLDialogElement;

	onMount(() => {
		dialog.showModal();
	});

	function handleDialogClick(e: MouseEvent) {
		// e.target stays as the original clicked element even when bubbling,
		// so this only fires when the user clicks the transparent backdrop area
		if (e.target === dialog) {
			onclose();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="bottom-sheet"
	oncancel={(e) => {
		e.preventDefault();
		onclose();
	}}
	onclick={handleDialogClick}
>
	<div class="bottom-sheet__panel" style:max-block-size={maxHeight}>
		<div class="bottom-sheet__grab" aria-hidden="true"></div>
		{@render children()}
	</div>
</dialog>

<style>
	@keyframes sheet-slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	@keyframes backdrop-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.bottom-sheet {
		position: fixed;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		max-inline-size: 100%;
		max-block-size: 100%;
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
		overflow: visible;

		&::backdrop {
			background: rgba(0, 0, 0, 0.6);
			animation: backdrop-fade-in 120ms var(--ease-out) both;
		}
	}

	.bottom-sheet__panel {
		position: absolute;
		inset-inline: 0;
		inset-block-end: 0;
		max-inline-size: var(--max-width);
		margin-inline: auto;
		background: var(--color-surface-2);
		border-radius: 26px 26px 0 0;
		border-block-start: 1px solid var(--color-border);
		padding-block-end: calc(var(--safe-bottom) + var(--space-5));
		overflow-y: auto;
		overscroll-behavior: contain;
		animation: sheet-slide-up 220ms var(--ease-out) both;
	}

	@container app (inline-size >= 720px) {
		.bottom-sheet__panel {
			inset-inline-start: var(--side-nav-width);
		}
	}

	.bottom-sheet__grab {
		inline-size: 38px;
		block-size: 4px;
		background: var(--color-border-strong);
		border-radius: var(--radius-full);
		margin: var(--space-3) auto var(--space-1);
		flex-shrink: 0;
	}
</style>
