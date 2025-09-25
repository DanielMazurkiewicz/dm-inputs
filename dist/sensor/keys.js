// -- Sensor Inputs
export const SENSOR_BASE_ID = 12000;
// Device Motion (Acceleration)
export const KeySensorAccelerationX_P = 12000;
export const KeySensorAccelerationX_N = 12001;
export const KeySensorAccelerationY_P = 12002;
export const KeySensorAccelerationY_N = 12003;
export const KeySensorAccelerationZ_P = 12004;
export const KeySensorAccelerationZ_N = 12005;
export const KeySensorAccelerationIncludingGravityX_P = 12010;
export const KeySensorAccelerationIncludingGravityX_N = 12011;
export const KeySensorAccelerationIncludingGravityY_P = 12012;
export const KeySensorAccelerationIncludingGravityY_N = 12013;
export const KeySensorAccelerationIncludingGravityZ_P = 12014;
export const KeySensorAccelerationIncludingGravityZ_N = 12015;
// Rotation Rate (Yaw, Pitch, Roll from `rotationRate`)
export const KeySensorRotationRateYaw_P = 12020;
export const KeySensorRotationRateYaw_N = 12021;
export const KeySensorRotationRatePitch_P = 12022;
export const KeySensorRotationRatePitch_N = 12023;
export const KeySensorRotationRateRoll_P = 12024;
export const KeySensorRotationRateRoll_N = 12025;
// Device Orientation (Heading, Pitch, Roll from `orientation`)
export const KeySensorOrientationHeading = 12100; // Z axis rotation (compass heading, alpha) 0-360.
export const KeySensorOrientationPitch = 12101; // X axis rotation (front-back tilt, beta), normalized [-180, 180] -> [0, 1]
export const KeySensorOrientationRoll = 12102; // Y axis rotation (left-right tilt, gamma), normalized [-90, 90] -> [0, 1]
export const KeySensorOrientationAbsolute = 12103; // A boolean represented as a key
//# sourceMappingURL=keys.js.map