import type { UserPrefs, Density, Roundness } from '$lib/db/types';
import { DEFAULT_HOME_CARD_ORDER, resolveHomeCardOrder, type HomeCardId } from '$lib/homeCards';

const PREFS_KEY = 'cwout:prefs';

const DEFAULTS: UserPrefs = {
	accentColor: '#b2f042',
	density: 'comfortable',
	roundness: 'default',
	weightUnit: 'lb',
	homeCardOrder: [...DEFAULT_HOME_CARD_ORDER],
	habitsEnabled: false,
	activityLogEnabled: false,
	practiceEnabled: false,
	healthMetricsEnabled: false,
	goalProgressionPlansEnabled: false,
	baselinesEnabled: false,
	hiddenCharts: [],
};

class PrefsStore {
	accentColor = $state(DEFAULTS.accentColor);
	density = $state<Density>(DEFAULTS.density);
	roundness = $state<Roundness>(DEFAULTS.roundness);
	weightUnit = $state<'lb' | 'kg'>(DEFAULTS.weightUnit);
	homeCardOrder = $state<HomeCardId[]>([...DEFAULT_HOME_CARD_ORDER]);
	habitsEnabled = $state(DEFAULTS.habitsEnabled);
	activityLogEnabled = $state(DEFAULTS.activityLogEnabled);
	practiceEnabled = $state(DEFAULTS.practiceEnabled);
	healthMetricsEnabled = $state(DEFAULTS.healthMetricsEnabled);
	goalProgressionPlansEnabled = $state(DEFAULTS.goalProgressionPlansEnabled);
	baselinesEnabled = $state(DEFAULTS.baselinesEnabled);
	hiddenCharts = $state<string[]>([]);

	/**
	 * Lift plans generate backing programs and can only be trained through `/workout`,
	 * which Practice owns — so they are only ever live when Practice is on. Every
	 * consumer reads this instead of and-ing the two flags itself.
	 */
	liftPlansEnabled = $derived(this.practiceEnabled && this.goalProgressionPlansEnabled);

	/**
	 * Every tracking feature is opt-in, so a fresh install has nothing to show.
	 * Overview uses this to offer a way into Settings instead of rendering blank.
	 */
	anyTrackingEnabled = $derived(
		this.habitsEnabled ||
			this.activityLogEnabled ||
			this.practiceEnabled ||
			this.healthMetricsEnabled ||
			this.baselinesEnabled,
	);

	load(): void {
		try {
			const stored = localStorage.getItem(PREFS_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as Partial<UserPrefs>;
				this.accentColor = parsed.accentColor ?? DEFAULTS.accentColor;
				this.density = parsed.density ?? DEFAULTS.density;
				this.roundness = parsed.roundness ?? DEFAULTS.roundness;
				this.weightUnit = parsed.weightUnit ?? DEFAULTS.weightUnit;
				this.homeCardOrder = resolveHomeCardOrder(parsed.homeCardOrder);
				this.habitsEnabled = parsed.habitsEnabled ?? DEFAULTS.habitsEnabled;
				this.activityLogEnabled = parsed.activityLogEnabled ?? DEFAULTS.activityLogEnabled;
				this.practiceEnabled = parsed.practiceEnabled ?? DEFAULTS.practiceEnabled;
				this.healthMetricsEnabled = parsed.healthMetricsEnabled ?? DEFAULTS.healthMetricsEnabled;
				this.goalProgressionPlansEnabled =
					parsed.goalProgressionPlansEnabled ?? DEFAULTS.goalProgressionPlansEnabled;
				this.baselinesEnabled = parsed.baselinesEnabled ?? DEFAULTS.baselinesEnabled;
				this.hiddenCharts = Array.isArray(parsed.hiddenCharts)
					? parsed.hiddenCharts.filter((id): id is string => typeof id === 'string')
					: [];
			}
		} catch (e) {
			// Corrupt prefs must never block app startup — fall back to defaults.
			console.error('Failed to load preferences, using defaults:', e);
		}

		this.applyAccentColor();
		this.applyDensity();
		this.applyRoundness();
	}

	private save(): void {
		const prefs: UserPrefs = {
			accentColor: this.accentColor,
			density: this.density,
			roundness: this.roundness,
			weightUnit: this.weightUnit,
			homeCardOrder: this.homeCardOrder,
			habitsEnabled: this.habitsEnabled,
			activityLogEnabled: this.activityLogEnabled,
			practiceEnabled: this.practiceEnabled,
			healthMetricsEnabled: this.healthMetricsEnabled,
			goalProgressionPlansEnabled: this.goalProgressionPlansEnabled,
			baselinesEnabled: this.baselinesEnabled,
			hiddenCharts: this.hiddenCharts,
		};
		localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
	}

	setHomeCardOrder(order: HomeCardId[]): void {
		this.homeCardOrder = resolveHomeCardOrder(order);
		this.save();
	}

	resetHomeCardOrder(): void {
		this.setHomeCardOrder([...DEFAULT_HOME_CARD_ORDER]);
	}

	setHabitsEnabled(enabled: boolean): void {
		this.habitsEnabled = enabled;
		this.save();
	}

	setActivityLogEnabled(enabled: boolean): void {
		this.activityLogEnabled = enabled;
		this.save();
	}

	setPracticeEnabled(enabled: boolean): void {
		this.practiceEnabled = enabled;
		this.save();
	}

	setHealthMetricsEnabled(enabled: boolean): void {
		this.healthMetricsEnabled = enabled;
		this.save();
	}

	setGoalProgressionPlansEnabled(enabled: boolean): void {
		this.goalProgressionPlansEnabled = enabled;
		this.save();
	}

	setBaselinesEnabled(enabled: boolean): void {
		this.baselinesEnabled = enabled;
		this.save();
	}

	isChartHidden(id: string): boolean {
		return this.hiddenCharts.includes(id);
	}

	/** Show or hide one Insights chart (US-043). New charts are visible by default. */
	setChartHidden(id: string, hidden: boolean): void {
		const rest = this.hiddenCharts.filter((c) => c !== id);
		this.hiddenCharts = hidden ? [...rest, id] : rest;
		this.save();
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

	resetToDefaults(): void {
		this.accentColor = DEFAULTS.accentColor;
		this.density = DEFAULTS.density;
		this.roundness = DEFAULTS.roundness;
		this.weightUnit = DEFAULTS.weightUnit;
		this.applyAccentColor();
		this.applyDensity();
		this.applyRoundness();
		this.save();
	}
}

export const prefsStore = new PrefsStore();
