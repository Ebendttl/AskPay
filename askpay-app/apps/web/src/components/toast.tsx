"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, CheckCircle2, AlertCircle, Info, Loader2, AlertTriangle } from "lucide-react";
import { useNotifications, type Notification, type NotificationType } from "@/lib/notification-context";

// ---------------------------------------------------------------------------
// Icon + colour per type
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; bar: string; bg: string; title: string; border: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    bar: "bg-green-500",
    bg: "bg-card",
    title: "text-green-600 dark:text-green-400",
    border: "border-green-500/30",
  },
  error: {
    icon: <AlertCircle className="h-4 w-4" />,
    bar: "bg-red-500",
    bg: "bg-card",
    title: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    bar: "bg-amber-500",
    bg: "bg-card",
    title: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    bar: "bg-blue-500",
    bg: "bg-card",
    title: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  loading: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    bar: "bg-primary",
    bg: "bg-card",
    title: "text-primary",
    border: "border-primary/30",
  },
};

// ---------------------------------------------------------------------------
// Single toast item
// ---------------------------------------------------------------------------

function ToastItem({ n, onDismiss }: { n: Notification; onDismiss: () => void }) {
  const cfg = TYPE_CONFIG[n.type];
  const progressRef = useRef<HTMLDivElement>(null);

  // Animate progress bar over `n.duration` ms
  useEffect(() => {
    if (!progressRef.current || !n.duration || n.duration === 0) return;
    const el = progressRef.current;
    el.style.transition = "none";
    el.style.width = "100%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `width ${n.duration}ms linear`;
        el.style.width = "0%";
      });
    });
  }, [n.duration, n.id]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative flex flex-col w-80 max-w-[calc(100vw-2rem)]
        rounded-xl border shadow-lg overflow-hidden
        ${cfg.bg} ${cfg.border}
        animate-in slide-in-from-right-4 fade-in duration-200
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />

      {/* Content */}
      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <span className={`mt-0.5 shrink-0 ${cfg.title}`}>{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${cfg.title}`}>{n.title}</p>
          {n.message && (
            <p className="text-xs text-muted-foreground mt-0.5 break-words">{n.message}</p>
          )}
          {n.txHash && n.explorerUrl && (
            <a
              href={`${n.explorerUrl}/tx/${n.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
            >
              View on Explorer <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Timed progress underline */}
      {n.duration && n.duration > 0 && (
        <div className="h-[2px] bg-border/40">
          <div
            ref={progressRef}
            className={`h-full ${cfg.bar} opacity-60`}
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast container — portals into document.body
// ---------------------------------------------------------------------------

export function ToastContainer() {
  const { notifications, dismiss } = useNotifications();

  if (typeof window === "undefined" || notifications.length === 0) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end"
    >
      {[...notifications].reverse().map((n) => (
        <ToastItem key={n.id} n={n} onDismiss={() => dismiss(n.id)} />
      ))}
    </div>,
    document.body
  );
}
