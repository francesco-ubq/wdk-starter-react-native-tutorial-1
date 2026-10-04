# Browser harness and protocol demos

The browser build is a screenshot/demo harness. It renders the app's real
screens with replacements for the native wallet engine and selected
services. It is not a wallet for managing real funds.

## Running it

After installing dependencies using [ENVIRONMENT.md](ENVIRONMENT.md), run:

```sh
EXPO_PUBLIC_WDK_INDEXER_API_KEY=web-harness-demo npm run web
```

The dummy value is sufficient **only in the web harness**. The existing
`src/wdk/indexer.ts` still checks for a nonempty value before constructing
its client, even though Metro replaces that client with a fake. Without
the value, Activity shows the application's missing-key error.

Use a disposable password and the provided test phrase for onboarding.
Do not import a real recovery phrase. The command does not edit `.env`.
Native builds require their normal, valid service configuration.

## How module replacement works

`metro.config.js` starts with Expo's default configuration, then intercepts
module resolution when `platform === 'web'`. Exact package imports and
subpath imports resolve to the same corresponding stub. A suffix rule
replaces the generated wallet bundle import with an empty string.

For iOS and Android, requests fall through to the default resolver. There
is no `__DEV__` or environment-variable guard: **production web exports
also use the stubs**.

| Module(s) | Browser behavior |
|---|---|
| `@tetherto/wdk-react-native-core` | Fake lifecycle, addresses, balances, seed phrases, signatures, sends, and account hooks |
| `@tetherto/wdk-indexer-http` | Fabricated transfers; the app's mapping, filtering, and formatting still run |
| `expo-secure-store` | Reads/writes prefixed `localStorage` entries |
| `react-native-bare-kit` | Placeholder host; starting a worklet throws |
| `@react-native-google-signin/google-signin` | Sign-in/token requests reject with unavailable errors |
| `react-native-webview` | Renders an empty `View`; CloudKit sign-in is not functional |
| `react-native-nitro-modules`, `react-native-mmkv`, `@tetherto/pear-wrk-wdk`, `@tetherto/wdk-react-native-secure-storage`, `@buildonspark/spark-frost-bare-addon`, `bare-node-runtime` | Empty modules for otherwise native-only imports |
| `.wdk-bundle/wdk-worklet.bundle.js` | Empty string instead of the serialized Bare bundle |

The CoinGecko client is **not** stubbed, so pricing can still make network
requests and fail or be rate-limited. This is not a fully offline test
environment. Layout, navigation, app state, and TanStack Query behavior
also still execute.

## Persistence and security

The fake wallet persists wallet identifiers under
`wdk-web-harness.wallets.v1`; imported phrases live in its in-memory store.
Generated phrases, keys, and addresses are fixtures and are not connected
to usable wallet accounts. A reload does not restore an imported phrase
from secure storage.

The SecureStore replacement uses the prefix
`wdk-web-harness.securestore.`. The real password-vault encryption code
runs, but both the vault key and encrypted password payload are stored
together in `localStorage`. Any script with access to that origin can read
both and recover the password. Native Keychain/Keystore and biometric
guarantees do not apply.

Use browser site-data controls to clear demo data when needed. Stub
warnings currently appear in the developer console; there is no persistent
in-app banner identifying the harness.

## Swap, Earn, and Pay run as demos on every platform

These routes are separate from Metro's web-only replacement mechanism.
They are ordinary shared route files and have no native implementation:

| Route | What the current handler does |
|---|---|
| `src/app/swap/index.tsx` | Changes quote → submitting → done after a timer; the fee-cap button shows a preset error |
| `src/app/earn/index.tsx` | Starts in done; Withdraw resets the demo to enter, then Supply advances approve/supply states with timers |
| `src/app/pay/index.tsx` | Starts in done; Decline resets to challenge, then Approve advances to done with a timer |

All figures and receipt hashes come from `src/features/protocolData.ts`,
whose comments describe them as captured mainnet results. They are not
queried for the active user's account. No current handler signs, sends,
approves, withdraws, or requests the displayed paid resource. The "View on
Arbiscan" buttons currently have no navigation behavior.

`wdk.config.js` and `src/wdk/networks.ts` do not register the required
protocol integrations. Making these routes live requires configuration,
account-aware quotes/state, actual signing/execution, error handling, and
receipt verification; replacing a constant alone is insufficient.

## What browser verification establishes

Browser checks can cover screen layout, navigation, and demo state
transitions. They cannot establish that native transaction submission,
fee enforcement, protocol settlement, secure storage, or cloud backup
works. Validate those paths on native builds with deliberate test data and
appropriate service configuration.
