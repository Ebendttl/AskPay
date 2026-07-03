# AskPay — Project Spec
*Pay-per-use AI chat mini app for MiniPay on Celo. This doc defines what to build, in what order. Read alongside `00-celo-build-reference.md` and `02-minipay-integration-checklist.md`.*

---

## What this app does

A user opens AskPay inside MiniPay → wallet auto-connects → user types a question → pays a small stablecoin fee on-chain (e.g. $0.01–0.05 USDm) → payment is verified → an LLM answers the question → answer is shown. No subscription, no account creation — pure pay-as-you-go.

---

## Tech stack (fixed — do not substitute)

- **Frontend:** Next.js (from celo-composer minipay scaffold), Tailwind CSS
- **Chain interaction:** viem + wagmi v2 ONLY (see build reference doc §3 — no ethers.js)
- **Smart contract:** Solidity, Hardhat, deployed to Celo mainnet (test on Celo Sepolia first)
- **Payment currency:** USDm (18 decimals)
- **LLM backend:** Next.js API route, calling a free/cheap-tier LLM API (Groq or Gemini — key provided via env var, never hardcoded)

---

## Smart contract spec: `PayPerQuery.sol`

Keep this deliberately simple — a payment gate, not a DeFi primitive. This is intentional: Proof of Ship discourages solo-builder DeFi apps due to audit/regulatory overhead, and simplicity = fewer bugs = safer solo ship.

**Required behavior:**
1. `askQuestion(uint256 queryId)` — payable-equivalent function. Accepts payment via `transferFrom` on the USDm token contract (user must `approve` the contract first) for a fixed or owner-configurable fee amount.
2. On successful payment, emit event: `event QueryPaid(address indexed payer, uint256 amount, uint256 indexed queryId, uint256 timestamp);`
3. `withdraw()` — owner-only function to withdraw accumulated USDm balance to the owner's address.
4. `setFee(uint256 newFee)` — owner-only function to adjust the per-query price.
5. Use OpenZeppelin's `Ownable` for access control and `IERC20` interface for the USDm token — don't hand-roll these.

**Explicitly NOT in scope for this contract:**
- No pooled/custodial fund holding beyond immediate withdrawal
- No staking, lending, or yield logic
- No upgradability/proxy pattern needed — keep it a single simple deployed contract for this MVP

**Testing requirements before mainnet deploy:**
- Test successful payment + event emission
- Test rejection when payment amount is insufficient (i.e., `approve` amount too low)
- Test that only the owner can call `withdraw()` and `setFee()`
- Deploy and manually verify on Celo Sepolia FIRST, confirm working end-to-end from the frontend, THEN deploy to mainnet

---

## Frontend flow

1. On load, detect MiniPay via `window.ethereum.isMiniPay` (see MiniPay checklist doc). If true, skip any custom "Connect Wallet" UI — MiniPay auto-connects.
2. Simple chat-style UI: text input for the question, a "Ask (costs $X USDm)" button.
3. On button click:
   a. Check/request USDm `approve` for the contract (if not already approved for at least the fee amount)
   b. Call `askQuestion(queryId)` on the contract via wagmi's `useWriteContract`
   c. Show a pending state while the transaction confirms
   d. On confirmation, call the backend API route with the queryId + tx hash
4. Backend API route (`/api/ask`):
   a. Verify the `QueryPaid` event exists on-chain for that queryId + tx hash (via viem's `getLogs` or `waitForTransactionReceipt` + log parsing) — this is the actual payment verification, don't trust the frontend claim alone
   b. If verified, call the LLM API with the user's question
   c. Return the answer to the frontend
5. Display the answer.

---

## Build phases (work through in order, commit after each)

- **Phase 1:** Scaffold via celo-composer, confirm MiniPay hook present, initial commit.
- **Phase 2:** Write + test `PayPerQuery.sol`, deploy to Celo Sepolia, manual test.
- **Phase 3:** Build frontend chat UI + wagmi payment wiring (Sepolia contract).
- **Phase 4:** Build backend API route (payment verification + LLM call).
- **Phase 5:** Extract MiniPay-payment-verification logic into a standalone npm package (see below).
- **Phase 6:** Deploy `PayPerQuery.sol` to Celo mainnet, verify on Celoscan, update frontend to point to mainnet contract + chain config.
- **Phase 7:** Write/update README to accurately reflect what's implemented.

---

## The npm package (Phase 5 — separate scoring lever)

Extract the "verify a Celo/MiniPay stablecoin payment via on-chain event" logic into its own small, documented package (e.g. `use-minipay-paygate`). This should be genuinely reusable by any MiniPay builder wanting to gate content behind a small payment — not tightly coupled to AskPay's specific question/answer flow. Publish to npm with its own README and a minimal usage example.

---

## Environment variables needed

```
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=
NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET=
NEXT_PUBLIC_USDM_ADDRESS_MAINNET=
LLM_API_KEY=
LLM_API_PROVIDER=   # e.g. "groq" or "gemini"
```

---

## Definition of done (for Proof of Ship submission)

- [ ] Contract deployed on Celo **mainnet** and **verified** on Celoscan
- [ ] Frontend fully functional end-to-end on mainnet (not just Sepolia)
- [ ] MiniPay hook implemented (booster points)
- [ ] GitHub repo public, README accurately reflects implementation
- [ ] npm package published (bonus scoring lever)
- [ ] Real, distinct users have transacted (not just self-testing)
