/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WEB-ONLY STUB for `@tetherto/wdk-react-native-core`.
 *
 * Loaded only when metro's platform === 'web' (see metro.config.js).
 * Never bundled into an iOS/Android build.
 *
 * The real package drives a Bare worklet over `react-native-bare-kit`
 * (a native nitro module) and stores secrets in `react-native-mmkv` +
 * `@tetherto/wdk-react-native-secure-storage`. None of those exist in a
 * browser, so this file re-implements the package's *public surface* with
 * an in-memory / localStorage fake.
 *
 * EVERYTHING BELOW IS FAKE DATA. No key is ever derived, no address is
 * ever really computed, no chain is ever contacted, nothing is signed.
 *
 * What IS real and exercised by this stub:
 *   - the exact exported names/shapes the app imports (so app code is
 *     completely untouched),
 *   - the real `BaseAsset` implementation (copied verbatim from the
 *     package — it is pure config plumbing with no native deps),
 *   - real @tanstack/react-query plumbing, so the app's loading /
 *     refetching / isFetching / staleTime behaviour is genuine.
 */
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { create } from 'zustand';

// ───────────────────────────────────────────────────────────────────────────
//  Types — mirrored from the real package (type-only, erased at runtime)
// ───────────────────────────────────────────────────────────────────────────

export type AssetConfig<T = Record<string, unknown>> = T & {
  id: string;
  network: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  address?: string | null;
};

export interface IAsset {
  getId(): string;
  getNetwork(): string;
  getSymbol(): string;
  getName(): string;
  getDecimals(): number;
  isNative(): boolean;
  getContractAddress(): string | null;
}

export interface BalanceFetchResult {
  success: boolean;
  network: string;
  accountIndex: number;
  assetId: string;
  balance: string | null;
  error?: string;
}

export interface BundleConfig {
  bundle: string;
}

export interface AddressInfo {
  network: string;
  accountIndex: number;
  address: string;
}

export interface AddressInfoResult extends AddressInfo {
  success: boolean;
  error?: string;
}

export type WdkConfigs<
  TNetwork = Record<string, unknown>,
  TProtocol = Record<string, unknown>,
> = {
  networks: Record<string, { blockchain: string; config: TNetwork }>;
  protocols?: Record<string, { protocol: string; config: TProtocol }>;
};

export type WdkAppState =
  | { status: 'INITIALIZING' }
  | { status: 'REINITIALIZING' }
  | { status: 'NO_WALLET' }
  | { status: 'LOCKED'; walletId?: string }
  | { status: 'READY'; walletId: string }
  | { status: 'ERROR'; error: Error };

export interface WdkAppContextValue {
  state: WdkAppState;
}

export interface WdkAppProviderProps<
  TNetwork extends Record<string, unknown> = Record<string, unknown>,
  TProtocol extends Record<string, unknown> = Record<string, unknown>,
> {
  bundle: BundleConfig;
  wdkConfigs: WdkConfigs<TNetwork, TProtocol>;
  children: React.ReactNode;
}

export interface WalletInfo {
  identifier: string;
  exists: boolean;
}

export interface AccountInfo {
  accountIndex: number;
  network: string;
  walletId: string;
}

export interface UseAccountParams {
  accountIndex: number;
  network: string;
}

export interface TransactionParams {
  to: string;
  asset: IAsset;
  amount: string;
}

export interface UseAccountResponse {
  success: boolean;
  error?: string;
}

export interface TransactionResult extends UseAccountResponse {
  hash: string;
  fee: string;
}

export interface BalanceQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}

// ───────────────────────────────────────────────────────────────────────────
//  BaseAsset — copied verbatim from the real package (pure, no native deps)
// ───────────────────────────────────────────────────────────────────────────

