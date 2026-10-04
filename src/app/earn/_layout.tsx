import { Stack } from 'expo-router';
import { Toast } from '@/components';

/** Same nested-Stack + Toast pattern as send/_layout.tsx — see the note there
 *  for why Toast is mounted inside each modal stack rather than only at root. */
export default function EarnLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}
