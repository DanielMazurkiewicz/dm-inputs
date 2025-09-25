import type { InputsState } from '../common';
import { type KeyId } from '../keys';
export interface MouseOptions {
    mouseMoveStopTimeout?: number;
}
/** Initializes mouse input handling. */
export declare function initInputMouse(element: HTMLElement, state: InputsState, options?: MouseOptions): {
    destroy: () => void;
};
/** Detects if a key ID belongs to a mouse key. */
export declare function isMouseKey(keyId: KeyId): boolean;
