import type { InputsState } from '../common';
import { type KeyId } from '../keys';
export interface GeolocationOptions extends PositionOptions {
}
/**
 * Initializes geolocation input handling.
 * This uses the `navigator.geolocation` API.
 *
 * NOTE: The browser will ask the user for permission to access their location.
 * This usually happens on the first call to `watchPosition`.
 */
export declare function initInputGeolocation(state: InputsState, options?: GeolocationOptions): {
    destroy: () => void;
};
/** Detects if a key ID belongs to a geolocation key. */
export declare function isGeolocationKey(keyId: KeyId): boolean;
