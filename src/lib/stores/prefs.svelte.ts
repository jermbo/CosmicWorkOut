import type { UserPrefs, CompletionFeel, Density, Roundness } from '$lib/db/types';

const PREFS_KEY = 'cwout:prefs';

const DEFAULTS: UserPrefs = {
	accentColor: '#b2f042',
	completionFeel: 'full',
	density: 'comfortable',
	roundness: 'default',
	weightUnit: 'lb'
};

class PrefsStore {
	accentColor = $state(DEFAULTS.accentColor);
	completionFeel = $state<CompletionFeel>(DEFAULTS.completionFeel);
	density = $state<Density>(DEFAULTS.density);
	roundness = $state<Roundness>(DEFAULTS.roundness);
	weightUnit = $state<'lb' | 'kg'>(DEFAULTS.weightUnit);

	load(): void {
		const stored = localStorage.getItem(PREFS_KEY);
		if (stored) {
			const parsed = JSON.parse(stored) as UserPrefs;
			this.accentColor = parsed.accentColor ?? DEFAULTS.accentColor;
			this.completionFeel = parsed.completionFeel ?? DEFAULTS.completionFeel;
			this.density = parsed.density ?? DEFAULTS.density;
			this.roundness = parsed.roundness ?? DEFAULTS.roundness;
			this.weightUnit = parsed.weightUnit ?? DEFAULTS.weightUnit;
		}

		this.applyAccentColor();
		this.applyDensity();
		this.applyRoundness();
	}

	private save(): void {
		const prefs: UserPrefs = {
			accentColor: this.accentColor,
			completionFeel: this.completionFeel,
			density: this.density,
			roundness: this.roundness,
			weightUnit: this.weightUnit
		};
		localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
	}

	private applyDensity(): void {
		document.documentElement.dataset.density = this.density;
	}

	private applyRoundness(): void {
		document.documentElement.dataset.roundness = this.roundness;
	}

	private applyAccentColor(): void {
		document.documentElement.style.setProperty('--color-accent', this.accentColor);

		const hex = this.accentColor.replace('#', '');
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		const luminance = (r * 299 + g * 587 + b * 114) / 1000;

		let inkColor = '#ffffff';
		if (luminance > 140) {
			inkColor = '#101010';
		}

		document.documentElement.style.setProperty('--color-accent-ink', inkColor);
	}

	setAccentColor(color: string): void {
		this.accentColor = color;
		this.applyAccentColor();
		this.save();
	}

	setCompletionFeel(feel: CompletionFeel): void {
		this.completionFeel = feel;
		this.save();
	}

	setDensity(density: Density): void {
		this.density = density;
		this.applyDensity();
		this.save();
	}

	setRoundness(roundness: Roundness): void {
		this.roundness = roundness;
		this.applyRoundness();
		this.save();
	}

	setWeightUnit(unit: 'lb' | 'kg'): void {
		this.weightUnit = unit;
		this.save();
	}
}

export const prefsStore = new PrefsStore();
