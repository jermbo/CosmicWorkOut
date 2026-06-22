<script lang="ts">
	import { untrack } from 'svelte';
	import type { Program } from '$lib/db/types';
	import { programStore } from '$lib/stores/program.svelte';
	import { practiceGroupById, practiceGroups } from '$lib/practice';
	import BottomSheet from './BottomSheet.svelte';
	import CreateProgramSheet from './CreateProgramSheet.svelte';

	type Props = {
		onClose: () => void;
		groupId?: string;
	};

	let { onClose, groupId: initialGroupId }: Props = $props();

	type Filter = 'all' | 'mine' | 'builtin';
	type Step = 'group' | 'plans';

	let step = $state<Step>(
		untrack(() => {
			if (initialGroupId) return 'plans';
			return 'group';
		}),
	);
	let groupId = $state(untrack(() => initialGroupId ?? ''));
	let filter = $state<Filter>('all');
	let createDisciplineId = $state<string | null>(null);

	let group = $derived(practiceGroupById(groupId));
	let disciplineId = $derived(group?.disciplineIds[0] ?? '');

	let programs = $derived.by(() => {
		if (!group) return [] as Program[];
		let list = programStore.programs.filter((p) => group.disciplineIds.includes(p.disciplineId));
		if (filter === 'mine') list = list.filter((p) => !p.isBuiltIn);
		if (filter === 'builtin') list = list.filter((p) => p.isBuiltIn);
		return list;
	});

	function pickGroup(id: string) {
		groupId = id;
		step = 'plans';
	}

	function activate(program: Program) {
		programStore.setActiveProgram(program.id);
		onClose();
	}

	function pause(program: Program) {
		programStore.deactivateProgram(program.id);
	}
</script>

<BottomSheet onclose={onClose} maxHeight="85dvh">
	<div class="add-practice">
		<div class="add-practice__header">
			<h2 class="add-practice__title">
				{#if step === 'group'}
					Add practice
				{:else}
					{group?.label ?? 'Plans'}
				{/if}
			</h2>
			<button class="add-practice__close" onclick={onClose} aria-label="Close">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		{#if step === 'group'}
			<p class="add-practice__lead">Choose a practice area to browse plans.</p>
			<div class="add-practice__groups">
				{#each practiceGroups as g (g.id)}
					<button class="add-practice__group" onclick={() => pickGroup(g.id)}>
						<span class="add-practice__group-label">{g.label}</span>
						<span class="add-practice__group-desc">{g.description}</span>
					</button>
				{/each}
			</div>
		{:else if group}
			{#if !initialGroupId}
				<button class="add-practice__back" type="button" onclick={() => (step = 'group')}> ← All areas </button>
			{/if}

			<p class="add-practice__lead">Turn plans on or off. History is always kept when you pause.</p>

			<div class="add-practice__filters" role="tablist" aria-label="Plan filter">
				{#each [['all', 'All'], ['mine', 'Mine'], ['builtin', 'Built-in']] as [value, label]}
					<button
						type="button"
						class="add-practice__filter"
						class:add-practice__filter--active={filter === value}
						role="tab"
						aria-selected={filter === value}
						onclick={() => (filter = value as Filter)}
					>
						{label}
					</button>
				{/each}
			</div>

			<div class="add-practice__list">
				{#each programs as program (program.id)}
					{@const isActive = programStore.isProgramActive(program.id)}
					<div class="add-practice__row" class:add-practice__row--active={isActive}>
						<div class="add-practice__row-info">
							<div class="add-practice__row-name-row">
								<span class="add-practice__row-name">{program.name}</span>
								{#if program.isBuiltIn}
									<span class="add-practice__tag">Built-in</span>
								{:else}
									<span class="add-practice__tag add-practice__tag--mine">Mine</span>
								{/if}
							</div>
							<span class="add-practice__row-meta">
								{program.durationWeeks} wk · {program.daysPerWeek}×/wk
							</span>
						</div>
						{#if isActive}
							<button class="add-practice__pause" type="button" onclick={() => pause(program)}>Pause</button>
						{:else}
							<button class="add-practice__activate" type="button" onclick={() => activate(program)}> Activate </button>
						{/if}
					</div>
				{:else}
					<p class="add-practice__empty">No plans match this filter.</p>
				{/each}
			</div>

			<div class="add-practice__footer">
				<button class="add-practice__create" type="button" onclick={() => (createDisciplineId = disciplineId)}>
					Create new plan
				</button>
			</div>
		{/if}
	</div>
</BottomSheet>

{#if createDisciplineId}
	<CreateProgramSheet disciplineId={createDisciplineId} onClose={() => (createDisciplineId = null)} />
{/if}

<style>
	.add-practice {
		display: flex;
		flex-direction: column;
		padding-block-start: var(--space-2);
		min-block-size: 200px;
	}

	.add-practice__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--space-5);
		padding-block-end: var(--space-3);
	}

	.add-practice__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
	}

	.add-practice__close {
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

	.add-practice__lead {
		padding-inline: var(--space-5);
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-4);
	}

	.add-practice__groups {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-inline: var(--space-5);
		padding-block-end: var(--space-5);
	}

	.add-practice__group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-1);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--r-xl);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-accent);
		}
	}

	.add-practice__group-label {
		font-size: 1.0625rem;
		font-weight: 700;
	}

	.add-practice__group-desc {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.add-practice__back {
		padding-inline: var(--space-5);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-accent);
		margin-block-end: var(--space-2);
	}

	.add-practice__filters {
		display: flex;
		gap: var(--space-2);
		padding-inline: var(--space-5);
		margin-block-end: var(--space-3);
	}

	.add-practice__filter {
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 600;
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
	}

	.add-practice__filter--active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.add-practice__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-inline: var(--space-5);
		overflow-y: auto;
		max-block-size: 45dvh;
	}

	.add-practice__row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.add-practice__row--active {
		border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
	}

	.add-practice__row-info {
		flex: 1;
		min-inline-size: 0;
	}

	.add-practice__row-name-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.add-practice__row-name {
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.add-practice__tag {
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

	.add-practice__tag--mine {
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		color: var(--color-accent);
	}

	.add-practice__row-meta {
		display: block;
		font-size: 0.6875rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.add-practice__activate,
	.add-practice__pause {
		padding-inline: var(--space-3);
		block-size: 32px;
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.add-practice__activate {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}

	.add-practice__pause {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);

		&:hover {
			color: var(--color-red);
			border-color: color-mix(in srgb, var(--color-red) 40%, var(--color-border));
		}
	}

	.add-practice__empty {
		padding-block: var(--space-6);
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.9375rem;
	}

	.add-practice__footer {
		padding: var(--space-4) var(--space-5);
		padding-block-end: max(var(--space-4), env(safe-area-inset-bottom));
	}

	.add-practice__create {
		inline-size: 100%;
		block-size: 44px;
		border-radius: var(--radius-full);
		border: 2px dashed var(--color-border-strong);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}
</style>
