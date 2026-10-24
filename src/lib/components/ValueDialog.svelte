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
	<label
		class="value-dialog__title"
		for="value-dialog-input">{title}</label
	>
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
			<span
				class="value-dialog__unit"
				aria-hidden="true">{unit}</span
			>
		{/if}
	</div>
	<div class="value-dialog__actions">
		<button
			class="value-dialog__save"
			onclick={save}>Save</button
		>
		<button
			class="value-dialog__cancel"
			onclick={() => dialog.close()}>Cancel</button
		>
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
		background: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
		padding: var(--space-5);
		box-shadow: var(--shadow-hard);
		outline: none;
	}

	dialog.value-dialog::backdrop {
		background: rgba(10, 10, 10, 0.8);
	}

	.value-dialog__title {
		display: block;
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 1.25rem;
		font-weight: 900;
		letter-spacing: -0.03em;
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
		background: var(--color-ink);
		border: var(--rule) solid var(--color-paper);
		font-family: var(--font-display);
		text-transform: uppercase;
		font-size: 2.75rem;
		font-weight: 900;
		letter-spacing: -0.05em;
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
		block-size: 56px;
		background: var(--color-accent);
		color: var(--color-accent-ink);
		border: var(--rule) solid var(--color-ink);
		box-shadow: var(--shadow-hard-sm);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 900;
		text-transform: uppercase;
		transition:
			transform var(--duration-press) linear,
			box-shadow var(--duration-press) linear;

		&:active {
			transform: translate(4px, 4px);
			box-shadow: none;
		}
	}

	.value-dialog__cancel {
		block-size: 48px;
		background: transparent;
		border: var(--rule) solid var(--color-paper);
		color: var(--color-text-primary);
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		text-transform: uppercase;
	}
</style>
