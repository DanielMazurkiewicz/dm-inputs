import type { KeyId } from './keys';
export declare const JustReleased = 0;
export declare const JustPressed = 1;
export declare const JustUpdated = 2;
export type InputEventState = typeof JustPressed | typeof JustReleased | typeof JustUpdated;
export interface InputEvent {
    keyId: KeyId;
    state: InputEventState;
    char?: string;
    pressure: number;
    x: number;
    y: number;
}
export interface InputsState {
    readonly pendingInputs: InputEvent[];
    pendingInputsLength: number;
    pendingInputsConsumed: number;
    /** A map of all keys currently held down. Stores the event that caused the key to be pressed. */
    readonly keysPressed: Map<KeyId, InputEvent>;
}
/** @internal */
export declare function addEvent(state: InputsState, keyId: KeyId, eventState: InputEventState, pressure: number, x: number, y: number, char?: string): InputEvent;
export declare function combineDestroyers(...destroyers: (() => void)[]): () => void;
/** Creates a new shared state object for the input system. */
export declare function createInputsState(maxEvents?: number): InputsState;
export declare function pendingInputsClear(state: InputsState): void;
export declare function pendingInputsConsume(state: InputsState): InputEvent | undefined;
/**
 * Checks if a combination of keys is currently held down.
 * @param state The input state.
 * @param keys The array of KeyIds for the combination.
 * @returns True if all keys in the combination are currently pressed.
 */
export declare function isCombinationPressed(state: InputsState, keys: readonly KeyId[]): boolean;
/**
 * Checks if a key combination was just completed in the current processing frame.
 * This is true if one key of the combination was just pressed while all others were already held down.
 * @param state The input state.
 * @param keys The array of KeyIds for the combination.
 * @returns True if the combination was just pressed.
 */
export declare function wasCombinationJustPressed(state: InputsState, keys: readonly KeyId[]): boolean;
/**
 * Checks if a key combination was just broken in the current processing frame.
 * This is true if one key of the combination was just released, and all keys of the combination were pressed before this frame.
 * @param state The input state.
 * @param keys The array of KeyIds for the combination.
 * @returns True if the combination was just released.
 */
export declare function wasCombinationJustReleased(state: InputsState, keys: readonly KeyId[]): boolean;
