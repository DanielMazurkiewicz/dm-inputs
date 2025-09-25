import type { InputEvent, InputsState } from '../common';
import { addEvent, combineDestroyers, JustPressed, JustReleased, JustUpdated } from '../common';
import { type KeyId } from '../keys';
import { GEOLOCATION_BASE_ID } from '../geolocation/keys_consts';
import {
    KeySensorAccelerationIncludingGravityX_N, KeySensorAccelerationIncludingGravityX_P,
    KeySensorAccelerationIncludingGravityY_N, KeySensorAccelerationIncludingGravityY_P,
    KeySensorAccelerationIncludingGravityZ_N, KeySensorAccelerationIncludingGravityZ_P,
    KeySensorAccelerationX_N, KeySensorAccelerationX_P,
    KeySensorAccelerationY_N, KeySensorAccelerationY_P,
    KeySensorAccelerationZ_N, KeySensorAccelerationZ_P,
    KeySensorOrientationAbsolute, KeySensorOrientationHeading, KeySensorOrientationPitch, KeySensorOrientationRoll,
    KeySensorRotationRatePitch_N, KeySensorRotationRatePitch_P,
    KeySensorRotationRateRoll_N, KeySensorRotationRateRoll_P,
    KeySensorRotationRateYaw_N, KeySensorRotationRateYaw_P,
    SENSOR_BASE_ID
} from './keys';
import type {} from './sensors';

// --- Options Interfaces ---
export interface SensorOptions {
    /** The deadzone to apply to sensor axes to filter noise. Values within [-deadzone, +deadzone] are treated as 0. Default is 0.1. */
    sensorDeadzone?: number;
}

// --- Internal: Constants for Normalization ---
const MAX_ACCELERATION = 100; // m/s^2, roughly +/-10g
const MAX_ROTATION_RATE = 2000; // degrees/s

/**
 * Updates the state for a bipolar sensor value (e.g., acceleration on one axis).
 * @internal 
 */
function updateBipolarSensorState(state: InputsState, value: number | null, posKeyId: KeyId, negKeyId: KeyId, maxValue: number, deadzone: number) {
    if (value === null) value = 0; // Treat null as 0 to release keys if sensor stops reporting

    // --- Positive side ---
    const isPos = value > deadzone;
    const wasPos = state.keysPressed.has(posKeyId);
    if (isPos && !wasPos) {
        const pressure = Math.max(0, Math.min(1, (value - deadzone) / (maxValue - deadzone)));
        addEvent(state, posKeyId, JustPressed, pressure, -1, -1);
    } else if (!isPos && wasPos) {
        addEvent(state, posKeyId, JustReleased, 0, -1, -1);
    } else if (isPos) {
        const pressure = Math.max(0, Math.min(1, (value - deadzone) / (maxValue - deadzone)));
        const event = state.keysPressed.get(posKeyId)!;
        if (event.pressure !== pressure) {
            addEvent(state, posKeyId, JustUpdated, pressure, -1, -1);
        }
    }
    
    // --- Negative side ---
    const isNeg = value < -deadzone;
    const wasNeg = state.keysPressed.has(negKeyId);
    if (isNeg && !wasNeg) {
        const pressure = Math.max(0, Math.min(1, (Math.abs(value) - deadzone) / (maxValue - deadzone)));
        addEvent(state, negKeyId, JustPressed, pressure, -1, -1);
    } else if (!isNeg && wasNeg) {
        addEvent(state, negKeyId, JustReleased, 0, -1, -1);
    } else if (isNeg) {
        const pressure = Math.max(0, Math.min(1, (Math.abs(value) - deadzone) / (maxValue - deadzone)));
        const event = state.keysPressed.get(negKeyId)!;
        if (event.pressure !== pressure) {
            addEvent(state, negKeyId, JustUpdated, pressure, -1, -1);
        }
    }
}


/**
 * Updates the state for a unipolar sensor value (e.g., compass heading).
 * Value is normalized from [0, maxValue] to a [0, 1] pressure.
 * @internal 
 */
