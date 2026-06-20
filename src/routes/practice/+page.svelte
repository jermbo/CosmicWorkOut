<script lang="ts">
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { disciplines, STRENGTH_DISCIPLINE_ID, BELLYDANCE_DISCIPLINE_ID, effectiveSections } from '$lib/discipline';
	import { todayIso } from '$lib/date';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import HomeCard from '$lib/components/HomeCard.svelte';

	const todayStr = todayIso();
	let contextDate = $derived(loggingContext.date);

	const sessionRoutes: Record<string, string> = {
		[STRENGTH_DISCIPLINE_ID]: '/workout',
		[BELLYDANCE_DISCIPLINE_ID]: '/practice/dance',
	};

	const programRoutes: Record<string, string> = {
		[STRENGTH_DISCIPLINE_ID]: '/program?discipline=strength',
		[BELLYDANCE_DISCIPLINE_ID]: '/program?discipline=bellydance',
	};

	function cardMeta(disciplineId: string): { name: string | null; meta: string | null; done: boolean; active: boolean } {
		const session = programStore.sessionForDisciplineDate(disciplineId, contextDate);
		const suggested = programStore.suggestedRoutineInCurrentWeekFor(disciplineId);
		const active =
			sessionStore.isActive && sessionStore.activeDisciplineId === disciplineId;

		if (session) {
			const routine = programStore.getRoutineForSession(session);
			const program = programStore.activeProgramFor(disciplineId);
			const itemCount = routine && program
				? effectiveSections(program, routine).reduce((n, s) => n + s.items.length, 0)
				: session.items.length;
			return {
				name: routine?.name ?? 'Session logged',
				meta: `${formatDuration(session.durationSeconds ?? 0)} · ${formatCountWithWord(itemCount, 'item')}`,
				done: true,
				active,
			};
		}

		if (suggested) {
			const program = programStore.activeProgramFor(disciplineId);
			const count =
				program ? effectiveSections(program, suggested).reduce((n, s) => n + s.items.length, 0) : 0;
			return {
				name: suggested.name,
				meta: `Routine ${suggested.letter ?? '?'} · ${formatCountWithWord(count, 'item')} · ~${formatMinutes(suggested.estMin ?? 0)}`,
				done: false,
				active,
			};
		}

		return { name: null, meta: null, done: false, active };
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
	{:else}
		<div class="practice-page__cards">
			{#each programStore.activeDisciplines as disc (disc.id)}
				{@const info = cardMeta(disc.id)}
				{@const complete = programStore.isProgramCompleteFor(disc.id)}
				<HomeCard
					href={sessionRoutes[disc.id] ?? '/practice'}
					title={disc.label}
					ariaLabel="{disc.label}{info.name ? ': ' + info.name : ''}"
					variant={disc.id === BELLYDANCE_DISCIPLINE_ID ? 'dance' : 'workout'}
					done={info.done}
					active={info.active}
					badge={info.active ? 'live' : info.done ? 'done' : null}
				>
					{#snippet children()}
						{#if complete}
							<p class="practice-card__name">Program complete!</p>
							<p class="practice-card__meta">Time for something new.</p>
						{:else if info.name}
							<p class="practice-card__name">{info.name}</p>
							{#if info.meta}
								<p class="practice-card__meta">{info.meta}</p>
							{/if}
						{:else}
							<p class="practice-card__empty">No program active.</p>
						{/if}
					{/snippet}
				</HomeCard>
				<a class="practice-card__program-link" href={programRoutes[disc.id] ?? '/program'}>
					Manage {disc.label.toLowerCase()} program →
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.practice-page__cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.practice-card__name {
		font-size: 1.125rem;
		font-weight: 700;
	}

	.practice-card__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-1);
	}

	.practice-card__empty {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}

	.practice-card__program-link {
		display: block;
		margin-block-start: calc(-1 * var(--space-1));
		margin-block-end: var(--space-2);
		padding-inline: var(--space-5);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-decoration: none;

		&:hover {
			color: var(--color-accent);
		}
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
