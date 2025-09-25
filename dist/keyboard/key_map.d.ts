import type { KeyId } from '../keys';
/**
 * Maps `KeyboardEvent.code` values to the internal `KeyId` numeric constants.
 * This provides a layer of abstraction over the physical keys, independent of keyboard layout.
 * For example, `KeyA` will always refer to the physical key that is 'A' on a US-QWERTY layout,
 * regardless of whether the user has an AZERTY or Dvorak layout active.
 */
export declare const keyMap: {
    readonly [code: string]: KeyId;
};
/**
 * Maps internal `KeyId` numeric constants to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export declare const keyboardKeyMap: {
    readonly [keyId: KeyId]: string;
};
