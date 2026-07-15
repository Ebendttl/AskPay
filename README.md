# AskPay

AskPay is a decentralized, pay-per-query AI assistant mini-app optimized for Celo's **MiniPay** wallet. By utilizing micro-payments powered by stablecoins (USDm), it eliminates monthly subscription models and sign-up forms, offering a pure utility-driven, secure, and instant chat experience.

---

## 🚀 Key Features

*   **Pay-per-Query Utility:** Users pay a flat fee per question (e.g., 0.01 USDm ≈ 1 US cent), transacting directly on Celo with near-zero gas costs.
*   **On-Chain Verification:** AI answers are only unlocked and streamed after the payment transaction is confirmed on-chain.
*   **AI Streaming & Resilient Retries:** Real-time streaming answers word-by-word with built-in retry mechanics for network interruptions (no double-charging for failed streams).
*   **Personal Usage Dashboard:** Built-in statistics page displaying total questions, USDm spent, average query times, wallet balance, and a responsive **custom SVG usage chart** showing query history over the last 14 days.
*   **Global Toast Notification System:** In-place loading state updates (checking allowance → approving → paying → confirmed), error details, and direct links to Celo Explorer.
*   **Onboarding Tour:** A beautiful 3-step interactive modal walkthrough for first-time visitors to explain the mechanics of pay-per-use, blockchain interactions, and wallet setup.
*   **Referral & Rewards System:** Auto-generates a unique referral link (`/?ref=<wallet-address>`) for sharing, localized in multiple languages.
*   **Localization (i18n):** Complete application context and translation support for **English** and **Swahili** (Kiswahili).
*   **Dark/Light Mode Engine:** A system-aware theme provider that persists to `localStorage` and integrates directly with RainbowKit for color consistency without theme-flash issues.
*   **Admin telemetry & security:** Owner-gated dashboard page to track total contract transactions, volume, and in-memory IP-based rate limiter logs for bot prevention.

---

## 🛠️ Tech Stack & Architecture

### Web Application (`/askpay-app/apps/web`)
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS, CSS Variables (for full HSL theme support), Lucide icons
- **Web3 Integrations:** Wagmi v2, Viem, RainbowKit, Celo Provider
- **State Management:** React Context (Theme, Languages, Global Toast Notifications)
- **Testing:** Vitest + React Testing Library + JSDOM

### Smart Contracts (`/askpay-app/apps/contracts`)
- **Language:** Solidity v0.8.28
- **Tooling:** Hardhat, Hardhat Ignition
- **Contracts:**
  - `PayPerQuery.sol`: Handles registration, fee administration, owner withdrawals, and emits indexed `QueryPaid` events.
  - `MockERC20.sol`: Test token representing USDm on Celo Sepolia testnet.

---

## 📦 Directory Structure

```
AskPay/
├── MEMORY.md                        # Active project developer log
├── README.md                        # Main documentation (this file)
└── askpay-app/                      # Monorepo directory
    ├── apps/
    │   ├── web/                     # Next.js 14 frontend application
    │   └── contracts/               # Solidity Hardhat environment
    └── node_modules/                # Workspace dependencies
```

---

## ⚙️ Smart Contract Deployments

| Network | Contract | Address |
|---|---|---|
| **Celo Sepolia** | `PayPerQuery` | `0x0c77e53D988059773D6E18396D449e86cF876687` |
| **Celo Sepolia** | `MockERC20` (USDm) | `0x3c839797BA135457Eca83f8C20f2335A817899b5` |
| **Celo Mainnet** | `PayPerQuery` | *Configured for deployment* |

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js >= 18
- pnpm >= 8

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Ebendttl/AskPay.git
cd AskPay/askpay-app
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file inside `apps/web/`:
```env
# RPC
CELO_RPC_URL=https://forno.celo.org

# WalletConnect Project ID (Obtain from cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=d541ab3adedb91fe183d69ac5538f7ce

# Contract Addresses (Sepolia)
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x0c77e53D988059773D6E18396D449e86cF876687
NEXT_PUBLIC_USDM_ADDRESS_SEPOLIA=0x3c839797BA135457Eca83f8C20f2335A817899b5

# Mainnet (Leave blank or fill when deploying to Celo mainnet)
NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET=
NEXT_PUBLIC_USDM_ADDRESS_MAINNET=

# Toggle Network Selection: "sepolia" or "mainnet"
NEXT_PUBLIC_NETWORK=sepolia
```

For the smart contracts workspace (`apps/contracts/`), create a `.env` file:
```env
CELO_SEPOLIA_RPC_URL=https://alfajores-forno.celo-testnet.org
CELO_MAINNET_RPC_URL=https://forno.celo.org
PRIVATE_KEY=your_private_key_here
```

### 3. Run Development Server
```bash
pnpm --filter web dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

### Running Frontend Tests
We use Vitest to run component and utility tests:
```bash
pnpm --filter web test
```

### Running Smart Contract Tests
We use Hardhat + Mocha/Chai for solidity unit tests:
```bash
pnpm --filter hardhat test
```

---

## 🚀 Building & Production Deployment

To run a production-ready build for the web application:
```bash
pnpm build
```

This compiles static pages, sets up asset caching, and optimizes bundle assets. The Next.js routing maps out:
- `/` - Main Chat Box & Payment Interface
- `/dashboard` - Personalized analytics and query history
- `/referrals` - Referral sharing card
- `/admin` - Telemetry logs and contract analytics dashboard
- `/how-it-works` - FAQ and protocol details

---

## 📜 License

This project is licensed under the MIT License.