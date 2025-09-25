import type { KeyId } from '../keys';
/**
 * Maps internal `KeyId` numeric constants for the mouse to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export declare const mouseKeyMap: {
    readonly [keyId: KeyId]: string;
};
