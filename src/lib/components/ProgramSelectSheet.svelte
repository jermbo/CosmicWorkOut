<script lang="ts">
	import type { Program } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import { goalPlanStore } from '$lib/stores/goalPlans.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import SheetHeader from './SheetHeader.svelte';
	import SheetBody from './SheetBody.svelte';

	type Props = {
		onClose: () => void;
		onCreateNew: () => void;
		disciplineId?: string;
	};

	let { onClose, onCreateNew, disciplineId }: Props = $props();

	let programs = $derived.by(() => {
		let list = disciplineId
			? programStore.programs.filter((p) => p.disciplineId === disciplineId)
			: programStore.programs;
		return list.filter((p) => !goalPlanStore.planForProgram(p.id));
	});

	async function activate(program: Program) {
		const activeGoal = goalPlanStore.activePlan;
		if (activeGoal) await goalPlanStore.pausePlan(activeGoal.id);
		programStore.setActiveProgram(program.id);
	}

	function pause(program: Program) {
		programStore.deactivateProgram(program.id);
	}
</script>

<BottomSheet
	onclose={onClose}
	maxHeight="80dvh"
>
	<SheetBody>
		<SheetHeader
			title="Plans"
			{onClose}
		/>

		<div class="prog-sheet__list">
			{#each programs as program (program.id)}
				{@const isActive = programStore.isProgramActive(program.id)}
				<div
					class="prog-row"
					class:prog-row--active={isActive}
				>
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
						<button
							class="prog-row__deactivate-btn"
							onclick={() => pause(program)}>Pause</button
						>
					{:else}
						<button
							class="prog-row__action-btn"
							onclick={() => activate(program)}>Activate</button
						>
					{/if}
				</div>
			{/each}
		</div>

		<div class="prog-sheet__footer">
			<button
				class="prog-sheet__new-btn"
				onclick={onCreateNew}
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<line
						x1="12"
						y1="5"
						x2="12"
						y2="19"
					/>
					<line
						x1="5"
						y1="12"
						x2="19"
						y2="12"
					/>
				</svg>
				Create new plan
			</button>
		</div>
	</SheetBody>
</BottomSheet>

<style>
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
	}

	.prog-row__deactivate-btn {
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		background: transparent;
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
		flex-shrink: 0;

		&:hover {
			color: var(--color-red);
			border-color: color-mix(in srgb, var(--color-red) 40%, var(--color-border));
		}
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

		svg {
			inline-size: 18px;
			block-size: 18px;
		}

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent-text);
		}
	}
</style>
