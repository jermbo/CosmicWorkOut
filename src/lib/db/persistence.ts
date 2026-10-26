/**
 * Ask the browser to keep this app's data instead of clearing it when the disk runs low
 * or the site goes unused. Chromium decides silently, Firefox may show a prompt, and
 * Safari mostly relies on the app being added to the Home Screen.
 *
 * Called from backup actions the user starts (export, restore, Send / Receive by QR), so
 * any prompt shows up when keeping data is clearly the point. Never throws.
 */
export async function requestPersistentStorage(): Promise<boolean> {
	try {
		if (!navigator.storage?.persist) return false;
		if (await navigator.storage.persisted()) return true;
		const granted = await navigator.storage.persist();
		console.info('[storage] persistent storage', granted ? 'granted' : 'not granted');
		return granted;
	} catch (err) {
		console.info('[storage] persistent storage request failed', err);
		return false;
	}
}
