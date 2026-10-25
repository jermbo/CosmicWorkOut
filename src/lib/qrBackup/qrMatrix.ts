import { encode } from 'uqr';

/** Modules of white border around each code — the QR spec's minimum quiet zone. */
export const QUIET_ZONE = 4;

/**
 * The module grid for one frame (`true` = dark), quiet zone included.
 * Error correction stays at L: a screen doesn't get scuffed, and the lower level keeps
 * the code a version smaller, so each square is bigger for the camera.
 */
export function frameMatrix(frame: string): boolean[][] {
	return encode(frame, { ecc: 'L', border: QUIET_ZONE }).data;
}
