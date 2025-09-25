import type { InputsState } from '../common';
import { type KeyId } from '../keys';
/** Initializes keyboard input handling. */
export declare function initInputKeyboard(element: HTMLElement, state: InputsState): {
    destroy: () => void;
};
/** Detects if a key ID belongs to a keyboard key. */
export declare function isKeyboardKey(keyId: KeyId): boolean;
