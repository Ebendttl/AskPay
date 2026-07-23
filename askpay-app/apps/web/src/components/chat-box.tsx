/**
 * ChatBox
 *
 * Phase 4 chat UI for AskPay — streaming LLM responses.
 *
 * Responsibilities:
 *  - Detect MiniPay via useMiniPay — show RainbowKit connect button only
 *    when NOT in MiniPay (per checklist doc §1)
 *  - Display the current fee read from the contract (never hardcoded)
 *  - Accept a question from the user
 *  - Drive the approve → askQuestion flow via useAskPay
 *  - Show clear pending/confirming/success/error states for every step
 *  - Stream the LLM answer word-by-word via useStreamResponse
 *  - Render a live assistant bubble with a blinking cursor during streaming
 *  - Show a Retry button if the AI response fails (after payment is confirmed)
 */

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useAskPay, generateQueryId } from "@/hooks/useAskPay";
import { useStreamResponse, type StreamParams } from "@/hooks/use-stream-response";
import { Loader2, Send, CheckCircle2, AlertCircle, AlertTriangle, Zap, History, ExternalLink, Plus, Trash2, Clock, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ACTIVE_NETWORK } from "@/lib/contracts";
import { HeroSection } from "@/components/hero-section";
import { useLanguage } from "@/hooks/useLanguage";
import { useNotifications } from "@/lib/notification-context";
import { PaymentConfirmationCard } from "@/components/payment-confirmation-card";
import { RetryScheduledCard } from "@/components/retry-scheduled-card";
import { RateLimitIndicator } from "@/components/rate-limit-indicator";
import { FeedbackWidget } from "@/components/feedback-widget";
import { DisclaimerModal, DISCLAIMER_LS_KEY } from "@/components/disclaimer-modal";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Check if the typed question is identical or near-identical (Jaccard similarity >= 0.7)
 * to a question already in the user's local history.
 */
