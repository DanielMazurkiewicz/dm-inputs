import type { InputsState } from '../common';
import { type KeyId } from '../keys';
export interface JoystickOptions {
    joystickAxisDeadzone?: number;
}
/** Initializes joystick/gamepad input handling. */
export declare function initInputJoystick(state: InputsState, options?: JoystickOptions): {
    destroy: () => void;
};
/** Detects if a key ID belongs to a joystick key. */
export declare function isJoystickKey(keyId: KeyId): boolean;
