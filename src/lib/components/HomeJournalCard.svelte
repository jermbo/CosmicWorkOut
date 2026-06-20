<script lang="ts">
	import type { JournalEntry } from '$lib/db/types';
	import HomeCard from './HomeCard.svelte';

	type Props = {
		entry?: JournalEntry;
	};

	let { entry }: Props = $props();

	let ariaLabel = $derived(`Journal: ${entry ? 'Entry logged' : 'No entry yet'}`);

	let preview = $derived.by(() => {
		if (!entry) return null;
		const text = entry.content.slice(0, 80);
		return entry.content.length > 80 ? `${text}…` : text;
	});
</script>

<HomeCard href="/journal" title="Journal" {ariaLabel} variant="journal" done={!!entry}>
	{#snippet children()}
		{#if preview}
			<p class="home-journal-card__preview">{preview}</p>
		{:else}
			<p class="home-journal-card__empty">No entry yet. Tap to write.</p>
		{/if}
	{/snippet}
</HomeCard>

<style>
	.home-journal-card__preview {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.home-journal-card__empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
</style>
