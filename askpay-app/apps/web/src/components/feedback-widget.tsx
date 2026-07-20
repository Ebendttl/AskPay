/**
 * FeedbackWidget
 *
 * Shown beneath a completed AI answer. Lets the user vote thumbs up/down
 * and optionally leave a short comment. Submits to POST /api/feedback.
 *
 * Props:
 *   queryId       — the queryId of the just-answered query
 *   walletAddress — the connected wallet (already used for payment; no new PII)
 *
 * Behaviour:
 *   - Renders only after streamStatus === "done" (controlled by parent)
 *   - Selecting a vote reveals the comment textarea and submit button
 *   - On success shows a localised thank-you state; no aggregate stats shown
 *   - On 409 (already voted) shows the "already rated" message gracefully
 */

"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

type Vote = "up" | "down";
type SubmitState = "idle" | "submitting" | "done" | "error" | "duplicate";

interface FeedbackWidgetProps {
  queryId: string;
  walletAddress: string;
}

export function FeedbackWidget({ queryId, walletAddress }: FeedbackWidgetProps) {
  const { t } = useLanguage();
  const [vote, setVote] = useState<Vote | null>(null);
  const [comment, setComment] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  async function handleSubmit() {
    if (!vote || submitState === "submitting" || submitState === "done") return;
    setSubmitState("submitting");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryId,
          vote,
          walletAddress,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        setSubmitState("duplicate");
        return;
      }
      if (!res.ok) {
        setSubmitState("error");
        return;
      }
      setSubmitState("done");
    } catch {
      setSubmitState("error");
    }
  }

  // ── Terminal states ────────────────────────────────────────────────────────

  if (submitState === "done") {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 animate-fade-in">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>{t("feedback_thanks")}</span>
      </div>
    );
  }

  if (submitState === "duplicate") {
    return (
      <p className="mt-3 text-xs text-muted-foreground italic">
        {t("feedback_already_submitted")}
      </p>
    );
  }

  // ── Interactive state ──────────────────────────────────────────────────────

  return (
    <div className="mt-3 flex flex-col gap-2 animate-fade-in">
      {/* Prompt + vote buttons */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground font-medium">
          {t("feedback_prompt")}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            id={`feedback-up-${queryId}`}
            aria-label={t("feedback_thumbs_up")}
            aria-pressed={vote === "up"}
            onClick={() => setVote(vote === "up" ? null : "up")}
            disabled={submitState === "submitting"}
            className={`flex items-center justify-center h-7 w-7 rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              vote === "up"
                ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
                : "border-border bg-background/50 text-muted-foreground hover:border-green-500/50 hover:text-green-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>

          <button
            id={`feedback-down-${queryId}`}
            aria-label={t("feedback_thumbs_down")}
            aria-pressed={vote === "down"}
            onClick={() => setVote(vote === "down" ? null : "down")}
            disabled={submitState === "submitting"}
            className={`flex items-center justify-center h-7 w-7 rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              vote === "down"
                ? "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400"
                : "border-border bg-background/50 text-muted-foreground hover:border-red-500/50 hover:text-red-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Comment + submit — revealed once a vote is selected */}
      {vote && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <textarea
            id={`feedback-comment-${queryId}`}
            aria-label={t("feedback_comment_placeholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder={t("feedback_comment_placeholder")}
            disabled={submitState === "submitting"}
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          />

          <div className="flex items-center justify-between gap-2">
            {submitState === "error" && (
              <p className="text-[10px] text-red-500">{t("feedback_error")}</p>
            )}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                {comment.length}/500
              </span>
              <button
                id={`feedback-submit-${queryId}`}
                onClick={handleSubmit}
                disabled={submitState === "submitting"}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {submitState === "submitting" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("feedback_submitting")}
                  </>
                ) : (
                  t("feedback_submit")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
