import { addEvent, JustPressed, JustReleased, JustUpdated } from '../common';
import { KeyTouch0 } from '../touch/keys';
import { KeyMouseLeft, KeyMouseMiddle, KeyMouseMove, KeyMouseRight, KeyMouseWheelDown, KeyMouseWheelUp } from './keys';
/** Initializes mouse input handling. */
export function initInputMouse(element, state, options = {}) {
    const { mouseMoveStopTimeout = 200 } = options;
    const MOUSE_BUTTON_MAP = [KeyMouseLeft, KeyMouseMiddle, KeyMouseRight];
    let mouseX = 0, mouseY = 0; // State variables for coordinates
    let lastMouseMoveTime = 0;
    let stopCheckRequestId = null;
    const updateCoords = (e) => {
        const rect = element.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    };
    const handleMouseDown = (e) => {
        const keyId = MOUSE_BUTTON_MAP[e.button];
        if (!keyId || state.keysPressed.has(keyId))
            return;
        updateCoords(e);
        addEvent(state, keyId, JustPressed, 1, mouseX, mouseY);
    };
    const handleMouseUp = (e) => {
        const keyId = MOUSE_BUTTON_MAP[e.button];
        if (!keyId || !state.keysPressed.has(keyId))
            return;
        updateCoords(e);
        addEvent(state, keyId, JustReleased, 0, mouseX, mouseY);
    };
    const checkMouseMoveStop = () => {
        if (lastMouseMoveTime > 0 && state.keysPressed.has(KeyMouseMove)) {
            if (performance.now() - lastMouseMoveTime >= mouseMoveStopTimeout) {
                addEvent(state, KeyMouseMove, JustReleased, 0, mouseX, mouseY);
                lastMouseMoveTime = 0; // Stop checking
                stopCheckRequestId = null;
            }
            else {
                // Check again on the next frame
                stopCheckRequestId = requestAnimationFrame(checkMouseMoveStop);
            }
        }
        else {
            stopCheckRequestId = null;
        }
    };
    const handleMouseMove = (e) => {
        updateCoords(e);
        if (!state.keysPressed.has(KeyMouseMove)) {
            addEvent(state, KeyMouseMove, JustPressed, 1, mouseX, mouseY);
        }
        else {
            addEvent(state, KeyMouseMove, JustUpdated, 1, mouseX, mouseY);
        }
        lastMouseMoveTime = performance.now();
        // If a check isn't already scheduled, start one.
        if (stopCheckRequestId === null) {
            stopCheckRequestId = requestAnimationFrame(checkMouseMoveStop);
        }
    };
    const handleWheel = (e) => {
        const keyId = e.deltaY < 0 ? KeyMouseWheelUp : KeyMouseWheelDown;
        updateCoords(e);
        addEvent(state, keyId, JustPressed, 1, mouseX, mouseY);
        addEvent(state, keyId, JustReleased, 0, mouseX, mouseY);
        e.preventDefault();
    };
    const handleContextMenu = (e) => e.preventDefault();
    const handleBlur = () => {
        const keysToRelease = [];
        for (const keyId of state.keysPressed.keys()) {
            if (keyId >= KeyMouseLeft && keyId < KeyTouch0) { // Only mouse keys
                keysToRelease.push(keyId);
            }
        }
        for (const keyId of keysToRelease) {
            addEvent(state, keyId, JustReleased, 0, -1, -1);
        }
    };
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);
    const destroy = () => {
        if (stopCheckRequestId !== null) {
            cancelAnimationFrame(stopCheckRequestId);
        }
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('wheel', handleWheel, false);
        element.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('blur', handleBlur);
    };
    return { destroy };
}
/** Detects if a key ID belongs to a mouse key. */
export function isMouseKey(keyId) {
    return keyId >= KeyMouseLeft && keyId < KeyTouch0;
}
//# sourceMappingURL=index.js.map