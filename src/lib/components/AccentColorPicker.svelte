<script lang="ts">
	import { prefsStore } from '$lib/stores/prefs.svelte';
	import Icon from './Icon.svelte';

	const ACCENT_PRESETS = [
		{ label: 'Lime', value: '#b2f042' },
		{ label: 'Lavender', value: '#b286fd' },
		{ label: 'Sky', value: '#60c6ff' },
		{ label: 'Red', value: '#e55733' },
		{ label: 'Orange', value: '#f97316' },
		{ label: 'Teal', value: '#2dd4bf' },
	];

	let customHex = $state(prefsStore.accentColor);
	let hexError = $state(false);

	function applyCustomHex() {
		const value = customHex.trim();
		if (/^#[0-9a-fA-F]{6}$/.test(value)) {
			prefsStore.setAccentColor(value);
			hexError = false;
		} else {
			hexError = true;
		}
	}

	function selectPreset(value: string) {
		customHex = value;
		prefsStore.setAccentColor(value);
		hexError = false;
	}

	function presetAriaLabel(preset: { label: string; value: string }): string {
		if (prefsStore.accentColor === preset.value) {
			return `${preset.label} (selected)`;
		}
		return preset.label;
	}
</script>

<div class="color-swatches" role="group" aria-label="Accent color presets">
	{#each ACCENT_PRESETS as preset}
		<button
			class="color-swatch"
			class:color-swatch--active={prefsStore.accentColor === preset.value}
			style:--swatch={preset.value}
			onclick={() => selectPreset(preset.value)}
			aria-label={presetAriaLabel(preset)}
			aria-pressed={prefsStore.accentColor === preset.value}
		>
			{#if prefsStore.accentColor === preset.value}
				<Icon name="check" size={18} stroke={3} />
			{/if}
		</button>
	{/each}
</div>
<div class="hex-input-row">
	<label class="hex-input-label" for="hex-input">Custom hex</label>
	<div class="hex-input-wrap" class:hex-input-wrap--error={hexError}>
		<span class="hex-input-preview" style:background={prefsStore.accentColor}></span>
		<input
			id="hex-input"
			class="hex-input"
			type="text"
			bind:value={customHex}
			placeholder="#b2f042"
			maxlength={7}
			onblur={applyCustomHex}
			onkeydown={(e) => e.key === 'Enter' && applyCustomHex()}
		/>
	</div>
</div>

<style>
	.color-swatches {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin-block-end: var(--space-3);
	}

	.color-swatch {
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--radius-full);
		background: var(--swatch);
		border: 3px solid transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #101010;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.color-swatch--active {
		border-color: var(--color-text-primary);
	}

	.hex-input-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.hex-input-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.hex-input-wrap {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: var(--color-surface-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding-inline: var(--space-3);
		block-size: 40px;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.hex-input-wrap--error {
		border-color: var(--color-red);
	}

	.hex-input-preview {
		inline-size: 18px;
		block-size: 18px;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.hex-input {
		background: none;
		border: none;
		outline: none;
		font: inherit;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-text-primary);
		inline-size: 80px;

		&::placeholder {
			color: var(--color-text-muted);
		}
	}
</style>
