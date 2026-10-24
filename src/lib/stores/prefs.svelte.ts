import type { UserPrefs, Density } from '$lib/db/types';
import { DEFAULT_HOME_CARD_ORDER, resolveHomeCardOrder, type HomeCardId } from '$lib/homeCards';

const PREFS_KEY = 'cwout:prefs';

const DEFAULTS: UserPrefs = {
	density: 'comfortable',
	weightUnit: 'lb',
	homeCardOrder: [...DEFAULT_HOME_CARD_ORDER],
	habitsEnabled: false,
	activityLogEnabled: false,
	practiceEnabled: false,
	healthMetricsEnabled: false,
	baselinesEnabled: false,
	hiddenCharts: [],
};

class PrefsStore {
	density = $state<Density>(DEFAULTS.density);
	weightUnit = $state<'lb' | 'kg'>(DEFAULTS.weightUnit);
	homeCardOrder = $state<HomeCardId[]>([...DEFAULT_HOME_CARD_ORDER]);
	habitsEnabled = $state(DEFAULTS.habitsEnabled);
	activityLogEnabled = $state(DEFAULTS.activityLogEnabled);
	practiceEnabled = $state(DEFAULTS.practiceEnabled);
	healthMetricsEnabled = $state(DEFAULTS.healthMetricsEnabled);
	baselinesEnabled = $state(DEFAULTS.baselinesEnabled);
	hiddenCharts = $state<string[]>([]);

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
				// Older prefs may still carry theme / accentColor / roundness (removed in
				// v1.12.0 — the app is dark only). They're ignored and dropped on next save.
				this.density = parsed.density ?? DEFAULTS.density;
				this.weightUnit = parsed.weightUnit ?? DEFAULTS.weightUnit;
				this.homeCardOrder = resolveHomeCardOrder(parsed.homeCardOrder);
				this.habitsEnabled = parsed.habitsEnabled ?? DEFAULTS.habitsEnabled;
				this.activityLogEnabled = parsed.activityLogEnabled ?? DEFAULTS.activityLogEnabled;
				this.practiceEnabled = parsed.practiceEnabled ?? DEFAULTS.practiceEnabled;
				this.healthMetricsEnabled = parsed.healthMetricsEnabled ?? DEFAULTS.healthMetricsEnabled;
				this.baselinesEnabled = parsed.baselinesEnabled ?? DEFAULTS.baselinesEnabled;
				this.hiddenCharts = Array.isArray(parsed.hiddenCharts)
					? parsed.hiddenCharts.filter((id): id is string => typeof id === 'string')
					: [];
			}
		} catch (e) {
			// Corrupt prefs must never block app startup — fall back to defaults.
			console.error('Failed to load preferences, using defaults:', e);
		}

		this.applyDensity();
	}

	private save(): void {
		const prefs: UserPrefs = {
			density: this.density,
			weightUnit: this.weightUnit,
			homeCardOrder: this.homeCardOrder,
			habitsEnabled: this.habitsEnabled,
			activityLogEnabled: this.activityLogEnabled,
			practiceEnabled: this.practiceEnabled,
			healthMetricsEnabled: this.healthMetricsEnabled,
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

	setDensity(density: Density): void {
		this.density = density;
		this.applyDensity();
		this.save();
	}

	setWeightUnit(unit: 'lb' | 'kg'): void {
		this.weightUnit = unit;
		this.save();
	}

	resetToDefaults(): void {
		this.density = DEFAULTS.density;
		this.weightUnit = DEFAULTS.weightUnit;
		this.applyDensity();
		this.save();
	}
}

export const prefsStore = new PrefsStore();
