/**
 * ChatBox
 *
 * Phase 3 chat UI for AskPay.
 *
 * Responsibilities:
 *  - Detect MiniPay via useMiniPay — show RainbowKit connect button only
 *    when NOT in MiniPay (per checklist doc §1)
 *  - Display the current fee read from the contract (never hardcoded)
 *  - Accept a question from the user
 *  - Drive the approve → askQuestion flow via useAskPay
 *  - Show clear pending/confirming/success/error states for every step
 *
 * Phase 4 integration point: on "success", the question + queryId will be
 * sent to /api/ask and the LLM answer will be shown in the message list.
 * For now, a placeholder confirmation is shown instead.
 */

"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useAskPay } from "@/hooks/useAskPay";
import { Loader2, Send, CheckCircle2, AlertCircle, Zap } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a raw 18-decimal fee bigint to a human-readable string like "0.01" */
function formatFee(raw: bigint): string {
  return formatUnits(raw, 18);
}

/** Truncate a tx hash for display */
function shortHash(hash: string): string {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ step }: { step: string }) {
  const labels: Record<string, { label: string; color: string }> = {
    "checking-allowance": { label: "Checking allowance…",   color: "text-yellow-600" },
    "approving":           { label: "Sending approve tx…",   color: "text-blue-500" },
    "approve-confirming":  { label: "Confirming approve…",   color: "text-blue-500" },
    "asking":              { label: "Sending payment tx…",   color: "text-purple-500" },
    "ask-confirming":      { label: "Confirming payment…",   color: "text-purple-500" },
    "success":             { label: "Payment confirmed ✓",   color: "text-green-600" },
    "error":               { label: "Transaction failed",    color: "text-red-500" },
  };

  const info = labels[step];
  if (!info) return null;

  const isSpinner = [
    "checking-allowance",
    "approving",
    "approve-confirming",
    "asking",
    "ask-confirming",
  ].includes(step);

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${info.color}`}>
      {isSpinner && <Loader2 className="h-4 w-4 animate-spin" />}
      {step === "success" && <CheckCircle2 className="h-4 w-4" />}
      {step === "error" && <AlertCircle className="h-4 w-4" />}
      <span>{info.label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message type (Phase 4 will add "answer" role)
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChatBox() {
  const { address, isConnected } = useAccount();
  const { isMiniPay, detected } = useMiniPay();
  const { fee, isFeeLoading, state, submitQuestion, reset } = useAskPay();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const isBusy = ![  "idle", "success", "error"].includes(state.step);

  // ---- Handle submit -------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || isBusy) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const savedQuestion = question.trim();
    setQuestion("");

    await submitQuestion();

    // After success, add a system placeholder (Phase 4 will replace this
    // with the real LLM answer from /api/ask)
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "system",
        content: state.step === "error"
          ? `⚠️ Payment failed. Your question was not sent.`
          : `✅ Payment confirmed on Celo Sepolia. (Phase 4 will show the AI answer here — queryId: ${state.lastQueryId?.toString() ?? "?"})`,
      },
    ]);
  }

  // Allow asking another question after success/error
  function handleNewQuestion() {
    reset();
  }

  // ---- Fee display ---------------------------------------------------------
  const feeDisplay = isFeeLoading
    ? "…"
    : fee !== undefined
    ? formatFee(fee)
    : "?";

  // ---- Wallet guard --------------------------------------------------------
  // Don't render anything until MiniPay detection has run (avoids flash)
  if (!detected) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // In a regular browser (not MiniPay), show a connect prompt if not connected
  if (!isMiniPay && !isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm max-w-md mx-auto">
        <Zap className="h-8 w-8 text-primary" />
        <h2 className="text-lg font-semibold">Connect your wallet to use AskPay</h2>
        <p className="text-sm text-muted-foreground text-center">
          Connect a wallet to ask questions and pay per query on Celo Sepolia.
        </p>
        {/* RainbowKit button — hidden in MiniPay per checklist doc */}
        <RainbowConnectButton />
      </div>
    );
  }

  // ---- Main chat UI --------------------------------------------------------
  return (
    <div className="flex flex-col w-full max-w-xl mx-auto h-[calc(100vh-4rem-64px)] min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">AskPay</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            Celo Sepolia
          </span>
        </div>
        {address && (
          <span className="text-xs text-muted-foreground font-mono">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground text-sm">
            <Zap className="h-10 w-10 opacity-20" />
            <p>Ask a question — pay <strong className="text-foreground">{feeDisplay} USDm</strong> per query.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Status bar */}
      {state.step !== "idle" && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border text-xs">
          <StatusBadge step={state.step} />

          {/* Show tx hashes once we have them */}
          {state.approveTxHash && (
            <p className="text-muted-foreground mt-1">
              Approve tx:{" "}
              <a
                href={`https://celo-sepolia.blockscout.com/tx/${state.approveTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {shortHash(state.approveTxHash)}
              </a>
            </p>
          )}
          {state.askTxHash && (
            <p className="text-muted-foreground mt-0.5">
              Payment tx:{" "}
              <a
                href={`https://celo-sepolia.blockscout.com/tx/${state.askTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {shortHash(state.askTxHash)}
              </a>
            </p>
          )}

          {/* Error message */}
          {state.step === "error" && state.errorMessage && (
            <p className="text-red-500 mt-1 text-xs break-all">{state.errorMessage}</p>
          )}

          {/* Reset after terminal states */}
          {(state.step === "success" || state.step === "error") && (
            <button
              onClick={handleNewQuestion}
              className="mt-2 text-xs text-primary underline hover:no-underline"
            >
              Ask another question
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 px-4 py-3 border-t border-border bg-card rounded-b-2xl"
      >
        <textarea
          id="question-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Type your question…"
          disabled={isBusy}
          rows={1}
          className="
            flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2
            text-sm placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-ring
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[40px] max-h-[120px] overflow-y-auto
          "
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        <button
          type="submit"
          id="ask-button"
          disabled={!question.trim() || isBusy || !isConnected}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-primary text-primary-foreground font-medium text-sm
            hover:bg-primary/90 active:scale-95
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
            whitespace-nowrap
          "
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isBusy ? "Processing…" : `Ask (${feeDisplay} USDm)`}
        </button>
      </form>
    </div>
  );
}
