// metro.config.js
//
// ══════════════════════════════════════════════════════════════════════
//  ADDED FOR THE WEB SCREENSHOT HARNESS — see docs/WEB-HARNESS.md
// ══════════════════════════════════════════════════════════════════════
//
// This file did not exist before. Everything in it is gated on
// `platform === 'web'`, so iOS and Android resolution is byte-for-byte
// identical to the default Expo config (the `getDefaultConfig` result is
// returned untouched for those platforms).
//
// Why any of this is needed: the real WDK engine executes inside a Bare
// worklet hosted by `react-native-bare-kit`, a native nitro module. A
// browser has no such runtime, so the worklet layer — and a handful of
// other native-only modules — are swapped for hand-written fakes under
// `src/web-stubs/` when (and only when) bundling for web.
//
// If you are reading this in a fresh clone and do not care about the web
// harness, deleting this file and `src/web-stubs/` restores the project
// to its original state. Nothing else depends on either.

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const stub = (file) => path.resolve(__dirname, 'src/web-stubs', file);

/**
 * Exact package names redirected to a local stub on web.
 * Keep this list as short as it can possibly be — every entry here is a
 * piece of the app that is NOT being exercised for real in the browser.
 */
const WEB_MODULE_STUBS = {
  // The WDK React hooks/provider layer. This is the big one: it is what
  // talks to the Bare worklet. Stubbed wholesale.
  '@tetherto/wdk-react-native-core': stub('wdk-react-native-core.tsx'),

  // The native worklet host itself (nitro module).
  'react-native-bare-kit': stub('react-native-bare-kit.ts'),

  // iOS Keychain / Android Keystore. Has no web implementation at all;
  // the app's password vault calls it during onboarding.
  'expo-secure-store': stub('expo-secure-store.ts'),

  // Native Google Sign-In SDK wrapper (cloud-backup flow only).
  '@react-native-google-signin/google-signin': stub('google-signin.ts'),

  // No web implementation; only reached by the iCloud sign-in WebView.
  'react-native-webview': stub('react-native-webview.tsx'),

  // Transitively referenced native-only packages. Never called on web.
  'react-native-nitro-modules': stub('empty.js'),
  'react-native-mmkv': stub('empty.js'),
  '@tetherto/pear-wrk-wdk': stub('empty.js'),
  '@tetherto/wdk-react-native-secure-storage': stub('empty.js'),
  '@buildonspark/spark-frost-bare-addon': stub('empty.js'),
  'bare-node-runtime': stub('empty.js'),

  // The HTTP transaction-history client. Stubbed so the Activity tab has
  // something to render without a real (paid, registered) indexer API
  // key — the app's own request-building and response-mapping code in
  // src/wdk/indexer.ts still runs for real against it.
  '@tetherto/wdk-indexer-http': stub('wdk-indexer-http.ts'),
};

/** Suffix matches, for relative imports that cannot be keyed by package name. */
const WEB_SUFFIX_STUBS = [
  // `src/app/_layout.tsx` imports the generated 12 MB Bare bundle as a
  // string. Useless and slow in a browser.
  ['.wdk-bundle/wdk-worklet.bundle.js', stub('wdk-worklet-bundle.js')],
];

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const direct = WEB_MODULE_STUBS[moduleName];
    if (direct) return { type: 'sourceFile', filePath: direct };

    // Sub-path imports of a stubbed package (e.g. 'react-native-webview/lib/X')
    for (const [pkg, filePath] of Object.entries(WEB_MODULE_STUBS)) {
      if (moduleName.startsWith(`${pkg}/`)) return { type: 'sourceFile', filePath };
    }

    for (const [suffix, filePath] of WEB_SUFFIX_STUBS) {
      if (moduleName.endsWith(suffix)) return { type: 'sourceFile', filePath };
    }
  }

  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
