<script lang="ts">
	import type { SessionLog } from '$lib/db/types';

	let { sessions }: { sessions: SessionLog[] } = $props();

	const todayDate = new Date();
	const todayStr = todayDate.toISOString().split('T')[0];

	function getWeekDays() {
		const days: { dow: string; date: number; dateStr: string; status: string }[] = [];
		const dayOfWeek = todayDate.getDay(); // 0=Sun
		const monday = new Date(todayDate);
		monday.setDate(todayDate.getDate() - ((dayOfWeek + 6) % 7));

		const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

		for (let i = 0; i < 7; i++) {
			const d = new Date(monday);
			d.setDate(monday.getDate() + i);
			const dateStr = d.toISOString().split('T')[0];

			let status: string;
			if (dateStr === todayStr) {
				status = 'today';
			} else if (sessions.some((s) => s.date === dateStr)) {
				status = 'done';
			} else if (dateStr > todayStr) {
				status = 'future';
			} else {
				status = 'rest';
			}

			days.push({ dow: DOW_LABELS[i], date: d.getDate(), dateStr, status });
		}

		return days;
	}

	let weekDays = $derived(getWeekDays());
	let doneDays = $derived(weekDays.filter((d) => d.status === 'done').length);
	let totalTrainingDays = $derived(
		weekDays.filter((d) => d.status === 'done' || d.status === 'today').length
	);
</script>

<section class="week-strip">
	<div class="week-strip__header">
		<h3 class="week-strip__label">This week</h3>
		<span class="week-strip__count">{doneDays} done</span>
	</div>
	<div class="week-strip__days" role="list" aria-label="Weekly training schedule">
		{#each weekDays as day}
			<div
				class="week-day"
				class:week-day--today={day.status === 'today'}
				class:week-day--done={day.status === 'done'}
				class:week-day--future={day.status === 'future'}
				role="listitem"
				aria-label="{day.dow} {day.date}{day.status === 'done' ? ', completed' : ''}{day.status === 'today' ? ', today' : ''}"
			>
				<span class="week-day__dow">{day.dow}</span>
				<span class="week-day__date">{day.date}</span>
				<span class="week-day__indicator" aria-hidden="true"></span>
			</div>
		{/each}
	</div>
</section>

<style>
	.week-strip {
		container-type: inline-size;
		padding-inline: var(--space-4);
		margin-block-start: var(--space-6);
	}

	.week-strip__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: var(--space-3);
	}

	.week-strip__label {
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.week-strip__count {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.week-strip__days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--space-1);
	}

	.week-day {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding-block: var(--space-2);
		border-radius: var(--radius-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.week-day--today {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.week-day__dow {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-text-secondary);
		letter-spacing: 0.04em;

		.week-day--today & {
			color: var(--color-accent-ink);
			opacity: 0.7;
		}
	}

	.week-day__date {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1;
		color: var(--color-text-primary);

		.week-day--today & {
			color: var(--color-accent-ink);
		}

		.week-day--future & {
			color: var(--color-text-muted);
		}
	}

	.week-day__indicator {
		inline-size: 5px;
		block-size: 5px;
		border-radius: var(--radius-full);
		background: transparent;

		.week-day--done & {
			background: var(--color-accent);
		}

		.week-day--today & {
			background: var(--color-accent-ink);
			opacity: 0.5;
		}
	}
</style>
