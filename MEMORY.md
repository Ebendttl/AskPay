# AskPay — Project Memory

> **Purpose:** Ground-truth reference for Antigravity to avoid hallucination on future decisions.
> Updated whenever a feature is completed or a decision is made.
> Last updated: 2026-07-15

---

## Repository Structure

```
AskPay/
├── MEMORY.md                         ← this file
├── README.md                         ← Master project documentation
└── askpay-app/                       ← pnpm/turborepo monorepo
    ├── apps/
    │   ├── web/                      ← Next.js 14 frontend (App Router)
    │   └── contracts/                ← Hardhat smart contracts
    └── packages/                     ← (shared packages, not yet populated)
```

### Key paths — web app

| Path | Purpose |
|------|---------|
| `apps/web/src/app/layout.tsx` | Root layout — all providers live here |
| `apps/web/src/app/page.tsx` | Home page — renders `<ChatBox />` |
| `apps/web/src/app/dashboard/page.tsx` | Usage dashboard |
| `apps/web/src/app/referrals/page.tsx` | Referral link page |
| `apps/web/src/app/admin/page.tsx` | Owner-only contract telemetry |
| `apps/web/src/app/api/ask/` | Backend API route: verifies payment + streams LLM |
| `apps/web/src/components/chat-box.tsx` | Core chat UI + payment flow state machine |
| `apps/web/src/components/navbar.tsx` | Navigation (all links + toggles) |
| `apps/web/src/components/onboarding-modal.tsx` | First-visit 3-step modal |
| `apps/web/src/components/onboarding-wrapper.tsx` | Thin wagmi adapter for onboarding modal |
| `apps/web/src/components/toast.tsx` | Toast/notification UI component |
| `apps/web/src/components/theme-toggle.tsx` | Dark/light theme button |
| `apps/web/src/components/usage-chart.tsx` | Custom SVG bar chart (no external chart lib) |
| `apps/web/src/components/referral-card.tsx` | Referral link generator + clipboard copy |
| `apps/web/src/lib/contracts.ts` | Contract addresses, ABIs, ACTIVE_NETWORK toggle |
| `apps/web/src/lib/theme-context.tsx` | ThemeProvider + useTheme hook |
| `apps/web/src/lib/notification-context.tsx` | NotificationProvider + useNotifications hook |
| `apps/web/src/lib/translations.ts` | i18n strings (English + Swahili) |
| `apps/web/src/hooks/useAskPay.ts` | Main payment hook (fee, balance, submitQuestion) |
| `apps/web/src/hooks/use-stream-response.ts` | LLM streaming hook |
| `apps/web/src/hooks/useLanguage.tsx` | Language context + `t()` helper |
| `apps/web/src/hooks/useMiniPay.ts` | MiniPay detection |
| `apps/web/src/hooks/useAdminStats.ts` | Admin contract reads |
| `apps/web/src/middleware.ts` | Per-IP rate limiting on `/api/ask` |
| `apps/web/tailwind.config.js` | Tailwind config — all colors use `hsl(var(--*))` |
| `apps/web/src/app/globals.css` | CSS variable definitions (light + dark themes) |

---

## Provider Tree (layout.tsx)

```
ThemeProvider
  └── NotificationProvider
        └── LanguageProvider
              └── WalletProvider            ← wagmi + RainbowKit (theme-aware)
                    ├── <Navbar />
                    ├── <main>{children}</main>
                    ├── <SiteFooter />
                    ├── <ToastContainer />  ← portal-rendered, bottom-right
                    └── <OnboardingWrapper /> ← client-side first-visit checks
```

---

## Network / Chain Configuration

