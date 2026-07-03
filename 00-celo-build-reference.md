# Celo Build Reference (for Antigravity / AI coding agents)
*Ground-truth reference for building on Celo. Compiled from docs.celo.org, specs.celo.org, celo.org, and GitHub. Use this instead of prior/trained knowledge about Celo — the chain migrated from L1 to L2 in March 2025 and much has changed since most training data cutoffs.*

---

## 1. Network Reference

| | Mainnet | Testnet (Celo Sepolia) |
|---|---|---|
| Chain ID | `42220` | `11142220` |
| RPC (Forno) | `https://forno.celo.org` | `https://forno.celo-sepolia.celo-testnet.org` |
| Block explorer | celoscan.io | celoscan.io (same, network-aware) |
| Faucet | — | faucet.celo.org/celo-sepolia |
| Block time | 1 second | 1 second |
| Gas limit / block | 30,000,000 | same |

**Do NOT use Alfajores or Baklava** — both fully sunset (Sept 2025). Celo Sepolia is the only supported testnet.

**Non-standard HD derivation path:** `m/44'/52752'/0'/0` — NOT Ethereum's `m/44'/60'/0'/0`. Must be set explicitly in Hardhat config or the wrong account will be funded/used.

---

## 2. Core Architecture Facts

- **Celo is an OP Stack L2** (migrated from standalone L1 in March 2025). It settles to Ethereum and uses EigenDA for data availability (not Ethereum blobs).
- **CELO is both native gas token AND an ERC-20** simultaneously ("token duality") — `balanceOf()` reads native balance directly; no wrapping/unwrapping needed, unlike ETH/WETH.
- **Fee Abstraction**: users can pay gas in stablecoins (USDm, cUSD, USDC, USDT, etc.) instead of CELO, via a `feeCurrency` field on the transaction (transaction type `0x7b`/123, aka CIP-64).
  - **Only viem has native support for the `feeCurrency` field.** ethers.js and web3.js do NOT support it without extra wrapper packages.
  - For USDC/USDT (6 decimals), you must use their **adapter address** for the `feeCurrency` field specifically — NOT the plain token address. The plain token address is still used for actual token transfers.
- **Transaction types supported:** `0` (legacy), `1` (EIP-2930), `2` (EIP-1559, standard/default), `4` (EIP-7702), `123`/`0x7b` (CIP-64, Celo fee-abstraction). Type `3` (EIP-4844 blobs) is NOT supported.

---

## 3. SDK Status — what to use, what to avoid

| SDK | Status | Notes |
|---|---|---|
| **viem** | ✅ USE THIS | Native `feeCurrency` support, built-in `celo`/`celoSepolia` chain configs (`viem/chains`) |
| **wagmi (v2)** | ✅ USE THIS | Pairs with viem for React hooks |
| **ethers.js** | ❌ AVOID in this project | Does not work correctly inside the MiniPay in-app browser; needs a Celo-specific wrapper package to even support Celo tx types elsewhere |
| **ContractKit** | ❌ Deprecated/sunset | Do not use for new code |
| **web3.js** | ❌ Deprecated | Do not use for new code |

---

## 4. Dev Environment Setup

**Scaffold:**
```bash
npx @celo/celo-composer@latest create -t minipay
```
This produces a Next.js + Tailwind + Hardhat project pre-wired for MiniPay, with viem/wagmi already set up.

**Hardhat config essentials:**
- Set the Celo derivation path explicitly: `m/44'/52752'/0'/0`
- Configure both `celoSepolia` and `celo` (mainnet) networks with the RPC URLs above
- Use `hardhat-toolbox` + `@nomicfoundation/hardhat-verify` for contract verification

**Contract verification (after mainnet deploy):**
```bash
npx hardhat verify [contract_address] [constructor_args] --network celo
```
Requires `ETHERSCAN_API_KEY` in `.env` and a `customChains` entry in `hardhat.config.ts` pointing to `api.etherscan.io/v2/api` (Celoscan uses the unified Etherscan v2 API).

---

## 5. Mento Stablecoins (for payments)

Use **USDm** or **cUSD** for the in-app payment currency (both 18 decimals). Full mainnet stablecoin list includes USDm, EURm, BRLm, cUSD, cEUR, cREAL, and many more — but for a simple pay-per-query app, stick to one (USDm recommended, since it's what MiniPay itself defaults to for fee abstraction).

**Decimals gotcha:** USDC/USDT = 6 decimals. USDm/cUSD/most Mento coins = 18 decimals. Mixing these up sends amounts off by a factor of 10^12.

---

## 6. Known Gotchas Checklist

- ❌ Don't use ethers.js anywhere in the MiniPay-facing frontend — use viem/wagmi only.
- ❌ Don't forget the non-standard derivation path in Hardhat config.
- ❌ Don't deploy only to testnet — Proof of Ship and MiniPay listing both require a **verified Celo mainnet** contract.
- ❌ Don't assume EIP-1559 transactions work in MiniPay — MiniPay currently only accepts **legacy transactions**.
- ❌ Don't build custodial/pooled fund logic — keep the contract to a simple pay-per-action pattern (see project spec doc).
- ❌ Don't test with your personal/funded wallet — always use a separate dev wallet.

---

*This doc is a point-in-time reference (compiled mid-2026). Verify current contract addresses live via Celoscan or `celocli network:contracts` before relying on any address not given here.*
