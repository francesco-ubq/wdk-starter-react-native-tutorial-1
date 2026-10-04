/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WEB-ONLY STUB for `@tetherto/wdk-indexer-http`.
 *
 * This one is NOT stubbed because the package is native-only — it is a
 * plain fetch client and would run fine in a browser. It is stubbed
 * because the Activity tab needs a *real, registered* WDK Indexer API key
 * (https://wdk-api.tether.io/register) and the harness has none. Without
 * this, Activity can only ever render its error state.
 *
 * What stays REAL: all of `src/wdk/indexer.ts` — the asset -> (blockchain,
 * token) mapping, the batch request construction, the response flattening,
 * the sort — plus all of `useWdkTransactions()` in
 * `src/wdk/hooks/useWalletData.ts`: direction derivation from from/to vs.
 * the active address, decimals formatting, fiat conversion, and the
 * Activity screen's own date grouping and chain filtering. Only the HTTP
 * round-trip is replaced.
 *
 * What is FAKE: the transfers themselves (hashes, counterparties, amounts,
 * timestamps, block numbers).
 */

export type Blockchain =
  | 'ethereum'
  | 'sepolia'
  | 'plasma'
  | 'arbitrum'
  | 'polygon'
  | 'tron'
  | 'ton'
  | 'bitcoin'
  | 'spark';

export type Token = 'usdt' | 'xaut' | 'btc';

export const BLOCKCHAINS: readonly Blockchain[] = [
  'ethereum', 'sepolia', 'plasma', 'arbitrum', 'polygon', 'tron', 'ton', 'bitcoin', 'spark',
];
export const TOKENS: readonly Token[] = ['usdt', 'xaut', 'btc'];

export interface TokenTransfer {
  blockchain: string;
  blockNumber: number;
  transactionHash: string;
  transferIndex: number;
  token: string;
  amount: string;
  timestamp: number;
  transactionIndex?: number | null;
  logIndex?: number | null;
  from?: string | null;
  to?: string | null;
  label?: string;
  [key: string]: unknown;
}

export interface TokenTransfersResponse {
  transfers: TokenTransfer[];
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export interface BatchTokenTransfersRequest {
  blockchain: Blockchain;
  token: Token;
  address: string;
  limit?: number;
}

export type BatchTokenTransfersResponseItem = TokenTransfersResponse | ApiError;

export class WdkIndexerError extends Error {}
export class WdkIndexerNetworkError extends WdkIndexerError {}

export function isApiError(response: unknown): response is ApiError {
  return typeof response === 'object' && response !== null && 'error' in (response as any);
}

export function isTokenTransfersResponse(
  item: BatchTokenTransfersResponseItem,
): item is TokenTransfersResponse {
  return typeof item === 'object' && item !== null && Array.isArray((item as any).transfers);
}

// ── fake data ──────────────────────────────────────────────────────────────

const HEX = '0123456789abcdef';
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

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

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/**
 * Per-(blockchain, token) fake history. `amount` is a human-readable
 * decimal string, which matches what the real API returns (see the long
 * comment in useWalletData.ts about NOT shifting by decimals here).
 * `timestamp` is in MILLISECONDS, also matching the real API.
 */
const SCRIPT: Record<string, Array<{ out: boolean; amount: string; agoMs: number }>> = {
  'bitcoin:btc': [
    { out: false, amount: '0.0250000', agoMs: 2 * HOUR },
    { out: true, amount: '0.0041200', agoMs: 1 * DAY + 5 * HOUR },
    { out: false, amount: '0.0213000', agoMs: 6 * DAY },
  ],
  'sepolia:usdt': [
    { out: false, amount: '1500.000000', agoMs: 40 * 60_000 },
    { out: true, amount: '125.500000', agoMs: 9 * HOUR },
    { out: false, amount: '468.000000', agoMs: 3 * DAY + 2 * HOUR },
  ],
  'arbitrum:usdt': [
    { out: false, amount: '932.400000', agoMs: 2 * DAY + 11 * HOUR },
    { out: true, amount: '60.000000', agoMs: 11 * DAY },
  ],
  'polygon:usdt': [
    { out: false, amount: '418.770000', agoMs: 5 * HOUR + 20 * 60_000 },
    { out: true, amount: '24.000000', agoMs: 17 * DAY },
  ],
};

function counterparty(blockchain: string, i: number): string {
  const rnd = seeded(`${blockchain}:counterparty:${i}`);
  return blockchain === 'bitcoin' ? `bc1q${pick(rnd, BECH32, 38)}` : `0x${pick(rnd, HEX, 40)}`;
}

function txHash(blockchain: string, i: number): string {
  const rnd = seeded(`${blockchain}:tx:${i}`);
  return blockchain === 'bitcoin' ? pick(rnd, HEX, 64) : `0x${pick(rnd, HEX, 64)}`;
}

export interface WdkIndexerConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class WdkIndexerClient {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly timeout: number;

  constructor(config: WdkIndexerConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://web-harness.invalid';
    this.timeout = config.timeout ?? 10_000;
    if (typeof console !== 'undefined') {
      console.warn(
        '[wdk web harness] @tetherto/wdk-indexer-http is STUBBED — Activity shows fabricated transfers.',
      );
    }
  }

  async health() {
    return { status: 'ok (web harness stub)', timestamp: new Date().toISOString() };
  }

  async getTokenTransfers(
    blockchain: Blockchain,
    token: Token,
    address: string,
  ): Promise<TokenTransfersResponse> {
    await new Promise((r) => setTimeout(r, 300));
    return { transfers: this.#build(blockchain, token, address) };
  }

  async getBatchTokenTransfers(
    requests: BatchTokenTransfersRequest[],
  ): Promise<BatchTokenTransfersResponseItem[]> {
    await new Promise((r) => setTimeout(r, 450));
    return requests.map((r) => ({
      transfers: this.#build(r.blockchain, r.token, r.address),
    }));
  }

  async getTokenBalance(blockchain: Blockchain, token: Token) {
    return { tokenBalance: { blockchain, token, amount: '0' } };
  }

  async getBatchTokenBalances(requests: Array<{ blockchain: Blockchain; token: Token }>) {
    return requests.map((r) => ({
      tokenBalance: { blockchain: r.blockchain, token: r.token, amount: '0' },
    }));
  }

  #build(blockchain: string, token: string, address: string): TokenTransfer[] {
    const script = SCRIPT[`${blockchain}:${token}`] ?? [];
    const now = Date.now();
    return script.map((s, i) => ({
      blockchain,
      token,
      blockNumber: 21_400_000 + i * 137,
      transactionHash: txHash(`${blockchain}:${token}`, i),
      transferIndex: 0,
      transactionIndex: i,
      logIndex: i,
      amount: s.amount,
      timestamp: now - s.agoMs,
      // The app derives direction by comparing `from` against the active
      // account's own address — so an "outgoing" transfer has to really
      // carry that address in `from`. That derivation stays real.
      from: s.out ? address : counterparty(`${blockchain}:${token}`, i),
      to: s.out ? counterparty(`${blockchain}:${token}`, i) : address,
    }));
  }
}

export default WdkIndexerClient;