function updateUnipolarSensorState(state: InputsState, keyId: KeyId, value: number | boolean | null, maxValue: number = 1) {
    if (value === null || value === undefined) return;

    const numValue = typeof value === 'boolean' ? (value ? 1 : 0) : value;
    const pressure = Math.max(0, Math.min(1, numValue / maxValue));

    if (!state.keysPressed.has(keyId)) {
        addEvent(state, keyId, JustPressed, pressure, -1, -1);
    } else {
        const event = state.keysPressed.get(keyId)!;
        if (event.pressure !== pressure) {
            addEvent(state, keyId, JustUpdated, pressure, -1, -1);
        }
    }
}

/**
 * Updates the state for a bipolar value that is normalized to a single key.
 * Value is normalized from [minValue, maxValue] to a [0, 1] pressure.
 * @internal 
 */
function updateNormalizedSensorState(state: InputsState, keyId: KeyId, value: number | null, minValue: number, maxValue: number) {
    // If value is null, treat it as the "zero" point in the range.
    if (value === null) value = 0;
    
    // Normalize the value to a pressure from 0 to 1.
    const pressure = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));

    if (!state.keysPressed.has(keyId)) {
        addEvent(state, keyId, JustPressed, pressure, -1, -1);
    } else {
        const event = state.keysPressed.get(keyId)!;
        if (event.pressure !== pressure) {
            addEvent(state, keyId, JustUpdated, pressure, -1, -1);
        }
    }
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
export function initInputSensor(state: InputsState, options: SensorOptions = {}) {
    const { sensorDeadzone = 0.1 } = options;
    const destroyers: (() => void)[] = [];
    const sensorOptions: globalThis.SensorOptions = { frequency: 60 };

    // --- Linear Acceleration (without gravity) ---
    if (typeof LinearAccelerationSensor === 'function') {
        try {
            const laccel = new LinearAccelerationSensor(sensorOptions);
            const onReading = () => {
                updateBipolarSensorState(state, laccel.x ?? null, KeySensorAccelerationX_P, KeySensorAccelerationX_N, MAX_ACCELERATION, sensorDeadzone);
                updateBipolarSensorState(state, laccel.y ?? null, KeySensorAccelerationY_P, KeySensorAccelerationY_N, MAX_ACCELERATION, sensorDeadzone);
                updateBipolarSensorState(state, laccel.z ?? null, KeySensorAccelerationZ_P, KeySensorAccelerationZ_N, MAX_ACCELERATION, sensorDeadzone);
            };
            laccel.addEventListener('reading', onReading);
            laccel.addEventListener('error', e => {
                const err = e as SensorErrorEvent;
                console.warn('LinearAccelerationSensor error:', err.error.name, err.error.message);
            });
            laccel.start();
            destroyers.push(() => { laccel.removeEventListener('reading', onReading); laccel.stop(); });
        } catch (e) { console.warn("Could not initialize LinearAccelerationSensor.", e); }
    }

    // --- Acceleration (with gravity) ---
    if (typeof Accelerometer === 'function') {
        try {
            const accel = new Accelerometer(sensorOptions);
            const onReading = () => {
                updateBipolarSensorState(state, accel.x ?? null, KeySensorAccelerationIncludingGravityX_P, KeySensorAccelerationIncludingGravityX_N, MAX_ACCELERATION, sensorDeadzone);
                updateBipolarSensorState(state, accel.y ?? null, KeySensorAccelerationIncludingGravityY_P, KeySensorAccelerationIncludingGravityY_N, MAX_ACCELERATION, sensorDeadzone);
                updateBipolarSensorState(state, accel.z ?? null, KeySensorAccelerationIncludingGravityZ_P, KeySensorAccelerationIncludingGravityZ_N, MAX_ACCELERATION, sensorDeadzone);
            };
            accel.addEventListener('reading', onReading);
            accel.addEventListener('error', e => {
                const err = e as SensorErrorEvent;
                console.warn('Accelerometer error:', err.error.name, err.error.message);
            });
            accel.start();
            destroyers.push(() => { accel.removeEventListener('reading', onReading); accel.stop(); });
        } catch (e) { console.warn("Could not initialize Accelerometer.", e); }
    }

    // --- Gyroscope (rotation rate) ---
    if (typeof Gyroscope === 'function') {
        try {
            const gyro = new Gyroscope(sensorOptions);
            const onReading = () => {
                const radToDeg = 180 / Math.PI;
                updateBipolarSensorState(state, gyro.x ? gyro.x * radToDeg : null, KeySensorRotationRatePitch_P, KeySensorRotationRatePitch_N, MAX_ROTATION_RATE, sensorDeadzone);
                updateBipolarSensorState(state, gyro.y ? gyro.y * radToDeg : null, KeySensorRotationRateRoll_P, KeySensorRotationRateRoll_N, MAX_ROTATION_RATE, sensorDeadzone);
                updateBipolarSensorState(state, gyro.z ? gyro.z * radToDeg : null, KeySensorRotationRateYaw_P, KeySensorRotationRateYaw_N, MAX_ROTATION_RATE, sensorDeadzone);
            };
            gyro.addEventListener('reading', onReading);
            gyro.addEventListener('error', e => {
                const err = e as SensorErrorEvent;
                console.warn('Gyroscope error:', err.error.name, err.error.message);
            });
            gyro.start();
            destroyers.push(() => { gyro.removeEventListener('reading', onReading); gyro.stop(); });
        } catch (e) { console.warn("Could not initialize Gyroscope.", e); }
    }

    // --- Orientation ---
    if (typeof AbsoluteOrientationSensor === 'function') {
        try {
            const orient = new AbsoluteOrientationSensor(sensorOptions);
            const onReading = () => {
                if (!orient.quaternion || orient.quaternion.length < 4) return;
                const [x, y, z, w] = orient.quaternion as [number, number, number, number];
                const radToDeg = 180 / Math.PI;

                // The deviceorientation event uses an intrinsic Z-X'-Y'' Tait-Bryan angle sequence.
                const sinBeta = 2 * (w * x - y * z);
                let beta = Math.asin(sinBeta >= 1.0 ? 1.0 : sinBeta <= -1.0 ? -1.0 : sinBeta) * radToDeg;

                const sinGamma_cosBeta = 2 * (w * y + z * x);
                const cosGamma_cosBeta = 1 - 2 * (x * x + y * y);
                let gamma = Math.atan2(sinGamma_cosBeta, cosGamma_cosBeta) * radToDeg;

                const sinAlpha_cosBeta = 2 * (w * z + x * y);
                const cosAlpha_cosBeta = 1 - 2 * (y * y + z * z);
                let alphaFromEast = Math.atan2(sinAlpha_cosBeta, cosAlpha_cosBeta) * radToDeg;
                
                // The sensor's coordinate system is ENU (East-North-Up).
                // deviceorientation alpha is a compass heading (0=North, 90=East, etc.).
                // Our calculated alpha is relative to East. We convert it to compass heading.
                let alpha = (450 - alphaFromEast) % 360;
                
                // NOTE: The converted 'beta' (pitch) value is limited to [-90, 90] due to Math.asin.
                // The original deviceorientation event supported [-180, 180], but this requires
                // more complex math to resolve ambiguity and is often not needed for standard use cases.
                updateUnipolarSensorState(state, KeySensorOrientationHeading, alpha, 360);
                updateNormalizedSensorState(state, KeySensorOrientationPitch, beta, -180, 180);
                updateNormalizedSensorState(state, KeySensorOrientationRoll, gamma, -90, 90);
                updateUnipolarSensorState(state, KeySensorOrientationAbsolute, true);
            };
            orient.addEventListener('reading', onReading);
            orient.addEventListener('error', e => {
                const err = e as SensorErrorEvent;
                console.warn('AbsoluteOrientationSensor error:', err.error.name, err.error.message);
                updateUnipolarSensorState(state, KeySensorOrientationAbsolute, false);
            });
            orient.start();
            destroyers.push(() => { orient.removeEventListener('reading', onReading); orient.stop(); });
        } catch (e) { console.warn("Could not initialize AbsoluteOrientationSensor.", e); }
    }

    return { destroy: combineDestroyers(...destroyers) };
}

/** Detects if a key ID belongs to a sensor key. */
export function isSensorKey(keyId: KeyId): boolean {
    return keyId >= SENSOR_BASE_ID && keyId < GEOLOCATION_BASE_ID;
}