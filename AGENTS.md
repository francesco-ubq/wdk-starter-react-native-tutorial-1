# Working in this repository

This is an Expo / React Native WDK reference wallet with a browser demo
harness. Read [docs/README.md](docs/README.md) for the documentation map.
Use the source and `package.json` / `package-lock.json` to resolve stale
comments or historical notes in the longer docs.

## Start here

- [Architecture](docs/ARCHITECTURE.md): providers, wallet data, networks,
  session state, and platform boundaries.
- [Project structure](docs/PROJECT_STRUCTURE.md): paths and responsibilities.
- [Packages](docs/PACKAGES.md): dependencies and where they are used.
- [Web harness](docs/WEB-HARNESS.md): what is simulated and what still runs.
- [Security](docs/SECURITY.md): read before changing password, seed, or lock logic.
- [Environment](docs/ENVIRONMENT.md): native toolchain and setup constraints.

## Important implementation boundaries

- Native wallet operations go through `src/wdk/` and
  `@tetherto/wdk-react-native-core`, which talks to a Bare worklet.
- `metro.config.js` redirects selected modules to `src/web-stubs/` only for
  web. This happens for every web build, including production web exports;
  there is no separate opt-in demo flag.
- Swap, Earn, and Pay are currently scripted demonstrations on **all**
  platforms. They read `src/features/protocolData.ts` and change local state
  with timers. They do not execute protocol calls. Do not report their
  confirmation screens as evidence that a transaction ran.
- Screens use `src/wdk/hooks/useWalletData.ts` and related WDK helpers.
  `src/data/` is an older, unused repository layer; its `USE_WDK` flag does
  not control the current screens or the browser harness.
- `src/wdk/networks.ts` owns runtime network definitions, assets, display
  metadata, explorers, and indexer chain mapping. `config.ts`, `assets.ts`,
  and `chains.ts` are compatibility re-exports. The token mapping is in
  `src/wdk/indexer.ts`.
- `wdk.config.js` separately selects packages compiled into the worklet.
  Match its network keys with runtime configuration when adding a network.
  Spark is bundled but is not currently exposed in the runtime registry/UI.

## Editing and verification

- Keep changes within the requested scope. Preserve existing staged and
  unstaged work; do not stage, commit, or regenerate artifacts as a side
  effect of a review.
- Use shared components from `src/components/` and theme utilities from
  `src/theme/`. The `@/` alias means `src/`.
- Preserve literal `process.env.EXPO_PUBLIC_*` reads and static asset
  `require(...)` calls: Expo/Metro need to see them at build time.
- Keep the per-modal `Toast` instances; native modal presentation requires
  them. See `src/app/send/_layout.tsx` for the explanation.
- Run `npm run typecheck` for TypeScript changes. For a review without
  generated output, use
  `node node_modules/typescript/bin/tsc --noEmit --incremental false`.
- `npm run lint` currently invokes Expo's interactive ESLint setup because
  the dependencies/config are absent. Do not run it during a read-only
  review or describe it as an established passing check.
- There is no configured automated test suite. Verify changed flows on the
  relevant platform. Browser screenshots cannot verify native signing,
  secure storage, lock behavior, or cloud backup. Report untested paths.
- `npm install` runs the worklet generator through `postinstall`.
  `npm run prebuild` regenerates native projects with `--clean`.
  Neither is a read-only validation command.

## Secrets and generated files

Keep real credentials, passwords, seed phrases, and private keys out of
code, fixtures, logs, and docs. Document environment variable names, not
local values. `EXPO_PUBLIC_*` values are exposed to the app bundle and must
not be treated as server secrets. Public addresses and transaction hashes
are not signing credentials, but may identify a wallet's activity.

Use disposable passwords and test phrases in the browser harness. Its
SecureStore replacement uses `localStorage`, and its wallet outputs are
fixtures, not usable accounts.

`.wdk/`, `.wdk-bundle/`, `ios/`, and `android/` are generated locations.
Although `.wdk-bundle/` is ignored, the current repository already tracks
the bundle file, so regenerated changes can appear in a diff. Inspect them
when reviewing; do not hand-edit the bundle or assume `.gitignore` removes
an already tracked file.
