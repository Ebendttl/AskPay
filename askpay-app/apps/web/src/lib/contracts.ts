/**
 * contracts.ts
 *
 * Contract addresses (read from env vars — never hardcoded) and
 * trimmed ABIs for the functions used by the frontend.
 *
 * Addresses:
 *  - NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA  → PayPerQuery on Celo Sepolia
 *  - NEXT_PUBLIC_USDM_ADDRESS_SEPOLIA      → MockERC20 (USDm stand-in) on Celo Sepolia
 *
 * Phase 6 will add mainnet equivalents without touching this logic.
 */

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

import { celo, celoSepolia } from "wagmi/chains";

export const PAYPERQUERY_ADDRESS_SEPOLIA =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA as `0x${string}`) ?? "0x";

export const USDM_ADDRESS_SEPOLIA =
  (process.env.NEXT_PUBLIC_USDM_ADDRESS_SEPOLIA as `0x${string}`) ?? "0x";

export const PAYPERQUERY_ADDRESS_MAINNET =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET as `0x${string}`) ?? "0x";

export const USDM_ADDRESS_MAINNET =
  (process.env.NEXT_PUBLIC_USDM_ADDRESS_MAINNET as `0x${string}`) ?? "0x";

export const NEXT_PUBLIC_NETWORK = process.env.NEXT_PUBLIC_NETWORK || "sepolia";

export const ACTIVE_NETWORK = NEXT_PUBLIC_NETWORK === "mainnet" ? "mainnet" : "sepolia";
export const ACTIVE_CHAIN = ACTIVE_NETWORK === "mainnet" ? celo : celoSepolia;

export const PAYPERQUERY_ADDRESS =
  ACTIVE_NETWORK === "mainnet"
    ? PAYPERQUERY_ADDRESS_MAINNET
    : PAYPERQUERY_ADDRESS_SEPOLIA;

export const USDM_ADDRESS =
  ACTIVE_NETWORK === "mainnet"
    ? USDM_ADDRESS_MAINNET
    : USDM_ADDRESS_SEPOLIA;

// ---------------------------------------------------------------------------
// PayPerQuery ABI — only the selectors needed by the UI
// ---------------------------------------------------------------------------

export const PAY_PER_QUERY_ABI = [
  // View: read the current per-query fee (18-decimal USDm amount)
  {
    inputs: [],
    name: "fee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write: pay and record a query
  {
    inputs: [{ internalType: "uint256", name: "queryId", type: "uint256" }],
    name: "askQuestion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Event emitted on successful payment (used in Phase 4 for backend verification)
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "address", name: "payer",     type: "address"  },
      { indexed: false, internalType: "uint256", name: "amount",    type: "uint256"  },
      { indexed: true,  internalType: "uint256", name: "queryId",   type: "uint256"  },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256"  },
    ],
    name: "QueryPaid",
    type: "event",
  },
  // View: OZ Ownable — returns the current contract owner address
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ---------------------------------------------------------------------------
// Known deployment blocks — used to bound getLogs queries so public RPCs
// don't time out scanning from genesis. Set to 0n as a safe fallback if
// the exact block is unknown (slower but correct).
// ---------------------------------------------------------------------------

/** Approximate block at which PayPerQuery.sol was deployed on Celo Sepolia. */
export const DEPLOY_BLOCK_SEPOLIA = BigInt(
  process.env.NEXT_PUBLIC_DEPLOY_BLOCK_SEPOLIA ?? "0"
);

/** Approximate block at which PayPerQuery.sol was deployed on Celo Mainnet. */
export const DEPLOY_BLOCK_MAINNET = BigInt(
  process.env.NEXT_PUBLIC_DEPLOY_BLOCK_MAINNET ?? "0"
);

/** The deploy block for the currently active network. */
export const DEPLOY_BLOCK =
  ACTIVE_NETWORK === "mainnet" ? DEPLOY_BLOCK_MAINNET : DEPLOY_BLOCK_SEPOLIA;


// ---------------------------------------------------------------------------
// ERC20 ABI — only allowance + approve
// ---------------------------------------------------------------------------

export const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "owner",   type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value",   type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
