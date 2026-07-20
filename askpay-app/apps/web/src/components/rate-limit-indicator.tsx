"use client";

import { Gauge } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface RateLimitIndicatorProps {
  remaining: number | null;
  max: number;
}

/**
 * RateLimitIndicator
 *
 * Unobtrusive pill shown near the Ask button.
 * Hidden until we have a real reading (i.e. after the first successful request).
 * Colour-codes urgency:
 *   green  — plenty of headroom  (> max/2)
 *   amber  — getting low         (≤ max/2, > 1)
 *   red    — last request or 0   (≤ 1)
 */
export function RateLimitIndicator({ remaining, max }: RateLimitIndicatorProps) {
  const { t } = useLanguage();

  // Don't render until we have a real reading
  if (remaining === null) return null;

  const pct = max > 0 ? remaining / max : 0;

  const colour =
    remaining <= 1
      ? "text-red-500 border-red-500/30 bg-red-500/8"
      : pct <= 0.5
      ? "text-amber-500 border-amber-500/30 bg-amber-500/8"
      : "text-green-600 dark:text-green-400 border-green-500/30 bg-green-500/8";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tabular-nums transition-colors ${colour}`}
      title={t("rate_limit_tooltip", { remaining: remaining ?? 0, max })}
    >
      <Gauge className="h-2.5 w-2.5 shrink-0" />
      {remaining}/{max}
    </span>
  );
}
