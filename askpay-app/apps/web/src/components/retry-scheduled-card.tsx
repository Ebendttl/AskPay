"use client";

/**
 * RetryScheduledCard
 *
 * Shown when the LLM API fails after all in-request retries and the server
 * has scheduled a background retry worker. The card:
 *  - Tells the user their payment was received and the answer will arrive.
 *  - Polls /api/query-status?queryId=… every POLL_INTERVAL_MS.
 *  - Calls onAnswerDelivered(answer) as soon as the backend marks the query
 *    "answered", so the parent can inject the response into the chat.
 *  - Stops polling after MAX_POLLS (approx. 5 minutes at 5 s intervals) and
 *    shows a soft failure with a link to the My Questions page.
 *
 * READ-ONLY — no wallet-write logic whatsoever.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { ACTIVE_NETWORK } from "@/lib/contracts";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS = 5_000;
const MAX_POLLS = 60; // 5 minutes

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QueryStatusResponse {
  queryId: string;
  txHash: string;
  question: string;
  status: "pending" | "streaming" | "answered" | "failed" | "retrying";
  answer?: string;
  errorMessage?: string;
}

export interface RetryScheduledCardProps {
  queryId: string;
  txHash: string;
  /** Called once the backend delivers the answer — parent adds it to the chat. */
  onAnswerDelivered: (answer: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RetryScheduledCard({
  queryId,
  txHash,
  onAnswerDelivered,
}: RetryScheduledCardProps) {
  const { t } = useLanguage();

  const [pollCount, setPollCount] = useState(0);
  const [delivered, setDelivered] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const calledBackRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const explorerBaseUrl =
    ACTIVE_NETWORK === "mainnet"
      ? "https://celoscan.io"
      : "https://sepolia.celoscan.io";

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/query-status?queryId=${encodeURIComponent(queryId)}`
      );
      if (!res.ok) return; // 404 = not yet saved or server restart; keep polling

      const data: QueryStatusResponse = await res.json();

      if (data.status === "answered" && data.answer && !calledBackRef.current) {
        calledBackRef.current = true;
        setDelivered(true);
        onAnswerDelivered(data.answer);
        return; // stop polling
      }

      if (data.status === "failed") {
        setExhausted(true);
        return;
      }
    } catch {
      // Network error — keep polling
    }
  }, [queryId, onAnswerDelivered]);

  useEffect(() => {
    let count = 0;

    const tick = async () => {
      if (calledBackRef.current || exhausted) return;

      count += 1;
      setPollCount(count);

      await poll();

      if (count >= MAX_POLLS) {
        setExhausted(true);
        return;
      }

      timerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
    };

    // First poll after a short grace period (server needs a moment to kick off retries)
    timerRef.current = setTimeout(tick, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll, exhausted]);

  const shortQueryId = `${queryId.slice(0, 10)}…${queryId.slice(-6)}`;
  const shortTxHash = `${txHash.slice(0, 10)}…${txHash.slice(-6)}`;

  // ── Delivered state ──────────────────────────────────────────────────────
  if (delivered) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium animate-in fade-in duration-300"
      >
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        <span>{t("chat_retry_scheduled_delivered")}</span>
      </div>
    );
  }

  // ── Exhausted state (background retries also failed) ────────────────────
  if (exhausted) {
    return (
      <div
        role="alert"
        className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs space-y-2 animate-in fade-in duration-300"
      >
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Answer Delivery Delayed</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          We were unable to reach the AI provider after multiple retries.
          Your payment is safe and recorded on Celo. Check back via{" "}
          <Link
            href={`/my-questions`}
            className="text-primary underline decoration-primary/30 hover:no-underline font-medium"
          >
            My Questions
          </Link>{" "}
          or use the Query ID below to request support.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {t("chat_retry_scheduled_query_id")}: {shortQueryId}
        </p>
        <a
          href={`${explorerBaseUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
        >
          {shortTxHash} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  // ── Polling / retrying state ─────────────────────────────────────────────
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Waiting for AI answer — background retry in progress"
      className="p-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex-shrink-0 p-1.5 rounded-full bg-primary/15">
          <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">
            {t("chat_retry_scheduled_title")}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-0.5">
            {t("chat_retry_scheduled_body")}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Poll #{pollCount} of {MAX_POLLS}
        </span>
        <span className="font-mono text-[10px]">
          {t("chat_retry_scheduled_query_id")}: {shortQueryId}
        </span>
        <a
          href={`${explorerBaseUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-primary hover:underline font-medium"
        >
          {shortTxHash} <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Check status link */}
      <Link
        href="/my-questions"
        className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
      >
        {t("chat_retry_scheduled_check_status")} →
      </Link>
    </div>
  );
}
