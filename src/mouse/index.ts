import type { InputEvent, InputsState } from '../common';
import { addEvent } from '../common';
import { type KeyId } from '../keys';
import { KeyTouch0 } from '../touch/keys';
import { KeyMouseLeft, KeyMouseMiddle, KeyMouseMove, KeyMouseRight, KeyMouseWheelDown, KeyMouseWheelUp } from './keys';

// --- Options Interfaces ---
export interface MouseOptions { preventDefaults?: boolean; mouseMoveStopTimeout?: number; }

/** Initializes mouse input handling. */
export function initInputMouse(element: HTMLElement, state: InputsState, options: MouseOptions = {}) {
    const { preventDefaults = true, mouseMoveStopTimeout = 200 } = options;
    const MOUSE_BUTTON_MAP: readonly KeyId[] = [KeyMouseLeft, KeyMouseMiddle, KeyMouseRight];
    let mouseX = 0, mouseY = 0; // State variables for coordinates
    let lastMouseMoveTime = 0;
    let stopCheckRequestId: number | null = null;

    const updateCoords = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    };

    const handleMouseDown = (e: MouseEvent) => {
        const keyId = MOUSE_BUTTON_MAP[e.button];
        if (!keyId || state.keysPressed.has(keyId)) return;
        updateCoords(e);
        addEvent(state, keyId, true, false, 1, mouseX, mouseY);
    };
    const handleMouseUp = (e: MouseEvent) => {
        const keyId = MOUSE_BUTTON_MAP[e.button];
        if (!keyId || !state.keysPressed.has(keyId)) return;
        updateCoords(e);
        addEvent(state, keyId, false, true, 0, mouseX, mouseY);
    };

    const checkMouseMoveStop = () => {
        if (lastMouseMoveTime > 0 && state.keysPressed.has(KeyMouseMove)) {
            if (performance.now() - lastMouseMoveTime >= mouseMoveStopTimeout) {
                addEvent(state, KeyMouseMove, false, true, 0, mouseX, mouseY);
                lastMouseMoveTime = 0; // Stop checking
                stopCheckRequestId = null;
            } else {
                // Check again on the next frame
                stopCheckRequestId = requestAnimationFrame(checkMouseMoveStop);
            }
        } else {
            stopCheckRequestId = null;
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        updateCoords(e);
        if (!state.keysPressed.has(KeyMouseMove)) {
            addEvent(state, KeyMouseMove, true, false, 1, mouseX, mouseY);
        } else {
            addEvent(state, KeyMouseMove, false, false, 1, mouseX, mouseY);
        }
        lastMouseMoveTime = performance.now();
        // If a check isn't already scheduled, start one.
        if (stopCheckRequestId === null) {
            stopCheckRequestId = requestAnimationFrame(checkMouseMoveStop);
        }
    };
    const handleWheel = (e: WheelEvent) => {
        const keyId = e.deltaY < 0 ? KeyMouseWheelUp : KeyMouseWheelDown;
        updateCoords(e);
        addEvent(state, keyId, true, false, 1, mouseX, mouseY); addEvent(state, keyId, false, true, 0, mouseX, mouseY);
        if (preventDefaults) e.preventDefault();
    };
    const handleContextMenu = (e: Event) => preventDefaults && e.preventDefault();

    const handleBlur = () => {
        const keysToRelease: KeyId[] = [];
        for (const keyId of state.keysPressed.keys()) {
            if (keyId >= KeyMouseLeft && keyId < KeyTouch0) { // Only mouse keys
                keysToRelease.push(keyId);
            }
        }
        for (const keyId of keysToRelease) {
            addEvent(state, keyId, false, true, 0, -1, -1);
        }
    };

    element.addEventListener('mousedown', handleMouseDown); element.addEventListener('mouseup', handleMouseUp); element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('wheel', handleWheel, { passive: false }); element.addEventListener('contextmenu', handleContextMenu); window.addEventListener('blur', handleBlur);
    const destroy = () => {
        if (stopCheckRequestId !== null) {
            cancelAnimationFrame(stopCheckRequestId);
        }
        element.removeEventListener('mousedown', handleMouseDown); element.removeEventListener('mouseup', handleMouseUp); element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('wheel', handleWheel, false); element.removeEventListener('contextmenu', handleContextMenu); window.removeEventListener('blur', handleBlur);
    };
    return { destroy };
}

/** Detects if a key ID belongs to a mouse key. */
export function isMouseKey(keyId: KeyId): boolean {
    return keyId >= KeyMouseLeft && keyId < KeyTouch0;
}