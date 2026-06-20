<script lang="ts">
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { disciplines, STRENGTH_DISCIPLINE_ID, BELLYDANCE_DISCIPLINE_ID, effectiveSections } from '$lib/discipline';
	import { todayIso } from '$lib/date';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import HomeCard from '$lib/components/HomeCard.svelte';
	import ProgramSelectSheet from '$lib/components/ProgramSelectSheet.svelte';
	import CreateProgramSheet from '$lib/components/CreateProgramSheet.svelte';

	const todayStr = todayIso();
	let contextDate = $derived(loggingContext.date);

	let selectDisciplineId = $state<string | null>(null);
	let createDisciplineId = $state<string | null>(null);

	const sessionRoutes: Record<string, string> = {
		[STRENGTH_DISCIPLINE_ID]: '/workout',
		[BELLYDANCE_DISCIPLINE_ID]: '/practice/dance',
	};

	const programRoutes: Record<string, string> = {
		[STRENGTH_DISCIPLINE_ID]: '/program?discipline=strength',
		[BELLYDANCE_DISCIPLINE_ID]: '/program?discipline=bellydance',
	};

	function cardMeta(disciplineId: string): { name: string | null; meta: string | null; done: boolean; live: boolean } {
		const session = programStore.sessionForDisciplineDate(disciplineId, contextDate);
		const suggested = programStore.suggestedRoutineInCurrentWeekFor(disciplineId);
		const live = sessionStore.isActive && sessionStore.activeDisciplineId === disciplineId;

		if (session) {
			const routine = programStore.getRoutineForSession(session);
			const program = programStore.activeProgramFor(disciplineId);
			const itemCount =
				routine && program
					? effectiveSections(program, routine).reduce((n, s) => n + s.items.length, 0)
					: session.items.length;
			return {
				name: routine?.name ?? 'Session logged',
				meta: `${formatDuration(session.durationSeconds ?? 0)} · ${formatCountWithWord(itemCount, 'item')}`,
				done: true,
				live,
			};
		}

		if (suggested) {
			const program = programStore.activeProgramFor(disciplineId);
			const count = program
				? effectiveSections(program, suggested).reduce((n, s) => n + s.items.length, 0)
				: 0;
			return {
				name: suggested.name,
				meta: `Routine ${suggested.letter ?? '?'} · ${formatCountWithWord(count, 'item')} · ~${formatMinutes(suggested.estMin ?? 0)}`,
				done: false,
				live,
			};
		}

		return { name: null, meta: null, done: false, live };
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
			{#each disciplines as disc (disc.id)}
				{@const isActive = programStore.isDisciplineActive(disc.id)}
				{@const info = cardMeta(disc.id)}
				{@const complete = isActive && programStore.isProgramCompleteFor(disc.id)}

				{#if isActive}
					<HomeCard
						href={sessionRoutes[disc.id] ?? '/practice'}
						title={disc.label}
						ariaLabel="{disc.label}{info.name ? ': ' + info.name : ''}"
						variant={disc.id === BELLYDANCE_DISCIPLINE_ID ? 'dance' : 'workout'}
						done={info.done}
						active={info.live}
						badge={info.live ? 'live' : info.done ? 'done' : null}
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
								<p class="practice-card__empty">No routine scheduled.</p>
							{/if}
						{/snippet}
					</HomeCard>
				{:else}
					<div class="practice-inactive" class:practice-inactive--dance={disc.id === BELLYDANCE_DISCIPLINE_ID}>
						<div class="practice-inactive__header">
							<h2 class="practice-inactive__title">{disc.label}</h2>
							<span class="practice-inactive__badge">Off</span>
						</div>
						<p class="practice-inactive__body">No program active. Turn one on when you're ready to practice.</p>
						<button class="practice-inactive__btn" onclick={() => (selectDisciplineId = disc.id)}>
							Choose program
						</button>
					</div>
				{/if}

				<div class="practice-card__links">
					<a class="practice-card__program-link" href={programRoutes[disc.id] ?? '/program'}>
						Manage programs →
					</a>
					{#if isActive}
						<button
							class="practice-card__deactivate-link"
							onclick={() => programStore.deactivateProgram(disc.id)}
						>
							Turn off
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if selectDisciplineId}
	<ProgramSelectSheet
		disciplineId={selectDisciplineId}
		onClose={() => (selectDisciplineId = null)}
		onCreateNew={() => {
			createDisciplineId = selectDisciplineId;
			selectDisciplineId = null;
		}}
	/>
{/if}

{#if createDisciplineId}
	<CreateProgramSheet disciplineId={createDisciplineId} onClose={() => (createDisciplineId = null)} />
{/if}

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

	.practice-inactive {
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: 1px dashed var(--color-border-strong);
		border-radius: var(--r-xl);
	}

	.practice-inactive--dance {
		border-color: color-mix(in srgb, var(--color-lavender) 35%, var(--color-border-strong));
	}

	.practice-inactive__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-2);
	}

	.practice-inactive__title {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.practice-inactive__badge {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-inline: var(--space-2);
		block-size: 20px;
		border-radius: var(--radius-full);
		background: var(--color-surface-3);
		color: var(--color-text-muted);
		display: inline-flex;
		align-items: center;
	}

	.practice-inactive__body {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	.practice-inactive__btn {
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.875rem;
		font-weight: 700;
	}

	.practice-inactive--dance .practice-inactive__btn {
		background: var(--color-lavender);
		color: #101010;
	}

	.practice-card__links {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-start: calc(-1 * var(--space-1));
		margin-block-end: var(--space-2);
		padding-inline: var(--space-5);
	}

	.practice-card__program-link {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-decoration: none;

		&:hover {
			color: var(--color-accent);
		}
	}

	.practice-card__deactivate-link {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);

		&:hover {
			color: var(--color-red);
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
