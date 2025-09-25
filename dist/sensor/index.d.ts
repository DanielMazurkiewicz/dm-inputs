import type { InputsState } from '../common';
import { type KeyId } from '../keys';
export interface SensorOptions {
    /** The deadzone to apply to sensor axes to filter noise. Values within [-deadzone, +deadzone] are treated as 0. Default is 0.1. */
    sensorDeadzone?: number;
}
/**
 * Initializes sensor input handling for device motion and orientation using the modern Generic Sensor API.
 * This replaces the deprecated `devicemotion` and `deviceorientation` events.
 *
 * NOTE: On many platforms, you must request permission to access sensor APIs.
 * This must be done in response to a user gesture, like a click.
 * The browser will typically prompt the user when a sensor's `start()` method is called for the first time.
 *
 * This library does not handle this for you; it only attempts to start the sensors.
 * You must implement any permission-requesting UI/logic in your application code.
 */
export declare function initInputSensor(state: InputsState, options?: SensorOptions): {
    destroy: () => void;
};
/** Detects if a key ID belongs to a sensor key. */
export declare function isSensorKey(keyId: KeyId): boolean;
