import type { KeyId } from '../keys';
import { KeyGeolocationAccuracy, KeyGeolocationChange } from './keys';

/**
 * Maps internal `KeyId` numeric constants for geolocation to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export const geolocationKeyMap: { readonly [keyId: KeyId]: string } = {
    [KeyGeolocationChange]: 'GeolocationChange',
    [KeyGeolocationAccuracy]: 'GeolocationAccuracy',
};