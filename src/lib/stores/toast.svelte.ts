import { generateId } from '$lib/utils';

export type ToastKind = 'error' | 'info';

export interface Toast {
	id: string;
	message: string;
	kind: ToastKind;
}

class ToastStore {
	toasts = $state<Toast[]>([]);
	#timers = new Map<string, ReturnType<typeof setTimeout>>();

	show(message: string, kind: ToastKind = 'info', durationMs = 4000): void {
		const id = generateId();
		this.toasts = [...this.toasts, { id, message, kind }];
		this.#timers.set(
			id,
			setTimeout(() => this.dismiss(id), durationMs),
		);
	}

	error(message: string): void {
		this.show(message, 'error', 6000);
	}

	dismiss(id: string): void {
		const timer = this.#timers.get(id);
		if (timer !== undefined) {
			clearTimeout(timer);
			this.#timers.delete(id);
		}
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

export const toastStore = new ToastStore();
