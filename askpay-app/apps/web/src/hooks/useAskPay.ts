/**
 * useAskPay
 *
 * Orchestrates the full payment flow for a single query:
 *   1. Read current fee from PayPerQuery.fee()
 *   2. Check user's USDm allowance for the PayPerQuery contract
 *   3. If allowance < fee, submit an approve() tx and wait for confirmation
 *   4. Call askQuestion(queryId) and wait for confirmation
 *   5. Log the resulting tx hash + queryId to console (Phase 4 will call the API here)
 *
 * Rules:
 *  - viem + wagmi v2 ONLY — no ethers.js
 *  - Addresses from env vars via src/lib/contracts.ts — never hardcoded here
 *  - Contract addresses target Celo Sepolia (chain ID 44787)
 */

"use client";

import { useState, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { celoSepolia } from "wagmi/chains";
import {
  PAY_PER_QUERY_ABI,
  ERC20_ABI,
  PAYPERQUERY_ADDRESS_SEPOLIA,
  USDM_ADDRESS_SEPOLIA,
} from "@/lib/contracts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AskPayStep =
  | "idle"
  | "checking-allowance"
  | "approving"
  | "approve-confirming"
  | "asking"
  | "ask-confirming"
  | "success"
  | "error";

export interface AskPayState {
  step: AskPayStep;
  errorMessage: string | null;
  approveTxHash: `0x${string}` | null;
  askTxHash: `0x${string}` | null;
  lastQueryId: bigint | null;
}

export interface UseAskPayReturn {
  /** Current contract fee (18-decimal bigint), undefined while loading */
  fee: bigint | undefined;
  isFeeLoading: boolean;
  /** Full flow state */
  state: AskPayState;
  /** Kick off the approve → askQuestion flow */
  submitQuestion: () => Promise<void>;
  /** Reset back to idle so the user can try again */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a pseudo-random uint256 queryId. Good enough for MVP. */
function generateQueryId(): bigint {
  const hi = BigInt(Math.floor(Math.random() * 0xffffffff));
  const lo = BigInt(Math.floor(Math.random() * 0xffffffff));
  return (hi << 32n) | lo;
}

const INITIAL_STATE: AskPayState = {
  step: "idle",
  errorMessage: null,
  approveTxHash: null,
  askTxHash: null,
  lastQueryId: null,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAskPay(): UseAskPayReturn {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: celoSepolia.id });
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<AskPayState>(INITIAL_STATE);

  // ------------------------------------------------------------------
  // Read: fee from PayPerQuery contract
  // ------------------------------------------------------------------
  const { data: fee, isLoading: isFeeLoading } = useReadContract({
    address: PAYPERQUERY_ADDRESS_SEPOLIA,
    abi: PAY_PER_QUERY_ABI,
    functionName: "fee",
    chainId: celoSepolia.id,
  });

  // ------------------------------------------------------------------
  // Main flow
  // ------------------------------------------------------------------
  const submitQuestion = useCallback(async () => {
    if (!address) {
      setState((s) => ({
        ...s,
        step: "error",
        errorMessage: "No wallet connected. Please connect your wallet first.",
      }));
      return;
    }
    if (!publicClient) {
      setState((s) => ({
        ...s,
        step: "error",
        errorMessage: "Network client not ready. Please try again.",
      }));
      return;
    }
    if (fee === undefined) {
      setState((s) => ({
        ...s,
        step: "error",
        errorMessage: "Fee not loaded yet. Please wait a moment.",
      }));
      return;
    }

    setState({ ...INITIAL_STATE, step: "checking-allowance" });

    try {
      // ----------------------------------------------------------------
      // Step 1: Check current allowance
      // ----------------------------------------------------------------
      const allowance = await publicClient.readContract({
        address: USDM_ADDRESS_SEPOLIA,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, PAYPERQUERY_ADDRESS_SEPOLIA],
      });

      // ----------------------------------------------------------------
      // Step 2: Approve if needed
      // ----------------------------------------------------------------
      if (allowance < fee) {
        setState((s) => ({ ...s, step: "approving" }));

        const approveTxHash = await writeContractAsync({
          address: USDM_ADDRESS_SEPOLIA,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [PAYPERQUERY_ADDRESS_SEPOLIA, fee],
          chainId: celoSepolia.id,
        });

        setState((s) => ({ ...s, step: "approve-confirming", approveTxHash }));
        console.log("[AskPay] approve tx submitted:", approveTxHash);

        // Wait for the approve tx to be mined
        await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
        console.log("[AskPay] approve confirmed:", approveTxHash);
      }

      // ----------------------------------------------------------------
      // Step 3: askQuestion
      // ----------------------------------------------------------------
      setState((s) => ({ ...s, step: "asking" }));

      const queryId = generateQueryId();

      const askTxHash = await writeContractAsync({
        address: PAYPERQUERY_ADDRESS_SEPOLIA,
        abi: PAY_PER_QUERY_ABI,
        functionName: "askQuestion",
        args: [queryId],
        chainId: celoSepolia.id,
      });

      setState((s) => ({ ...s, step: "ask-confirming", askTxHash, lastQueryId: queryId }));
      console.log("[AskPay] askQuestion tx submitted:", askTxHash, "queryId:", queryId.toString());

      // Wait for the askQuestion tx to be mined
      await publicClient.waitForTransactionReceipt({ hash: askTxHash });

      console.log(
        "[AskPay] askQuestion confirmed ✓ | txHash:", askTxHash,
        "| queryId:", queryId.toString(),
        "| Phase 4: backend /api/ask call goes here"
      );

      setState((s) => ({ ...s, step: "success" }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("[AskPay] error:", message);
      setState((s) => ({
        ...s,
        step: "error",
        errorMessage: message,
      }));
    }
  }, [address, publicClient, fee, writeContractAsync]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { fee, isFeeLoading, state, submitQuestion, reset };
}
