// --- Type Definitions ---
export const JustReleased = 0;
export const JustPressed = 1;
export const JustUpdated = 2;
// --- Internal Helper Functions ---
/** @internal */
export function addEvent(state, keyId, eventState, pressure, x, y, char) {
    // --- Step 1: Add the event to the pending queue ---
    let event;
    if (state.pendingInputsLength >= state.pendingInputs.length) {
        // Grow buffer on demand if it's full. This handles input bursts gracefully.
        event = { keyId, state: eventState, pressure, x, y, char };
        state.pendingInputs.push(event);
    }
    else {
        // Reuse existing event object from the pool for performance.
        //@ts-ignore
        event = state.pendingInputs[state.pendingInputsLength];
        event.keyId = keyId;
        event.state = eventState;
        event.pressure = pressure;
        event.x = x;
        event.y = y;
        event.char = char;
    }
    state.pendingInputsLength++;
    // --- Step 2: Update the persistent keysPressed state map ---
    if (eventState === JustPressed) {
        // We must create a new object for the map, because the 'event' object from the pool will be mutated.
        // This new object represents the persistent state of the pressed key.
        const pressEvent = { ...event };
        state.keysPressed.set(keyId, pressEvent);
    }
    else if (eventState === JustReleased) {
        state.keysPressed.delete(keyId);
    }
    else { // JustUpdated
        // This is a "move" or "pressure change" event. Update the existing state in the map.
        const existingEvent = state.keysPressed.get(keyId);
        if (existingEvent) {
            existingEvent.pressure = pressure;
            existingEvent.x = x;
            existingEvent.y = y;
            // 'char' is typically only associated with the initial press, so we don't update it here.
        }
    }
    return event;
}
export function combineDestroyers(...destroyers) {
    return () => {
        for (const destroy of destroyers) {
            destroy();
        }
    };
}
// --- Public API ---
/** Creates a new shared state object for the input system. */
export function createInputsState(maxEvents = 64) {
    return {
        pendingInputs: Array.from({ length: maxEvents }, () => ({ keyId: 0, state: JustUpdated, pressure: 0, x: -1, y: -1 })),
        pendingInputsLength: 0,
        pendingInputsConsumed: 0,
        keysPressed: new Map(),
    };
}
export function pendingInputsClear(state) {
    state.pendingInputsLength = 0;
    state.pendingInputsConsumed = 0;
}
export function pendingInputsConsume(state) {
    if (state.pendingInputsConsumed >= state.pendingInputsLength) {
        pendingInputsClear(state);
        return undefined;
    }
    return state.pendingInputs[state.pendingInputsConsumed++];
}
/**
 * Checks if a combination of keys is currently held down.
 * @param state The input state.
 * @param keys The array of KeyIds for the combination.
 * @returns True if all keys in the combination are currently pressed.
 */
export function isCombinationPressed(state, keys) {
    if (keys.length === 0)
        return false;
    for (let i = 0, len = keys.length; i < len; i++) {
        //@ts-ignore
        if (!state.keysPressed.has(keys[i])) {
            return false;
        }
    }
    return true;
}
/**
 * Checks if a key combination was just completed in the current processing frame.
 * This is true if one key of the combination was just pressed while all others were already held down.
 * @param state The input state.
 * @param keys The array of KeyIds for the combination.
 * @returns True if the combination was just pressed.
 */
export function wasCombinationJustPressed(state, keys) {
    if (keys.length === 0)
        return false;
    let justPressedKeyFound = false;
    // First, find if any key in the combination was just pressed in this frame.
    for (let i = state.pendingInputsConsumed; i < state.pendingInputsLength; i++) {
        const event = state.pendingInputs[i];
        if (event && event.state === JustPressed && keys.includes(event.keyId)) {
            justPressedKeyFound = true;
            break;
        }
    }
    if (!justPressedKeyFound) {
        return false;
    }
    // If we found a key that was just pressed, we must also verify that all keys
    // in the combination are now in the `keysPressed` state.
    return isCombinationPressed(state, keys);
}
/**
 * Checks if a key combination was just broken in the current processing frame.
 * This is true if one key of the combination was just released, and all keys of the combination were pressed before this frame.
 * @param state The input state.
 * @param keys The array of KeyIds for the combination.
 * @returns True if the combination was just released.
 */
export function wasCombinationJustReleased(state, keys) {
    if (keys.length === 0)
        return false;
    let releasedKeyInCombo = undefined;
    for (let i = state.pendingInputsConsumed; i < state.pendingInputsLength; i++) {
        const event = state.pendingInputs[i];
        if (event && event.state === JustReleased && keys.includes(event.keyId)) {
            releasedKeyInCombo = event.keyId;
            break;
        }
    }
    if (releasedKeyInCombo === undefined) {
        return false;
    }
    // A key from the combo was released. Now check if all other keys were "active" in the combo.
    // A key was "active" if it's either still being held down, or was also released this frame.
    const releasedThisFrame = new Set();
    for (let i = state.pendingInputsConsumed; i < state.pendingInputsLength; i++) {
        const event = state.pendingInputs[i];
        if (event && event.state === JustReleased) {
            releasedThisFrame.add(event.keyId);
        }
    }
    for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        if (key === undefined)
            continue;
        const isStillPressed = state.keysPressed.has(key);
        const wasJustReleased = releasedThisFrame.has(key);
        if (!isStillPressed && !wasJustReleased) {
            // This key was not part of the active combo, so the release is not for this combination.
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=common.js.map