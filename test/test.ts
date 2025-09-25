import * as DM from '../src/index';
import type { KeyId } from '../src/keys';

// --- DOM Elements ---
const inputArea = document.getElementById('input-area')! as HTMLDivElement;
const pressedKeysList = document.querySelector('#pressed-keys ul')! as HTMLUListElement;
const pendingInputsList = document.querySelector('#pending-inputs ul')! as HTMLUListElement;
const historyInputsList = document.querySelector('#history-inputs ul')! as HTMLUListElement;
const comboStatusDiv = document.getElementById('combo-status')! as HTMLDivElement;
const sensorBtn = document.getElementById('sensor-btn')! as HTMLButtonElement;
const geoBtn = document.getElementById('geo-btn')! as HTMLButtonElement;
const vrBtn = document.getElementById('vr-btn')! as HTMLButtonElement;
const clearHistoryBtn = document.getElementById('clear-history-btn')! as HTMLButtonElement;

// --- State ---
const state = DM.createInputsState(256);
const inputHistory: DM.InputEvent[] = [];
const MAX_HISTORY = 100;
let destroyers: (() => void)[] = [];

// --- Key Maps for Display ---
const keyMaps: { [keyId: KeyId]: string } = {
    ...DM.keyboardKeyMap,
    ...DM.mouseKeyMap,
    ...DM.touchKeyMap,
    ...DM.sensorKeyMap,
    ...DM.geolocationKeyMap,
    ...DM.vrKeyMap,
    ...DM.joystickKeyMap,
};
const getKeyName = (keyId: DM.KeyId) => keyMaps[keyId] || `Unknown (${keyId})`;
const getStateName = (state: DM.InputEventState) => {
    if (state === DM.JustPressed) return 'PRESS';
    if (state === DM.JustReleased) return 'RELEASE';
    if (state === DM.JustUpdated) return 'UPDATE';
    return '??';
};

// --- Helper Functions ---
function formatEvent(event: DM.InputEvent): string {
    const name = getKeyName(event.keyId);
    const state = getStateName(event.state);
    const pressure = event.pressure.toFixed(3);
    const coords = (event.x !== -1 || event.y !== -1) ? `(${event.x.toFixed(0)}, ${event.y.toFixed(0)})` : '';
    const char = event.char ? `'${event.char}'` : '';
    return `${state.padEnd(7)} ${name.padEnd(25)} p=${pressure} ${coords.padEnd(12)} ${char}`;
}

// --- Initialization ---
function init() {
    console.log("Initializing dm-inputs...");
    
    // Combine all destroyer functions to be called on cleanup.
    const allDestroyers = DM.combineDestroyers(
        DM.initInputKeyboard(inputArea, state).destroy,
        DM.initInputMouse(inputArea, state, { mouseMoveStopTimeout: 200 }).destroy,
        DM.initInputTouch(inputArea, state, { touchMoveStopTimeout: 200 }).destroy,
        DM.initInputJoystick(state, { joystickAxisDeadzone: 0.2 }).destroy
    );
    destroyers.push(allDestroyers);

    // Button event listeners
    sensorBtn.addEventListener('click', () => {
        console.log("Requesting sensor access...");
        const { destroy } = DM.initInputSensor(state);
        destroyers.push(destroy);
        sensorBtn.disabled = true;
        sensorBtn.textContent = 'Sensors Active';
    });

    geoBtn.addEventListener('click', () => {
        console.log("Starting geolocation...");
        const { destroy } = DM.initInputGeolocation(state, { enableHighAccuracy: true });
        destroyers.push(destroy);
        geoBtn.disabled = true;
        geoBtn.textContent = 'Geolocation Active';
    });
    
    vrBtn.addEventListener('click', async () => {
        if (!navigator.xr) {
            alert('WebXR is not available on this device/browser.');
            return;
        }
        console.log("Requesting VR session...");
        try {
            const { destroy } = await DM.initInputVR(state, { referenceSpaceType: 'local-floor' });
            destroyers.push(destroy);
            vrBtn.disabled = true;
            vrBtn.textContent = 'VR Active';
        } catch(e) {
            console.error("Failed to start VR session:", e);
            alert(`Failed to start VR session: ${e}`);
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        inputHistory.length = 0;
        historyInputsList.innerHTML = '';
    });
    
    // Focus the area to start capturing keyboard events.
    inputArea.focus();

    // Start the main loop.
    requestAnimationFrame(update);
}

// --- Main Loop ---
function update() {
    // --- Update UI for Keys Pressed ---
    pressedKeysList.innerHTML = '';
    for (const event of state.keysPressed.values()) {
        const li = document.createElement('li');
        li.textContent = formatEvent(event);
        pressedKeysList.appendChild(li);
    }

    // --- Process and Display Pending Inputs ---
    pendingInputsList.innerHTML = '';
    let event: DM.InputEvent | undefined;
    while ((event = DM.pendingInputsConsume(state)) !== undefined) {
        // Display in "pending" list
        const pendingLi = document.createElement('li');
        pendingLi.textContent = formatEvent(event);
        pendingInputsList.appendChild(pendingLi);

        // Add to history (and keep it trimmed)
        inputHistory.unshift({ ...event }); // Clone event for history
        if (inputHistory.length > MAX_HISTORY) {
            inputHistory.pop();
        }
    }

    // --- Update UI for Input History ---
    historyInputsList.innerHTML = '';
    for (const histEvent of inputHistory) {
        const historyLi = document.createElement('li');
        historyLi.textContent = formatEvent(histEvent);
        historyInputsList.appendChild(historyLi);
    }
    
    // --- Check and Display Combination Status ---
    const combo = [DM.KeyCtrl, DM.KeyShift, DM.KeyA];
    const comboName = combo.map(getKeyName).join(' + ');

    let statusText = `Combination: ${comboName}<br/>`;
    if (DM.isCombinationPressed(state, combo)) statusText += 'Status: HELD<br/>';
    if (DM.wasCombinationJustPressed(state, combo)) statusText += 'Status: JUST PRESSED<br/>';
    if (DM.wasCombinationJustReleased(state, combo)) statusText += 'Status: JUST RELEASED';
    comboStatusDiv.innerHTML = statusText;

    // --- Clear pending queue for next frame ---
    // This is handled automatically by pendingInputsConsume when it reaches the end.
    
    // --- Loop ---
    requestAnimationFrame(update);
}

// --- Run ---
init();

// --- Cleanup on page unload ---
window.addEventListener('beforeunload', () => {
    console.log("Cleaning up inputs...");
    for (const destroy of destroyers) {
        destroy();
    }
});