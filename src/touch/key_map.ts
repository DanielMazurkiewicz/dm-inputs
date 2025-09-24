import type { KeyId } from '../keys';
import {
    KeyTouch0, KeyTouch1, KeyTouch2, KeyTouch3, KeyTouch4, KeyTouch5, KeyTouch6, KeyTouch7, KeyTouch8, KeyTouch9,
    KeyTouchMove0, KeyTouchMove1, KeyTouchMove2, KeyTouchMove3, KeyTouchMove4, KeyTouchMove5, KeyTouchMove6, KeyTouchMove7, KeyTouchMove8, KeyTouchMove9
} from './keys';

/**
 * Maps internal `KeyId` numeric constants for touch inputs to their string names (without the "Key" prefix).
 * Useful for debugging or UI purposes.
 */
export const touchKeyMap: { readonly [keyId: KeyId]: string } = {
    [KeyTouch0]: 'Touch0',
    [KeyTouch1]: 'Touch1',
    [KeyTouch2]: 'Touch2',
    [KeyTouch3]: 'Touch3',
    [KeyTouch4]: 'Touch4',
    [KeyTouch5]: 'Touch5',
    [KeyTouch6]: 'Touch6',
    [KeyTouch7]: 'Touch7',
    [KeyTouch8]: 'Touch8',
    [KeyTouch9]: 'Touch9',
    [KeyTouchMove0]: 'TouchMove0',
    [KeyTouchMove1]: 'TouchMove1',
    [KeyTouchMove2]: 'TouchMove2',
    [KeyTouchMove3]: 'TouchMove3',
    [KeyTouchMove4]: 'TouchMove4',
    [KeyTouchMove5]: 'TouchMove5',
    [KeyTouchMove6]: 'TouchMove6',
    [KeyTouchMove7]: 'TouchMove7',
    [KeyTouchMove8]: 'TouchMove8',
    [KeyTouchMove9]: 'TouchMove9',
};