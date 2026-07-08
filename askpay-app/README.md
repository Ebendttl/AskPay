# AskPay

> Pay-per-use AI chat mini app for MiniPay on Celo

AskPay lets a user open the app inside MiniPay, type a question, pay a small stablecoin fee on-chain, and get an AI answer — no account creation, no subscription. Each question costs ~$0.01 USDm.

---

## How it works

```
User → types question
      → pays fee (0.01 USDm) via PayPerQuery.sol
      → backend verifies QueryPaid event on-chain
      → LLM (Gemini or Groq) answers
      → answer shown in chat UI
```

1. **Wallet connect** — In MiniPay, `window.ethereum.isMiniPay` is detected and the wallet auto-connects. Outside MiniPay a RainbowKit connect button is shown.
2. **Fee read** — The UI reads the current fee live from `PayPerQuery.fee()` — never hardcoded.
3. **Payment** — If USDm allowance is below the fee, an `approve` tx is sent first. Then `askQuestion(queryId)` is called.
4. **Backend verification** — `/api/ask` fetches the transaction receipt via viem, parses the `QueryPaid` event, checks the `queryId` matches, then calls the LLM.
5. **Answer** — Displayed in the chat interface.

---

## Monorepo structure

```
askpay-app/
├── apps/
│   ├── web/                    # Next.js 14 frontend + /api/ask backend route
│   └── contracts/              # Hardhat — PayPerQuery.sol + MockERC20.sol
└── packages/
    └── use-minipay-paygate/    # Standalone npm package for on-chain payment verification
```

---

## Smart contracts

| Contract | Network | Address |
|---|---|---|
| MockERC20 (USDm stand-in) | Celo Sepolia | `0x3c839797BA135457Eca83f8C20f2335A817899b5` |
| PayPerQuery | Celo Sepolia | `0x0c77e53D988059773D6E18396D449e86cF876687` |
| PayPerQuery | Celo Mainnet | _(Phase 6 — see below)_ |

**`PayPerQuery.sol`** is a deliberately minimal payment gate:
- `askQuestion(uint256 queryId)` — pulls `fee` USDm via `transferFrom`, emits `QueryPaid`
- `withdraw()` — owner only, drains accumulated balance
- `setFee(uint256)` — owner only, adjusts price
- No proxy pattern, no pooled funds, no DeFi logic

---

## npm package — `use-minipay-paygate`

A standalone, reusable package that any MiniPay builder can use to verify on-chain stablecoin payments without being coupled to AskPay's specific flow.

Located at `packages/use-minipay-paygate/`. See its own [README](packages/use-minipay-paygate/README.md) for usage examples.

**Quick example:**

```typescript
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { verifyPayment } from "use-minipay-paygate";

const result = await verifyPayment({
  publicClient: createPublicClient({ chain: celo, transport: http("https://forno.celo.org") }),
  txHash: "0x...",
  expectedReceiver: "0xYourContractAddress",
  customEvent: {
    abi: PayPerQueryABI,
    eventName: "QueryPaid",
    verifyArgs: (args) => args.queryId === expectedQueryId,
  },
});
```

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Wallet / Chain | viem + wagmi v2 (no ethers.js) |
| Smart contracts | Solidity 0.8.28, Hardhat, Hardhat Ignition |
| Payment token | USDm (18 decimals) |
| LLM backend | Next.js API route → Gemini 1.5 Flash or Groq llama3 |
| Monorepo | Turborepo + pnpm workspaces |

---

## Local development

### Prerequisites

- Node.js 20+
- pnpm 9+

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

**`apps/web/.env.local`**

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_wc_project_id>
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x0c77e53D988059773D6E18396D449e86cF876687
NEXT_PUBLIC_USDM_ADDRESS_SEPOLIA=0x3c839797BA135457Eca83f8C20f2335A817899b5
NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET=<mainnet_address_after_phase_6>

# LLM — set one of:
LLM_API_PROVIDER=gemini   # or: groq
LLM_API_KEY=<your_key>
```

**`apps/contracts/.env`** (only needed for contract deployment/verification)

```env
PRIVATE_KEY=<deployer_private_key>
ETHERSCAN_API_KEY=<celoscan_api_key>
```

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Connect a wallet (or open in MiniPay).

---

## Contract deployment

### Celo Sepolia (testnet — already deployed)

```bash
cd apps/contracts

# Deploy
npx hardhat ignition deploy ignition/modules/PayPerQueryWithMock.ts --network celo-sepolia

# Verify
npx hardhat verify <MockERC20_address> --network celo-sepolia
npx hardhat verify <PayPerQuery_address> <usdm_address> <fee> --network celo-sepolia
```

### Celo Mainnet (Phase 6)

```bash
cd apps/contracts

# Deploy using real USDm (0x765DE816845861e75A25fCA122bb6898B8B1282a)
npx hardhat ignition deploy ignition/modules/PayPerQueryMainnet.ts --network celo

# Verify on Celoscan
npx hardhat verify <PayPerQuery_address> 0x765DE816845861e75A25fCA122bb6898B8B1282a 10000000000000000 --network celo
```

After mainnet deploy, set `NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET` in `apps/web/.env.local` and update the chain target in `apps/web/src/hooks/useAskPay.ts`.

---

## Available scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build all packages (Turbo) |
| `pnpm type-check` | TypeScript check (apps/web) |
| `pnpm --filter use-minipay-paygate build` | Build the npm package |

---

## MiniPay integration

- Detects `window.ethereum.isMiniPay` on load — hides connect button, auto-connects
- All transactions use standard EIP-1559 compatible format (MiniPay handles gas)
- Payment token is USDm — the same token MiniPay defaults to for fee abstraction
- Only viem/wagmi used — no ethers.js (per MiniPay compatibility requirements)

---

## Proof of Ship checklist

- [x] Contract deployed on Celo Sepolia, verified on Celoscan
- [ ] Contract deployed on Celo **mainnet**, verified on Celoscan _(Phase 6)_
- [x] Frontend end-to-end on Sepolia
- [ ] Frontend switched to mainnet _(Phase 6)_
- [x] MiniPay hook implemented (`useMiniPay`)
- [x] `use-minipay-paygate` npm package with README and usage examples
- [x] GitHub repo public
- [ ] README accurately reflects implementation ✅ _(this file)_
