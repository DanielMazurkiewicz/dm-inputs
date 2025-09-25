import type { KeyId } from '../keys';
/**
 * Maps internal `KeyId` numeric constants for joysticks to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export declare const joystickKeyMap: {
    readonly [keyId: KeyId]: string;
};