| Variable | Value |
|----------|-------|
| `ACTIVE_NETWORK` | Driven by `NEXT_PUBLIC_NETWORK` env var; defaults to `"sepolia"` |
| `ACTIVE_CHAIN` | `celoSepolia` when sepolia, `celo` when mainnet |
| `PAYPERQUERY_ADDRESS` | `0x0c77e53D988059773D6E18396D449e86cF876687` (Sepolia) |
| `USDM_ADDRESS` | `0x3c839797BA135457Eca83f8C20f2335A817899b5` (Sepolia MockERC20) |
| Mainnet addresses | Filled in `.env.local` but **not yet activated** — `NEXT_PUBLIC_NETWORK` not set to mainnet |
| Explorer (Sepolia) | `https://sepolia.celoscan.io` |
| Explorer (Mainnet) | `https://celoscan.io` |

**Switching to mainnet = set `NEXT_PUBLIC_NETWORK=mainnet` in `.env.local` and fund wallet.**
No code changes required.

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `askpay_history` | `HistoryItem[]` — per-query records (question, answer, txHash, status, timestamp) |
| `askpay_theme` | `"light"` or `"dark"` — persisted theme preference |
| `askpay_onboarding_seen` | `"1"` when user has dismissed the onboarding modal |

---

## HistoryItem Schema

```ts
interface HistoryItem {
  queryId: string;
  question: string;
  answer?: string;
  txHash?: `0x${string}`;
  status: "pending" | "paid" | "answered" | "failed";
  timestamp: number;  // Date.now()
}
```

---

## Completed Features (all committed, working tree clean)

### Phase 1–3: Smart Contracts + Payment Gate
- PayPerQuery contract deployed on Celo Sepolia (`0x0c77e53…`)
- MockERC20 (USDm stand-in) deployed on Sepolia
- approve + askQuestion flow verified end-to-end via UI
- Hardhat Ignition module for mainnet ready (not yet deployed)

### Phase 4: AI Streaming
- `/api/ask` backend verifies on-chain payment, then streams LLM response word-by-word
- `useStreamResponse` hook drives incremental chat bubble updates
- Retry button on stream failure (payment already confirmed, no re-charge)

### Phase 5: UX Hardening
- **Balance check** — reads USDm balance via `useReadContract`, auto-refreshes after tx
- **Insufficient funds warning** — amber banner + disabled Ask button when `balance < fee`
- **Testnet hint** — shows mint script tip only when `ACTIVE_NETWORK === "sepolia"`

### Phase 7: Internationalization
- English + Swahili translations for all pages and components
- `useLanguage` hook with `t(key, vars?)` helper
- Language toggle in navbar (desktop + mobile sheet)

### Phase 7b: Admin Dashboard
- `/admin` page — owner-gated, reads contract fee + event logs
- `useAdminStats` hook — reads QueryPaid events from chain
- Rate limit request log surfaced via `/api/admin/request-log`

### Phase 7c: Tests
- Vitest + jsdom configured
- Unit tests for ChatBox and FAQAccordion
- Custom `renderWithProviders` test utility (in `src/test/test-utils.tsx`) updated to mount `NotificationProvider` to fix context injection errors during ChatBox rendering tests.

### Dashboard Page
- `/dashboard` — reads `askpay_history` from localStorage
- Stats: total questions, USDm spent (uses current fee as approximation), avg queries/day, wallet balance
- `UsageChart` SVG bar chart — last 14 days, no external chart library
- Recent queries table with status badges and Explorer links

### Referral System (frontend-only)
- `ReferralCard` — generates `/?ref=<address>` link with copy-to-clipboard
- `/referrals` page — referral link + honest "coming soon" stats banner
- Both English and Swahili translations wired

### Theme Toggle (dark/light mode)
- `ThemeProvider` in `lib/theme-context.tsx` — respects `prefers-color-scheme`, persists to localStorage
- Inline `<script>` in `<head>` prevents theme flash on load
- `ThemeToggle` button in navbar (desktop + mobile)
- RainbowKitProvider receives `lightTheme()` / `darkTheme()` dynamically
- All Tailwind colors use `hsl(var(--*))` CSS variables — no hardcoded hex

