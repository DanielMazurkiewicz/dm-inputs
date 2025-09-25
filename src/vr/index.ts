import type { InputEvent, InputsState } from '../common';
import { addEvent, JustPressed, JustReleased, JustUpdated } from '../common';
import { type KeyId } from '../keys';
import { JOYSTICK_BASE_ID } from '../joystick/keys_consts';
import {
    VR_AXIS_OFFSET, VR_BASE_ID, VR_BUTTON_OFFSET, VR_CONTROLLER_L_DEVICE_INDEX, VR_CONTROLLER_R_DEVICE_INDEX,
    VR_ID_RANGE, MAX_VR_AXES, MAX_VR_BUTTONS
} from './keys_consts';
import {
    KeyVRHmdOrientationW, KeyVRHmdOrientationX, KeyVRHmdOrientationY, KeyVRHmdOrientationZ,
    KeyVRHmdPositionX, KeyVRHmdPositionY, KeyVRHmdPositionZ
} from './keys';


// --- Options Interfaces ---
export interface VROptions {
    /** The reference space to use for poses. 'local-floor' is room-scale, 'viewer' is head-locked. */
    referenceSpaceType?: XRReferenceSpaceType;
    vrAxisDeadzone?: number;
}

// --- Internal: Normalization ---
const MAX_POSITION = 10; // meters from origin
function normalizePosition(value: number): number {
    // Normalize from [-MAX_POSITION, MAX_POSITION] to [0, 1]
    return Math.max(0, Math.min(1, (value + MAX_POSITION) / (2 * MAX_POSITION)));
}
function normalizeOrientation(value: number): number {
    // Normalize quaternion component from [-1, 1] to [0, 1]
    return (value + 1) / 2;
}


/**
 * Updates the state for a single VR value (position/orientation component).
 * @internal 
 */
function updateVRState(state: InputsState, keyId: KeyId, value: number, normalizer: (v: number) => number) {
    const pressure = normalizer(value);

    if (!state.keysPressed.has(keyId)) {
        // First time seeing this, treat as "just pressed"
        addEvent(state, keyId, JustPressed, pressure, -1, -1);
    } else {
        // Value updated, treat as a "move" event
        const event = state.keysPressed.get(keyId)!;
        if (event.pressure !== pressure) {
            addEvent(state, keyId, JustUpdated, pressure, -1, -1);
        }
    }
}

/** Detects if a key ID belongs to a VR key. @internal */
function isVRKey(keyId: KeyId): boolean {
    return keyId >= VR_BASE_ID && keyId < JOYSTICK_BASE_ID;
}

/** Releases all VR-related keys from the state. @internal */
function releaseAllVRKeys(state: InputsState) {
    const keysToRelease: KeyId[] = [];
    for (const keyId of state.keysPressed.keys()) {
        if (isVRKey(keyId)) {
            keysToRelease.push(keyId);
        }
    }
    for (const keyId of keysToRelease) {
        const event = state.keysPressed.get(keyId)!;
        addEvent(state, keyId, JustReleased, 0, event.x, event.y);
    }
}

