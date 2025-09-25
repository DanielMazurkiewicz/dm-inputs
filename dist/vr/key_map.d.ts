import type { KeyId } from '../keys';
/**
 * Maps internal `KeyId` numeric constants for VR to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export declare const vrKeyMap: {
    readonly [keyId: KeyId]: string;
};
