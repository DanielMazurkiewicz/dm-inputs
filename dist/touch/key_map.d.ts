import type { KeyId } from '../keys';
/**
 * Maps internal `KeyId` numeric constants for touch inputs to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export declare const touchKeyMap: {
    readonly [keyId: KeyId]: string;
};