export function findSimilarHistoryItem(
  currentQuestion: string,
  history: HistoryItem[]
): HistoryItem | null {
  const normCurrent = normalizeText(currentQuestion);
  if (normCurrent.length < 4) return null;

  const currentTokens = new Set(normCurrent.split(" ").filter((t) => t.length > 1));
  if (currentTokens.size === 0) return null;

  for (const item of history) {
    if (!item.question) continue;
    const normHist = normalizeText(item.question);
    if (normHist === normCurrent) return item;

    const histTokens = new Set(normHist.split(" ").filter((t) => t.length > 1));
    if (histTokens.size === 0) continue;

    let intersection = 0;
    for (const t of currentTokens) {
      if (histTokens.has(t)) intersection++;
    }
    const union = new Set([...currentTokens, ...histTokens]).size;
    const similarity = union > 0 ? intersection / union : 0;

    if (similarity >= 0.7) {
      return item;
    }
  }

  return null;
}

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
  const { t } = useLanguage();
  const labels: Record<string, { labelKey: string; color: string }> = {
    "checking-allowance": { labelKey: "status_checking_allowance",   color: "text-yellow-600" },
    "approving":           { labelKey: "status_approving",   color: "text-blue-500" },
    "approve-confirming":  { labelKey: "status_approve_confirming",   color: "text-blue-500" },
    "asking":              { labelKey: "status_asking",   color: "text-purple-500" },
    "ask-confirming":      { labelKey: "status_ask_confirming",   color: "text-purple-500" },
    "success":             { labelKey: "status_success",   color: "text-green-600" },
    "error":               { labelKey: "status_error",   color: "text-red-500" },
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
      <span>{t(info.labelKey)}</span>
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
  const { t } = useLanguage();
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

  // Streaming hook — replaces apiPending + apiError
  const { streamingText, status: streamStatus, errorMessage: streamError, rateLimitRemaining, rateLimitMax, retryAfterSeconds, startStream, reset: resetStream } = useStreamResponse();

  // Keep a ref to the last stream params for the Retry button
  const lastStreamParamsRef = useRef<StreamParams | null>(null);

  // Notification hook
  const { notify, update, dismiss } = useNotifications();
  // Track the loading-toast id so we can update it in-place as steps advance
  const loadingToastIdRef = useRef<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Timestamp captured when the askQuestion tx is confirmed on-chain
  const [confirmationTimestamp, setConfirmationTimestamp] = useState<number | null>(null);

  // Fire toasts on transaction step changes
  useEffect(() => {
    const step = state.step;
    const explorerUrl = ACTIVE_NETWORK === "mainnet"
      ? "https://celoscan.io"
      : "https://sepolia.celoscan.io";

    if (step === "idle") {
      // Dismiss any lingering loading toast on reset
      if (loadingToastIdRef.current) {
        dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }
      return;
    }

    if (step === "checking-allowance") {
      const id = notify({ type: "loading", title: "Checking allowance…", duration: 0 });
      loadingToastIdRef.current = id;
      return;
    }

    if (step === "approving" || step === "approve-confirming") {
      if (loadingToastIdRef.current) {
        update(loadingToastIdRef.current, {
          title: step === "approving" ? "Sending approve transaction…" : "Confirming approve…",
        });
      } else {
        const id = notify({ type: "loading", title: "Sending approve transaction…", duration: 0 });
        loadingToastIdRef.current = id;
      }
      return;
    }

    if (step === "asking" || step === "ask-confirming") {
      if (loadingToastIdRef.current) {
        update(loadingToastIdRef.current, {
          title: step === "asking" ? "Sending payment transaction…" : "Confirming payment…",
        });
      } else {
        const id = notify({ type: "loading", title: "Sending payment transaction…", duration: 0 });
        loadingToastIdRef.current = id;
      }
      return;
    }

    if (step === "success") {
      const id = loadingToastIdRef.current;
      if (id) {
        update(id, {
          type: "success",
          title: "Payment confirmed!",
          message: "Fetching your AI response…",
          txHash: state.askTxHash ?? undefined,
          explorerUrl,
          duration: 6000,
        });
        loadingToastIdRef.current = null;
      } else {
        notify({
          type: "success",
          title: "Payment confirmed!",
          message: "Fetching your AI response…",
          txHash: state.askTxHash ?? undefined,
          explorerUrl,
        });
      }
      return;
    }

    if (step === "error") {
      const id = loadingToastIdRef.current;
      const msg = state.errorMessage ?? "Transaction failed or was rejected.";
      if (id) {
        update(id, { type: "error", title: "Transaction failed", message: msg, duration: 8000 });
        loadingToastIdRef.current = null;
      } else {
        notify({ type: "error", title: "Transaction failed", message: msg });
      }
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  // Fire toasts on stream state changes
  useEffect(() => {
    if (streamStatus === "done") {
      notify({ type: "success", title: "Answer received!", duration: 4000 });
    }
    if (streamStatus === "error" && streamError) {
      notify({
        type: "error",
        title: "AI response failed",
        message: streamError,
        duration: 8000,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamStatus]);


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

  const isBusy =
    streamStatus === "streaming" ||
    !["idle", "success", "error"].includes(state.step);

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

  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [dismissedSimilarQueryId, setDismissedSimilarQueryId] = useState<string | null>(null);

  const similarHistoryItem = useMemo(() => {
    if (!question.trim() || selectedQueryId) return null;
    const match = findSimilarHistoryItem(question, history);
    if (match && match.queryId === dismissedSimilarQueryId) return null;
    return match;
  }, [question, history, selectedQueryId, dismissedSimilarQueryId]);

  // ---- Handle submit -------------------------------------------------------
  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!question.trim() || isBusy) return;

    // Check first-use disclaimer acknowledgment
    try {
      const acked = localStorage.getItem(DISCLAIMER_LS_KEY) === "true";
      if (!acked) {
        setShowDisclaimerModal(true);
        return;
      }
    } catch (e) {
      console.error("Failed to check disclaimer ack", e);
    }

    executeQuestionSubmission(question.trim());
  }

  const handleDisclaimerAccept = () => {
    setShowDisclaimerModal(false);
    if (question.trim()) {
      executeQuestionSubmission(question.trim());
    }
  };

  async function executeQuestionSubmission(savedQuestion: string) {
    // Clear history selection to show the new active chat
    if (selectedQueryId) {
      setSelectedQueryId(null);
    }

    setQuestion("");

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
      // Record the wall-clock time at which the UI sees the confirmed tx.
      // Used to populate the PaymentConfirmationCard timestamp field.
      setConfirmationTimestamp(Date.now());

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
          content: t("chat_payment_failed"),
        },
      ]);

      return;
    }

    // Step 2: Begin streaming the LLM response
    const streamParams: StreamParams = {
      question: savedQuestion,
      queryId: queryIdStr,
      txHash: txHash,
      network: ACTIVE_NETWORK,
    };
    lastStreamParamsRef.current = streamParams;

    // Populate inFlightRef so the useEffect watching streamStatus can
    // commit the answer (or mark failed) once the stream finishes.
    inFlightRef.current = {
      queryId: queryIdStr,
      txHash: txHash,
      history: currentHistory,
    };

    // startStream resolves when the stream is fully consumed (done or error).
    // React state updates from the hook drive re-renders incrementally.
    await startStream(streamParams);
  }

  // Commit the stream result to messages + history when streaming finishes.
  // We track the "in-flight" query with a ref so the effect can reference it.
  const inFlightRef = useRef<{
    queryId: string;
    txHash: `0x${string}`;
    history: HistoryItem[];
  } | null>(null);

  useEffect(() => {
    if (streamStatus === "done" && inFlightRef.current) {
      const { queryId: qId, txHash: tx, history: hist } = inFlightRef.current;
      inFlightRef.current = null;

      // Persist the full answer to history
      saveHistory(
        hist.map((item) =>
          item.queryId === qId
            ? { ...item, status: "answered" as const, txHash: tx, answer: streamingText }
            : item
        )
      );

      // Commit as a permanent message
      const finalText = streamingText;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content: finalText,
        },
      ]);
    }

    if (streamStatus === "error" && inFlightRef.current) {
      const { queryId: qId, history: hist } = inFlightRef.current;
      // Don't null out inFlightRef — Retry button needs the same payload

      saveHistory(
        hist.map((item) =>
          item.queryId === qId ? { ...item, status: "failed" as const } : item
        )
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamStatus]);

  // Allow asking another question after success/error
  function handleNewQuestion() {
    setConfirmationTimestamp(null);
    setSelectedQueryId(null);
    setMessages([]);
    resetStream();
    inFlightRef.current = null;
    lastStreamParamsRef.current = null;
    reset();
  }

  // Retry the last stream call (payment already confirmed)
  function handleRetryStream() {
    if (!lastStreamParamsRef.current) return;
    startStream(lastStreamParamsRef.current);
  }

  /**
   * Parse streamError to detect a retry_scheduled payload from the server.
   * Returns null when the error is a plain string (normal LLM failure).
   */
  const retryScheduledPayload: { retryScheduled: true; queryId: string; txHash: string; message: string } | null =
    (() => {
      if (!streamError) return null;
      try {
        const parsed = JSON.parse(streamError);
        if (parsed?.retryScheduled === true) return parsed;
      } catch { /* not JSON */ }
      return null;
    })();

  /**
   * Called by RetryScheduledCard once the background worker delivers the answer.
   * Commits it as an assistant message and saves it to localStorage history.
   */
  function handleAnswerDelivered(answer: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant" as const, content: answer },
    ]);
    if (inFlightRef.current) {
      const { queryId: qId, txHash: tx, history: hist } = inFlightRef.current;
      saveHistory(
        hist.map((item) =>
          item.queryId === qId
            ? { ...item, status: "answered" as const, txHash: tx, answer }
            : item
        )
      );
    }
  }

  // Clear entire history
  function handleClearHistory() {
    if (confirm(t("chat_clear_history_confirm"))) {
      saveHistory([]);
      setSelectedQueryId(null);
    }
  }

  // Determine active messages list to display
  const activeHistoryItem = selectedQueryId
    ? history.find((h) => h.queryId === selectedQueryId)
    : null;

  // Build the list of messages to display, injecting a live streaming bubble
  // when a stream is in progress.
  const liveStreamingBubble: Message | null =
    !activeHistoryItem && streamStatus === "streaming"
      ? {
          id: "stream-live",
          role: "assistant",
          // Show a blinking cursor until the first token arrives
          content: streamingText || "▍",
        }
      : null;

  // Whether to show the confirmation card in the current active chat view.
  // Only shown when: not viewing history, tx is confirmed, fee is loaded, and
  // timestamp was captured (card disappears once user resets with handleNewQuestion).
  const showConfirmationCard =
    !selectedQueryId &&
    !activeHistoryItem &&
    state.step === "success" &&
    !!state.askTxHash &&
    fee !== undefined &&
    confirmationTimestamp !== null;

  const messagesToDisplay: Message[] = activeHistoryItem
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
                content: t("chat_payment_initiated"),
              },
            ]
          : []),
        ...(activeHistoryItem.status === "paid"
          ? [
              {
                id: "s-" + activeHistoryItem.queryId,
                role: "system" as const,
                content: t("chat_payment_confirmed_verifying"),
              },
            ]
          : []),
        ...(activeHistoryItem.status === "failed"
          ? [
              {
                id: "s-" + activeHistoryItem.queryId,
                role: "system" as const,
                content: t("chat_status_failed"),
              },
            ]
          : []),
      ]

    : [
        ...messages,
        ...(liveStreamingBubble ? [liveStreamingBubble] : []),
      ];

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
            <span className="font-semibold text-sm">{t("app_title")}</span>
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
              title={t("nav_history")}
              aria-label={t("nav_history")}
              aria-expanded={showHistory}
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("nav_history")}</span>
            </button>
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background/50">
          {messagesToDisplay.length === 0 && (
            <EmptyState
              Icon={Zap}
              title={t("empty_state_title", { fee: feeDisplay })}
              description={t("empty_state_desc")}
            />
          )}


          {messagesToDisplay.map((msg) => {
            const isLive = msg.id === "stream-live";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
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
                  {isLive ? (
                    <span>
                      {streamingText}
                      {/* Blinking block cursor */}
                      <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5 animate-pulse" />
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>

                {msg.role === "assistant" && !isLive && (
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground/75 px-1 max-w-[80%]">
                    <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500/80" />
                    <span>
                      {t("ai_disclaimer_inline")}{" "}
                      <Link href="/legal" target="_blank" className="underline hover:text-foreground">
                        {t("ai_disclaimer_legal_link")}
                      </Link>
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Payment confirmation card — shown once askQuestion is confirmed,
              before the AI response streams in. Dismissed by handleNewQuestion. */}
          {showConfirmationCard && (
            <PaymentConfirmationCard
              txHash={state.askTxHash!}
              fee={fee!}
              confirmedAt={confirmationTimestamp!}
              explorerBaseUrl={explorerBaseUrl}
            />
          )}

          {/* Feedback widget — shown only when a fresh answer has just finished streaming */}
          {!selectedQueryId &&
            streamStatus === "done" &&
            lastStreamParamsRef.current?.queryId &&
            address && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2">
                  <FeedbackWidget
                    queryId={lastStreamParamsRef.current.queryId}
                    walletAddress={address}
                  />
                </div>
              </div>
            )}
        </div>


        {/* Status bar */}
        {(state.step !== "idle" || selectedQueryId) && (
          <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs">
            {selectedQueryId ? (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{t("chat_viewing_history", { status: activeHistoryItem?.status || "" })}</span>
                <button
                  onClick={handleNewQuestion}
                  className="text-primary hover:underline font-medium"
                >
                  {t("chat_ask_new")}
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
            {!selectedQueryId && streamStatus === "error" && streamError && (
              (() => {
                // 429 rate-limit — friendly inline message
                if (streamError.startsWith("__rate_limited__:")) {
                  const secs = retryAfterSeconds ?? parseInt(streamError.split(":")[1] ?? "60", 10);
                  return (
                    <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">{t("rate_limit_title")}</p>
                        <p className="mt-0.5 opacity-90">
                          {t("rate_limit_desc", { max: rateLimitMax, secs })}
                        </p>
                      </div>
                    </div>
                  );
                }
                // retry_scheduled payload or generic error
                return retryScheduledPayload ? (
                  <div className="mt-2">
                    <RetryScheduledCard
                      queryId={retryScheduledPayload.queryId}
                      txHash={retryScheduledPayload.txHash}
                      onAnswerDelivered={handleAnswerDelivered}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-red-500 text-xs break-all flex-1">{streamError}</p>
                    {lastStreamParamsRef.current && (
                      <button
                        onClick={handleRetryStream}
                        className="text-xs text-primary border border-primary/30 px-2 py-0.5 rounded-lg hover:bg-primary/10 transition-colors whitespace-nowrap"
                      >
                        {t("chat_retry")}
                      </button>
                    )}
                  </div>
                );
              })()
            )}

            {/* Reset after terminal states */}
            {!selectedQueryId &&
              (state.step === "success" || state.step === "error" || streamStatus === "done" || streamStatus === "error") &&
              streamStatus !== "streaming" && (
              <button
                onClick={handleNewQuestion}
                className="mt-2 text-xs text-primary underline hover:no-underline"
              >
                {t("chat_ask_another")}
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
                <span>{t("chat_balance")}</span>
              </span>
              <div className="flex items-center gap-2">
                <RateLimitIndicator remaining={rateLimitRemaining} max={rateLimitMax} />
                <span className="font-mono font-medium text-foreground">
                  {balanceDisplay} USDm
                </span>
              </div>
            </div>

            {hasInsufficientFunds && (
              <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    {t("chat_insufficient_funds", { fee: feeDisplay })}
                  </p>
                  {ACTIVE_NETWORK === "sepolia" && (
                    <p className="text-[10px] opacity-80 mt-0.5">
                      {t("chat_insufficient_funds_testnet")}
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
            placeholder={selectedQueryId ? t("chat_placeholder_new") : t("chat_placeholder")}
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
            {isBusy ? t("chat_button_processing") : t("chat_button_ask", { fee: feeDisplay })}
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
              {t("nav_history")} ({history.length})
            </span>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded"
                title={t("chat_clear_history_title")}
                aria-label={t("chat_clear_history_title")}
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
                <p className="text-xs">{t("chat_no_history")}</p>
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
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedQueryId(isSelected ? null : item.queryId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedQueryId(isSelected ? null : item.queryId);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 relative group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
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
                          {t("chat_receipt")} <ExternalLink className="h-2.5 w-2.5" />
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

      {/* First-use AI Legal Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onAccept={handleDisclaimerAccept}
        onClose={() => setShowDisclaimerModal(false)}
      />
    </div>
  );
}
