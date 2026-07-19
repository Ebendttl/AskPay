/**
 * PaymentConfirmationCard
 *
 * Shown inside the chat message list immediately after `askQuestion` is
 * confirmed on-chain (state.step === "success"), before the AI response
 * arrives.  It is a read-only display component — no write calls, no hooks
 * that trigger transactions.
 *
 * Data it shows:
 *  - Truncated tx hash with full hash on hover/focus (title attribute)
 *  - Direct Celoscan link for the hash
 *  - Fee paid in USDm (formatted from 18-decimal bigint)
 *  - Confirmation timestamp (locale-formatted)
 */

import { formatUnits } from "viem";
import { CheckCircle2, ExternalLink, Clock, Coins } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PaymentConfirmationCardProps {
  txHash: `0x${string}`;
  fee: bigint;
  confirmedAt: number; // Date.now() at confirmation time
  explorerBaseUrl: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns "0x12345678…abcdef" — first 10 chars + last 6 */
function shortHash(hash: string): string {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

/** Format 18-decimal bigint to a readable USDm string e.g. "0.01" */
function formatFeeUsdm(raw: bigint): string {
  return parseFloat(formatUnits(raw, 18)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentConfirmationCard({
  txHash,
  fee,
  confirmedAt,
  explorerBaseUrl,
}: PaymentConfirmationCardProps) {
  const { t } = useLanguage();

  const formattedFee = formatFeeUsdm(fee);
  const formattedTime = new Date(confirmedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const celoscanUrl = `${explorerBaseUrl}/tx/${txHash}`;

  return (
    <div
      role="status"
      aria-label={t("confirm_card_aria_label")}
      className="
        flex justify-start
      "
    >
      <div
        className="
          max-w-[88%] w-full rounded-2xl rounded-bl-sm border border-green-500/25
          bg-gradient-to-br from-green-500/8 to-emerald-500/5
          px-4 py-3 text-sm shadow-sm
          animate-in fade-in slide-in-from-bottom-2 duration-300
        "
      >
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="font-semibold text-green-700 dark:text-green-400 text-sm">
            {t("confirm_card_title")}
          </span>
        </div>

        {/* Data grid */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
          {/* Tx Hash */}
          <dt className="text-muted-foreground font-medium flex items-center gap-1 whitespace-nowrap">
            {t("confirm_card_tx_hash")}
          </dt>
          <dd className="flex items-center gap-1.5 min-w-0">
            <a
              id="payment-tx-link"
              href={celoscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={txHash}
              aria-label={`${t("confirm_card_view_on_celoscan")}: ${txHash}`}
              className="
                font-mono text-primary hover:text-primary/80
                underline underline-offset-2 decoration-primary/40
                hover:decoration-primary
                transition-colors duration-150
                inline-flex items-center gap-1 min-w-0
              "
            >
              <span className="truncate">{shortHash(txHash)}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            </a>
          </dd>

          {/* Fee */}
          <dt className="text-muted-foreground font-medium flex items-center gap-1 whitespace-nowrap">
            <Coins className="h-3 w-3" aria-hidden="true" />
            {t("confirm_card_fee_label")}
          </dt>
          <dd className="font-mono font-semibold text-foreground">
            {formattedFee}{" "}
            <span className="font-normal text-muted-foreground">USDm</span>
          </dd>

          {/* Timestamp */}
          <dt className="text-muted-foreground font-medium flex items-center gap-1 whitespace-nowrap">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {t("confirm_card_time_label")}
          </dt>
          <dd className="tabular-nums text-foreground">{formattedTime}</dd>
        </dl>

        {/* Celoscan CTA */}
        <div className="mt-3 pt-2.5 border-t border-green-500/15">
          <a
            href={celoscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-1 text-[11px] font-medium
              text-primary/70 hover:text-primary transition-colors duration-150
            "
          >
            {t("confirm_card_view_on_celoscan")}
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
