<script lang="ts">
	import { onMount, untrack } from 'svelte';

	type Props = {
		title: string;
		unit?: string;
		initialValue: number;
		onsave: (value: number) => void;
		onclose: () => void;
	};

	let { title, unit = '', initialValue, onsave, onclose }: Props = $props();

	let input = $state(
		untrack(() => {
			if (initialValue) return String(initialValue);
			return '';
		}),
	);
	let dialog: HTMLDialogElement;

	onMount(() => {
		dialog.showModal();
	});

	function save() {
		const value = parseInt(input, 10);
		if (!isNaN(value) && value >= 0) onsave(value);
		dialog.close();
	}
</script>

<dialog
	bind:this={dialog}
	class="value-dialog"
	{onclose}
	oncancel={(e) => {
		e.preventDefault();
		dialog.close();
	}}
	onclick={(e) => {
		if (e.target === dialog) dialog.close();
	}}
>
	<label class="value-dialog__title" for="value-dialog-input">{title}</label>
	<div class="value-dialog__field">
		<input
			id="value-dialog-input"
			class="value-dialog__input"
			type="number"
			bind:value={input}
			min="0"
			placeholder="0"
			onkeydown={(e) => e.key === 'Enter' && save()}
		/>
		{#if unit}
			<span class="value-dialog__unit" aria-hidden="true">{unit}</span>
		{/if}
	</div>
	<div class="value-dialog__actions">
		<button class="value-dialog__save" onclick={save}>Save</button>
		<button class="value-dialog__cancel" onclick={() => dialog.close()}>Cancel</button>
	</div>
</dialog>

<style>
	dialog.value-dialog {
		border: none;
		padding: 0;
		color: inherit;
		position: fixed;
		inset-inline: var(--space-4);
		inset-block-start: 50%;
		translate: 0 -50%;
		max-inline-size: 360px;
		inline-size: 100%;
		margin-inline: auto;
		background: var(--color-surface-2);
		border-radius: var(--r-2xl);
		padding: var(--space-5);
		box-shadow: var(--shadow-lg);
		outline: none;
	}

	dialog.value-dialog::backdrop {
		background: rgba(0, 0, 0, 0.65);
	}

	.value-dialog__title {
		display: block;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-block-end: var(--space-4);
		cursor: default;
	}

	.value-dialog__field {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		margin-block-end: var(--space-4);
	}

	.value-dialog__input {
		inline-size: 100%;
		block-size: 80px;
		padding-inline: var(--space-3);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--color-text-primary);
		text-align: center;
		outline: none;
		-moz-appearance: textfield;
		appearance: textfield;

		&::-webkit-inner-spin-button,
		&::-webkit-outer-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
		&:focus {
			border-color: var(--color-accent);
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent);
		}
		&::placeholder {
			color: var(--color-text-muted);
			font-size: 1.5rem;
			font-weight: 400;
		}
	}

	.value-dialog__unit {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.value-dialog__actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.value-dialog__save {
		block-size: 52px;
		border-radius: var(--radius-lg);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 1rem;
		font-weight: 700;
	}

	.value-dialog__cancel {
		block-size: 46px;
		border-radius: var(--radius-lg);
		background: var(--color-surface-3);
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		font-weight: 600;
	}
</style>
