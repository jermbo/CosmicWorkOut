<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- program route helper uses resolveHref() */
	import { resolveHref } from '$lib/navigation';
	import { page } from '$app/state';
	import { programStore } from '$lib/stores/program.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { loggingContext } from '$lib/stores/loggingContext.svelte';
	import { effectiveSections } from '$lib/discipline';
	import { formatDuration, formatMinutes, formatCountWithWord } from '$lib/format';
	import { practiceGroupById, sessionRouteForProgram, programRouteForDiscipline } from '$lib/practice';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import HomeCard from '$lib/components/HomeCard.svelte';
	import AddPracticeSheet from '$lib/components/AddPracticeSheet.svelte';

	let groupId = $derived(page.params.groupId ?? '');
	let group = $derived(practiceGroupById(groupId));
	let contextDate = $derived(loggingContext.date);
	let showAddPractice = $state(false);

	let activePlans = $derived.by(() => {
		if (group) return programStore.activeProgramsForGroup(group.id);
		return [];
	});

	function variantForColor(color: string): 'dance' | 'workout' {
		if (color === 'lavender') return 'dance';
		return 'workout';
	}

	function planAriaLabel(programName: string, infoName: string | null): string {
		if (infoName) return `${programName}: ${infoName}`;
		return programName;
	}

	function planBadge(info: { live: boolean; done: boolean }): 'live' | 'done' | null {
		if (info.live) return 'live';
		if (info.done) return 'done';
		return null;
	}

	function planMeta(programId: string) {
		const program = programStore.programById(programId);
		if (!program) return { name: 'Plan', meta: null as string | null, done: false, live: false };

		const session = programStore.sessionForProgramDate(programId, contextDate);
		const suggested = programStore.suggestedRoutineInCurrentWeekForProgram(programId);
		const live = sessionStore.isActive && sessionStore.active?.programId === programId;
		const complete = programStore.isProgramCompleteForProgram(programId);

		if (complete && !session) {
			return { name: 'Program complete!', meta: 'Time for something new.', done: false, live: false };
		}

		if (session) {
			const routine = programStore.getRoutineForSession(session);
			const itemCount = routine
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
			const count = effectiveSections(program, suggested).reduce((n, s) => n + s.items.length, 0);
			return {
				name: suggested.name,
				meta: `Routine ${suggested.letter ?? '?'} · ${formatCountWithWord(count, 'item')} · ~${formatMinutes(suggested.estMin ?? 0)}`,
				done: false,
				live,
			};
		}

		return { name: program.name, meta: 'No routine scheduled', done: false, live };
	}
</script>

<svelte:head>
	<title>{group?.label ?? 'Practice'} — CosmicWorkOut</title>
</svelte:head>

{#if group}
	<div class="page page--wide group-page">
		<PageHeader title={group.label} showBack backHref="/practice" />

		<div class="group-page__toolbar">
			<button class="group-page__add" type="button" onclick={() => (showAddPractice = true)}> Add plan </button>
			<a class="group-page__manage" href={resolveHref(programRouteForDiscipline(group.disciplineIds[0]))}>
				Manage plans
			</a>
		</div>

		{#if activePlans.length === 0}
			<section class="group-empty">
				<p>No active plans in {group.label.toLowerCase()} right now.</p>
				<button type="button" onclick={() => (showAddPractice = true)}>Add a plan</button>
			</section>
		{:else}
			<div class="group-page__plans">
				{#each activePlans as program (program.id)}
					{@const info = planMeta(program.id)}
					{@const variant = variantForColor(group.color)}
					<div class="group-plan">
						<HomeCard
							href={sessionRouteForProgram(program)}
							title={program.name}
							ariaLabel={planAriaLabel(program.name, info.name)}
							{variant}
							done={info.done}
							active={info.live}
							badge={planBadge(info)}
						>
							<p class="group-plan__name">{info.name}</p>
							{#if info.meta}
								<p class="group-plan__meta">{info.meta}</p>
							{/if}
						</HomeCard>
						<div class="group-plan__actions">
							<button
								type="button"
								class="group-plan__pause"
								onclick={() => programStore.deactivateProgram(program.id)}
							>
								Pause plan
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="page">
		<PageHeader title="Practice" showBack backHref="/practice" />
		<p class="group-missing">Practice area not found.</p>
	</div>
{/if}

{#if showAddPractice && group}
	<AddPracticeSheet groupId={group.id} onClose={() => (showAddPractice = false)} />
{/if}

<style>
	.group-page__toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-block-end: var(--space-4);
	}

	.group-page__add {
		padding-inline: var(--space-4);
		block-size: 40px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.875rem;
		font-weight: 700;
	}

	.group-page__manage {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-decoration: none;

		&:hover {
			color: var(--color-accent);
		}
	}

	.group-page__plans {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.group-plan__name {
		font-size: 1.125rem;
		font-weight: 700;
	}

	.group-plan__meta {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-block-start: var(--space-1);
	}

	.group-plan__actions {
		display: flex;
		justify-content: flex-end;
		padding-inline: var(--space-5);
		margin-block-start: calc(-1 * var(--space-1));
	}

	.group-plan__pause {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);

		&:hover {
			color: var(--color-red);
		}
	}

	.group-empty {
		padding: var(--space-8);
		text-align: center;
		color: var(--color-text-secondary);
		background: var(--color-surface-2);
		border-radius: var(--r-xl);
		border: 1px dashed var(--color-border-strong);

		button {
			margin-block-start: var(--space-4);
			color: var(--color-accent);
			font-weight: 700;
		}
	}

	.group-missing {
		color: var(--color-text-muted);
	}
</style>
