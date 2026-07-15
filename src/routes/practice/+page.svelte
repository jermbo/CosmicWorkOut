<script lang="ts">
	import { resolve } from '$app/paths';
	import { programStore } from '$lib/stores/program.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import { effectiveSections } from '$lib/discipline';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PracticeGroupCard from '$lib/components/PracticeGroupCard.svelte';
	import AddPracticeSheet from '$lib/components/AddPracticeSheet.svelte';

	let contextDate = $derived(loggingContext.date);
	let showAddPractice = $state(false);
	let goalsEnabled = $derived(prefsStore.goalProgressionPlansEnabled);

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
			<div class="practice-empty__actions">
				<button class="practice-empty__btn" type="button" onclick={() => (showAddPractice = true)}>
					Add practice
				</button>
				{#if goalsEnabled}
					<a class="practice-empty__goal" href={resolve('/goals/new')}>Start a goal plan</a>
					<p class="practice-empty__goal-hint">
						Build toward a specific lift (e.g. bench 250×5) with an auto-generated wave.
					</p>
				{/if}
			</div>
		</section>
	{:else}
		<div class="practice-page__toolbar">
			{#if goalsEnabled}
				<a class="practice-page__goals" href={resolve('/goals')}>Goal plans</a>
			{/if}
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

	.practice-empty__actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
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

	.practice-empty__goal {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding-inline: var(--space-5);
		block-size: 44px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-strong);
		background: var(--color-surface-3);
		color: var(--color-text-primary);
		font-size: 0.9375rem;
		font-weight: 700;
		text-decoration: none;

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}

	.practice-empty__goal-hint {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		max-inline-size: 34ch;
		margin: 0;
	}

	.practice-page__toolbar {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--space-3);
		margin-block-end: var(--space-3);
	}

	.practice-page__goals {
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-strong);
		background: var(--color-surface-2);
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-decoration: none;

		&:hover {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
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
