import type { KeyId } from '../keys';
/**
 * Maps internal `KeyId` numeric constants for sensors to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export declare const sensorKeyMap: {
    readonly [keyId: KeyId]: string;
};
