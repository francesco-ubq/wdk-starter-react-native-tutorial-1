/**
 * WEB-ONLY STUB for `react-native-webview`.
 *
 * The real package has no web implementation. It is only used by
 * `src/wdk/cloud-backup/CloudKitAuthWebView.tsx` (the iCloud sign-in
 * flow), which is unreachable in the harness — but the import is
 * top-level, so it still has to resolve.
 */
import React from 'react';
import { View } from 'react-native';

export const WebView = React.forwardRef<unknown, Record<string, unknown>>(function WebView(
  _props,
  _ref,
) {
  return <View />;
});

export default WebView;
