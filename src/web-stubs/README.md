# src/web-stubs — browser-only fakes

Everything in this folder is loaded **only when `platform === 'web'`**, via
`metro.config.js`'s `resolveRequest` hook. None of it is reachable from an
iOS or Android build, and no real app source file imports anything from
here directly.

Why it exists: the real WDK engine runs inside a Bare worklet
(`react-native-bare-kit`, a native module backed by
`react-native-nitro-modules`). A browser has no such runtime, so the
worklet layer cannot execute on web at all. These stubs replace exactly
that layer — plus a handful of other native-only modules — so the app's
own screens, navigation, theming, formatting and state management can be
rendered in a desktop browser for screenshots / demos.

**Every balance, address, mnemonic, transaction and signature produced
here is fabricated.** See [the browser harness documentation](../../docs/WEB-HARNESS.md)
for startup instructions, the exact stub coverage, and storage limitations.
The Swap, Earn, and Pay route demos are separate: they run from captured
data on native builds as well as web.
