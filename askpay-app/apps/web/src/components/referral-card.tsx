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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/?ref=${address}`);
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

      <div className="flex items-center gap-2 bg-background/50 border border-border p-2 rounded-xl">
        <input
          type="text"
          readOnly
          value={shareUrl || "Generating link..."}
          className="flex-1 bg-transparent text-xs font-mono px-2 outline-none select-all text-muted-foreground truncate"
        />
        <Button
          onClick={handleCopy}
          disabled={!shareUrl}
          size="sm"
          className="h-8 rounded-lg text-xs gap-1.5 shrink-0"
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
      </div>
    </div>
  );
}
