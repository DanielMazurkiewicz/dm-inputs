import { KeySensorAccelerationIncludingGravityX_N, KeySensorAccelerationIncludingGravityX_P, KeySensorAccelerationIncludingGravityY_N, KeySensorAccelerationIncludingGravityY_P, KeySensorAccelerationIncludingGravityZ_N, KeySensorAccelerationIncludingGravityZ_P, KeySensorAccelerationX_N, KeySensorAccelerationX_P, KeySensorAccelerationY_N, KeySensorAccelerationY_P, KeySensorAccelerationZ_N, KeySensorAccelerationZ_P, KeySensorOrientationAbsolute, KeySensorOrientationHeading, KeySensorOrientationPitch, KeySensorOrientationRoll, KeySensorRotationRatePitch_N, KeySensorRotationRatePitch_P, KeySensorRotationRateRoll_N, KeySensorRotationRateRoll_P, KeySensorRotationRateYaw_N, KeySensorRotationRateYaw_P } from './keys';
/**
 * Maps internal `KeyId` numeric constants for sensors to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export const sensorKeyMap = {
    [KeySensorAccelerationX_P]: 'SensorAccelerationX_P',
    [KeySensorAccelerationX_N]: 'SensorAccelerationX_N',
    [KeySensorAccelerationY_P]: 'SensorAccelerationY_P',
    [KeySensorAccelerationY_N]: 'SensorAccelerationY_N',
    [KeySensorAccelerationZ_P]: 'SensorAccelerationZ_P',
    [KeySensorAccelerationZ_N]: 'SensorAccelerationZ_N',
    [KeySensorAccelerationIncludingGravityX_P]: 'SensorAccelerationIncludingGravityX_P',
    [KeySensorAccelerationIncludingGravityX_N]: 'SensorAccelerationIncludingGravityX_N',
    [KeySensorAccelerationIncludingGravityY_P]: 'SensorAccelerationIncludingGravityY_P',
    [KeySensorAccelerationIncludingGravityY_N]: 'SensorAccelerationIncludingGravityY_N',
    [KeySensorAccelerationIncludingGravityZ_P]: 'SensorAccelerationIncludingGravityZ_P',
    [KeySensorAccelerationIncludingGravityZ_N]: 'SensorAccelerationIncludingGravityZ_N',
    [KeySensorRotationRateYaw_P]: 'SensorRotationRateYaw_P',
    [KeySensorRotationRateYaw_N]: 'SensorRotationRateYaw_N',
    [KeySensorRotationRatePitch_P]: 'SensorRotationRatePitch_P',
    [KeySensorRotationRatePitch_N]: 'SensorRotationRatePitch_N',
    [KeySensorRotationRateRoll_P]: 'SensorRotationRateRoll_P',
    [KeySensorRotationRateRoll_N]: 'SensorRotationRateRoll_N',
    [KeySensorOrientationHeading]: 'SensorOrientationHeading',
    [KeySensorOrientationPitch]: 'SensorOrientationPitch',
    [KeySensorOrientationRoll]: 'SensorOrientationRoll',
    [KeySensorOrientationAbsolute]: 'SensorOrientationAbsolute',
};
//# sourceMappingURL=key_map.js.map