/** Releases all keys associated with a single VR device. @internal */
function releaseDeviceKeys(state: InputsState, deviceIndex: number, prevState: { buttons: any[], axes: any[] }, vrAxisDeadzone: number) {
    // Release pose keys
    const basePoseId = VR_BASE_ID + deviceIndex * VR_ID_RANGE;
    for (let j = 0; j < 7; j++) { // pos x,y,z, rot x,y,z,w
         const keyId = (basePoseId + j) as KeyId;
         if(state.keysPressed.has(keyId)) {
             addEvent(state, keyId, JustReleased, 0, -1, -1);
         }
    }

    // Release buttons
    for (let j = 0; j < prevState.buttons.length; j++) {
        if (prevState.buttons[j].pressed) {
            const keyId = (VR_BASE_ID + (deviceIndex * VR_ID_RANGE) + VR_BUTTON_OFFSET + j) as KeyId;
            if (state.keysPressed.has(keyId)) {
                addEvent(state, keyId, JustReleased, 0, -1, -1);
            }
        }
    }
    
    // Release axes
    for (let j = 0; j < prevState.axes.length; j++) {
        const prev = prevState.axes[j];
        const baseAxisId = VR_BASE_ID + (deviceIndex * VR_ID_RANGE) + VR_AXIS_OFFSET + (j * 2);
        if (prev > vrAxisDeadzone) {
            const posKeyId = baseAxisId as KeyId;
            if (state.keysPressed.has(posKeyId)) {
                addEvent(state, posKeyId, JustReleased, 0, -1, -1);
            }
        }
        if (prev < -vrAxisDeadzone) {
            const negKeyId = (baseAxisId + 1) as KeyId;
            if (state.keysPressed.has(negKeyId)) {
                addEvent(state, negKeyId, JustReleased, 0, -1, -1);
            }
        }
    }
}


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
export async function initInputVR(state: InputsState, options: VROptions = {}): Promise<{ destroy: () => void }> {
    if (!navigator.xr) {
        console.warn("WebXR API is not available in this browser.");
        return { destroy: () => {} };
    }

    const { referenceSpaceType = 'local', vrAxisDeadzone = 0.15 } = options;
    let xrSession: XRSession | null = null;
    let xrReferenceSpace: XRReferenceSpace | null = null;
    let isDestroyed = false;

    try {
        // 'immersive-vr' is for headsets. 'inline' is for viewing on a page.
        xrSession = await navigator.xr.requestSession('immersive-vr');
        xrReferenceSpace = await xrSession.requestReferenceSpace(referenceSpaceType);
    } catch (e) {
        console.error("Failed to start WebXR session:", e);
        return { destroy: () => {} };
    }

    const onSessionEnd = () => {
        xrSession = null;
        xrReferenceSpace = null;
        releaseAllVRKeys(state);
        console.log("WebXR session ended.");
    };
    xrSession.addEventListener('end', onSessionEnd);

    const previousControllerStates: { [key: string]: { buttons: { pressed: boolean; value: number }[]; axes: number[] } } = {};


    const onFrame: XRFrameRequestCallback = (time, frame) => {
        if (isDestroyed || !xrSession) return;
        xrSession.requestAnimationFrame(onFrame);

        const viewerPose = frame.getViewerPose(xrReferenceSpace!);
        if (viewerPose) {
            const { position, orientation } = viewerPose.transform;
            updateVRState(state, KeyVRHmdPositionX, position.x, normalizePosition);
            updateVRState(state, KeyVRHmdPositionY, position.y, normalizePosition);
            updateVRState(state, KeyVRHmdPositionZ, position.z, normalizePosition);
            updateVRState(state, KeyVRHmdOrientationX, orientation.x, normalizeOrientation);
            updateVRState(state, KeyVRHmdOrientationY, orientation.y, normalizeOrientation);
            updateVRState(state, KeyVRHmdOrientationZ, orientation.z, normalizeOrientation);
            updateVRState(state, KeyVRHmdOrientationW, orientation.w, normalizeOrientation);
        }

        const activeHands = new Set<XRHandedness>();
        let leftControllerFound = false;
        let rightControllerFound = false;

        for (const source of xrSession.inputSources) {
            if (!source.gripSpace || !source.gamepad) continue;

            let hand = source.handedness;
            
            if (hand === 'none' || !hand) {
                if (!leftControllerFound) { hand = 'left'; } 
                else if (!rightControllerFound) { hand = 'right'; } 
                else { continue; } // Already found two controllers, skip this one
            }
            activeHands.add(hand);

            let deviceIndex: number;
            if (hand === 'left') { deviceIndex = VR_CONTROLLER_L_DEVICE_INDEX; leftControllerFound = true; } 
            else if (hand === 'right') { deviceIndex = VR_CONTROLLER_R_DEVICE_INDEX; rightControllerFound = true; } 
            else { continue; }
            
            const pose = frame.getPose(source.gripSpace, xrReferenceSpace!);
            if (pose) {
                const basePoseId = VR_BASE_ID + deviceIndex * VR_ID_RANGE;
                const { position, orientation } = pose.transform;
                updateVRState(state, (basePoseId + 0) as KeyId, position.x, normalizePosition);
                updateVRState(state, (basePoseId + 1) as KeyId, position.y, normalizePosition);
                updateVRState(state, (basePoseId + 2) as KeyId, position.z, normalizePosition);
                updateVRState(state, (basePoseId + 3) as KeyId, orientation.x, normalizeOrientation);
                updateVRState(state, (basePoseId + 4) as KeyId, orientation.y, normalizeOrientation);
                updateVRState(state, (basePoseId + 5) as KeyId, orientation.z, normalizeOrientation);
                updateVRState(state, (basePoseId + 6) as KeyId, orientation.w, normalizeOrientation);
            }

            const gamepad = source.gamepad;
            const prevState = previousControllerStates[hand];
            const btnCount = Math.min(gamepad.buttons.length, MAX_VR_BUTTONS);
            for (let j = 0; j < btnCount; j++) {
                const isPressed = gamepad.buttons[j].pressed;
                const wasPressed = prevState?.buttons[j]?.pressed ?? false;
                const keyId = (VR_BASE_ID + (deviceIndex * VR_ID_RANGE) + VR_BUTTON_OFFSET + j) as KeyId;
                const pressure = gamepad.buttons[j].value;

                if (isPressed && !wasPressed) {
                    addEvent(state, keyId, JustPressed, pressure, -1, -1);
                } else if (!isPressed && wasPressed) {
                    addEvent(state, keyId, JustReleased, 0, -1, -1);
                } else if (isPressed) {
                    const event = state.keysPressed.get(keyId);
                    if (event && event.pressure !== pressure) {
                        addEvent(state, keyId, JustUpdated, pressure, -1, -1);
                    }
                }
            }

            const axisCount = Math.min(gamepad.axes.length, MAX_VR_AXES);
            for (let j = 0; j < axisCount; j++) {
                const current = gamepad.axes[j];
                const prev = prevState?.axes[j] ?? 0;
                const baseAxisId = VR_BASE_ID + (deviceIndex * VR_ID_RANGE) + VR_AXIS_OFFSET + (j * 2);
            
                // Positive axis
                const isPos = current > vrAxisDeadzone;
                const wasPos = prev > vrAxisDeadzone;
                const posKeyId = baseAxisId as KeyId;
                const pressurePos = Math.max(0, (current - vrAxisDeadzone) / (1 - vrAxisDeadzone));
                if (isPos && !wasPos) {
                    addEvent(state, posKeyId, JustPressed, pressurePos, -1, -1);
                } else if (!isPos && wasPos) {
                    addEvent(state, posKeyId, JustReleased, 0, -1, -1);
                } else if (isPos) {
                    const event = state.keysPressed.get(posKeyId);
                    if (event && event.pressure !== pressurePos) {
                        addEvent(state, posKeyId, JustUpdated, pressurePos, -1, -1);
                    }
                }
            
                // Negative axis
                const isNeg = current < -vrAxisDeadzone;
                const wasNeg = prev < -vrAxisDeadzone;
                const negKeyId = (baseAxisId + 1) as KeyId;
                const pressureNeg = Math.max(0, (Math.abs(current) - vrAxisDeadzone) / (1 - vrAxisDeadzone));
                if (isNeg && !wasNeg) {
                    addEvent(state, negKeyId, JustPressed, pressureNeg, -1, -1);
                } else if (!isNeg && wasNeg) {
                    addEvent(state, negKeyId, JustReleased, 0, -1, -1);
                } else if (isNeg) {
                    const event = state.keysPressed.get(negKeyId);
                    if (event && event.pressure !== pressureNeg) {
                        addEvent(state, negKeyId, JustUpdated, pressureNeg, -1, -1);
                    }
                }
            }

            if (!previousControllerStates[hand]) previousControllerStates[hand] = { buttons: [], axes: [] };
            const newState = previousControllerStates[hand];
            for (let j = 0; j < btnCount; j++) { if (!newState.buttons[j]) newState.buttons[j] = { pressed: false, value: 0 }; newState.buttons[j].pressed = gamepad.buttons[j].pressed; newState.buttons[j].value = gamepad.buttons[j].value; }
            for (let j = 0; j < axisCount; j++) newState.axes[j] = gamepad.axes[j];
        }

        // Check for disconnected controllers
        for (const hand in previousControllerStates) {
            if (!activeHands.has(hand as XRHandedness)) {
                const deviceIndex = hand === 'left' ? VR_CONTROLLER_L_DEVICE_INDEX : VR_CONTROLLER_R_DEVICE_INDEX;
                releaseDeviceKeys(state, deviceIndex, previousControllerStates[hand], vrAxisDeadzone);
                delete previousControllerStates[hand];
            }
        }
    };

    xrSession.requestAnimationFrame(onFrame);

    const destroy = () => {
        isDestroyed = true;
        if (xrSession) {
            // Ending the session will trigger the 'end' event, which calls onSessionEnd for cleanup.
            xrSession.end().catch((e: any) => console.error("Error ending XR session:", e));
            xrSession.removeEventListener('end', onSessionEnd);
        } else {
            // If session was never created or already ended, clean up manually.
            releaseAllVRKeys(state);
        }
    };

    return { destroy };
}