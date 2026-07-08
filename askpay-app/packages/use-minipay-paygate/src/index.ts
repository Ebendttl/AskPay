import {
  PublicClient,
  Hash,
  Address,
  parseEventLogs,
  Log,
  Abi,
} from "viem";

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

export class PaymentVerificationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "PaymentVerificationError";
  }
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface VerifyPaymentOptions {
  /** The viem PublicClient instance to query the blockchain */
  publicClient: any;
  /** The transaction hash containing the payment */
  txHash: Hash;
  /** The expected payment recipient address (case-insensitive) */
  expectedReceiver: Address;
  /** Optional check for the minimum paid amount (in 18-decimal wei or token decimals) */
  minimumAmount?: bigint;
  /** Optional check for the exact expected payer address (case-insensitive) */
  expectedPayer?: Address;
  /** Optional custom ABI and event configuration to parse */
  customEvent?: {
    abi: Abi;
    eventName: string;
    /**
     * A callback to validate arguments of the custom event.
     * Return true if the event args are valid.
     */
    verifyArgs?: (args: any) => boolean | Promise<boolean>;
  };
}

export interface VerificationResult {
  success: boolean;
  blockNumber: bigint;
  payer: Address;
  amount: bigint;
  recipient: Address;
  eventLogs: any[];
}

// ---------------------------------------------------------------------------
// Standard ERC20 Transfer ABI (for default verification)
// ---------------------------------------------------------------------------

const ERC20_TRANSFER_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
] as const;

// ---------------------------------------------------------------------------
// Core Verification Utility
// ---------------------------------------------------------------------------

/**
 * Verifies a Celo / MiniPay stablecoin transaction on-chain.
 *
 * Ensures:
 *   1. The transaction receipt exists and succeeded.
 *   2. The recipient is the expected merchant/contract address.
 *   3. The payment event (ERC20 Transfer or custom event) was emitted.
 *   4. The payer, amount, and custom arguments match expectations.
 */
export async function verifyPayment(
  options: VerifyPaymentOptions
): Promise<VerificationResult> {
  const {
    publicClient,
    txHash,
    expectedReceiver,
    minimumAmount,
    expectedPayer,
    customEvent,
  } = options;

  // 1. Fetch transaction receipt
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  } catch (err) {
    throw new PaymentVerificationError(
      "Transaction receipt not found. Make sure the transaction has been mined.",
      "RECEIPT_NOT_FOUND"
    );
  }

  // 2. Check transaction status
  if (receipt.status !== "success") {
    throw new PaymentVerificationError(
      `Transaction failed on-chain with status: ${receipt.status}`,
      "TRANSACTION_FAILED"
    );
  }

  const normalizedExpectedReceiver = expectedReceiver.toLowerCase();

  // 3. Verify recipient of the transaction
  // For a direct ERC20 transfer, receipt.to is the token address.
  // For a custom contract call (like PayPerQuery), receipt.to is the contract address.
  const toAddress = receipt.to?.toLowerCase();

  if (customEvent) {
    // If a custom event is provided, receipt.to must match the contract address
    if (toAddress !== normalizedExpectedReceiver) {
      throw new PaymentVerificationError(
        `Transaction recipient mismatch. Expected: ${expectedReceiver}, got: ${receipt.to}`,
        "RECIPIENT_MISMATCH"
      );
    }

    // Parse the custom event logs
    const logs = parseEventLogs({
      abi: customEvent.abi,
      eventName: customEvent.eventName,
      logs: receipt.logs,
    });

    if (logs.length === 0) {
      throw new PaymentVerificationError(
        `Expected event "${customEvent.eventName}" was not emitted by the contract`,
        "EVENT_NOT_FOUND"
      );
    }

    // Process custom event arguments
    const matchingLog = logs[0];
    const args = matchingLog.args as any;

    // We make a best effort to find common parameter names in the custom event:
    // payer/from, amount/value, etc.
    const eventPayer = (args.payer || args.from || receipt.from) as Address;
    const eventAmount = (args.amount !== undefined ? args.amount : args.value || 0n) as bigint;

    // Check expected payer if specified
    if (expectedPayer && eventPayer.toLowerCase() !== expectedPayer.toLowerCase()) {
      throw new PaymentVerificationError(
        `Payer mismatch in event. Expected: ${expectedPayer}, got: ${eventPayer}`,
        "PAYER_MISMATCH"
      );
    }

    // Check minimum amount if specified
    if (minimumAmount && eventAmount < minimumAmount) {
      throw new PaymentVerificationError(
        `Insufficient payment amount. Expected at least: ${minimumAmount.toString()}, got: ${eventAmount.toString()}`,
        "INSUFFICIENT_AMOUNT"
      );
    }

    // Validate any custom arguments via the verifyArgs callback
    if (customEvent.verifyArgs) {
      const isValid = await customEvent.verifyArgs(args);
      if (!isValid) {
        throw new PaymentVerificationError(
          "Custom event arguments verification failed",
          "ARGUMENTS_VERIFICATION_FAILED"
        );
      }
    }

    return {
      success: true,
      blockNumber: receipt.blockNumber,
      payer: eventPayer,
      amount: eventAmount,
      recipient: receipt.to as Address,
      eventLogs: logs,
    };
  } else {
    // Default mode: Verify a standard ERC20 token transfer event inside the logs
    // receipt.to points to the token contract address.
    const logs = parseEventLogs({
      abi: ERC20_TRANSFER_ABI,
      eventName: "Transfer",
      logs: receipt.logs,
    });

    // Find the log that matches our expected receiver
    const matchingLog = logs.find(
      (log: any) => log.args.to.toLowerCase() === normalizedExpectedReceiver
    );

    if (!matchingLog) {
      throw new PaymentVerificationError(
        `No ERC20 Transfer event found targeting receiver: ${expectedReceiver}`,
        "TRANSFER_EVENT_NOT_FOUND"
      );
    }

    const { from: eventPayer, value: eventAmount } = matchingLog.args;

    // Check expected payer if specified
    if (expectedPayer && eventPayer.toLowerCase() !== expectedPayer.toLowerCase()) {
      throw new PaymentVerificationError(
        `Payer mismatch in transfer event. Expected: ${expectedPayer}, got: ${eventPayer}`,
        "PAYER_MISMATCH"
      );
    }

    // Check minimum amount if specified
    if (minimumAmount && eventAmount < minimumAmount) {
      throw new PaymentVerificationError(
        `Insufficient payment amount. Expected at least: ${minimumAmount.toString()}, got: ${eventAmount.toString()}`,
        "INSUFFICIENT_AMOUNT"
      );
    }

    return {
      success: true,
      blockNumber: receipt.blockNumber,
      payer: eventPayer,
      amount: eventAmount,
      recipient: expectedReceiver,
      eventLogs: [matchingLog],
    };
  }
}
