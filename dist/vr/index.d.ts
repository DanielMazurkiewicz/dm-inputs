import type { InputsState } from '../common';
import { type KeyId } from '../keys';
export interface VROptions {
    /** The reference space to use for poses. 'local-floor' is room-scale, 'viewer' is head-locked. */
    referenceSpaceType?: XRReferenceSpaceType;
    vrAxisDeadzone?: number;
}
/** Detects if a key ID belongs to a VR key. @internal */
export declare function isVRKey(keyId: KeyId): boolean;
/**
 * Initializes VR input handling using the WebXR API.
 * This function is asynchronous because it needs to request an XR session.
 *
 * NOTE: Requesting an XR session MUST be done in response to a user gesture (e.g., a click).
 * You should typically call this from within a button's click event listener.
 *
 * Example:
 * ```
 * const vrButton = document.getElementById('vr-button');
 * vrButton.addEventListener('click', async () => {
 *   const { destroy } = await initInputVR(state, { referenceSpaceType: 'local-floor' });
 *   // Store the destroy function to call it when you want to exit VR.
 * });
 * ```
 */
export declare function initInputVR(state: InputsState, options?: VROptions): Promise<{
    destroy: () => void;
}>;
