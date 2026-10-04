/**
 * WEB-ONLY STUB for `expo-secure-store`.
 *
 * The real module is backed by the iOS Keychain / Android Keystore and
 * has NO web implementation (calls throw `UnavailabilityError`). The app
 * uses it for the password vault (src/wdk/passwordVault.ts), so without
 * this the whole onboarding password step would crash.
 *
 * NOT SECURE: this is plain `localStorage`, readable by any script on the
 * page. It is a demo harness only.
 *
 * Note what stays REAL because of this: passwordVault.ts's actual
 * envelope-encryption code (`@tetherto/wdk-utils` encrypt/decrypt, pure
 * JS @noble/hashes scrypt + AES) still runs for real in the browser — only
 * the storage medium underneath it is faked.
 */

const PREFIX = 'wdk-web-harness.securestore.';

function read(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(PREFIX + key) ?? null;
  } catch {
    return null;
  }
}

export async function getItemAsync(key: string): Promise<string | null> {
  return read(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, value);
  } catch {
    /* blocked storage — harness just forgets */
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  try {
    globalThis.localStorage?.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export function getItem(key: string): string | null {
  return read(key);
}

export function setItem(key: string, value: string): void {
  void setItemAsync(key, value);
}

export async function isAvailableAsync(): Promise<boolean> {
  return true;
}

export async function canUseBiometricAuthentication(): Promise<boolean> {
  return false;
}

export const WHEN_UNLOCKED = 'WHEN_UNLOCKED';
export const AFTER_FIRST_UNLOCK = 'AFTER_FIRST_UNLOCK';
export const ALWAYS = 'ALWAYS';
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 'WHEN_PASSCODE_SET_THIS_DEVICE_ONLY';
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'WHEN_UNLOCKED_THIS_DEVICE_ONLY';
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY';
export const ALWAYS_THIS_DEVICE_ONLY = 'ALWAYS_THIS_DEVICE_ONLY';
