import type { JournalEntry } from '$lib/db/types';
import { db } from '$lib/db/database';
import { generateId } from '$lib/utils';

class JournalStore {
	entries = $state<JournalEntry[]>([]);
	loaded = $state(false);

	entryForDate(date: string): JournalEntry | undefined {
		return this.entries.find((e) => e.date === date);
	}

	async load(): Promise<void> {
		this.entries = await db.journals.getAll();
		this.loaded = true;
	}

	async save(date: string, content: string): Promise<void> {
		const existing = this.entryForDate(date);
		const now = new Date().toISOString();
		const entry: JournalEntry = existing
			? { ...existing, content, updatedAt: now }
			: { id: generateId(), date, content, createdAt: now, updatedAt: now };
		await db.journals.put(entry);
		if (existing) {
			this.entries = this.entries.map((e) => (e.id === entry.id ? entry : e));
		} else {
			this.entries = [...this.entries, entry];
		}
	}

	async clear(date: string): Promise<void> {
		const existing = this.entryForDate(date);
		if (!existing) return;
		await db.journals.remove(existing.id);
		this.entries = this.entries.filter((e) => e.id !== existing.id);
	}
}

export const journalStore = new JournalStore();
