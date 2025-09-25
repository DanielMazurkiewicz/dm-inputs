import type { InputEvent, InputsState } from '../common';
import { addEvent, JustPressed, JustReleased } from '../common';
import { type KeyId } from '../keys';
import { KeyMouseLeft } from '../mouse/keys';
import { KeyArrowDown, KeyArrowLeft, KeyS, KeySpace, KeyTab } from './keys';
import { keyMap } from './key_map';

// --- Options Interfaces ---
export interface KeyboardOptions { preventDefaults?: boolean; }

/** Initializes keyboard input handling. */
export function initInputKeyboard(element: HTMLElement, state: InputsState, options: KeyboardOptions = {}) {
    const { preventDefaults = true } = options;
    let mouseX = -1, mouseY = -1;

    const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        // Coordinates are relative to the element.
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        const keyId = keyMap[e.code];
        // Ignore unknown keys or keys that are already pressed.
        if (keyId === undefined || state.keysPressed.has(keyId)) {
            return;
        }
        
        let char: string | undefined = undefined;
        // Check if the key corresponds to a printable character.
        // A simple and effective heuristic is checking if the `key` property has a length of 1.
        // This covers letters, numbers, symbols, and space.
        // We also check for Ctrl/Meta combinations, which are usually shortcuts and not for character input.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            char = e.key;
        }

        addEvent(state, keyId, JustPressed, 1, mouseX, mouseY, char);
        
        if (preventDefaults) {
            // Prevent scrolling with arrow keys, space, etc.
            if ((keyId >= KeyArrowLeft && keyId <= KeyArrowDown) || keyId === KeySpace || keyId === KeyTab) {
                e.preventDefault();
            }
            // Prevent browser save dialog on Ctrl+S
            if (e.ctrlKey && keyId === KeyS) {
                e.preventDefault();
            }
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        const keyId = keyMap[e.code];
        if (keyId === undefined || !state.keysPressed.has(keyId)) {
            return;
        }
        addEvent(state, keyId, JustReleased, 0, mouseX, mouseY);
    };

    const handleBlur = () => {
        const keysToRelease: KeyId[] = [];
        for (const keyId of state.keysPressed.keys()) {
            if (keyId < KeyMouseLeft) { // Only handle keyboard keys
                keysToRelease.push(keyId);
            }
        }
        for (const keyId of keysToRelease) {
            addEvent(state, keyId, JustReleased, 0, -1, -1);
        }
    };
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    const destroy = () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('keydown', handleKeyDown);
        element.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('blur', handleBlur);
    };

    return { destroy };
}

/** Detects if a key ID belongs to a keyboard key. */
export function isKeyboardKey(keyId: KeyId): boolean {
    return keyId < KeyMouseLeft;
}