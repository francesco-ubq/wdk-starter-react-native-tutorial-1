# Packages and tooling

`package.json` is the source of declared versions and ranges;
`package-lock.json` records the resolved dependency tree. The versions below
describe the current manifest, not recommendations to upgrade. Do not infer
an enabled feature from a package merely being installed.

## Framework, navigation, and browser

| Package | Declared version | Role |
|---|---|---|
| `expo` | `^55.0.23` | SDK, CLI, configuration, and native project generation |
| `react` / `react-dom` | `19.2.0` | React components; DOM renderer for web |
| `react-native` | `0.83.6` | Native UI runtime |
| `expo-router` | `^55.0.14` | File-based routes under `src/app/`; application entry |
| `@react-navigation/native` | `^7.3.3` | Navigation dependency used by the router stack |
| `react-native-screens` | `~4.23.0` | Native navigation screens/modal presentation |
| `react-native-gesture-handler` | `~2.30.0` | Root gesture container and gesture infrastructure |
| `react-native-safe-area-context` | `~5.6.2` | Root and modal safe-area layout |
| `react-native-web` | `^0.21.0` | Browser rendering of React Native components |
| `@expo/metro-runtime` | `~55.0.12` | Expo/Metro browser runtime |

## Wallet and external data

| Package | Declared version/source | Role |
|---|---|---|
| `@tetherto/wdk-react-native-core` | `1.0.0-beta.17` | Provider, wallet/account hooks, and bridge to the worklet; replaced on web |
| `@tetherto/wdk` | `^1.0.0-beta.5` | Wallet SDK loaded inside the generated worklet |
| `@tetherto/wdk-wallet-btc` | `^1.0.0-beta.8` | Bitcoin implementation selected by `wdk.config.js` |
| `@tetherto/wdk-wallet-evm-7702-gasless` | `1.0.0-beta.5` | Implementation for Ethereum, Arbitrum, and Polygon slots |
| `@tetherto/wdk-wallet-spark` | `^1.0.0-beta.17` | Included in the worklet config; no runtime asset/UI registration yet |
| `@buildonspark/spark-frost-bare-addon` | `^0.0.12` | Spark native addon preloaded by the worklet config |
| `react-native-bare-kit` | `0.14.5` | Native host for the WDK Bare worklet |
| `bare-node-runtime` | `^1.5.0` | Node compatibility inside Bare |
| `react-native-nitro-modules` | `^0.36.1` | Native module infrastructure used by the worklet host |
| `@tetherto/wdk-indexer-http` | `github:tetherto/wdk-indexer-http#fbde10b` | HTTP history client in `src/wdk/indexer.ts`; replaced on web |
| `@tetherto/wdk-pricing-coingecko-http` | `1.0.0-beta.2` | USD price queries in `src/wdk/pricing.ts`; remains live on web |
| `@tanstack/react-query` | `^5.101.0` | Asynchronous data, cache, and refresh behavior |
| `bignumber.js` | `^11.1.5` | Token amount arithmetic, formatting, and base-unit conversion |
| `zustand` | `^5.0.14` | Account selection, session-related state, toasts, and refresh flags |

There are no configured swap, lending, or x402 protocol integrations in
`wdk.config.js` or the runtime WDK config. Names such as Velora and Aave in
the feature screens refer to captured demo data, not installed and wired
application integrations.

## Security, backup, and UI

| Package(s) | Role in this application |
|---|---|
| `@tetherto/wdk-utils` (`^1.0.0-beta.7`) | Password-vault and cloud-backup encryption helpers |
| `expo-secure-store` (`~55.0.16`) | Native password-vault storage; replaced with `localStorage` on web |
| `react-native-get-random-values` (`^2.0.0`) | Random-values polyfill imported by the root layout |
| `@tetherto/wdk-backup-cloud` (`github:Boka44/wdk-backup-cloud`) | Cloud backup client used by `CloudBackupContext` |
| `@react-native-google-signin/google-signin` (`^16.1.2`) | Native Google authentication; stub rejects sign-in on web |
| `react-native-webview` (`13.16.0`) | CloudKit sign-in view; inert replacement on web |
| `lucide-react-native` (`^1.14.0`) | UI icons |
| `react-native-svg` (`15.15.3`), `react-native-qrcode-svg` (`^6.3.21`) | SVG and receive-address QR rendering |
| `expo-clipboard` | Copying addresses and recovery phrases |
| `expo-navigation-bar`, `expo-status-bar`, `expo-system-ui`, `expo-splash-screen` | System appearance and launch integration |
| `expo-constants`, `expo-linking` | Expo application/navigation infrastructure |
| `react-native-reanimated` (`4.2.1`), `react-native-worklets` (`0.7.4`) | Declared animation infrastructure; distinct from the Bare wallet worklet |

`@tetherto/wdk-uikit-react-native` and `@ledgerhq/ledger-bitcoin` are declared
dependencies but have no direct imports in current `src/` code. The visible
UI uses `src/components/` and `src/theme/`; there is no implemented Ledger
screen. `bufferutil` and `utf-8-validate` are declared native dependency
support packages, not application features.

## Build and development

- `@tetherto/wdk-worklet-bundler` (`^1.0.0-beta.9`, also an override) reads
  `wdk.config.js` and generates `.wdk/` and `.wdk-bundle/`. The root
  `postinstall` invokes `wdk-worklet-bundler generate`. It is currently an
  npm version range, not a GitHub reference.
- `typescript` (`^5.3.3`) and `@types/react` provide strict type checking.
  `tsconfig.json` extends Expo's base config.
- `babel-preset-expo` and `babel-plugin-module-resolver` compile the app
  and resolve `@/` to `src/` through `babel.config.js`.
- `@expo/config-plugins` and `expo-build-properties` support native config;
  custom plugins live in `modules/`.
- `dotenv` loads local configuration for `app.config.js`.
- `prettier` and `prettier-config-standard` are installed, but there is no
  committed Prettier configuration. ESLint dependencies/configuration are
  also absent despite the `lint` script.
- Overrides constrain `expo-crypto` to `~55.0.16` and `expo-font` to
  `~55.0.8`. `passwordVault.ts` imports `expo-crypto` for random bytes;
  these packages are not listed as direct dependencies in this manifest.

The two GitHub dependencies are backup-cloud and indexer-http. Consult the
lockfile for their resolved commits; the backup-cloud manifest reference
does not pin a commit. Historical setup docs describing three GitHub
dependencies predate the current bundler declaration.

See [ENVIRONMENT.md](ENVIRONMENT.md) before installing or changing native
dependencies, and [CONTRIBUTING.md](CONTRIBUTING.md) for available checks.
