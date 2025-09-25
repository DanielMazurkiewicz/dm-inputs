import type { InputEvent, InputsState } from '../common';
import { addEvent, JustPressed, JustReleased, JustUpdated } from '../common';
import { type KeyId } from '../keys';
import { JOYSTICK_AXIS_OFFSET, JOYSTICK_BASE_ID, JOYSTICK_BUTTON_OFFSET, JOYSTICK_ID_RANGE, MAX_JOYSTICKS, MAX_JOYSTICK_AXES, MAX_JOYSTICK_BUTTONS } from './keys_consts';

// --- Options Interfaces ---
export interface JoystickOptions { joystickAxisDeadzone?: number; }
type GamepadState = { buttons: { pressed: boolean; value: number }[]; axes: number[]; };

// --- Internal Helper Functions ---

/** Initializes joystick/gamepad input handling. */
export function initInputJoystick(state: InputsState, options: JoystickOptions = {}) {
    const { joystickAxisDeadzone = 0.15 } = options;
    const previousGamepadStates: (GamepadState | null)[] = Array(MAX_JOYSTICKS).fill(null);
    let pollRequestId: number;

    const pollGamepads = () => {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < MAX_JOYSTICKS; i++) {
            const currentGamepad = gamepads[i];
            const previousState = previousGamepadStates[i];
            if (!currentGamepad) {
                if (previousState) {
                    // Gamepad was disconnected, release all its keys.
                    for (let j = 0; j < Math.min(previousState.buttons.length, MAX_JOYSTICK_BUTTONS); j++) {
                        if (previousState.buttons[j].pressed) {
                            const keyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_BUTTON_OFFSET + j) as KeyId;
                            addEvent(state, keyId, JustReleased, 0, -1, -1);
                        }
                    }
                    for (let j = 0; j < Math.min(previousState.axes.length, MAX_JOYSTICK_AXES); j++) {
                        if (Math.abs(previousState.axes[j]) > joystickAxisDeadzone) {
                            const wasPos = previousState.axes[j] > joystickAxisDeadzone;
                            const keyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_AXIS_OFFSET + (j * 2) + (wasPos ? 0 : 1)) as KeyId;
                            addEvent(state, keyId, JustReleased, 0, -1, -1);
                        }
                    }
                    previousGamepadStates[i] = null;
                }
                continue;
            }

            const btnCount = Math.min(currentGamepad.buttons.length, MAX_JOYSTICK_BUTTONS);
            for (let j = 0; j < btnCount; j++) {
                const isPressed = currentGamepad.buttons[j].pressed;
                const wasPressed = previousState?.buttons[j]?.pressed ?? false;
                const keyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_BUTTON_OFFSET + j) as KeyId;
                
                if (isPressed && !wasPressed) {
                    const pressure = currentGamepad.buttons[j].value;
                    addEvent(state, keyId, JustPressed, pressure, -1, -1);
                } else if (!isPressed && wasPressed) {
                    addEvent(state, keyId, JustReleased, 0, -1, -1);
                } else if (isPressed) {
                    const pressure = currentGamepad.buttons[j].value;
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
                const posKeyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_AXIS_OFFSET + (j * 2)) as KeyId;
                const pressurePos = Math.max(0, (current - joystickAxisDeadzone) / (1 - joystickAxisDeadzone));
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
                const isNeg = current < -joystickAxisDeadzone;
                const wasNeg = prev < -joystickAxisDeadzone;
                const negKeyId = (JOYSTICK_BASE_ID + (i * JOYSTICK_ID_RANGE) + JOYSTICK_AXIS_OFFSET + (j * 2) + 1) as KeyId;
                const pressureNeg = Math.max(0, (Math.abs(current) - joystickAxisDeadzone) / (1 - joystickAxisDeadzone));
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
            
            // Save current state for next poll
            if (!previousGamepadStates[i]) previousGamepadStates[i] = { buttons: [], axes: [] };
            const newState = previousGamepadStates[i]!;
            for (let j = 0; j < btnCount; j++) { if (!newState.buttons[j]) newState.buttons[j] = { pressed: false, value: 0 }; newState.buttons[j].pressed = currentGamepad.buttons[j].pressed; newState.buttons[j].value = currentGamepad.buttons[j].value; }
            for (let j = 0; j < axisCount; j++) newState.axes[j] = currentGamepad.axes[j];
        }
        pollRequestId = requestAnimationFrame(pollGamepads);
    };
    pollRequestId = requestAnimationFrame(pollGamepads);
    const destroy = () => { cancelAnimationFrame(pollRequestId); };
    return { destroy };
}

/** Detects if a key ID belongs to a joystick key. */
export function isJoystickKey(keyId: KeyId): boolean {
    return keyId >= JOYSTICK_BASE_ID;
}