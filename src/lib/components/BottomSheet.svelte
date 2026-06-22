<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		onclose: () => void;
		maxHeight?: string;
		hideHandle?: boolean;
		fixedHeight?: boolean;
	};

	let { children, onclose, maxHeight = '90dvh', hideHandle = false, fixedHeight = false }: Props = $props();

	let dialog: HTMLDialogElement;

	onMount(() => {
		dialog.showModal();
	});

	function isBackdropClick(e: MouseEvent): boolean {
		return e.target === dialog;
	}

	function handleDialogClick(e: MouseEvent) {
		if (isBackdropClick(e)) {
			onclose();
		}
	}

	let panelBlockSize = $derived.by(() => {
		if (fixedHeight) return maxHeight;
		return undefined;
	});
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
	<div
		class="bottom-sheet__panel"
		class:bottom-sheet__panel--fixed={fixedHeight}
		style:max-block-size={maxHeight}
		style:block-size={panelBlockSize}
	>
		{#if !hideHandle}
			<div class="bottom-sheet__grab" aria-hidden="true"></div>
		{/if}
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
			inset-inline-end: 0;
		}
	}

	.bottom-sheet__panel--fixed {
		overflow: hidden;
		padding-block-end: 0;
		border-radius: 0;
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
