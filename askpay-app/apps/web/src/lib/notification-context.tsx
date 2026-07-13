"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType = "info" | "success" | "error" | "warning" | "loading";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  /** If provided, shows an "Explorer" link button */
  txHash?: string;
  /** Explorer base URL to pair with txHash */
  explorerUrl?: string;
  /**
   * Auto-dismiss after this many milliseconds.
   * Set to 0 to require manual dismissal.
   * Defaults: loading → 0 (manual), others → 5000ms
   */
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  /** Add a new notification and return its generated id */
  notify: (opts: Omit<Notification, "id">) => string;
  /** Remove a notification by id */
  dismiss: (id: string) => void;
  /** Remove all notifications */
  dismissAll: () => void;
  /**
   * Update an existing notification in-place (useful for loading → success/error transitions).
   * If the id is not found, a new notification is created.
   */
  update: (id: string, opts: Partial<Omit<Notification, "id">>) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const DEFAULT_DURATION: Record<NotificationType, number> = {
  loading: 0,   // must be dismissed manually or via update()
  info:    5000,
  success: 5000,
  warning: 7000,
  error:   8000,
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Track auto-dismiss timers so we can clear them on manual dismiss
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const clearTimer = (id: string) => {
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  };

  const dismiss = useCallback((id: string) => {
    clearTimer(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    Object.keys(timers.current).forEach(clearTimer);
    setNotifications([]);
  }, []);

  const scheduleAutoDismiss = useCallback(
    (id: string, duration: number) => {
      if (duration > 0) {
        timers.current[id] = setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const notify = useCallback(
    (opts: Omit<Notification, "id">): string => {
      const id = crypto.randomUUID();
      const duration =
        opts.duration !== undefined ? opts.duration : DEFAULT_DURATION[opts.type];

      const notification: Notification = { ...opts, id, duration };

      setNotifications((prev) => {
        // Cap at 5 visible toasts; drop oldest non-loading ones if over cap
        const next = [notification, ...prev];
        if (next.length > 5) {
          const oldest = next
            .slice()
            .reverse()
            .find((n) => n.type !== "loading");
          if (oldest) {
            clearTimer(oldest.id);
            return next.filter((n) => n.id !== oldest.id);
          }
        }
        return next;
      });

      scheduleAutoDismiss(id, duration);
      return id;
    },
    [scheduleAutoDismiss]
  );

  const update = useCallback(
    (id: string, opts: Partial<Omit<Notification, "id">>) => {
      setNotifications((prev) => {
        const exists = prev.find((n) => n.id === id);
        if (!exists) {
          // Fall back to creating a new notification if id not found
          return prev;
        }
        return prev.map((n) => (n.id === id ? { ...n, ...opts } : n));
      });

      // Reset timer if type or duration changed
      if (opts.type !== undefined || opts.duration !== undefined) {
        clearTimer(id);
        setNotifications((prev) => {
          const updated = prev.find((n) => n.id === id);
          if (!updated) return prev;
          const type = opts.type ?? updated.type;
          const duration =
            opts.duration !== undefined
              ? opts.duration
              : DEFAULT_DURATION[type];
          scheduleAutoDismiss(id, duration);
          return prev;
        });
      }
    },
    [scheduleAutoDismiss]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, dismiss, dismissAll, update }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}
