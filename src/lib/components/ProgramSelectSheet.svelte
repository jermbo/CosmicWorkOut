<script lang="ts">
	import type { Program } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import BottomSheet from './BottomSheet.svelte';

	let {
		onClose,
		onCreateNew
	}: {
		onClose: () => void;
		onCreateNew: () => void;
	} = $props();

	let copying = $state<string | null>(null);

	async function activateOrCopy(program: Program) {
		if (program.isBuiltIn) {
			copying = program.id;
			const copy = await programStore.copyProgram(program);
			programStore.setActiveProgram(copy.id);
			copying = null;
		} else {
			programStore.setActiveProgram(program.id);
		}
		onClose();
	}

	function switchTo(program: Program) {
		programStore.setActiveProgram(program.id);
		onClose();
	}
</script>

<BottomSheet onclose={onClose} maxHeight="80dvh">
	<div class="prog-sheet">
		<div class="prog-sheet__header">
			<h2 class="prog-sheet__title">Programs</h2>
			<button class="prog-sheet__close" onclick={onClose} aria-label="Close">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="prog-sheet__list">
			{#each programStore.programs as program (program.id)}
				{@const isActive = program.id === programStore.activeProgram?.id}
				<div class="prog-row" class:prog-row--active={isActive}>
					<div class="prog-row__info">
						<div class="prog-row__name-row">
							<span class="prog-row__name">{program.name}</span>
							{#if program.isBuiltIn}
								<span class="prog-row__built-in">Built-in</span>
							{/if}
						</div>
						<span class="prog-row__meta">
							{program.durationWeeks} wk · {program.daysPerWeek}×/wk
						</span>
					</div>
					{#if isActive}
						<span class="prog-row__active-badge">Active</span>
					{:else if program.isBuiltIn}
						<button
							class="prog-row__action-btn prog-row__action-btn--copy"
							onclick={() => activateOrCopy(program)}
							disabled={copying === program.id}
							aria-busy={copying === program.id}
						>
							{copying === program.id ? 'Copying…' : 'Use copy'}
						</button>
					{:else}
						<button
							class="prog-row__action-btn"
							onclick={() => switchTo(program)}
						>
							Switch
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<div class="prog-sheet__footer">
			<button class="prog-sheet__new-btn" onclick={onCreateNew}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
				Create new program
			</button>
		</div>
	</div>
</BottomSheet>

<style>
	.prog-sheet {
		display: flex;
		flex-direction: column;
		padding-block-start: var(--space-2);
	}

	.prog-sheet__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--space-5);
		padding-block-end: var(--space-4);
	}

	.prog-sheet__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
	}

	.prog-sheet__close {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);

		svg {
			inline-size: 16px;
			block-size: 16px;
		}
	}

	.prog-sheet__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-inline: var(--space-5);
		overflow-y: auto;
	}

	.prog-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.prog-row--active {
		border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
	}

	.prog-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.prog-row__name-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.prog-row__name {
		font-size: 0.9375rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.prog-row__built-in {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-inline: 5px;
		block-size: 18px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-text-muted) 20%, transparent);
		color: var(--color-text-muted);
		display: inline-flex;
		align-items: center;
	}

	.prog-row__meta {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.prog-row__active-badge {
		font-size: 0.75rem;
		font-weight: 700;
		padding-inline: var(--space-2);
		block-size: 26px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
		color: var(--color-accent);
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.prog-row__action-btn {
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border-strong);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		flex-shrink: 0;
		transition: color var(--duration-fast) var(--ease-out);

		&:disabled {
			opacity: 0.6;
			cursor: default;
		}
	}

	.prog-row__action-btn--copy {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.prog-sheet__footer {
		padding-inline: var(--space-5);
		padding-block-start: var(--space-4);
	}

	.prog-sheet__new-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		inline-size: 100%;
		padding-block: var(--space-4);
		border: 2px dashed var(--color-border-strong);
		border-radius: var(--radius-lg);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 18px;
			block-size: 18px;
		}

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}
</style>
