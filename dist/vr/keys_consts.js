// This file is created to avoid circular dependencies.
export const VR_BASE_ID = 14000;
export const VR_ID_RANGE = 1000;
// Offsets within a device's range
export const VR_POSE_OFFSET = 0; // Position + Orientation
export const VR_BUTTON_OFFSET = 100;
export const VR_AXIS_OFFSET = 200;
// Device indices (multiplied by VR_ID_RANGE)
export const VR_HEADSET_DEVICE_INDEX = 0;
export const VR_CONTROLLER_L_DEVICE_INDEX = 1;
export const VR_CONTROLLER_R_DEVICE_INDEX = 2;
// Limits
export const MAX_VR_BUTTONS = 10;
export const MAX_VR_AXES = 4; // e.g., 2 thumbsticks, each with 2 axes
//# sourceMappingURL=keys_consts.js.map