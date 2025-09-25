import { addEvent, JustPressed, JustReleased, JustUpdated } from '../common';
import { JOYSTICK_AXIS_OFFSET, JOYSTICK_BASE_ID, JOYSTICK_BUTTON_OFFSET, JOYSTICK_ID_RANGE, MAX_JOYSTICKS, MAX_JOYSTICK_AXES, MAX_JOYSTICK_BUTTONS } from './keys_consts';
// --- Internal Helper Functions ---
/** Initializes joystick/gamepad input handling. */
export function initInputJoystick(state, options = {}) {
    const { joystickAxisDeadzone = 0.15 } = options;
    const previousGamepadStates = Array(MAX_JOYSTICKS).fill(null);
    let pollRequestId;
    const pollGamepads = () => {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < MAX_JOYSTICKS; i++) {
            const currentGamepad = gamepads[i];
            const previousState = previousGamepadStates[i];
            if (!currentGamepad) {
                if (previousState) {
                    // Gamepad was disconnected, release all its keys.
                    for (let j = 0; j < Math.min(previousState.buttons.length, MAX_JOYSTICK_BUTTONS); j++) {
                        if (previousState.buttons[j]?.pressed) {
                            const keyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_BUTTON_OFFSET + j);
                            addEvent(state, keyId, JustReleased, 0, -1, -1);
                        }
                    }
                    for (let j = 0; j < Math.min(previousState.axes.length, MAX_JOYSTICK_AXES); j++) {
                        const axisValue = previousState.axes[j];
                        if (Math.abs(axisValue) > joystickAxisDeadzone) {
                            const wasPos = axisValue > joystickAxisDeadzone;
                            const keyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_AXIS_OFFSET + (j * 2) + (wasPos ? 0 : 1));
                            addEvent(state, keyId, JustReleased, 0, -1, -1);
                        }
                    }
                    previousGamepadStates[i] = null;
                }
                continue;
            }
            const btnCount = Math.min(currentGamepad.buttons.length, MAX_JOYSTICK_BUTTONS);
            for (let j = 0; j < btnCount; j++) {
                const currentButton = currentGamepad.buttons[j];
                const isPressed = currentButton.pressed;
                const wasPressed = previousState?.buttons[j]?.pressed ?? false;
                const keyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_BUTTON_OFFSET + j);
                if (isPressed && !wasPressed) {
                    const pressure = currentButton.value;
                    addEvent(state, keyId, JustPressed, pressure, -1, -1);
                }
                else if (!isPressed && wasPressed) {
                    addEvent(state, keyId, JustReleased, 0, -1, -1);
                }
                else if (isPressed) {
                    const pressure = currentButton.value;
                    const event = state.keysPressed.get(keyId);
                    if (event && event.pressure !== pressure) {
                        addEvent(state, keyId, JustUpdated, pressure, -1, -1);
                    }
                }
            }
            const axisCount = Math.min(currentGamepad.axes.length, MAX_JOYSTICK_AXES);
            for (let j = 0; j < axisCount; j++) {
                const current = currentGamepad.axes[j];
                const prev = previousState?.axes[j] ?? 0;
                // Positive axis
                const isPos = current > joystickAxisDeadzone;
                const wasPos = prev > joystickAxisDeadzone;
                const posKeyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_AXIS_OFFSET + (j * 2));
                const pressurePos = Math.max(0, (current - joystickAxisDeadzone) / (1 - joystickAxisDeadzone));
                if (isPos && !wasPos) {
                    addEvent(state, posKeyId, JustPressed, pressurePos, -1, -1);
                }
                else if (!isPos && wasPos) {
                    addEvent(state, posKeyId, JustReleased, 0, -1, -1);
                }
                else if (isPos) {
                    const event = state.keysPressed.get(posKeyId);
                    if (event && event.pressure !== pressurePos) {
                        addEvent(state, posKeyId, JustUpdated, pressurePos, -1, -1);
                    }
                }
                // Negative axis
                const isNeg = current < -joystickAxisDeadzone;
                const wasNeg = prev < -joystickAxisDeadzone;
                const negKeyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_AXIS_OFFSET + (j * 2) + 1);
                const pressureNeg = Math.max(0, (Math.abs(current) - joystickAxisDeadzone) / (1 - joystickAxisDeadzone));
                if (isNeg && !wasNeg) {
                    addEvent(state, negKeyId, JustPressed, pressureNeg, -1, -1);
                }
                else if (!isNeg && wasNeg) {
                    addEvent(state, negKeyId, JustReleased, 0, -1, -1);
                }
                else if (isNeg) {
                    const event = state.keysPressed.get(negKeyId);
                    if (event && event.pressure !== pressureNeg) {
                        addEvent(state, negKeyId, JustUpdated, pressureNeg, -1, -1);
                    }
                }
            }
            // Save current state for next poll
            if (!previousGamepadStates[i])
                previousGamepadStates[i] = { buttons: [], axes: [] };
            const newState = previousGamepadStates[i];
            for (let j = 0; j < btnCount; j++) {
                if (!newState.buttons[j])
                    newState.buttons[j] = { pressed: false, value: 0 };
                const currentButton = currentGamepad.buttons[j];
                const stateButton = newState.buttons[j];
                stateButton.pressed = currentButton.pressed;
                stateButton.value = currentButton.value;
            }
            for (let j = 0; j < axisCount; j++) {
                newState.axes[j] = currentGamepad.axes[j];
            }
        }
        pollRequestId = requestAnimationFrame(pollGamepads);
    };
    pollRequestId = requestAnimationFrame(pollGamepads);
    const destroy = () => { cancelAnimationFrame(pollRequestId); };
    return { destroy };
}
/** Detects if a key ID belongs to a joystick key. */
export function isJoystickKey(keyId) {
    return keyId >= JOYSTICK_BASE_ID;
}
//# sourceMappingURL=index.js.map