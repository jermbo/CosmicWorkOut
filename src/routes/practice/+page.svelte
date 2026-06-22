<script lang="ts">
	import { programStore } from '$lib/stores/program.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { effectiveSections } from '$lib/discipline';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PracticeGroupCard from '$lib/components/PracticeGroupCard.svelte';
	import AddPracticeSheet from '$lib/components/AddPracticeSheet.svelte';

	let contextDate = $derived(loggingContext.date);
	let showAddPractice = $state(false);

	function groupSummary(groupId: string): { summary: string; meta: string } {
		const plans = programStore.activeProgramsForGroup(groupId);
		if (plans.length === 0) return { summary: 'No active plans', meta: '' };

		const incomplete = plans.find((p) => !programStore.sessionForProgramDate(p.id, contextDate));
		const target = incomplete ?? plans[0];
		const session = programStore.sessionForProgramDate(target.id, contextDate);
		const suggested = programStore.suggestedRoutineInCurrentWeekForProgram(target.id);

		if (session) {
			const routine = programStore.getRoutineForSession(session);
			const itemCount = routine
				? effectiveSections(target, routine).reduce((n, s) => n + s.items.length, 0)
				: session.items.length;
			return {
				summary: routine?.name ?? target.name,
				meta: `${formatDuration(session.durationSeconds ?? 0)} · ${formatCountWithWord(itemCount, 'item')}`,
			};
		}

		if (suggested) {
			const count = effectiveSections(target, suggested).reduce((n, s) => n + s.items.length, 0);
			return {
				summary: suggested.name,
				meta: `Routine ${suggested.letter ?? '?'} · ${formatCountWithWord(count, 'item')} · ~${formatMinutes(suggested.estMin ?? 0)}`,
			};
		}

		return { summary: target.name, meta: 'Ready when you are' };
	}
</script>

<svelte:head>
	<title>Practice — CosmicWorkOut</title>
</svelte:head>

<div class="page page--wide practice-page">
	<PageHeader title="Practice" />

	{#if !programStore.loaded}
		<div class="practice-page__loading" aria-busy="true">
			<div class="practice-page__spinner"></div>
		</div>
	{:else if programStore.activeGroups.length === 0}
		<section class="practice-empty">
			<h2 class="practice-empty__title">Choose what you practice</h2>
			<p class="practice-empty__body">
				Nothing is turned on yet. Add a workout or dance plan when you're ready — you can pause or add more anytime.
			</p>
			<button class="practice-empty__btn" type="button" onclick={() => (showAddPractice = true)}> Add practice </button>
		</section>
	{:else}
		<div class="practice-page__toolbar">
			<button class="practice-page__add" type="button" onclick={() => (showAddPractice = true)}> Add practice </button>
		</div>

		<div class="practice-page__cards">
			{#each programStore.activeGroups as group (group.id)}
				{@const plans = programStore.activeProgramsForGroup(group.id)}
				{@const info = groupSummary(group.id)}
				<PracticeGroupCard {group} planCount={plans.length} summary={info.summary} meta={info.meta} />
			{/each}
		</div>
	{/if}
</div>

{#if showAddPractice}
	<AddPracticeSheet onClose={() => (showAddPractice = false)} />
{/if}

<style>
	.practice-empty {
		padding: var(--space-8) var(--space-5);
		text-align: center;
		background: var(--color-surface-2);
		border: 1px dashed var(--color-border-strong);
		border-radius: var(--r-xl);
	}

	.practice-empty__title {
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 700;
		margin-block-end: var(--space-2);
	}

	.practice-empty__body {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		max-inline-size: 36ch;
		margin-inline: auto;
		margin-block-end: var(--space-5);
	}

	.practice-empty__btn {
		padding-inline: var(--space-5);
		block-size: 48px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.practice-page__toolbar {
		display: flex;
		justify-content: flex-end;
		margin-block-end: var(--space-3);
	}

	.practice-page__add {
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}

	.practice-page__cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.practice-page__loading {
		display: flex;
		justify-content: center;
		padding-block: var(--space-12);
	}

	.practice-page__spinner {
		inline-size: 28px;
		block-size: 28px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
