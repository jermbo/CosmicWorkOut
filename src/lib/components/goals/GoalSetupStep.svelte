<script lang="ts">
	import type { Item } from '$lib/db/types';
	import type { SetupKind } from '$lib/goalPlans/wizard.svelte';
	import {
		PRIORITY_TEMPLATE_ID,
		FOCUS_ONLY_TEMPLATE_ID,
		SCRATCH_TEMPLATE_ID,
	} from '$lib/goalPlans/templates';

	type Props = {
		focusItem: Item;
		templateId: string | null;
		onPickSetup: (kind: SetupKind) => void;
	};

	let { focusItem, templateId, onPickSetup }: Props = $props();
</script>

<p class="lead">
	How do you want the week built around <strong>{focusItem.name}</strong>? This is not a full powerlifting split —
	other max lifts stay out unless you add them.
</p>
<div class="template-list">
	<button
		class="template-card"
		class:template-card--selected={templateId === PRIORITY_TEMPLATE_ID}
		onclick={() => onPickSetup(PRIORITY_TEMPLATE_ID)}
	>
		<span class="template-card__name">Priority week</span>
		<span class="template-card__desc">
			{focusItem.name} on every day, plus support work that helps that lift. Recommended.
		</span>
		<span class="template-card__meta">3×/week · Heavy · Volume · Assist</span>
	</button>
	<button
		class="template-card"
		class:template-card--selected={templateId === FOCUS_ONLY_TEMPLATE_ID}
		onclick={() => onPickSetup(FOCUS_ONLY_TEMPLATE_ID)}
	>
		<span class="template-card__name">Focus only</span>
		<span class="template-card__desc">
			Just {focusItem.name} on Days A/B/C — add accessories yourself next.
		</span>
		<span class="template-card__meta">3×/week · minimal</span>
	</button>
	<button
		class="template-card"
		class:template-card--selected={templateId === SCRATCH_TEMPLATE_ID}
		onclick={() => onPickSetup(SCRATCH_TEMPLATE_ID)}
	>
		<span class="template-card__name">Start from scratch</span>
		<span class="template-card__desc">
			{focusItem.name} on Day A; build the rest of the week from your library.
		</span>
		<span class="template-card__meta">3×/week · blank days</span>
	</button>
</div>

<style>
	.lead {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-block-end: var(--space-4);

		strong {
			color: var(--color-text-primary);
			font-weight: 700;
		}
	}

	.template-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.template-card {
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

	.template-card--selected {
		border-color: var(--color-accent);
	}

	.template-card__name {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 700;
	}

	.template-card__desc {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		line-height: 1.45;
	}

	.template-card__meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-block-start: var(--space-1);
	}
</style>
