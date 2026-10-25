/**
 * Camera and QR reader for Receive by QR (US-058). Browser-only.
 *
 * The browser's own `BarcodeDetector` is used where it reads QR codes (Chromium on
 * macOS, Android, ChromeOS). Safari and Firefox don't have it, so the bundled `jsqr`
 * reader is loaded on demand instead — it is precached by the service worker like
 * every other build chunk, so it works offline.
 */

export type ReaderEngine = 'built-in' | 'bundled';

export interface QrReader {
	engine: ReaderEngine;
	/** Every QR string visible in the current video frame. */
	read(video: HTMLVideoElement): Promise<string[]>;
}

/** Minimal shape of the Shape Detection API — not in TypeScript's DOM lib. */
interface BarcodeDetectorLike {
	detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}
interface BarcodeDetectorClass {
	new (options: { formats: string[] }): BarcodeDetectorLike;
	getSupportedFormats(): Promise<string[]>;
}

async function builtInReader(): Promise<QrReader | null> {
	const Detector = (globalThis as { BarcodeDetector?: BarcodeDetectorClass }).BarcodeDetector;
	if (!Detector) return null;
	try {
		if (!(await Detector.getSupportedFormats()).includes('qr_code')) return null;
		const detector = new Detector({ formats: ['qr_code'] });
		return {
			engine: 'built-in',
			read: async (video) => (await detector.detect(video)).map((code) => code.rawValue),
		};
	} catch (err) {
		console.warn('[qr-receive] BarcodeDetector unavailable; using bundled reader', err);
		return null;
	}
}

async function bundledReader(): Promise<QrReader> {
	const { default: jsQR } = await import('jsqr');
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) throw new Error('This browser cannot read camera frames.');
	return {
		engine: 'bundled',
		read: async (video) => {
			const { videoWidth: w, videoHeight: h } = video;
			if (!w || !h) return [];
			if (canvas.width !== w) canvas.width = w;
			if (canvas.height !== h) canvas.height = h;
			ctx.drawImage(video, 0, 0, w, h);
			const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, {
				// Codes are always dark on light here; skipping the inverted pass halves the cost.
				inversionAttempts: 'dontInvert',
			});
			return code ? [code.data] : [];
		},
	};
}

export async function createQrReader(): Promise<QrReader> {
	return (await builtInReader()) ?? (await bundledReader());
}

/** Why the camera can't be used at all on this page, or null when it can. */
export function cameraUnavailableReason(): string | null {
	if (typeof window !== 'undefined' && !window.isSecureContext) {
		return 'The camera only works over HTTPS or on localhost. Open the app from a secure address to receive.';
	}
	if (!navigator.mediaDevices?.getUserMedia) {
		return 'This browser has no camera access.';
	}
	return null;
}

export async function openCamera(deviceId?: string): Promise<MediaStream> {
	const size = { width: { ideal: 1280 }, height: { ideal: 720 } };
	return navigator.mediaDevices.getUserMedia({
		audio: false,
		video: deviceId
			? { deviceId: { exact: deviceId }, ...size }
			: { facingMode: { ideal: 'environment' }, ...size },
	});
}

/** Video inputs, with labels once permission has been granted. */
export async function listCameras(): Promise<MediaDeviceInfo[]> {
	const devices = await navigator.mediaDevices.enumerateDevices();
	return devices.filter((d) => d.kind === 'videoinput');
}

export function stopCamera(stream: MediaStream | null): void {
	for (const track of stream?.getTracks() ?? []) track.stop();
}

/** A rear camera shows the world as-is; anything else (laptop webcams) reads better mirrored. */
export function shouldMirror(stream: MediaStream): boolean {
	return stream.getVideoTracks()[0]?.getSettings().facingMode !== 'environment';
}

export function cameraErrorMessage(err: unknown): string {
	const name = err instanceof Error || err instanceof DOMException ? err.name : '';
	switch (name) {
		case 'NotAllowedError':
		case 'SecurityError':
			return "Camera access was refused. Allow the camera in this site's browser settings, then try again.";
		case 'NotFoundError':
		case 'OverconstrainedError':
			return 'No camera was found on this device.';
		case 'NotReadableError':
		case 'AbortError':
			return 'The camera is busy — close any other app using it, then try again.';
		default:
			return 'Could not start the camera.';
	}
}
