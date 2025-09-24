# DM-Inputs: A Unified Input Management Library

**DM-Inputs** is a high-performance, declarative, and unified input management library for browser-based applications and games. It provides a single, consistent API to handle a wide variety of input devices, including keyboard, mouse, touch, gamepads, VR controllers, device sensors, and geolocation.

Designed with a state-oriented approach, it simplifies complex input logic by abstracting away event listeners and focusing on "what is the current state of the input?" This makes it ideal for game loops and real-time applications.

---

## ✨ Features

-   **Unified API**: A single `InputEvent` format and `KeyId` system for all input types.
-   **Comprehensive Device Support**:
    -   Keyboard (layout-independent via `event.code`)
    -   Mouse (buttons, wheel, and movement tracking)
    -   Multi-Touch (with pressure/force support)
    -   Joystick / Gamepad API
    -   WebXR (VR Headsets and Controllers)
    -   Device Sensors (Accelerometer, Gyroscope, Orientation)
    -   Geolocation
-   **Performance-Oriented**: Uses object pooling for events to minimize garbage collection and ensure smooth performance, even with input bursts.
-   **Declarative & Stateful**: Easily check for complex key combinations (`isCombinationPressed`, `wasCombinationJustPressed`).
-   **Frame-Based Event Queue**: Process inputs that happened "this frame" in a simple loop.
-   **Tree-Shakable**: Only include the input modules you need.
-   **TypeScript Native**: Strong typing for robust development.

---

## 🚀 Quick Start

The core idea is to create a shared `InputsState` object, initialize the input modules you need, and then check the state or consume events in your main application loop.

```typescript
import {
    createInputsState,
    initInputKeyboard,
    initInputMouse,
    pendingInputsConsume,
    isCombinationPressed,
    wasCombinationJustPressed,
    KeyW,
    KeyMouseLeft,
    KeyCtrl
} from './src/index';

// --- 1. Setup ---
const canvas = document.getElementById('my-canvas');
const state = createInputsState();

// Initialize the input modules you want to use.
// The `destroy` function cleans up all event listeners.
const { destroy: destroyKeyboard } = initInputKeyboard(canvas, state);
const { destroy: destroyMouse } = initInputMouse(canvas, state);

// --- 2. Game Loop ---
function gameLoop() {
    // --- A: Process discrete events that happened since the last frame ---
    let event;
    while (event = pendingInputsConsume(state)) {
        if (event.isJustPressed && event.keyId === KeyMouseLeft) {
            console.log(`Mouse clicked at (${event.x}, ${event.y})`);
        }
    }
    
    // --- B: Check the current, persistent state of inputs ---

    // Is the 'W' key being held down right now?
    if (state.keysPressed.has(KeyW)) {
        console.log("Moving forward!");
    }

    // Was the combination Ctrl+W just completed in this frame?
    if (wasCombinationJustPressed(state, [KeyCtrl, KeyW])) {
        console.log("Just pressed Ctrl+W!");
    }

    // Is the Ctrl key currently held down? (Using the combination checker for one key)
    if (isCombinationPressed(state, [KeyCtrl])) {
        // ...
    }
    
    requestAnimationFrame(gameLoop);
}

gameLoop();

// --- 3. Cleanup ---
// When your application closes, call the destroy functions.
// destroyKeyboard();
// destroyMouse();
```

---

## 🧠 Core Concepts

### `InputsState`
This is the single source of truth for all input. It contains the queue of events that have occurred since the last frame (`pendingInputs`) and a map of all keys/buttons that are currently held down (`keysPressed`).

### The Game Loop Lifecycle
A typical frame consists of two phases:
1.  **Consume Events**: You loop through `pendingInputsConsume(state)` to react to discrete events like a key being pressed or released *this frame*. This is where you use functions like `wasCombinationJustPressed`. Once you have consumed all events, the queue is cleared for the next frame.
2.  **Check State**: After processing events, you check the persistent `state.keysPressed` map for continuous actions, like moving a character while a key is held down. The `isCombinationPressed` function is a convenient helper for this.

### `KeyId`
A `KeyId` is a unique number that identifies a specific input, regardless of the device. `KeyW` on the keyboard, `KeyMouseLeft` for the mouse, `KeyJoy0Btn0` for a gamepad button, and `KeySensorAccelerationX_P` for a device sensor are all `KeyId`s. This allows for a completely unified system.

### `InputEvent`
Every interaction generates an `InputEvent`. This object contains all the information about the event:
-   `keyId`: The `KeyId` of the input.
-   `isJustPressed` / `isJustReleased`: Booleans indicating a state change.
-   `pressure`: A normalized value (0-1) representing button pressure, trigger pull, touch force, or sensor reading.
-   `x`, `y`: Coordinates relative to the target element.
-   `char`: The typed character for keyboard events, if applicable.

---

## Cheat Sheet & Examples

### Check if a key was just pressed this frame
```typescript
if (wasCombinationJustPressed(state, [KeySpace])) {
    // Player jumped
}
```

