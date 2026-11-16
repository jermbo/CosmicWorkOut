<script lang="ts">
	import { untrack } from 'svelte';
	import type { ActivityType } from '$lib/db/types';
	import { activityStore } from '$lib/stores/activities.svelte';
	import { findTypeByName } from '$lib/activityTypes';
	import BottomSheet from './BottomSheet.svelte';
	import SheetHeader from './SheetHeader.svelte';
	import SheetBody from './SheetBody.svelte';

	type Props = {
		type: ActivityType;
		onClose: () => void;
	};

	let { type, onClose }: Props = $props();

	let name = $state(untrack(() => type.name));
	let saving = $state(false);

	/** A rename to a name that exists joins the two types (US-063 3b). */
	let joins = $derived.by(() => {
		const match = findTypeByName(activityStore.types, name);
		return match && match.id !== type.id ? match : null;
	});

	let canSave = $derived(name.trim().length > 0 && name.trim() !== type.name && !saving);

	async function handleSave(e: SubmitEvent) {
		e.preventDefault();
		if (!canSave) return;
		saving = true;
		try {
			if (await activityStore.rename(type.id, name)) onClose();
		} finally {
			saving = false;
		}
	}
</script>

<BottomSheet
	onclose={onClose}
	maxHeight="60dvh"
>
	<SheetBody>
		<SheetHeader
			title="Rename activity"
			{onClose}
		/>
		<form
			class="rename"
			onsubmit={handleSave}
		>
			<label class="rename__field">
				<span class="rename__label">Name</span>
				<input
					class="rename__input"
					type="text"
					bind:value={name}
					maxlength={50}
					autocomplete="off"
				/>
			</label>
			<p
				class="rename__note"
				aria-live="polite"
			>
				{#if joins}
					{joins.name} exists. Saving joins the two, with all their entries.
				{:else}
					Every past entry takes the new name.
				{/if}
			</p>
			<button
				class="rename__save"
				type="submit"
				data-feedback="success"
				disabled={!canSave}
				aria-busy={saving}
			>
				{joins ? `Join into ${joins.name}` : 'Save'}
			</button>
		</form>
	</SheetBody>
</BottomSheet>

<style>
	.rename {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-inline: var(--space-5);
		padding-block-end: max(var(--space-5), env(safe-area-inset-bottom));
	}

	.rename__field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.rename__label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
	}

	.rename__input {
		block-size: 44px;
		padding-inline: var(--space-3);
		background: var(--color-surface-2);
		border: var(--rule-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-primary);
		outline: none;

		&:focus {
			border-color: var(--color-accent);
		}
	}

	.rename__note {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.rename__save {
		inline-size: 100%;
		block-size: 52px;
		border-radius: var(--radius-full);
		background: var(--field-active);
		color: var(--color-accent-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;

		&:disabled {
			opacity: 0.6;
			cursor: default;
		}
	}
</style>