export class BaseAsset implements IAsset {
  constructor(protected readonly config: AssetConfig) {}
  getId(): string {
    return this.config.id;
  }
  getNetwork(): string {
    return this.config.network;
  }
  getSymbol(): string {
    return this.config.symbol;
  }
  getName(): string {
    return this.config.name;
  }
  isNative(): boolean {
    return this.config.isNative;
  }
  getDecimals(): number {
    return this.config.decimals;
  }
  getContractAddress(): string | null {
    return this.config.address ?? null;
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  Fake data generators
// ───────────────────────────────────────────────────────────────────────────

/** A real BIP-39 word list slice — these ARE valid BIP-39 words, but the
 *  phrase below is a well-known test vector and has NO checksum guarantee
 *  for the 24-word case. Never put funds anywhere near it. */
const FAKE_MNEMONIC_12 =
  'legal winner thank year wave sausage worth useful legal winner thank yellow';
const FAKE_MNEMONIC_24 =
  'legal winner thank year wave sausage worth useful legal winner thank year ' +
  'wave sausage worth useful legal winner thank year wave sausage worth title';

const HEX = '0123456789abcdef';
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

/** Deterministic pseudo-random stream from a string seed (xorshift). */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

function pick(rnd: () => number, alphabet: string, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(rnd() * alphabet.length)];
  return out;
}

/** A plausible-looking (but entirely fabricated) address per network/index. */
export function fakeAddress(network: string, accountIndex: number): string {
  const rnd = seeded(`${network}:${accountIndex}:wdk-web-harness`);
  if (network === 'bitcoin') return `bc1q${pick(rnd, BECH32, 38)}`;
  return `0x${pick(rnd, HEX, 40)}`;
}

/**
 * Fake balances in BASE UNITS (what the real hook returns), keyed by the
 * app's own asset ids from src/wdk/networks.ts. Index 0 is the "funded"
 * demo account; 1 and 2 hold a little (so the app's own AccountDiscovery
 * surfaces them and the Accounts screen has more than one row); 3+ are
 * empty, which is also what the real discovery probe would conclude.
 */
const FAKE_BALANCES_BY_INDEX: Record<number, Record<string, string>> = {
  0: {
    'bitcoin-native': '4218000', //    0.04218 BTC
    'usdt-ethereum': '1842500000', //  1842.5 USDT
    'usdt0-arbitrum': '932400000', //  932.4 USDT0
    'usdt-polygon': '418770000', //    418.77 USDT
    'xaut-ethereum': '612000000', //   612 XAUT (only if the app adds XAUT)
  },
  1: {
    'bitcoin-native': '150000', //     0.0015 BTC
    'usdt-ethereum': '120000000', //   120 USDT
    'usdt0-arbitrum': '0',
    'usdt-polygon': '45500000', //     45.5 USDT
    'xaut-ethereum': '0',
  },
  2: {
    'bitcoin-native': '0',
    'usdt-ethereum': '7250000', //     7.25 USDT
    'usdt0-arbitrum': '0',
    'usdt-polygon': '0',
    'xaut-ethereum': '0',
  },
};

function fakeBalance(accountIndex: number, assetId: string): string {
  return FAKE_BALANCES_BY_INDEX[accountIndex]?.[assetId] ?? '0';
}

/** Simulated network latency, so the app's real loading states are visible. */
const ADDRESS_LATENCY_MS = 120;
const BALANCE_LATENCY_MS = 350;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ───────────────────────────────────────────────────────────────────────────
//  Fake wallet lifecycle store
// ───────────────────────────────────────────────────────────────────────────

const LS_KEY = 'wdk-web-harness.wallets.v1';

function loadPersistedWallets(): string[] {
  try {
    const raw = globalThis.localStorage?.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function persistWallets(ids: string[]) {
  try {
    globalThis.localStorage?.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    /* private mode / blocked storage — the harness just forgets on reload */
  }
}

type Lifecycle = 'INITIALIZING' | 'NO_WALLET' | 'LOCKED' | 'READY' | 'ERROR';

interface HarnessState {
  lifecycle: Lifecycle;
  walletIds: string[];
  activeWalletId: string | null;
  mnemonics: Record<string, string>;
  booted: boolean;
  boot: () => void;
  setLifecycle: (l: Lifecycle) => void;
  registerWallet: (id: string, mnemonic: string) => void;
  removeWallet: (id: string) => void;
  setActive: (id: string | null) => void;
}

const useHarness = create<HarnessState>((set, get) => ({
  lifecycle: 'INITIALIZING',
  walletIds: [],
  activeWalletId: null,
  mnemonics: {},
  booted: false,

  boot: () => {
    if (get().booted) return;
    set({ booted: true });
    const ids = loadPersistedWallets();
    // Short simulated worklet start-up so the app's "Starting up" state shows.
    setTimeout(() => {
      set({ walletIds: ids, lifecycle: ids.length > 0 ? 'LOCKED' : 'NO_WALLET' });
    }, 450);
  },

  setLifecycle: (lifecycle) => set({ lifecycle }),

  registerWallet: (id, mnemonic) => {
    const ids = Array.from(new Set([...get().walletIds, id]));
    persistWallets(ids);
    set((s) => ({ walletIds: ids, mnemonics: { ...s.mnemonics, [id]: mnemonic } }));
  },

  removeWallet: (id) => {
    const ids = get().walletIds.filter((w) => w !== id);
    persistWallets(ids);
    set({ walletIds: ids, activeWalletId: null, lifecycle: ids.length ? 'LOCKED' : 'NO_WALLET' });
  },

  setActive: (activeWalletId) => set({ activeWalletId }),
}));

// ───────────────────────────────────────────────────────────────────────────
//  Provider
// ───────────────────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0, staleTime: 30_000, gcTime: 5 * 60_000 } },
});

export const WdkAppContext = createContext<WdkAppContextValue | null>(null);

export function WdkAppProvider<
  TNetwork extends Record<string, unknown> = Record<string, unknown>,
  TProtocol extends Record<string, unknown> = Record<string, unknown>,
>({ children }: WdkAppProviderProps<TNetwork, TProtocol>) {
  const lifecycle = useHarness((s) => s.lifecycle);
  const activeWalletId = useHarness((s) => s.activeWalletId);
  const walletIds = useHarness((s) => s.walletIds);
  const boot = useHarness((s) => s.boot);

  React.useEffect(() => {
    boot();
  }, [boot]);

  const state = useMemo<WdkAppState>(() => {
    switch (lifecycle) {
      case 'INITIALIZING':
        return { status: 'INITIALIZING' };
      case 'NO_WALLET':
        return { status: 'NO_WALLET' };
      case 'LOCKED':
        return { status: 'LOCKED', walletId: walletIds[0] };
      case 'READY':
        return { status: 'READY', walletId: activeWalletId ?? walletIds[0] ?? 'primary' };
      default:
        return { status: 'ERROR', error: new Error('web harness error state') };
    }
  }, [lifecycle, activeWalletId, walletIds]);

  if (typeof console !== 'undefined' && !(globalThis as any).__wdkWebHarnessWarned) {
    (globalThis as any).__wdkWebHarnessWarned = true;
    console.warn(
      '[wdk web harness] @tetherto/wdk-react-native-core is STUBBED. ' +
        'All balances, addresses, mnemonics and transactions are fake.',
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WdkAppContext.Provider value={{ state }}>{children}</WdkAppContext.Provider>
    </QueryClientProvider>
  );
}

// ───────────────────────────────────────────────────────────────────────────
//  Hooks
// ───────────────────────────────────────────────────────────────────────────

export interface UseWdkAppResult extends WdkAppContextValue {
  reinitializeWdk: () => Promise<void>;
  resetWallets: (blockchains: string[]) => Promise<void>;
}

export function useWdkApp(): UseWdkAppResult {
  const context = useContext(WdkAppContext);
  if (!context) throw new Error('useWdkApp must be used within WdkAppProvider');
  return {
    ...context,
    reinitializeWdk: async () => {},
    resetWallets: async () => {},
  };
}

export interface UseWalletManagerResult {
  activeWalletId: string | null;
  status: 'LOCKED' | 'UNLOCKED' | 'NO_WALLET' | 'LOADING' | 'ERROR';
  wallets: WalletInfo[];
  createWallet: (walletId: string) => Promise<void>;
  restoreWallet: (mnemonic: string, walletId: string) => Promise<string>;
  generateMnemonic: (wordCount?: 12 | 24) => Promise<string>;
  deleteWallet: (walletId: string) => Promise<void>;
  lock: () => Promise<void>;
  unlock: (walletId: string) => Promise<void>;
  switchWallet: (walletId: string) => Promise<void>;
  clearCache: () => void;
  createTemporaryWallet: (walletId: string, mnemonic?: string) => Promise<string>;
  clearTemporaryWallet: () => void;
  getMnemonic: (walletId: string) => Promise<string | null>;
  getEncryptionKey: (walletId: string) => Promise<string | null>;
  getEncryptedSeed: (walletId: string) => Promise<string | null>;
  getEncryptedEntropy: (walletId: string) => Promise<string | null>;
  generateEntropyAndEncrypt: (wordCount?: 12 | 24) => Promise<{
    encryptionKey: string;
    encryptedSeedBuffer: string;
    encryptedEntropyBuffer: string;
  }>;
  getMnemonicFromEntropy: (
    encryptedEntropy: string,
    encryptionKey: string,
  ) => Promise<{ mnemonic: string }>;
  getSeedAndEntropyFromMnemonic: (mnemonic: string) => Promise<{
    encryptionKey: string;
    encryptedSeedBuffer: string;
    encryptedEntropyBuffer: string;
  }>;
}

export function useWalletManager(): UseWalletManagerResult {
  const lifecycle = useHarness((s) => s.lifecycle);
  const walletIds = useHarness((s) => s.walletIds);
  const activeWalletId = useHarness((s) => s.activeWalletId);
  const mnemonics = useHarness((s) => s.mnemonics);

  const status = useMemo<UseWalletManagerResult['status']>(() => {
    if (lifecycle === 'INITIALIZING') return 'LOADING';
    if (lifecycle === 'READY') return 'UNLOCKED';
    if (lifecycle === 'ERROR') return 'ERROR';
    if (lifecycle === 'LOCKED') return 'LOCKED';
    return 'NO_WALLET';
  }, [lifecycle]);

  const wallets = useMemo<WalletInfo[]>(
    () => walletIds.map((identifier) => ({ identifier, exists: true })),
    [walletIds],
  );

  const restoreWallet = useCallback(async (mnemonic: string, walletId: string) => {
    const s = useHarness.getState();
    if (s.walletIds.includes(walletId)) {
      throw new Error(`A wallet with the ID '${walletId}' already exists`);
    }
    await delay(220);
    s.registerWallet(walletId, mnemonic.trim());
    useHarness.setState({ lifecycle: 'LOCKED' });
    return walletId;
  }, []);

  const unlock = useCallback(async (walletId: string) => {
    await delay(180);
    const s = useHarness.getState();
    if (!s.walletIds.includes(walletId)) s.registerWallet(walletId, FAKE_MNEMONIC_12);
    s.setActive(walletId);
    useHarness.setState({ lifecycle: 'READY' });
  }, []);

  return {
    activeWalletId,
    status,
    wallets,

    createWallet: async (walletId) => {
      await restoreWallet(FAKE_MNEMONIC_12, walletId);
    },
    restoreWallet,
    generateMnemonic: async (wordCount = 12) => {
      await delay(260);
      return wordCount === 24 ? FAKE_MNEMONIC_24 : FAKE_MNEMONIC_12;
    },
    deleteWallet: async (walletId) => {
      await delay(80);
      useHarness.getState().removeWallet(walletId);
    },
    lock: async () => {
      await delay(60);
      const s = useHarness.getState();
      s.setActive(null);
      useHarness.setState({ lifecycle: s.walletIds.length ? 'LOCKED' : 'NO_WALLET' });
    },
    unlock,
    switchWallet: async (walletId) => {
      await unlock(walletId);
    },
    clearCache: () => queryClient.clear(),
    createTemporaryWallet: async (walletId) => walletId,
    clearTemporaryWallet: () => {},
    getMnemonic: async (walletId) => {
      await delay(80);
      return mnemonics[walletId] ?? FAKE_MNEMONIC_12;
    },
    getEncryptionKey: async () => 'fake-encryption-key-web-harness',
    getEncryptedSeed: async () => 'fake-encrypted-seed-web-harness',
    getEncryptedEntropy: async () => 'fake-encrypted-entropy-web-harness',
    generateEntropyAndEncrypt: async () => ({
      encryptionKey: 'fake-encryption-key-web-harness',
      encryptedSeedBuffer: 'fake-encrypted-seed-web-harness',
      encryptedEntropyBuffer: 'fake-encrypted-entropy-web-harness',
    }),
    getMnemonicFromEntropy: async () => ({ mnemonic: FAKE_MNEMONIC_12 }),
    getSeedAndEntropyFromMnemonic: async () => ({
      encryptionKey: 'fake-encryption-key-web-harness',
      encryptedSeedBuffer: 'fake-encrypted-seed-web-harness',
      encryptedEntropyBuffer: 'fake-encrypted-entropy-web-harness',
    }),
  };
}

// ── Addresses / accounts ───────────────────────────────────────────────────

export interface UseAccountReturn<T extends object = Record<string, unknown>> {
  address: string | null;
  isLoading: boolean;
  error: Error | null;
  account: AccountInfo | null;
  getBalance: (tokens: IAsset[]) => Promise<BalanceFetchResult[]>;
  send: (params: TransactionParams) => Promise<TransactionResult>;
  sign: (message: string) => Promise<UseAccountResponse & { signature: string }>;
  verify: (
    message: string,
    signature: string,
  ) => Promise<UseAccountResponse & { verified: boolean }>;
  estimateFee: (params: TransactionParams) => Promise<Omit<TransactionResult, 'hash'>>;
  extension: () => T;
}

function useFakeAddressQuery(network: string, accountIndex: number, walletId: string | null) {
  return useQuery({
    queryKey: ['wdk-web-harness', 'address', walletId ?? '', network, accountIndex],
    queryFn: async () => {
      await delay(ADDRESS_LATENCY_MS);
      return fakeAddress(network, accountIndex);
    },
    enabled: !!walletId,
    staleTime: Infinity,
  });
}

export function useAccount<T extends object = Record<string, unknown>>(
  params: UseAccountParams,
): UseAccountReturn<T> {
  const activeWalletId = useHarness((s) => s.activeWalletId);
  const { network, accountIndex } = params;
  const { data: address, isLoading, error } = useFakeAddressQuery(network, accountIndex, activeWalletId);

  const account = useMemo<AccountInfo | null>(
    () =>
      activeWalletId && address
        ? { accountIndex, network, walletId: activeWalletId }
        : null,
    [activeWalletId, address, accountIndex, network],
  );

  const extensionObject = useMemo(
    () =>
      ({
        /** Token transfer path the app uses for USDT/USDT0. Fabricated. */
        transfer: async (_args: any) => {
          await delay(700);
          return { hash: fakeTxHash(network), fee: '0' };
        },
        getTransfers: async () => [],
      }) as unknown as T,
    [network],
  );

  return {
    address: address ?? null,
    isLoading,
    error: (error as Error) ?? null,
    account,
    getBalance: async (tokens) => {
      await delay(BALANCE_LATENCY_MS);
      return tokens.map((t) => ({
        success: true,
        network: t.getNetwork(),
        accountIndex,
        assetId: t.getId(),
        balance: fakeBalance(accountIndex, t.getId()),
      }));
    },
    send: async () => {
      await delay(900);
      return { success: true, hash: fakeTxHash(network), fee: '0' };
    },
    sign: async () => ({ success: true, signature: `0x${pick(seeded('sig'), HEX, 130)}` }),
    verify: async () => ({ success: true, verified: true }),
    estimateFee: async () => ({ success: true, fee: network === 'bitcoin' ? '1420' : '0' }),
    extension: () => extensionObject,
  };
}

function fakeTxHash(network: string): string {
  const rnd = seeded(`${network}:${Date.now()}:${Math.random()}`);
  return network === 'bitcoin' ? pick(rnd, HEX, 64) : `0x${pick(rnd, HEX, 64)}`;
}

export interface UseAddressesReturn {
  addresses: AddressInfoResult[];
  isLoading: boolean;
  error: Error | null;
}

export function useAddresses(opts: {
  networks: string[];
  accountIndices: number[];
}): UseAddressesReturn {
  const activeWalletId = useHarness((s) => s.activeWalletId);
  const { data, isLoading, error } = useQuery({
    queryKey: ['wdk-web-harness', 'addresses', activeWalletId ?? '', opts],
    queryFn: async () => {
      await delay(ADDRESS_LATENCY_MS);
      const out: AddressInfoResult[] = [];
      for (const network of opts.networks)
        for (const accountIndex of opts.accountIndices)
          out.push({ success: true, network, accountIndex, address: fakeAddress(network, accountIndex) });
      return out;
    },
    enabled: !!activeWalletId,
    staleTime: Infinity,
  });
  return { addresses: data ?? [], isLoading, error: (error as Error) ?? null };
}

// ── Balances ───────────────────────────────────────────────────────────────

export const balanceQueryKeys = {
  all: ['wdk-web-harness', 'balances'] as const,
  byWallet: (walletId: string, accountIndex: number) =>
    ['wdk-web-harness', 'balances', walletId, accountIndex] as const,
  byToken: (walletId: string, accountIndex: number, network: string, assetId: string) =>
    ['wdk-web-harness', 'balances', walletId, accountIndex, network, assetId] as const,
};

export function useBalance(accountIndex: number, asset: IAsset, options?: BalanceQueryOptions) {
  const activeWalletId = useHarness((s) => s.activeWalletId);
  return useQuery({
    queryKey: balanceQueryKeys.byToken(
      activeWalletId ?? '',
      accountIndex,
      asset.getNetwork(),
      asset.getId(),
    ),
    queryFn: async (): Promise<BalanceFetchResult> => {
      await delay(BALANCE_LATENCY_MS);
      return {
        success: true,
        network: asset.getNetwork(),
        accountIndex,
        assetId: asset.getId(),
        balance: fakeBalance(accountIndex, asset.getId()),
      };
    },
    enabled: options?.enabled !== false && !!activeWalletId,
    staleTime: options?.staleTime ?? 30_000,
    refetchInterval: options?.refetchInterval,
  });
}

export function useBalancesForWallet(
  accountIndex: number,
  assetConfigs: IAsset[],
  options?: BalanceQueryOptions,
) {
  const activeWalletId = useHarness((s) => s.activeWalletId);
  const query = useQuery({
    queryKey: [...balanceQueryKeys.byWallet(activeWalletId ?? '', accountIndex), 'all'],
    queryFn: async (): Promise<BalanceFetchResult[]> => {
      await delay(BALANCE_LATENCY_MS);
      return assetConfigs.map((asset) => ({
        success: true,
        network: asset.getNetwork(),
        accountIndex,
        assetId: asset.getId(),
        balance: fakeBalance(accountIndex, asset.getId()),
      }));
    },
    enabled: options?.enabled !== false && !!activeWalletId,
    staleTime: options?.staleTime ?? 30_000,
    refetchInterval: options?.refetchInterval,
  });
  return { ...query, isLoading: query.isLoading, error: (query.error as Error) ?? null };
}

export function useBalancesForWallets(
  accountIndices: number[],
  assetConfigs: IAsset[],
  options?: BalanceQueryOptions,
) {
  const activeWalletId = useHarness((s) => s.activeWalletId);
  const query = useQuery({
    queryKey: ['wdk-web-harness', 'balances-multi', activeWalletId ?? '', accountIndices],
    queryFn: async (): Promise<BalanceFetchResult[]> => {
      await delay(BALANCE_LATENCY_MS);
      return accountIndices.flatMap((accountIndex) =>
        assetConfigs.map((asset) => ({
          success: true,
          network: asset.getNetwork(),
          accountIndex,
          assetId: asset.getId(),
          balance: fakeBalance(accountIndex, asset.getId()),
        })),
      );
    },
    enabled: options?.enabled !== false && !!activeWalletId,
    staleTime: options?.staleTime ?? 30_000,
  });
  return { ...query, isLoading: query.isLoading, error: (query.error as Error) ?? null };
}

export function useRefreshBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await qc.invalidateQueries({ queryKey: balanceQueryKeys.all });
    },
  });
}

// ── Remaining public surface (unused by this starter, kept for parity) ─────

export function useProtocol(_params: unknown) {
  return { protocol: null, isLoading: false, error: null, extension: () => ({}) };
}

export type UseModuleProxy<T> = T;

export function useModule<T extends object = Record<string, unknown>>(
  _name?: string,
): UseModuleProxy<T> {
  return new Proxy({} as T, {
    get: () => async () => {
      throw new Error('[wdk web harness] useModule is not available on web');
    },
  });
}

export type ModuleEventListener = (...args: unknown[]) => void;

export const ModuleService = {
  call: async () => {
    throw new Error('[wdk web harness] ModuleService is not available on web');
  },
  addEventListener: () => () => {},
  removeEventListener: () => {},
};

/** A deliberately permissive check — the harness must accept whatever the
 *  demo types into the import screen. */
export function validateMnemonic(mnemonic: string): boolean {
  const words = mnemonic.trim().split(/\s+/).filter(Boolean);
  return words.length === 12 || words.length === 15 || words.length === 18 ||
    words.length === 21 || words.length === 24;
}
