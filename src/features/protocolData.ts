/**
 * The three feature screens (Swap, Earn, Pay) read their figures from here.
 *
 * Every number below was captured from a real mainnet run against Arbitrum One
 * (eip155:42161) with this wallet's own account, not invented for the UI. The
 * capture files live in `verify/captures/` one level up from this app:
 *
 *   swap   step2-swap-EXECUTED.json      quoteSwap + the swapMaxFee rejection
 *   earn   step4-supply-EXECUTED.json     supply receipt + getAccountData
 *   pay    03-x402-402-responses.json     the live 402 challenge
 *
 * On web the WDK worklet is stubbed (src/web-stubs/), so these screens render
 * the captured result rather than re-running the protocol call in a browser.
 * The shapes match what the real hooks return, so swapping the constant for a
 * live `useProtocol(...)` call is a one-line change per screen.
 */

export const SWAP_QUOTE = {
  chain: 'Arbitrum One',
  tokenIn: { symbol: 'USD₮0', amount: '1.000000', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
  tokenOut: { symbol: 'WBTC', amount: '0.00001171', address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f' },
  /** quoteSwap().fee, in wei. 0.00000319232 ETH. */
  feeWei: '3192320000000',
  feeEth: '0.00000319232',
  /** What swap() throws when the quoted fee reaches the cap the caller set. */
  capRejection: 'Exceeded maximum fee cost for swap operation.',
} as const;

/** The swap this wallet actually sent, from step2-swap-EXECUTED.json plus the fee and block as
 *  arbiscan reports them. The demo beats in the video walk quote -> submitting -> confirmed, and
 *  every figure on the confirmed card is from this receipt. */
export const SWAP_RESULT = {
  hash: '0x3a8bd07af959a20edc39303eeee7db5c33b1cdbe13ec6bcab7941cc2a58577a4',
  explorer: 'https://arbiscan.io/tx/0x3a8bd07af959a20edc39303eeee7db5c33b1cdbe13ec6bcab7941cc2a58577a4',
  block: '511603486',
  /** What the fee actually came to on chain, not the quote. */
  feeEthPaid: '0.000002974124118',
  feeUsdPaid: '0.008038',
  spender: 'Velora: Augustus V6.2',
  /** Real holdings either side of the swap: 5 USD₮0 in, 1 spent; WBTC arrives. */
  before: { usdt0: '5.000000', wbtc: '0.00000000' },
  after: { usdt0: '4.000000', wbtc: '0.00001171' },
} as const;

export const EARN_POSITION = {
  chain: 'Arbitrum One',
  protocol: 'Aave v3',
  supplied: { symbol: 'USD₮0', amount: '1.000000' },
  txHash: '0xd7ca3ebcbd2b9fd0ba0558966483d2b98f9aa2a4b512a006c540714ee00f83c5',
  /** getAccountData(). The …Base fields are 8-decimal USD; ltv and the
   *  threshold are basis points; healthFactor is 18-decimal. None of that is
   *  in WDK's docs — it was read off the live call. */
  totalCollateralUsd: '0.99983802',
  totalDebtUsd: '0',
  ltvPct: '75.00',
  liquidationThresholdPct: '78.00',
  /** 2^256-1: the sentinel Aave returns while the position carries no debt. */
  healthFactorIsMax: true,
  supplyAprPct: '3.236',
} as const;

/** The run that produced the position above, step by step — captures/step3-approve-aave-EXECUTED
 *  and step4-supply-EXECUTED. Two transactions, because the Aave module's supply() sends exactly
 *  one call (Pool.supply) and never approves: the allowance is on you. */
export const EARN_RESULT = {
  approveHash: '0x8013614ee86ca633ee81954592beb0a541a86af16645a961b8bfc7c74f0e3d7d',
  supplyHash: '0xd7ca3ebcbd2b9fd0ba0558966483d2b98f9aa2a4b512a006c540714ee00f83c5',
  explorer: 'https://arbiscan.io/tx/0xd7ca3ebcbd2b9fd0ba0558966483d2b98f9aa2a4b512a006c540714ee00f83c5',
  spender: 'Aave v3 Pool',
  feeEthPaid: '0.00000861908',
  /** The aToken is the receipt: interest accrues by the balance itself growing. */
  aToken: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
  aTokenBalance: '0.999998',
  before: { usdt0: '4.000000', supplied: '0.000000' },
  after: { usdt0: '3.000000', supplied: '0.999998' },
} as const;

/** The 402 this wallet actually paid. The resource server and the facilitator are both ours, and
 *  the screen says so: a public facilitator can be offline, rate-limited, or simply not carry the
 *  asset you want to pay in, so this demo ships its own example one rather than depending on a
 *  third party staying up. The payment itself is real money on mainnet.
 *
 *  One detail worth keeping, because it is what made a USD₮0 settlement work here: Arbitrum USD₮0
 *  is a proxy whose implementation has transferWithAuthorization, but the token does not expose
 *  `version()`. The EIP-712 domain was recovered by matching its on-chain DOMAIN_SEPARATOR —
 *  {name:'USD₮0', version:'1'} — and declared as `extra` (verify/scripts/probe-domain.mjs). */
export const PAY_CHALLENGE = {
  resource: 'http://127.0.0.1:8402/quote',
  method: 'GET',
  status: 402,
  scheme: 'exact',
  network: 'eip155:42161',
  chain: 'Arbitrum One',
  asset: 'USD₮0',
  amount: '0.01',
  selfHosted: true,
  /** EIP-3009 TransferWithAuthorization: the buyer only signs. The facilitator
   *  submits the transfer and pays the gas, which is why this flow needs no
   *  native token in the wallet. */
  signsOnly: true,
} as const;

/** The settlement, measured. verify/captures/07-x402-selfhost.json.
 *  buyerEthBefore === buyerEthAfter is the whole point of x402, and it is a measurement here,
 *  not a claim: the buyer signed, and somebody else paid the gas. */
export const PAY_RESULT = {
  hash: '0x5cf603367404c2ae29eb4fbd452458f50da7f0e4ae8644ca9112c431926a3ee6',
  explorer: 'https://arbiscan.io/tx/0x5cf603367404c2ae29eb4fbd452458f50da7f0e4ae8644ca9112c431926a3ee6',
  block: '511715623',
  submittedBy: '0x9b2a8d549bD9220d5b1E320d4AFe889d2244d03B',
  paidTo: '0xC119CFb03b0D24C8Af101B3b9F8e9384FfFadCC3',
  feeEthPaidByFacilitator: '0.00000207368',
  feeUsdPaidByFacilitator: '0.005601',
  buyerEthBefore: '0.000440346136688',
  buyerEthAfter: '0.000440346136688',
  before: { usdt0: '3.000000' },
  after: { usdt0: '2.990000' },
} as const;