### Check if a key is currently held down
```typescript
if (isCombinationPressed(state, [KeyW])) {
    // Move player forward
}
```

### Check for a key combination (e.g., Ctrl + S)
```typescript
// Was the combo just completed?
if (wasCombinationJustPressed(state, [KeyCtrl, KeyS])) {
    // Save game
}

// Is the combo currently being held down?
if (isCombinationPressed(state, [KeyCtrl, KeyS])) {
    // Show "Saving..." indicator
}
```

### Get Mouse Position
The latest mouse position is stored in the `KeyMouseMove` event if the mouse is moving.
```typescript
const moveEvent = state.keysPressed.get(KeyMouseMove);
if (moveEvent) {
    const { x, y } = moveEvent;
    // Update cursor position, aim direction, etc.
}
```

### Iterate Through All Events
Useful for logging, debugging, or complex event processing.
```typescript
let event;
while (event = pendingInputsConsume(state)) {
    console.log(`Event for KeyId ${event.keyId}, Pressed: ${event.isJustPressed}`);
    // Handle the event...
}
```

### Using a Gamepad
```typescript
// In setup:
initInputJoystick(state);

// In loop:
if (isCombinationPressed(state, [KeyJoy0Btn0])) { // Check A/X button on most controllers
    // Fire weapon
}

const stickX = state.keysPressed.get(KeyJoy0Axis0_P)?.pressure ?? -state.keysPressed.get(KeyJoy0Axis0_N)?.pressure ?? 0;
// stickX is now a value from -1 to 1 for the first joystick's horizontal axis.
```

### Using VR (WebXR)
VR initialization is `async` and must be triggered by a user gesture.
```typescript
vrButton.addEventListener('click', async () => {
    const { destroy } = await initInputVR(state);
    // Now you can check VR keys in your game loop
});

// In loop:
if (wasCombinationJustPressed(state, [KeyVRRightBtn0])) { // Right controller trigger
    // Grab object
}
```

---

## 📜 API Reference

### Main Functions

-   `createInputsState(maxEvents: number = 64): InputsState`
    Creates the central state object. `maxEvents` is the initial size of the event pool, which can grow if needed.

-   `pendingInputsConsume(state: InputsState): InputEvent | undefined`
    Retrieves the next event from the pending queue. Returns `undefined` when the queue is empty. Consuming events automatically prepares the queue to be cleared for the next frame.

-   `pendingInputsClear(state: InputsState)`
    Manually clears the pending event queue. This is often called automatically by `pendingInputsConsume`.

### Combination Checkers

-   `isCombinationPressed(state: InputsState, keys: readonly KeyId[]): boolean`
    Checks if **all** keys in the combination are currently held down.

-   `wasCombinationJustPressed(state: InputsState, keys: readonly KeyId[]): boolean`
    Checks if the combination was just *completed* in the current frame (i.e., one key was pressed while the others were already down).

-   `wasCombinationJustReleased(state: InputsState, keys: readonly KeyId[]): boolean`
    Checks if the combination was just *broken* in the current frame (i.e., one key was released while the others were held).

### Initialization Functions

All `init` functions return an object with a `destroy` method to clean up event listeners.

-   `initInputKeyboard(element: HTMLElement, state: InputsState, options?: KeyboardOptions)`
-   `initInputMouse(element: HTMLElement, state: InputsState, options?: MouseOptions)`
-   `initInputTouch(element: HTMLElement, state: InputsState, options?: TouchOptions)`
-   `initInputJoystick(state: InputsState, options?: JoystickOptions)`
-   `initInputSensor(state: InputsState, options?: SensorOptions)`
-   `initInputGeolocation(state: InputsState, options?: GeolocationOptions)`
-   `initInputVR(state: InputsState, options?: VROptions): Promise<{ destroy: () => void }>` (Asynchronous)

### `KeyId` Constants

Each module exports its own set of `KeyId` constants.

-   **Keyboard**: `KeyA`, `KeyB`, ..., `KeySpace`, `KeyShift`, `KeyEnter`, etc.
-   **Mouse**: `KeyMouseLeft`, `KeyMouseRight`, `KeyMouseMiddle`, `KeyMouseWheelUp`, `KeyMouseWheelDown`, `KeyMouseMove`.
-   **Touch**: `KeyTouch0`...`KeyTouch9`, `KeyTouchMove0`...`KeyTouchMove9`.
-   **Joystick**: `KeyJoy0Btn0`...`KeyJoy7Btn19`, `KeyJoy0Axis0_P`, `KeyJoy0Axis0_N`, etc.
-   **Sensor**: `KeySensorAccelerationX_P`, `KeySensorOrientationHeading`, etc.
-   **Geolocation**: `KeyGeolocationChange`, `KeyGeolocationAccuracy`.
-   **VR**: `KeyVRHmdPositionX`, `KeyVRLeftBtn0` (Trigger), `KeyVRRightAxis2_P` (Right Thumbstick X+), etc.