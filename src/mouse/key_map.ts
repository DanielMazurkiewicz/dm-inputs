import type { KeyId } from '../keys';
import { KeyMouseLeft, KeyMouseRight, KeyMouseMiddle, KeyMouseWheelUp, KeyMouseWheelDown, KeyMouseMove } from './keys';

/**
 * Maps internal `KeyId` numeric constants for the mouse to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export const mouseKeyMap: { readonly [keyId: KeyId]: string } = {
    [KeyMouseLeft]: 'MouseLeft',
    [KeyMouseRight]: 'MouseRight',
    [KeyMouseMiddle]: 'MouseMiddle',
    [KeyMouseWheelUp]: 'MouseWheelUp',
    [KeyMouseWheelDown]: 'MouseWheelDown',
    [KeyMouseMove]: 'MouseMove',
};