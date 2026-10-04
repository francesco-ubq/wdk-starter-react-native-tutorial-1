/**
 * WEB-ONLY STUB for `@react-native-google-signin/google-signin`.
 *
 * The real module is a native SDK wrapper (Play Services / iOS Google
 * Sign-In). Only `src/wdk/cloud-backup/CloudBackupContext.tsx` imports it,
 * and only for the optional cloud-backup flow.
 *
 * Signing in always fails here with an explicit message, so the cloud
 * provider screen renders and shows an honest error instead of silently
 * faking a successful backup.
 */

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  ONE_TAP_START_FAILED: 'ONE_TAP_START_FAILED',
  NO_SAVED_CREDENTIAL_FOUND: 'NO_SAVED_CREDENTIAL_FOUND',
  SCOPES_ALREADY_GRANTED: 'SCOPES_ALREADY_GRANTED',
} as const;

const WEB_MSG = 'Google Sign-In is not available in the web harness (native module).';

export const GoogleSignin = {
  configure: () => {},
  hasPlayServices: async () => false,
  signIn: async () => {
    throw Object.assign(new Error(WEB_MSG), { code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE });
  },
  signInSilently: async () => {
    throw Object.assign(new Error(WEB_MSG), { code: statusCodes.SIGN_IN_REQUIRED });
  },
  signOut: async () => {},
  revokeAccess: async () => {},
  getCurrentUser: () => null,
  getTokens: async () => {
    throw Object.assign(new Error(WEB_MSG), { code: statusCodes.SIGN_IN_REQUIRED });
  },
  addScopes: async () => null,
  hasPreviousSignIn: () => false,
};

export function isErrorWithCode(e: unknown): e is { code: string; message: string } {
  return typeof e === 'object' && e !== null && 'code' in e;
}

export function isSuccessResponse(r: unknown): boolean {
  return typeof r === 'object' && r !== null && (r as { type?: string }).type === 'success';
}

export function isNoSavedCredentialFoundResponse(): boolean {
  return false;
}

export const GoogleSigninButton = () => null;
export const GoogleOneTapSignIn = GoogleSignin;
