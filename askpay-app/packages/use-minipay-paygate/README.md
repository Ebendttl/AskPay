# use-minipay-paygate

A lightweight, robust, on-chain stablecoin payment verification library for Celo and MiniPay applications.

Easily gate your backend APIs, AI features, or paid content behind simple on-chain payments using Celo's ultra-low fee structure.

## Features

- ⚡ **Lightweight & Fast**: Built directly on top of `viem`.
- 🔐 **Secure Backend Verification**: Validates transaction status, recipient addresses, payment amounts, payers, and custom event arguments.
- 🪙 **Multiple Modes**: Supports standard ERC20 transfers (e.g. sending cUSD or USDm to a wallet) AND custom payment gate events (e.g. smart contracts like `PayPerQuery`).
- 🛠️ **Fully Typed**: Written in TypeScript with full type-safety.

---

## Installation

```bash
npm install use-minipay-paygate viem
# or
pnpm add use-minipay-paygate viem
# or
yarn add use-minipay-paygate viem
```

---

## Usage Examples

### 1. Default Mode (Verify direct ERC20 cUSD/USDm transfer)
Use this when a user sends stablecoins directly to your merchant wallet.

```typescript
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { verifyPayment } from "use-minipay-paygate";

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

async function handlePaymentVerification(txHash: string) {
  try {
    const result = await verifyPayment({
      publicClient,
      txHash: txHash as `0x${string}`,
      // Your merchant/receiving wallet address
      expectedReceiver: "0xYourMerchantAddress...",
      // 0.05 USDm/cUSD (18 decimals)
      minimumAmount: 50_000_000_000_000_000n, 
    });

    if (result.success) {
      console.log(`Payment confirmed! Payer: ${result.payer}`);
      // Proceed to serve digital goods or unlock API
    }
  } catch (error) {
    console.error("Payment verification failed:", error.message);
  }
}
```

### 2. Custom Event Mode (Verify Smart Contract Payments)
Use this when you have a smart contract (e.g. `PayPerQuery.sol`) that emits a custom event on-chain when a user purchases a service.

```typescript
import { createPublicClient, http, parseAbi } from "viem";
import { celoSepolia } from "viem/chains";
import { verifyPayment } from "use-minipay-paygate";

// ABI containing the event to verify
const contractAbi = parseAbi([
  "event QueryPaid(address indexed payer, uint256 amount, uint256 indexed queryId, uint256 timestamp)"
]);

const publicClient = createPublicClient({
  chain: celoSepolia,
  transport: http("https://forno.celo-sepolia.celo-testnet.org"),
});

async function verifyQueryPayment(txHash: string, expectedQueryId: string) {
  try {
    const result = await verifyPayment({
      publicClient,
      txHash: txHash as `0x${string}`,
      // The deployed PayPerQuery contract address
      expectedReceiver: "0xContractAddress...", 
      customEvent: {
        abi: contractAbi,
        eventName: "QueryPaid",
        verifyArgs: (args) => {
          // Verify the event was emitted with the correct queryId
          return args.queryId === BigInt(expectedQueryId);
        }
      }
    });

    console.log("On-chain contract payment verified successfully!", result);
  } catch (error) {
    console.error("Failed to verify:", error.message);
  }
}
```

---

## API Reference

### `verifyPayment(options: VerifyPaymentOptions): Promise<VerificationResult>`

#### Options:
- `publicClient`: Viem `PublicClient` instance.
- `txHash`: The transaction hash to fetch and verify.
- `expectedReceiver`: 
  - Standard mode: The token recipient address (to address in transfer log).
  - Custom mode: The smart contract address.
- `minimumAmount` *(optional)*: The minimum amount (in wei) the user must have paid.
- `expectedPayer` *(optional)*: Case-insensitive check to verify the sender address.
- `customEvent` *(optional)*: Custom event details to parse from receipt logs.
  - `abi`: The contract's event ABI.
  - `eventName`: The name of the event to look for (e.g., `QueryPaid`).
  - `verifyArgs`: Callback to run custom checks against the parsed log arguments.

#### Returns `Promise<VerificationResult>`:
- `success`: boolean
- `blockNumber`: bigint
- `payer`: Address (the sender)
- `amount`: bigint (the amount transferred)
- `recipient`: Address (the recipient)
- `eventLogs`: Array of parsed logs matching criteria.

---

## License

MIT
