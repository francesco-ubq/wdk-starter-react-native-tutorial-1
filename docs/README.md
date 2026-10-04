# Documentation

For AI coding agents, begin with [AGENTS.md](../AGENTS.md). These documents
describe the checked-in application, including the browser harness and the
scripted protocol screens.

| Document | Read it for |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Runtime layers, providers, state, wallet data, and native/web boundaries |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Directory map and the right file to change |
| [PACKAGES.md](PACKAGES.md) | Package roles, version sources, and build tooling |
| [WEB-HARNESS.md](WEB-HARNESS.md) | Browser startup, stub coverage, and demo limitations |
| [ENVIRONMENT.md](ENVIRONMENT.md) | Native environment and installation |
| [WDK_INTEGRATION.md](WDK_INTEGRATION.md) | Wallet hooks, worklet setup, sends, and indexer integration |
| [SECURITY.md](SECURITY.md) | Password vault, seed handling, and session locking |
| [CLOUD_BACKUP.md](CLOUD_BACKUP.md) | Google Drive / iCloud setup and backup flows |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution workflow and validation |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Previously investigated failures |
| [RELEASE.md](RELEASE.md) | Native build, signing, and release automation |

## Current behavior at a glance

Native core-wallet screens use WDK and external services. The web build
replaces the wallet engine, indexer, and selected native modules with demo
implementations. CoinGecko pricing still runs in the browser.

Swap, Earn, and Pay use captured figures and simulated progress on **both
native and web**. They have no live swap, lending, or payment integration.
See [WEB-HARNESS.md](WEB-HARNESS.md) before interpreting screenshots or
testing a financial operation.

Keep these docs aligned with source changes. Package versions come from
`package.json` and `package-lock.json`; runtime network support comes from
`src/wdk/networks.ts`, not from an installed package or an old example.
