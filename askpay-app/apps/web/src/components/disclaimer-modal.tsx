"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

export const DISCLAIMER_LS_KEY = "askpay_disclaimer_ack";

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export function DisclaimerModal({ isOpen, onAccept, onClose }: DisclaimerModalProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus management & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus accept button on open
    setTimeout(() => {
      acceptBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleAgree = () => {
    try {
      localStorage.setItem(DISCLAIMER_LS_KEY, "true");
    } catch (e) {
      console.error("Failed to save disclaimer acknowledgment", e);
    }
    onAccept();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="disclaimer-modal-title"
                className="text-lg font-bold tracking-tight text-foreground"
              >
                {t("disclaimer_modal_title")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("disclaimer_modal_subtitle")}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="bg-muted/40 p-4 rounded-xl border border-border/60 text-foreground/90 font-normal">
            {t("disclaimer_modal_body")}
          </p>

          <div className="flex items-center gap-2 text-xs pt-1">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>
              {t("pricing_faq_title")} read our full{" "}
              <Link
                href="/legal"
                target="_blank"
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                {t("disclaimer_modal_link_text")} <ExternalLink className="h-3 w-3" />
              </Link>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end p-6 pt-0 gap-3">
          <Button
            ref={acceptBtnRef}
            onClick={handleAgree}
            className="w-full sm:w-auto font-semibold shadow-sm"
          >
            {t("disclaimer_modal_agree")}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
