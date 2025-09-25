import { VR_AXIS_OFFSET, VR_BASE_ID, VR_BUTTON_OFFSET, VR_CONTROLLER_L_DEVICE_INDEX, VR_CONTROLLER_R_DEVICE_INDEX, VR_HEADSET_DEVICE_INDEX, VR_ID_RANGE, VR_POSE_OFFSET } from './keys_consts';
const HMD = VR_BASE_ID + VR_HEADSET_DEVICE_INDEX * VR_ID_RANGE + VR_POSE_OFFSET;
const LEFT = VR_BASE_ID + VR_CONTROLLER_L_DEVICE_INDEX * VR_ID_RANGE;
const RIGHT = VR_BASE_ID + VR_CONTROLLER_R_DEVICE_INDEX * VR_ID_RANGE;
// --- Headset (HMD) ---
export const KeyVRHmdPositionX = HMD + 0;
export const KeyVRHmdPositionY = HMD + 1;
export const KeyVRHmdPositionZ = HMD + 2;
export const KeyVRHmdOrientationX = HMD + 3;
export const KeyVRHmdOrientationY = HMD + 4;
export const KeyVRHmdOrientationZ = HMD + 5;
export const KeyVRHmdOrientationW = HMD + 6;
// --- Left Controller ---
export const KeyVRLeftPositionX = LEFT + VR_POSE_OFFSET + 0;
export const KeyVRLeftPositionY = LEFT + VR_POSE_OFFSET + 1;
export const KeyVRLeftPositionZ = LEFT + VR_POSE_OFFSET + 2;
export const KeyVRLeftOrientationX = LEFT + VR_POSE_OFFSET + 3;
export const KeyVRLeftOrientationY = LEFT + VR_POSE_OFFSET + 4;
export const KeyVRLeftOrientationZ = LEFT + VR_POSE_OFFSET + 5;
export const KeyVRLeftOrientationW = LEFT + VR_POSE_OFFSET + 6;
export const KeyVRLeftBtn0 = LEFT + VR_BUTTON_OFFSET + 0; // Trigger
export const KeyVRLeftBtn1 = LEFT + VR_BUTTON_OFFSET + 1; // Grip
export const KeyVRLeftBtn2 = LEFT + VR_BUTTON_OFFSET + 2; // Thumbstick Press
export const KeyVRLeftBtn3 = LEFT + VR_BUTTON_OFFSET + 3; // X / Primary
export const KeyVRLeftBtn4 = LEFT + VR_BUTTON_OFFSET + 4; // Y / Secondary
export const KeyVRLeftBtn5 = LEFT + VR_BUTTON_OFFSET + 5; // Menu
// WebXR Standard Gamepad mapping for controllers like Oculus Touch.
// Axes 2 & 3 are thumbstick. Axes 0 & 1 are often unused.
export const KeyVRLeftAxis0_P = LEFT + VR_AXIS_OFFSET + 0; // Unused
export const KeyVRLeftAxis0_N = LEFT + VR_AXIS_OFFSET + 1; // Unused
export const KeyVRLeftAxis1_P = LEFT + VR_AXIS_OFFSET + 2; // Unused
export const KeyVRLeftAxis1_N = LEFT + VR_AXIS_OFFSET + 3; // Unused
export const KeyVRLeftAxis2_P = LEFT + VR_AXIS_OFFSET + 4; // Thumbstick X+
export const KeyVRLeftAxis2_N = LEFT + VR_AXIS_OFFSET + 5; // Thumbstick X-
export const KeyVRLeftAxis3_P = LEFT + VR_AXIS_OFFSET + 6; // Thumbstick Y+
export const KeyVRLeftAxis3_N = LEFT + VR_AXIS_OFFSET + 7; // Thumbstick Y- (Y is often inverted)
// --- Right Controller ---
export const KeyVRRightPositionX = RIGHT + VR_POSE_OFFSET + 0;
export const KeyVRRightPositionY = RIGHT + VR_POSE_OFFSET + 1;
export const KeyVRRightPositionZ = RIGHT + VR_POSE_OFFSET + 2;
export const KeyVRRightOrientationX = RIGHT + VR_POSE_OFFSET + 3;
export const KeyVRRightOrientationY = RIGHT + VR_POSE_OFFSET + 4;
export const KeyVRRightOrientationZ = RIGHT + VR_POSE_OFFSET + 5;
export const KeyVRRightOrientationW = RIGHT + VR_POSE_OFFSET + 6;
export const KeyVRRightBtn0 = RIGHT + VR_BUTTON_OFFSET + 0; // Trigger
export const KeyVRRightBtn1 = RIGHT + VR_BUTTON_OFFSET + 1; // Grip
export const KeyVRRightBtn2 = RIGHT + VR_BUTTON_OFFSET + 2; // Thumbstick Press
export const KeyVRRightBtn3 = RIGHT + VR_BUTTON_OFFSET + 3; // A / Primary
export const KeyVRRightBtn4 = RIGHT + VR_BUTTON_OFFSET + 4; // B / Secondary
export const KeyVRRightBtn5 = RIGHT + VR_BUTTON_OFFSET + 5; // Menu
// WebXR Standard Gamepad mapping
export const KeyVRRightAxis0_P = RIGHT + VR_AXIS_OFFSET + 0; // Unused
export const KeyVRRightAxis0_N = RIGHT + VR_AXIS_OFFSET + 1; // Unused
export const KeyVRRightAxis1_P = RIGHT + VR_AXIS_OFFSET + 2; // Unused
export const KeyVRRightAxis1_N = RIGHT + VR_AXIS_OFFSET + 3; // Unused
export const KeyVRRightAxis2_P = RIGHT + VR_AXIS_OFFSET + 4; // Thumbstick X+
export const KeyVRRightAxis2_N = RIGHT + VR_AXIS_OFFSET + 5; // Thumbstick X-
export const KeyVRRightAxis3_P = RIGHT + VR_AXIS_OFFSET + 6; // Thumbstick Y+
export const KeyVRRightAxis3_N = RIGHT + VR_AXIS_OFFSET + 7; // Thumbstick Y- (Y is often inverted)
//# sourceMappingURL=keys.js.map