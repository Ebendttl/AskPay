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

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useAskPay, generateQueryId } from "@/hooks/useAskPay";
import { Loader2, Send, CheckCircle2, AlertCircle, Zap, History, ExternalLink, Plus, Trash2, Clock } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ACTIVE_NETWORK } from "@/lib/contracts";
import { HeroSection } from "@/components/hero-section";

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
  role: "user" | "assistant" | "system";
  content: string;
}

export interface HistoryItem {
  queryId: string;
  question: string;
  answer?: string;
  txHash?: `0x${string}`;
  status: "pending" | "paid" | "answered" | "failed";
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChatBox() {
  const { address, isConnected } = useAccount();
  const { isMiniPay, detected } = useMiniPay();
  const {
    fee,
    isFeeLoading,
    balance,
    isBalanceLoading,
    refetchBalance,
    state,
    submitQuestion,
    reset,
  } = useAskPay();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiPending, setApiPending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("askpay_history");
      if (saved) {
        const parsed = JSON.parse(saved) as HistoryItem[];
        setHistory(parsed);
        if (parsed.length > 0) {
          setShowHistory(true);
        }
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  // Save history to state and localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("askpay_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  };

  const isBusy = apiPending || !["idle", "success", "error"].includes(state.step);

  const hasInsufficientFunds =
    isConnected &&
    balance !== undefined &&
    fee !== undefined &&
    balance < fee;

  const balanceDisplay = isBalanceLoading
    ? "…"
    : balance !== undefined
    ? parseFloat(formatUnits(balance, 18)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
    : "0.00";

  // ---- Handle submit -------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || isBusy) return;

    // Clear history selection to show the new active chat
    if (selectedQueryId) {
      setSelectedQueryId(null);
    }

    const savedQuestion = question.trim();
    setQuestion("");
    setApiError(null);

    const queryId = generateQueryId();
    const queryIdStr = queryId.toString();

    // 1. Add to history immediately as pending
    const newItem: HistoryItem = {
      queryId: queryIdStr,
      question: savedQuestion,
      status: "pending",
      timestamp: Date.now(),
    };
    const currentHistory = [newItem, ...history];
    saveHistory(currentHistory);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: savedQuestion,
    };
    setMessages([userMsg]);

    let txHash: `0x${string}`;

    try {
      // Step 1: Submit transaction & wait for confirmation
      const res = await submitQuestion(queryId);
      txHash = res.txHash;

      // 2. Update history entry to paid
      saveHistory(
        currentHistory.map((item) =>
          item.queryId === queryIdStr
            ? { ...item, status: "paid" as const, txHash }
            : item
        )
      );
    } catch (err) {
      // Update history entry to failed
      saveHistory(
        currentHistory.map((item) =>
          item.queryId === queryIdStr ? { ...item, status: "failed" as const } : item
        )
      );

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: `⚠️ Payment failed or rejected.`,
        },
      ]);
      return;
    }

    // Step 2: Call the backend API route
    setApiPending(true);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "system",
        content: `⌛ Payment confirmed. Verifying on-chain & waiting for AI response...`,
      },
    ]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: savedQuestion,
          queryId: queryIdStr,
          txHash: txHash,
          network: ACTIVE_NETWORK,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify payment or fetch response");
      }

      // 3. Update history entry to answered
      saveHistory(
        currentHistory.map((item) =>
          item.queryId === queryIdStr
            ? { ...item, status: "answered" as const, txHash, answer: data.answer }
            : item
        )
      );

      // Remove system status message and add assistant reply
      setMessages((prev) => {
        const filtered = prev.filter(
          (m) => !m.content.includes("Verifying on-chain & waiting for AI response")
        );
        return [
          ...filtered,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.answer,
          },
        ];
      });
    } catch (err: any) {
      const msg = err.message || "Failed to fetch response";
      setApiError(msg);

      // Update history entry to failed
      saveHistory(
        currentHistory.map((item) =>
          item.queryId === queryIdStr ? { ...item, status: "failed" as const } : item
        )
      );

      setMessages((prev) => {
        const filtered = prev.filter(
          (m) => !m.content.includes("Verifying on-chain & waiting for AI response")
        );
        return [
          ...filtered,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: `⚠️ Error verifying query: ${msg}`,
          },
        ];
      });
    } finally {
      setApiPending(false);
    }
  }

  // Allow asking another question after success/error
  function handleNewQuestion() {
    setSelectedQueryId(null);
    setMessages([]);
    setApiError(null);
    reset();
  }

  // Clear entire history
  function handleClearHistory() {
    if (confirm("Are you sure you want to clear your query history?")) {
      saveHistory([]);
      setSelectedQueryId(null);
    }
  }

  // Determine active messages list to display
  const activeHistoryItem = selectedQueryId
    ? history.find((h) => h.queryId === selectedQueryId)
    : null;

  const messagesToDisplay = activeHistoryItem
    ? [
        {
          id: "q-" + activeHistoryItem.queryId,
          role: "user" as const,
          content: activeHistoryItem.question,
        },
        ...(activeHistoryItem.answer
          ? [
              {
                id: "a-" + activeHistoryItem.queryId,
                role: "assistant" as const,
                content: activeHistoryItem.answer,
              },
            ]
          : []),
        ...(activeHistoryItem.status === "pending"
          ? [
              {
                id: "s-" + activeHistoryItem.queryId,
                role: "system" as const,
                content: "⌛ Payment transaction initiated. Please confirm in wallet...",
              },
            ]
          : []),
        ...(activeHistoryItem.status === "paid"
          ? [
              {
                id: "s-" + activeHistoryItem.queryId,
                role: "system" as const,
                content:
                  "⌛ Payment confirmed on-chain. Verifying payment & generating AI response...",
              },
            ]
          : []),
        ...(activeHistoryItem.status === "failed"
          ? [
              {
                id: "s-" + activeHistoryItem.queryId,
                role: "system" as const,
                content: "⚠️ Transaction or verification failed.",
              },
            ]
          : []),
      ]
    : messages;

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

  // In a regular browser (not MiniPay), show the hero landing section if not connected
  if (!isMiniPay && !isConnected) {
    return (
      <HeroSection
        connectButton={
          <RainbowConnectButton />
        }
      />
    );
  }

  const explorerBaseUrl = ACTIVE_NETWORK === "mainnet" ? "https://celoscan.io" : "https://sepolia.celoscan.io";

  // ---- Main chat UI --------------------------------------------------------
  return (
    <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto gap-4 h-[calc(100vh-4rem-64px)] min-h-[500px] px-4">
      
      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col border border-border bg-card rounded-2xl overflow-hidden shadow-sm h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">AskPay</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full capitalize">
              Celo {ACTIVE_NETWORK}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {address && (
              <span className="text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded">
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                showHistory 
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle Query History"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background/50">
          {messagesToDisplay.length === 0 && (
            <EmptyState
              Icon={Zap}
              title={`Ask a question — pay ${feeDisplay} USDm per query`}
              description="Your question is paid for on-chain before the AI answers it. Transaction logs and replies are stored locally in your browser."
            />
          )}

          {messagesToDisplay.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : msg.role === "system"
                    ? "bg-muted/80 text-muted-foreground border border-border text-xs rounded-lg"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Status bar */}
        {(state.step !== "idle" || selectedQueryId) && (
          <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs">
            {selectedQueryId ? (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Viewing history item ({activeHistoryItem?.status})</span>
                <button
                  onClick={handleNewQuestion}
                  className="text-primary hover:underline font-medium"
                >
                  Ask new question
                </button>
              </div>
            ) : (
              <StatusBadge step={state.step} />
            )}

            {/* Show tx hashes once we have them */}
            {!selectedQueryId && state.approveTxHash && (
              <p className="text-muted-foreground mt-1">
                Approve tx:{" "}
                <a
                  href={`${explorerBaseUrl}/tx/${state.approveTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary inline-flex items-center gap-0.5"
                >
                  {shortHash(state.approveTxHash)} <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
            {!selectedQueryId && state.askTxHash && (
              <p className="text-muted-foreground mt-0.5">
                Payment tx:{" "}
                <a
                  href={`${explorerBaseUrl}/tx/${state.askTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary inline-flex items-center gap-0.5"
                >
                  {shortHash(state.askTxHash)} <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}

            {/* Error message */}
            {!selectedQueryId && state.step === "error" && state.errorMessage && (
              <p className="text-red-500 mt-1 text-xs break-all">{state.errorMessage}</p>
            )}
            {!selectedQueryId && apiError && (
              <p className="text-red-500 mt-1 text-xs break-all">{apiError}</p>
            )}

            {/* Reset after terminal states */}
            {!selectedQueryId && (state.step === "success" || state.step === "error" || apiError) && !apiPending && (
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
        {isConnected && (
          <div className="flex flex-col gap-1.5 px-4 py-2 bg-muted/10 border-t border-border text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground/60" />
                <span>USDm Balance</span>
              </span>
              <span className="font-mono font-medium text-foreground">
                {balanceDisplay} USDm
              </span>
            </div>

            {hasInsufficientFunds && (
              <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    Insufficient USDm balance. You need at least {feeDisplay} USDm to ask a question.
                  </p>
                  {ACTIVE_NETWORK === "sepolia" && (
                    <p className="text-[10px] opacity-80 mt-0.5">
                      Testnet: use the mint script to top up your balance.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
            placeholder={selectedQueryId ? "Type to ask a new question…" : "Type your question…"}
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
            disabled={!question.trim() || isBusy || !isConnected || hasInsufficientFunds}
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

      {/* Collapsible History Panel */}
      {showHistory && (
        <div className="w-full md:w-80 border border-border bg-card rounded-2xl flex flex-col overflow-hidden shadow-sm h-full max-h-[500px] md:max-h-none">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10">
            <span className="font-semibold text-sm flex items-center gap-1.5">
              <History className="h-4 w-4 text-primary" />
              History ({history.length})
            </span>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded"
                title="Clear all history"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sidebar List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/20">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <Clock className="h-8 w-8 opacity-25 mb-1.5" />
                <p className="text-xs">No questions asked yet.</p>
              </div>
            ) : (
              history.map((item) => {
                const isSelected = selectedQueryId === item.queryId;
                
                // HSL Curated Status Badge Colors
                const badgeStyle = 
                  item.status === "answered"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    : item.status === "paid"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    : item.status === "pending"
                    ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20 animate-pulse"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";

                return (
                  <div
                    key={item.queryId}
                    onClick={() => setSelectedQueryId(isSelected ? null : item.queryId)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 relative group ${
                      isSelected
                        ? "bg-muted/80 border-primary"
                        : "bg-card border-border/80 hover:bg-muted/30 hover:border-border"
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Question snippet */}
                    <p className="text-xs text-foreground font-medium line-clamp-2 mb-2 break-words">
                      {item.question}
                    </p>

                    {/* Footer receipt link */}
                    {item.txHash && (
                      <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-border/30">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ID: {item.queryId.slice(0, 8)}…
                        </span>
                        <a
                          href={`${explorerBaseUrl}/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // don't select item when clicking link
                          className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          Receipt <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
