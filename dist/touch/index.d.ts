import type { InputsState } from '../common';
import { type KeyId } from '../keys';
export interface TouchOptions {
    touchMoveStopTimeout?: number;
}
/** Initializes touch input handling. */
export declare function initInputTouch(element: HTMLElement, state: InputsState, options?: TouchOptions): {
    destroy: () => void;
};
/** Detects if a key ID belongs to a touch key. */
export declare function isTouchKey(keyId: KeyId): boolean;
