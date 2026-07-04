# AskPay / Celo Proof of Ship — Session Handoff Document
*Comprehensive state capture as of this point in the project. Paste this into a new chat's project knowledge base to continue seamlessly without re-explaining context.*

---

## 1. The Goal

Building **AskPay**, a pay-per-use AI chat mini app for MiniPay on Celo, to compete in **Celo's Proof of Ship** monthly builder program. Primary objective: **rank in the Top 10** of the monthly leaderboard for maximum reward share. Season 2 runs April–July 2026; current cycle is July 2026 (submissions Jul 1–27, review Jul 28–31, leaderboard finalized + payout Jul 31).

**Builder identity:**
- GitHub: `Ebendttl`
- Talent Protocol profile: `talent.app/Ebendttl` (Talent ID `e2b12b...04d8d9`)
- Repo: `github.com/Ebendttl/AskPay` (public, MIT licensed)
- Location: Lagos, Nigeria

---

## 2. What AskPay Actually Is

A mobile-first mini app for MiniPay (Opera's stablecoin wallet, 14M+ wallets across 60+ countries) where a user pays a small stablecoin fee per AI question/answer — pay-as-you-go instead of subscriptions. Flow: user opens app in MiniPay → wallet auto-connects → types a question → pays a small on-chain fee → payment verified → LLM answers → response shown.

**Why this concept was chosen:** Proof of Ship's own docs explicitly name "AI Agents with use cases for MiniPay (including 'pay as you go' access to LLMs and image creation tools, as an alternative to subscriptions)" as a wanted category. It also avoids the explicitly discouraged "solo-builder DeFi app" pattern (regulatory/audit burden), since funds move through instantly rather than being pooled/held.

---

## 3. Proof of Ship — Exact Scoring & Eligibility Rules (verified from official FAQ)

**Scoring is based STRICTLY on three data sources — nothing else counts:**
1. **Onchain activity on Celo mainnet**: fees generated, transaction count, unique active users (via deployed, verified contract)
2. **GitHub development activity**: unique days with contributions, total number of contributions, MiniPay-specific dependencies/code usage
3. **NPM package downloads**: for any package published from the registered repository

**Hard eligibility requirements:**
- Project deployed on **Celo Mainnet** (not just testnet) with **verified** smart contract(s)
- Open source, public GitHub repo (private repos now supported for activity tracking, but public is the norm)
- Project must NOT already be listed on MiniPay (this program is for pre-listing validation only)
- Code is the IP of the builder's team, but must stay open source for tracking

**MiniPay hook is a BOOSTER, not mandatory** — but easy to add and directly extends reach to MiniPay's user base, so included anyway.

**What's explicitly wanted:** Games, utility apps, AI agents with MiniPay use cases, B2C onboarding apps.
**What's explicitly discouraged:** demos, farming tools, engagement bots, solo-builder DeFi apps, reward-farming apps, low-effort NFT/GM deploys.

**Reward structure:**
- $5,000 USDT pool/month, split among Top 50, proportional to score
- Top 10 share 50% of the pool
- Top 3 get 15-min priority mentor access
- Monthly #1 gets a one-time (per season) user-incentive/badge bonus
- **Cap: 2,000 USDT per project across the entire season** (Apr–Jul 2026)
- Leaderboard updates **weekly** — track via `celo.builderscore.xyz` and the talent.app project page

**Registration flow (already completed):**
1. Builder profile on talent.app ✅
2. Project page created ("AskPay") ✅
3. Category set: "Fintech & Payments" ✅
4. GitHub repo connected to project ✅
5. Contract address — pending (Phase 2 not yet deployed)
6. Registered for active Proof of Ship campaign — assumed done via Submit Project flow (verify if uncertain)

**Important nuance on commit strategy:** There is NO commit quota/budget to ration. "Unique days with contributions" is what matters — commit whatever logical chunks each day's real work produces, don't artificially withhold or force a fixed number. Group commits by logical purpose (e.g., "tooling config," "contract scaffold," "frontend source"), not by an arbitrary count.

**Talent Protocol sync delay:** Commits can take **hours** (not minutes) to reflect on the Talent Protocol Impact dashboard, even after confirmed on GitHub. This was tested and verified — don't panic-check repeatedly.

---

## 4. Tech Stack (fixed, do not deviate)

- **Frontend:** Next.js 14 (via celo-composer scaffold), Tailwind CSS, TypeScript, monorepo via pnpm + Turborepo
- **Chain interaction:** viem + wagmi v2 **ONLY** — ethers.js does NOT work correctly inside the MiniPay in-app browser and must never be used
- **Smart contract:** Solidity 0.8.28, Hardhat, deployed to Celo mainnet after Celo Sepolia testing
- **Payment currency:** USDm/cUSD (18 decimals) — do not confuse with USDC/USDT (6 decimals)
- **LLM backend:** Next.js API route calling a free/cheap-tier LLM API (Groq or Gemini — not yet chosen/configured)

---

## 5. Celo Network Reference

| | Mainnet | Testnet |
|---|---|---|
| Chain ID | `42220` | `11142220` |
| RPC | `https://forno.celo.org` | `https://forno.celo-sepolia.celo-testnet.org` |
| Explorer | celoscan.io | celoscan.io (network-aware) |
| Network name used | "Celo Mainnet" | "Celo Sepolia Testnet" |

**Non-standard HD derivation path:** `m/44'/52752'/0'/0` — required only if deriving from a mnemonic via Hardhat/CLI config. A normal MetaMask account created via UI doesn't need special handling.

**Do NOT use Alfajores or Baklava** — both sunset Sept 2025.

**Key architectural facts:** Token duality (CELO native + ERC-20 simultaneously), Fee Abstraction (pay gas in stablecoins via `feeCurrency` field, tx type `0x7b`/123, viem-only support), MiniPay currently only supports USDm as fee currency and only accepts legacy (non-EIP-1559) transactions.

*(A separate, more exhaustive general Celo build-reference doc — covering full protocol/governance/tooling/SDK history — was created earlier in this project and should already be in the repo as `00-celo-build-reference.md`. This handoff doc focuses on AskPay-specific state.)*

---

## 6. Wallet Setup State (current, verified correct)

**Main wallet (MetaMask "Account 1"):**
- Address: `0x23cb7...6eC84` (full: `0x23cb...a6ec84`)
- This is the address already verified on Talent Protocol and used for the "Deploy on Celo" task connection
- Holds real reputation/identity — never use for dev/testing

**Dev wallet (MetaMask "AskPay Dev"):**
- Address: `0x84507c59f68DD8824a47F8D7F84eCa76...` (full address available in wallet, not repeated here for safety)
- Funded with 30 testnet CELO via faucet.celo.org/celo-sepolia (GitHub-authenticated 10x claim)
- **Private key has been rotated at least once** after being inadvertently shown in a screenshot mid-conversation — always treat any key that's appeared in a screenshot/chat as burned and rotate immediately
- This is the account whose private key goes into `apps/contracts/.env` for Hardhat deployment

**Other addresses in the wallet (NOT usable for Celo):**
- `SP3ARG...CDG5ZW`, `SP28NF...T7DTK4` — Stacks (Bitcoin L2) addresses, wrong chain entirely, ignore

**MetaMask networks configured (verified correct chain IDs after initial confusion):**
- "Celo Mainnet" → RPC "Forno" (`forno.celo.org`) → Chain ID `42220` ✅
- "Celo Sepolia Testnet" → RPC "Forno Sepolia" (`forno.celo-sepolia.celo-testnet.org`) → Chain ID `11142220` ✅

*(Note: there was a real mix-up mid-setup where a screenshot appeared to show Chain ID 11142220 under a "Celo Mainnet" label — this was fully investigated and resolved; both networks are now confirmed correctly paired.)*

---

## 7. Environment File Setup (current, correct state)

**Critical architectural fact discovered:** Hardhat (in `apps/contracts/`) and Next.js (in `apps/web/`) run from different working directories and load **completely separate** `.env` files. Hardhat uses its built-in dotenv integration to read `.env` from the **same directory as `hardhat.config.ts`** — i.e., `apps/contracts/.env`. It does NOT read `apps/web/.env.local`, and vice versa.

**Correct current state:**
- **`apps/contracts/.env`** (real file, gitignored) — contains real `PRIVATE_KEY` (rotated dev wallet key) and real `ETHERSCAN_API_KEY` (Celoscan key, not rotated — deemed low-risk since it's read-only API access, not a signing key)
- **`apps/contracts/.env.example`** (committed template) — placeholders restored (`PRIVATE_KEY=your_private_key_here`, `ETHERSCAN_API_KEY=your_celoscan_api_key_here`) — verified via `git show 29e42c1:...` that the ORIGINAL committed version also had blank placeholders, so nothing sensitive ever entered git history
- **`apps/web/.env.local`** — `PRIVATE_KEY` was mistakenly added here early on and has been **removed** — the frontend never needs a private key; users sign with their own wallets in-browser. This file should only contain: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (real value: `d541ab3adedb91fe183d69ac5538f7ce`, from Reown/WalletConnect Cloud, team "AkinseindeLabs", project "AskPay"), `CELO_RPC_URL`, and similar public/frontend-safe vars.

**`.gitignore` coverage confirmed:** Root `.gitignore` lists `.env`, `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local` — these patterns apply at any depth in the repo, so both `apps/contracts/.env` and `apps/web/.env.local` are protected. `apps/contracts/` also has its own nested `.gitignore` from the Hardhat template listing `.env` again (double coverage).

**Verification method used:** `git status` from repo root shows "nothing to commit, working tree clean" when real `.env` files exist but aren't tracked — this is the expected/correct signal.

---

## 8. Git/Repo State & History

**Repo structure:** `AskPay/` (root, contains the 4 knowledge-base .md docs + LICENSE + README) → `askpay-app/` (the actual celo-composer monorepo) → `apps/contracts/` (Hardhat) + `apps/web/` (Next.js).

**Known incident (resolved):** celo-composer's scaffold command auto-ran its own `git init` inside `askpay-app/`, creating a **nested git repository** invisible to the outer repo. This caused Phase 1's first "commit" (as claimed by Antigravity) to never actually reach GitHub or Talent Protocol. Diagnosed via `git status` showing `askpay-app/` as a single untracked blob rather than individual files. Fixed via `rm -rf askpay-app/.git`, then re-added and committed everything properly into the outer repo on `main`.

**Commit history so far (10 total commits on `main`, all pushed):**
1. `37426bb` — Initial commit
2. `fb02486` — docs: Add a build reference guide
3. `648aeb4` — docs: Add project specification
4. `20a39b7` — docs: Add Minipay integration checklist
5. `9feb3fc` — docs: Add proof of ship scoring list
6. `5076399` — chore: initialize monorepo tooling and workspace config
7. `acab725` — docs: add scaffold README
8. `29e42c1` — feat: scaffold Hardhat contracts workspace via celo-composer
9. `8c60405` — chore: scaffold Next.js web app configuration
10. `8e2ef70` — feat: scaffold frontend with MiniPay detection hook, wallet provider, and base UI components

**Established commit/push workflow rules (told directly to Antigravity):**
- **Antigravity must NEVER run `git push`** — the builder does this manually after reviewing changes
- Commits should be grouped logically by purpose (e.g., 4-5 meaningful commits per phase), not one giant commit and not dozens of trivial ones
- Antigravity should confirm proposed commit grouping before running `git commit`
- Antigravity should verify git state via `git log`/`git status` itself rather than assuming — this was necessitated by the nested-git incident where it incorrectly believed a commit had happened

**4 knowledge-base docs committed to the repo root** (for Antigravity to read before building, treated as ground truth over its own training knowledge):
1. `00-celo-build-reference.md` — general exhaustive Celo technical reference
2. `01-askpay-project-spec.md` — AskPay-specific architecture, contract spec, build phases
3. `02-minipay-integration-checklist.md` — MiniPay-specific gotchas (viem-only, testing via ngrok, decimals, etc.)
4. `03-proof-of-ship-scoring-checklist.md` — exact scoring rules tied to build decisions

---

## 9. Build Phases — Status

**PHASE 1: COMPLETE.** Scaffolded via `celo-composer -t minipay`. Confirmed: MiniPay detection hook (`useMiniPay.ts`, used by `ConnectButton`), wallet provider config (viem + wagmi v2, both `celo` and `celoSepolia` chains configured), Hardhat config (fixed to use quoted network name keys, Celoscan verify config pointing to Etherscan V2 API), TypeScript checks passing clean, dev server runs successfully at localhost:3000. Confirmed working live in browser (screenshot showed "Welcome to askpay-app" landing page with "Built on Celo" badge and Connect Wallet button).

**PHASE 2: NOT YET STARTED.** Next up: write `PayPerQuery.sol`, Hardhat test suite (payment + event emission, insufficient-payment rejection, owner-only withdrawal), deploy to Celo Sepolia, manual testing.

**PHASE 3-7: NOT STARTED.** Frontend chat UI + payment wiring → Backend API route (payment verification + LLM call) → npm package extraction (`use-minipay-paygate`) → Mainnet deploy + Celoscan verification → Final README.

**Full original phase-by-phase build prompt (already given to Antigravity once for Phase 1, should be re-referenced/re-issued as needed for subsequent phases):**

```
PROJECT: AskPay — Pay-per-use AI chat mini app for MiniPay on Celo

CONTEXT: Building to submit to Celo's "Proof of Ship" monthly builder program,
competing for a top-10 leaderboard rank. Scoring is based STRICTLY on: (1)
onchain activity on Celo mainnet — fees generated, transaction count, unique
active users through the deployed contract; (2) GitHub activity — unique days
with contributions, total contributions, MiniPay-specific code/deps; (3) npm
package downloads for any package published from this repo. Prioritize code
that drives real, working onchain activity over polish for its own sake.

GOAL: Mobile-first mini app for MiniPay where a user pays a small stablecoin
fee per AI question/answer — pay-as-you-go instead of subscriptions.

HARD TECHNICAL CONSTRAINTS:
1. Scaffold with `npx @celo/celo-composer@latest create -t minipay`.
2. viem/wagmi v2 ONLY — never ethers.js anywhere in the frontend.
3. Detect MiniPay via window.ethereum.isMiniPay, hide custom Connect Wallet
   UI when true. Guard against window.ethereum being undefined.
4. Celo mainnet (42220, forno.celo.org) for production; Celo Sepolia
   (11142220, forno.celo-sepolia.celo-testnet.org) for testing.
5. Non-standard derivation path m/44'/52752'/0'/0 if deriving from mnemonic.
6. Payment in USDm/cUSD (18 decimals) — don't confuse with USDC/USDT (6).
7. Contract must be simple: accept payment via transferFrom (after approve)
   or native CELO, emit QueryPaid(payer, amount, queryId) event, owner-only
   withdraw. NO pooled/custodial logic, lending, staking, or DeFi patterns.
8. Test on Sepolia first, then mainnet deploy + Celoscan verification
   (hard eligibility requirement, not optional).

BUILD PHASES (pause for review after each):
PHASE 1: Scaffold, confirm MiniPay hook works. [COMPLETE]
PHASE 2: PayPerQuery.sol + Hardhat tests + Sepolia deploy. [NEXT]
PHASE 3: Frontend chat UI + wagmi payment wiring.
PHASE 4: Next.js API route (payment verification + LLM call via
  Groq/Gemini free tier, env var for API key).
PHASE 5: Extract payment-verification logic into standalone npm package
  (use-minipay-paygate), with own README + example.
PHASE 6: Deploy to Celo mainnet + verify on Celoscan.
PHASE 7: Write accurate README reflecting actual implementation.

WORKFLOW RULES:
- NEVER run git push — the builder does this manually after review.
- Group commits logically (2-5 per phase by purpose), confirm grouping
  before committing. Don't assume prior commits/pushes happened — verify
  via git log/git status first.
- Commit at a natural pace matching real work — no artificial quota in
  either direction.

Read 00-celo-build-reference.md, 01-askpay-project-spec.md,
02-minipay-integration-checklist.md, and 03-proof-of-ship-scoring-checklist.md
in this repo first — treat as ground truth over prior Celo knowledge, since
the chain migrated L1→L2 in March 2025.
```

---

## 10. Key Lessons Learned / Gotchas Encountered This Session

1. **Nested git repos from scaffolding tools** — always verify with `git status`/`git log` after any tool that might auto-`git init`, don't trust an agent's claim that it committed something.
2. **Env files for monorepo tools with different working directories are NOT shared** — Hardhat and Next.js each need their own `.env`, verify exactly which file a tool actually reads rather than assuming.
3. **`.env.example` vs `.env` confusion** — the former is a safe committed template, the latter is the real gitignored file; a tool can accidentally put real secrets in the template file, which is a genuine leak risk since `.gitignore` patterns for `.env` don't match `.env.example`.
4. **Treat any credential shown in a screenshot as burned** — rotate immediately regardless of git status, especially private keys (API keys are lower-stakes but same principle).
5. **Verify chain ID / network name pairings carefully in wallet UIs** — a scrolled panel can hide the field that actually disambiguates what's being configured; don't assume from partial screenshots.
6. **Talent Protocol dashboard sync has a real delay (hours)** — don't over-check or assume something failed just because it's not instant.
7. **No commit quota exists in Proof of Ship scoring** — "unique days with contributions" is what matters, not raw commit count; don't ration or artificially inflate.

---

## 11. Immediate Next Step (as of this handoff)

Tell Antigravity: **"Proceed to Phase 2"** (all env/wallet setup confirmed clean beforehand). Expect it to produce `PayPerQuery.sol` and a Hardhat test suite — this should be reviewed carefully (ideally line-by-line) before any deployment, even to testnet, given real payment logic is involved. After Sepolia deployment succeeds and is manually tested, move to Phase 3.

---

*This document reflects state as of the point it was generated. If significant time has passed or major decisions have changed since, verify current repo/wallet/Talent Protocol state before assuming this is fully current.*
