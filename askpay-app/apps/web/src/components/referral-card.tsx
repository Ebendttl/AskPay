"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralCardProps {
  address: string;
}

export function ReferralCard({ address }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/?ref=${address}`);
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        setCanShare(true);
      }
    }
  }, [address]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.share({
        title: "AskPay — Pay-Per-Query AI on Celo",
        text: "Check out AskPay, a pay-per-query AI chat on Celo! Ask questions and pay in USDm stablecoins.",
        url: shareUrl,
      });
    } catch (err) {
      console.log("Web Share failed or cancelled:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Share2 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Your Referral Link</h3>
          <p className="text-xs text-muted-foreground">Share this link to invite others to AskPay</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background/50 border border-border p-2 rounded-xl">
        <input
          type="text"
          readOnly
          value={shareUrl || "Generating link..."}
          aria-label="Referral Link"
          className="flex-1 bg-transparent text-xs font-mono px-2 py-1.5 sm:py-0 outline-none select-all text-muted-foreground truncate"
        />
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={handleCopy}
            disabled={!shareUrl}
            size="sm"
            className="flex-1 sm:flex-initial h-8 rounded-lg text-xs gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
          {canShare && (
            <Button
              onClick={handleShare}
              disabled={!shareUrl}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial h-8 rounded-lg text-xs gap-1.5"
            >
              <Share2 className="h-3 w-3" />
              Share
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
