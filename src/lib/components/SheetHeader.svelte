<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		onClose: () => void;
		/** Buttons rendered to the left of the close button. */
		actions?: Snippet;
		/** Trims the gap below the header — used by sheets with a filter row under it. */
		tight?: boolean;
		closeLabel?: string;
	};

	let { title, onClose, actions, tight = false, closeLabel = 'Close' }: Props = $props();
</script>

<div
	class="sheet-header"
	class:sheet-header--tight={tight}
>
	<h2 class="sheet-header__title">{title}</h2>
	<div class="sheet-header__actions">
		{@render actions?.()}
		<button
			class="sheet-header__close"
			onclick={onClose}
			aria-label={closeLabel}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"
			>
				<line
					x1="18"
					y1="6"
					x2="6"
					y2="18"
				/>
				<line
					x1="6"
					y1="6"
					x2="18"
					y2="18"
				/>
			</svg>
		</button>
	</div>
</div>

<style>
	.sheet-header__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.sheet-header__actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.sheet-header__close {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		flex-shrink: 0;

		svg {
			inline-size: 16px;
			block-size: 16px;
		}
	}
</style>
