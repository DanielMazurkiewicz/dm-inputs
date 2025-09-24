import type { InputEvent, InputsState } from '../common';
import { addEvent } from '../common';
import { type KeyId } from '../keys';
import { SENSOR_BASE_ID } from '../sensor/keys';
import { KeyTouch0, KeyTouchMove0 } from './keys';

// --- Options Interfaces ---
export interface TouchOptions { preventDefaults?: boolean; touchMoveStopTimeout?: number; }

/** Initializes touch input handling. */
export function initInputTouch(element: HTMLElement, state: InputsState, options: TouchOptions = {}) {
    const { preventDefaults = true, touchMoveStopTimeout = 200 } = options;
    // OPTIMIZED: Use a stack for O(1) allocation/deallocation of touch indices.
    const availableTouchIndices = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    const touchIdentifierMap = new Map<number, number>(); // <touch.identifier, our 0-9 index>
    const touchLastMoveTime = new Map<number, number>(); // <touchIndex, timestamp>
    const touchStopCheckRequestIds = new Map<number, number>(); // <touchIndex, animationFrameId>
    let touchX = 0, touchY = 0; // State variables for coordinates

    const updateCoords = (t: Touch) => {
        const rect = element.getBoundingClientRect();
        touchX = t.clientX - rect.left;
        touchY = t.clientY - rect.top;
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (preventDefaults) e.preventDefault();
        const touches = e.changedTouches;
        for (let i = 0, len = touches.length; i < len; i++) {
            const touch = touches[i];
            if (availableTouchIndices.length === 0) continue; // Max touches reached
            
            const touchIndex = availableTouchIndices.pop()!;
            touchIdentifierMap.set(touch.identifier, touchIndex);
            
            const keyId = (KeyTouch0 + touchIndex) as KeyId;
            updateCoords(touch);
            // NORMALIZED: Use touch.force for pressure if available, otherwise default to 1.0.
            const pressure = (touch.force > 0) ? touch.force : 1.0;
            
            addEvent(state, keyId, true, false, pressure, touchX, touchY);
        }
    };

    const handleTouchEndOrCancel = (e: TouchEvent) => {
        if (preventDefaults) e.preventDefault();
        const touches = e.changedTouches;
        for (let i = 0, len = touches.length; i < len; i++) {
            const touch = touches[i];
            const touchIndex = touchIdentifierMap.get(touch.identifier);
            if (touchIndex === undefined) continue;

            updateCoords(touch);
            const keyId = (KeyTouch0 + touchIndex) as KeyId;
            const moveKeyId = (KeyTouchMove0 + touchIndex) as KeyId;

            addEvent(state, keyId, false, true, 0, touchX, touchY);

            const moveEvent = state.keysPressed.get(moveKeyId);
            if (moveEvent) {
                // Use the coordinates from the last known move event for the release event.
                addEvent(state, moveKeyId, false, true, 0, moveEvent.x, moveEvent.y);
            }
            
            touchLastMoveTime.delete(touchIndex);
            const stopCheckId = touchStopCheckRequestIds.get(touchIndex);
            if (stopCheckId) {
                cancelAnimationFrame(stopCheckId);
                touchStopCheckRequestIds.delete(touchIndex);
            }
            touchIdentifierMap.delete(touch.identifier);
            availableTouchIndices.push(touchIndex); // Return index to the pool
        }
    };
    
    const checkTouchMoveStop = (touchIndex: number) => {
        const lastMoveTime = touchLastMoveTime.get(touchIndex);
        const moveKeyId = (KeyTouchMove0 + touchIndex) as KeyId;
    
        if (lastMoveTime && state.keysPressed.has(moveKeyId)) {
            if (performance.now() - lastMoveTime >= touchMoveStopTimeout) {
                const moveEvent = state.keysPressed.get(moveKeyId)!;
                addEvent(state, moveKeyId, false, true, 0, moveEvent.x, moveEvent.y);
                touchLastMoveTime.delete(touchIndex);
                touchStopCheckRequestIds.delete(touchIndex);
            } else {
                const requestId = requestAnimationFrame(() => checkTouchMoveStop(touchIndex));
                touchStopCheckRequestIds.set(touchIndex, requestId);
            }
        } else {
            touchStopCheckRequestIds.delete(touchIndex);
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (preventDefaults) e.preventDefault();
        const touches = e.changedTouches;
        for (let i = 0, len = touches.length; i < len; i++) {
            const touch = touches[i];
            const touchIndex = touchIdentifierMap.get(touch.identifier);
            if (touchIndex === undefined) continue;

            updateCoords(touch);
            const pressure = (touch.force > 0) ? touch.force : 1.0;
            const moveKeyId = (KeyTouchMove0 + touchIndex) as KeyId;
            const keyId = (KeyTouch0 + touchIndex) as KeyId;

            // Add a "move" event for the base touch key to update its position and pressure.
            addEvent(state, keyId, false, false, pressure, touchX, touchY);

            if (!state.keysPressed.has(moveKeyId)) {
                // First move event for this touch, treat as "just pressed" for the move key.
                addEvent(state, moveKeyId, true, false, pressure, touchX, touchY);
            } else {
                // Subsequent move event.
                addEvent(state, moveKeyId, false, false, pressure, touchX, touchY);
            }

            touchLastMoveTime.set(touchIndex, performance.now());
            if (!touchStopCheckRequestIds.has(touchIndex)) {
                const requestId = requestAnimationFrame(() => checkTouchMoveStop(touchIndex));
                touchStopCheckRequestIds.set(touchIndex, requestId);
            }
        }
    };
    
    const handleBlur = () => {
        const keysToRelease: KeyId[] = [];
        for (const keyId of state.keysPressed.keys()) {
            if (keyId >= KeyTouch0 && keyId < SENSOR_BASE_ID) { // Only touch keys
                 keysToRelease.push(keyId);
            }
        }
        for (const keyId of keysToRelease) {
            addEvent(state, keyId, false, true, 0, -1, -1);
        }

        for(const id of touchStopCheckRequestIds.values()) { cancelAnimationFrame(id); }
        touchIdentifierMap.clear(); 
        touchLastMoveTime.clear();
        touchStopCheckRequestIds.clear();
        // Reset the available indices pool
        availableTouchIndices.length = 0;
        for (let i = 9; i >= 0; i--) availableTouchIndices.push(i);
    };

    const opts = { passive: false };
    element.addEventListener('touchstart', handleTouchStart, opts); element.addEventListener('touchend', handleTouchEndOrCancel, opts);
    element.addEventListener('touchcancel', handleTouchEndOrCancel, opts); element.addEventListener('touchmove', handleTouchMove, opts);
    window.addEventListener('blur', handleBlur);
    const destroy = () => {
        element.removeEventListener('touchstart', handleTouchStart, false); element.removeEventListener('touchend', handleTouchEndOrCancel, false);
        element.removeEventListener('touchcancel', handleTouchEndOrCancel, false); element.removeEventListener('touchmove', handleTouchMove, false);
        window.removeEventListener('blur', handleBlur);
        handleBlur(); // a final cleanup
    };
    return { destroy };
}

/** Detects if a key ID belongs to a touch key. */
export function isTouchKey(keyId: KeyId): boolean {
    return keyId >= KeyTouch0 && keyId < SENSOR_BASE_ID;
}