<script lang="ts">
	import type { LoggingMode, CompletionFeel, Density, Roundness } from '$lib/db/types';
	import { prefsStore } from '$lib/stores/prefs.svelte';

	const ACCENT_PRESETS = [
		{ label: 'Lime', value: '#b2f042' },
		{ label: 'Lavender', value: '#b286fd' },
		{ label: 'Sky', value: '#60c6ff' },
		{ label: 'Red', value: '#e55733' },
		{ label: 'Orange', value: '#f97316' },
		{ label: 'Teal', value: '#2dd4bf' }
	];

	const LOGGING_MODES: { value: LoggingMode; label: string; desc: string }[] = [
		{ value: 'instant', label: 'Instant', desc: 'One tap logs at last weight' },
		{ value: 'stepper', label: 'Stepper', desc: 'Tap opens +/− controls' },
		{ value: 'numpad', label: 'Numpad', desc: 'Tap opens numeric keyboard' }
	];

	const DENSITIES: { value: Density; label: string }[] = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'spacious', label: 'Spacious' }
	];

	const ROUNDNESS_OPTIONS: { value: Roundness; label: string }[] = [
		{ value: 'sharp', label: 'Sharp' },
		{ value: 'default', label: 'Default' },
		{ value: 'soft', label: 'Soft' }
	];

	let customHex = $state(prefsStore.accentColor);
	let hexError = $state(false);

	function applyCustomHex() {
		const val = customHex.trim();
		if (/^#[0-9a-fA-F]{6}$/.test(val)) {
			prefsStore.setAccentColor(val);
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
</script>

<svelte:head>
	<title>Settings — CosmicWorkOut</title>
</svelte:head>

<div class="settings-page">
	<header class="settings-page__header">
		<p class="settings-page__eyebrow">Preferences</p>
		<h1 class="settings-page__title">Settings</h1>
	</header>

	<div class="settings-grid">
		<!-- Accent color -->
		<section class="settings-section settings-section--accent" aria-labelledby="section-accent">
			<h2 class="settings-section__title" id="section-accent">Accent Color</h2>
			<div class="color-swatches" role="group" aria-label="Accent color presets">
				{#each ACCENT_PRESETS as preset}
					<button
						class="color-swatch"
						class:color-swatch--active={prefsStore.accentColor === preset.value}
						style:--swatch={preset.value}
						onclick={() => selectPreset(preset.value)}
						aria-label="{preset.label}{prefsStore.accentColor === preset.value ? ' (selected)' : ''}"
						aria-pressed={prefsStore.accentColor === preset.value}
					>
						{#if prefsStore.accentColor === preset.value}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
								<polyline points="20 6 9 17 4 12" />
							</svg>
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
		</section>

		<!-- Logging mode -->
		<section class="settings-section" aria-labelledby="section-logging">
			<h2 class="settings-section__title" id="section-logging">Set Logging Mode</h2>
			<div class="option-list" role="radiogroup" aria-labelledby="section-logging">
				{#each LOGGING_MODES as mode}
					<button
						class="option-row"
						class:option-row--active={prefsStore.loggingMode === mode.value}
						role="radio"
						aria-checked={prefsStore.loggingMode === mode.value}
						onclick={() => prefsStore.setLoggingMode(mode.value)}
					>
						<div class="option-row__info">
							<span class="option-row__label">{mode.label}</span>
							<span class="option-row__desc">{mode.desc}</span>
						</div>
						<span class="option-row__radio" aria-hidden="true"></span>
					</button>
				{/each}
			</div>
		</section>

		<!-- Weight unit -->
		<section class="settings-section" aria-labelledby="section-unit">
			<h2 class="settings-section__title" id="section-unit">Weight Unit</h2>
			<div class="seg-control" role="radiogroup" aria-labelledby="section-unit">
				{#each (['lb', 'kg'] as const) as unit}
					<button
						class="seg-control__btn"
						class:seg-control__btn--active={prefsStore.weightUnit === unit}
						role="radio"
						aria-checked={prefsStore.weightUnit === unit}
						onclick={() => prefsStore.setWeightUnit(unit)}
					>
						{unit}
					</button>
				{/each}
			</div>
		</section>

		<!-- Completion feel -->
		<section class="settings-section" aria-labelledby="section-feel">
			<h2 class="settings-section__title" id="section-feel">Completion Feel</h2>
			<div class="option-list" role="radiogroup" aria-labelledby="section-feel">
				{#each ([{ value: 'full', label: 'Full', desc: 'Confetti + full ring animation' }, { value: 'subtle', label: 'Subtle', desc: 'Minimal indicators, no confetti' }] as const) as opt}
					<button
						class="option-row"
						class:option-row--active={prefsStore.completionFeel === opt.value}
						role="radio"
						aria-checked={prefsStore.completionFeel === opt.value}
						onclick={() => prefsStore.setCompletionFeel(opt.value)}
					>
						<div class="option-row__info">
							<span class="option-row__label">{opt.label}</span>
							<span class="option-row__desc">{opt.desc}</span>
						</div>
						<span class="option-row__radio" aria-hidden="true"></span>
					</button>
				{/each}
			</div>
		</section>

		<!-- Density -->
		<section class="settings-section" aria-labelledby="section-density">
			<h2 class="settings-section__title" id="section-density">Density</h2>
			<div class="seg-control" role="radiogroup" aria-labelledby="section-density">
				{#each DENSITIES as d}
					<button
						class="seg-control__btn"
						class:seg-control__btn--active={prefsStore.density === d.value}
						role="radio"
						aria-checked={prefsStore.density === d.value}
						onclick={() => prefsStore.setDensity(d.value)}
					>
						{d.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Roundness -->
		<section class="settings-section" aria-labelledby="section-roundness">
			<h2 class="settings-section__title" id="section-roundness">Roundness</h2>
			<div class="seg-control" role="radiogroup" aria-labelledby="section-roundness">
				{#each ROUNDNESS_OPTIONS as r}
					<button
						class="seg-control__btn"
						class:seg-control__btn--active={prefsStore.roundness === r.value}
						role="radio"
						aria-checked={prefsStore.roundness === r.value}
						onclick={() => prefsStore.setRoundness(r.value)}
					>
						{r.label}
					</button>
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	.settings-page {
		container-type: inline-size;
		padding-inline: var(--space-4);
		padding-block-start: calc(var(--safe-top) + var(--space-6));
		padding-block-end: var(--space-8);
	}

	@container main (inline-size >= 600px) {
		.settings-page {
			max-inline-size: 900px;
			margin-inline: auto;
			padding-inline: var(--space-8);
		}
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
	}

	@container (inline-size >= 560px) {
		.settings-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 0 var(--space-8);
		}

		.settings-section--accent {
			grid-column: 1 / -1;
		}
	}

	.settings-page__header {
		margin-block-end: var(--space-6);
	}

	.settings-page__eyebrow {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-1);
	}

	.settings-page__title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.settings-section {
		margin-block-end: var(--space-6);
	}

	.settings-section__title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
		margin-block-end: var(--space-3);
	}

	/* Color swatches */
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
		transition: border-color var(--duration-fast) var(--ease-out);

		svg {
			inline-size: 18px;
			block-size: 18px;
			color: #101010;
		}

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

	/* Option rows (radio-style) */
	.option-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.option-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-3) var(--space-4);
		text-align: start;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.option-row--active {
		border-color: var(--color-accent);
	}

	.option-row__info {
		flex: 1;
		min-inline-size: 0;
	}

	.option-row__label {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.option-row__desc {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-block-start: 2px;
	}

	.option-row__radio {
		inline-size: 20px;
		block-size: 20px;
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border-strong);
		flex-shrink: 0;
		position: relative;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.option-row--active .option-row__radio {
		border-color: var(--color-accent);

		&::after {
			content: '';
			position: absolute;
			inset: 3px;
			background: var(--color-accent);
			border-radius: var(--radius-full);
		}
	}

	/* Segmented control */
	.seg-control {
		display: flex;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 3px;
		gap: 3px;
	}

	.seg-control__btn {
		flex: 1;
		block-size: 38px;
		border-radius: calc(var(--radius-lg) - 4px);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.seg-control__btn--active {
		background: var(--color-surface-3);
		color: var(--color-text-primary);
	}
</style>
