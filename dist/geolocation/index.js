import { addEvent, JustPressed, JustReleased, JustUpdated } from '../common';
import { VR_BASE_ID } from '../vr/keys_consts';
import { GEOLOCATION_BASE_ID } from './keys_consts';
import { KeyGeolocationChange, KeyGeolocationAccuracy } from './keys';
// 100km in meters, for normalizing altitude to a 0-1 pressure value.
const ALTITUDE_NORMALIZATION_FACTOR = 100_000;
/**
 * Updates the state for a single geolocation value.
 * @internal
 */
function updateGeolocationState(state, coords) {
    const keyId = KeyGeolocationChange;
    const x = coords.longitude;
    const y = coords.latitude;
    // Altitude can be null, default to 0 (sea level).
    const altitude = coords.altitude ?? 0;
    // Normalize altitude: 0 for sea level, 1 for 100km. Clamp to [0, 1].
    const pressure = Math.max(0, Math.min(1, altitude / ALTITUDE_NORMALIZATION_FACTOR));
    if (!state.keysPressed.has(keyId)) {
        // First time seeing this sensor, treat as "just pressed"
        addEvent(state, keyId, JustPressed, pressure, x, y);
    }
    else {
        // Geolocation value updated, treat as a "move" event
        const event = state.keysPressed.get(keyId);
        if (event.x !== x || event.y !== y || event.pressure !== pressure) {
            addEvent(state, keyId, JustUpdated, pressure, x, y);
        }
    }
}
/**
 * Updates the state for geolocation status and accuracy.
 * @internal
 */
function updateGeolocationStatus(state, accuracy) {
    const keyId = KeyGeolocationAccuracy;
    let pressure = 0; // Default to 0 for unknown/error states (accuracy is null)
    if (accuracy !== null && accuracy > 0) {
        // Use a logarithmic scale for accuracy.
        // Pressure 1.0 = < 1mm accuracy.
        // Pressure drops to 0 at 100km accuracy.
        // Formula: 1 - (log10(accuracy) + 3) / 8
        // log10(0.001) = -3 -> 1 - (-3+3)/8 = 1
        // log10(100000) = 5 -> 1 - (5+3)/8 = 0
        pressure = Math.max(0, Math.min(1, 1 - (Math.log10(accuracy) + 3) / 8));
    }
    if (!state.keysPressed.has(keyId)) {
        // First time, treat as "just pressed"
        addEvent(state, keyId, JustPressed, pressure, -1, -1);
    }
    else {
        // Status updated, treat as a "move" event
        const event = state.keysPressed.get(keyId);
        if (event.pressure !== pressure) {
            addEvent(state, keyId, JustUpdated, pressure, -1, -1);
        }
    }
}
/**
 * Initializes geolocation input handling.
 * This uses the `navigator.geolocation` API.
 *
 * NOTE: The browser will ask the user for permission to access their location.
 * This usually happens on the first call to `watchPosition`.
 */
export function initInputGeolocation(state, options = {}) {
    if (!navigator.geolocation) {
        console.warn("Geolocation API is not available in this browser.");
        return { destroy: () => { } };
    }
    const handleSuccess = (position) => {
        updateGeolocationState(state, position.coords);
        updateGeolocationStatus(state, position.coords.accuracy);
    };
    const handleError = (error) => {
        // Warn instead of error for permission denied or unavailable, which are common.
        // This makes it "transparent" as requested, where the state just reflects no location.
        console.warn(`Geolocation info: ${error.message} (code: ${error.code})`);
        updateGeolocationStatus(state, null);
    };
    // The options object is passed directly to the Geolocation API.
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    const destroy = () => {
        navigator.geolocation.clearWatch(watchId);
        // On destroy, signal that location is no longer being tracked.
        const changeKey = KeyGeolocationChange;
        if (state.keysPressed.has(changeKey)) {
            const event = state.keysPressed.get(changeKey);
            addEvent(state, changeKey, JustReleased, 0, event.x, event.y);
        }
        const statusKey = KeyGeolocationAccuracy;
        if (state.keysPressed.has(statusKey)) {
            addEvent(state, statusKey, JustReleased, 0, -1, -1);
        }
    };
    return { destroy };
}
/** Detects if a key ID belongs to a geolocation key. */
export function isGeolocationKey(keyId) {
    // We check up to VR base ID, as VR is the next module in the ID range.
    return keyId >= GEOLOCATION_BASE_ID && keyId < VR_BASE_ID;
}
//# sourceMappingURL=index.js.map