### Toast / Notification System
- `NotificationProvider` in `lib/notification-context.tsx`
  - API: `notify()`, `update()`, `dismiss()`, `dismissAll()`
  - Loading toasts persist until explicitly updated/dismissed
  - Cap: 5 visible toasts max (FIFO drop of oldest non-loading)
- `ToastContainer` + `ToastItem` in `components/toast.tsx`
  - Type-specific icons: loading spinner, check, alert, info, warning
  - Left accent bar colour per type
  - Animated progress drain bar over auto-dismiss duration
  - Optional "View on Explorer" link when `txHash + explorerUrl` provided
  - Portal-rendered into `document.body`
- **Wired in `chat-box.tsx`:**
  - Single loading toast morphs through all steps:
    `checking-allowance → approving → approve-confirming → asking → ask-confirming → success/error`
  - Success toast includes payment `txHash` + Explorer URL
  - Separate stream effect: "Answer received!" on done, "AI response failed" on error
  - `loadingToastIdRef` ref prevents duplicate toasts on re-renders

### Onboarding Modal
- `components/onboarding-modal.tsx` — 3-step modal:
  1. "What is AskPay?" — overview + pricing
  2. "How payment works" — approve/pay/answer flow
  3. "Connect to start" — wallet options
- Shows once per browser via `askpay_onboarding_seen` localStorage key
- `isConnected` prop adapts final CTA text ("Start Asking" vs "Got it, connect wallet")
- Portal-rendered; dismiss on backdrop click or ✕ button or finish
- Step dot indicators, animated accent gradients per step
- `components/onboarding-wrapper.tsx` — thin wagmi adapter (reads `isConnected`, passes as prop)
- **Wired in `layout.tsx`** under the `<WalletProvider>` tree.

### Exhaustive Project Documentation
- Created a robust developer manual in `README.md` covering the routing system, provider hierarchies, backend middleware rate-limiting scripts, signature verification, smart contract layout details, CLI tools, tests, and owner admin commands.
- Updated sequence flows to conform to standard Mermaid parser syntax by escaping text variables and changing `actor` to `participant` declarations.

---

## In-Progress / Incomplete Tasks

- **None.** All core features, UI flows, i18n support, tests, documentation, and layout integrations are 100% completed, verified, and operational.

---

## Invariants / Rules Never to Break

1. **No wallet-write logic** outside `useAskPay.ts` and `apps/contracts/`
2. **No hardcoded addresses or hex colors** — always use env vars / CSS variables
3. **`NEXT_PUBLIC_NETWORK` env var** is the single switch between Sepolia and mainnet; never toggle by code
4. **Mainnet wallet not funded** — do not attempt mainnet deployment until user confirms funding
5. **Private keys** — only ever in `apps/contracts/.env`, never committed to git
6. **`pnpm build`** must pass clean before any commit is proposed
7. **Do not add new wallet-write RPC calls** without explicit user request

---

## Known Gotchas

- `tailwind.config.js` `darkMode: ["class"]` — dark mode is toggled by adding `.dark` to `<html>`, managed by `ThemeProvider`
- The inline `<script>` in `layout.tsx` `<head>` must stay — it prevents theme flash before React hydrates
- `WalletProvider` nests `RainbowKitProvider` inside `WalletProviderInner` (not at the outer level) so it can access `useTheme()` — don't move it out
- `OnboardingModal` uses `createPortal` — it must check `typeof window !== "undefined"` before rendering
- `useNotifications()` throws if called outside `<NotificationProvider>` — all call sites are inside the provider tree
- The `DayBucket` type is exported from `usage-chart.tsx` and consumed by `dashboard/page.tsx`
- `HistoryItem` type is exported from `chat-box.tsx` — don't split it to another file without updating all imports

---

## Commit Conventions

```
feat:   new user-visible feature
refactor: code restructure, no behaviour change
style:  CSS/Tailwind only
fix:    bug fix
test:   test files
chore:  config, deps, tooling
docs:   documentation only
```

Commits are atomic per logical unit. Build must pass before commit.
