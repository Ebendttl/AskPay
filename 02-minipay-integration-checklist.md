# MiniPay Integration Checklist
*Tactical, gotcha-focused reference for the MiniPay-specific parts of AskPay. MiniPay is Opera's non-custodial stablecoin wallet, built into the Opera Mini browser plus a standalone Android/iOS app — 14M+ wallets across 60+ countries.*

---

## The core detection pattern

```js
useEffect(() => {
  if (typeof window !== 'undefined' && window.ethereum?.isMiniPay) {
    setIsMiniPay(true);
    // auto-connect flow, skip showing a manual "Connect Wallet" button
  }
}, []);
```

**Always guard against `window.ethereum` being undefined** — don't assume it exists, especially for users opening the app outside MiniPay (e.g. testing in a regular desktop browser).

**When `isMiniPay` is true: hide your own wallet-connect UI.** MiniPay auto-connects its own injected wallet — showing a redundant "Connect Wallet" button is a bad UX signal and also called out in Celo's own docs as something to avoid.

---

## Hard constraints (confirmed from Celo's own MiniPay docs)

1. **Do NOT use ethers.js anywhere in this project.** Celo's own docs state plainly it doesn't work in MiniPay. Use viem or wagmi exclusively.
2. **MiniPay currently only accepts legacy transactions** (no EIP-1559 fields). If you build transactions manually rather than through wagmi's higher-level hooks, make sure the transaction type is compatible.
3. **MiniPay currently only supports USDm as a fee-abstraction currency.** This matters if you ever let users pay gas in a stablecoin — for now, AskPay's payment amount itself is in USDm anyway, which sidesteps this issue.
4. **Decimals: USDm = 18 decimals.** Don't confuse with USDC/USDT (6 decimals) if you ever add them later.

---

## Testing MiniPay integration

- **No emulator support** — MiniPay must be tested on a real Android/iOS device (or Opera Mini browser).
- Use **ngrok** to tunnel your local dev server (`ngrok http [PORT]`) so it's reachable from a real device.
- In MiniPay: enable **Developer Mode** → toggle **Testnet** → **"Load Test Page"** → paste your ngrok URL.
- Test the full flow on Celo Sepolia before ever touching mainnet.

---

## Phone-number-as-address (not needed for AskPay MVP, noted for awareness)

MiniPay supports resolving phone numbers to wallet addresses via ODIS (Celo's identity/attestation service). AskPay's MVP doesn't need this — payment flow is wallet-to-contract, not wallet-to-phone-number — but it's worth knowing this exists if a future version wants to let users share/tip via phone number.

---

## Eligibility notes (relevant to shipping, not just coding)

- The MiniPay hook is a **booster**, not mandatory, for Proof of Ship scoring — but it's low-effort to add and directly helps reach MiniPay's 14M+ user base, so there's no reason to skip it.
- **Projects already listed on MiniPay are NOT eligible for Proof of Ship rewards.** AskPay should stay unlisted on MiniPay itself while participating in Proof of Ship — the program is explicitly for pre-listing validation.
- Deeplink for MiniPay's own add-cash screen (not directly relevant to AskPay, but useful reference): `https://minipay.opera.com/add_cash`
