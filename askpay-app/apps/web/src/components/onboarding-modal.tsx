"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Zap,
  Coins,
  Wallet,
  ArrowRight,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LS_KEY = "askpay_onboarding_seen";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

interface Step {
  id: string;
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  detail: string;
  accentClass: string;
  iconBgClass: string;
}

const STEPS: Step[] = [
  {
    id: "what",
    icon: <Sparkles className="h-7 w-7" />,
    badge: "Step 1 of 3",
    title: "What is AskPay?",
    description:
      "AskPay is a pay-per-use AI chat app that runs on the Celo blockchain. No subscriptions, no accounts — just answers.",
    detail:
      "You pay a tiny flat fee (0.01 USDm ≈ 1 US cent) per question, settled directly on-chain. If you don't ask, you don't pay.",
    accentClass: "from-violet-500/10 to-transparent",
    iconBgClass: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
  },
  {
    id: "payment",
    icon: <Coins className="h-7 w-7" />,
    badge: "Step 2 of 3",
    title: "How payment works",
    description:
      "Every question triggers a micro-payment in USDm stablecoin. Your wallet confirms the transaction — the AI only responds after the payment is verified on-chain.",
    detail:
      "The flow: Approve once → Pay per question → Get your answer. Gas fees on Celo are typically less than $0.001.",
    accentClass: "from-emerald-500/10 to-transparent",
    iconBgClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  {
    id: "connect",
    icon: <Wallet className="h-7 w-7" />,
    badge: "Step 3 of 3",
    title: "Connect to start",
    description:
      "Connect any Celo-compatible wallet — MiniPay, Valora, MetaMask, or any injected wallet. No email or sign-up required.",
    detail:
      "Using MiniPay? It connects automatically. On desktop, click the Connect button in the navbar to link your wallet and start asking.",
    accentClass: "from-amber-500/10 to-transparent",
    iconBgClass: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  },
];

// ---------------------------------------------------------------------------
// Dot indicators
// ---------------------------------------------------------------------------

function StepDots({
  total,
  current,
  onGoTo,
}: {
  total: number;
  current: number;
  onGoTo: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onGoTo(i)}
          aria-label={`Go to step ${i + 1}`}
          className={`rounded-full transition-all duration-200 ${
            i === current
              ? "w-5 h-2 bg-primary"
              : "w-2 h-2 bg-border hover:bg-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

interface OnboardingModalProps {
  /** Pass the wallet connection state so the last step CTA can adapt */
  isConnected: boolean;
}

export function OnboardingModal({ isConnected }: OnboardingModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Only run localStorage check on the client
  useEffect(() => {
    setMounted(true);
    try {
      const seen = localStorage.getItem(LS_KEY);
      if (!seen) {
        setOpen(true);
      }
    } catch {
      // If localStorage fails (private browsing etc.) just skip the modal
    }
  }, []);

  // Focus trap, Esc key handler & focus restoration for accessibility
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
        return;
      }
      
      if (e.key === "Tab") {
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return;
        
        // Find all focusable elements
        const focusableElements = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    // Save current active element to restore later
    const previousActive = document.activeElement as HTMLElement;

    // Shift focus inside the modal on open
    const focusTimeout = setTimeout(() => {
      const dialog = document.querySelector('div[role="dialog"]') as HTMLElement;
      if (dialog) {
        const focusable = dialog.querySelectorAll('button, a, input');
        if (focusable.length > 0) {
          (focusable[0] as HTMLElement).focus();
        } else {
          dialog.focus();
        }
      }
    }, 50);

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [open]);

  function handleDismiss() {
    setOpen(false);
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {
      // ignore
    }
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleDismiss();
    }
  }

  function handlePrev() {
    setStep((s) => Math.max(0, s - 1));
  }

  // Don't render anything until client-side hydration is done
  if (!mounted || !open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return createPortal(
    // Backdrop
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="AskPay onboarding"
      onClick={(e) => {
        // Dismiss on backdrop click
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      {/* Panel */}
      <div
        className={`
          relative w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl
          overflow-hidden
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Gradient accent top strip */}
        <div
          className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${current.accentClass} pointer-events-none`}
        />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Skip onboarding"
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Body */}
        <div className="relative px-8 pt-10 pb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-6">
            <Zap className="h-3 w-3 text-primary" />
            {current.badge}
          </div>

          {/* Icon */}
          <div
            className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5 ${current.iconBgClass}`}
          >
            {current.icon}
          </div>

          {/* Content */}
          <h2 className="text-xl font-extrabold tracking-tight text-foreground mb-3">
            {current.title}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            {current.description}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
            {current.detail}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-muted/10">
          {/* Back / Dots */}
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                aria-label="Previous step"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-7" /> // spacer
            )}
            <StepDots total={STEPS.length} current={step} onGoTo={setStep} />
          </div>

          {/* CTA */}
          {isLast ? (
            <Button
              onClick={handleDismiss}
              className="rounded-xl gap-2 px-5"
              id="onboarding-finish-btn"
            >
              {isConnected ? "Start Asking" : "Got it, connect wallet"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="rounded-xl gap-2 px-5"
              id="onboarding-next-btn"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
