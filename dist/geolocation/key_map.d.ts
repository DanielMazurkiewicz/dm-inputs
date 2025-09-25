import type { KeyId } from '../keys';
/**
 * Maps internal `KeyId` numeric constants for geolocation to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export declare const geolocationKeyMap: {
    readonly [keyId: KeyId]: string;
};
