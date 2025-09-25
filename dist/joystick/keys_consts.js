// This file is created to avoid circular dependencies.
// For example, sensor/index.ts needs JOYSTICK_BASE_ID for its isSensorKey check,
// but importing from joystick/keys.ts would be problematic if joystick files
// also needed to import from sensor files in the future.
export const JOYSTICK_BASE_ID = 20000;
export const JOYSTICK_ID_RANGE = 1000;
export const JOYSTICK_BUTTON_OFFSET = 0;
export const JOYSTICK_AXIS_OFFSET = 100;
export const MAX_JOYSTICKS = 8;
export const MAX_JOYSTICK_BUTTONS = 20;
export const MAX_JOYSTICK_AXES = 8;
//# sourceMappingURL=keys_consts.js.map