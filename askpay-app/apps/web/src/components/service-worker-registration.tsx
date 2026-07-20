"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistration
 *
 * Registers /sw.js on browsers that support it.
 *
 * Skipped entirely when:
 *   1. Running inside MiniPay's WebView (detected via window.ethereum.isMiniPay
 *      or a MiniPay User-Agent substring) — avoids any interference with the
 *      in-app browser's own navigation and caching behaviour.
 *   2. The browser does not support service workers at all.
 *   3. Running in development (navigator.serviceWorker is available but we
 *      skip to avoid stale caches masking hot-reload changes).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Must be client-side
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Skip in Next.js dev server — avoids stale cache interfering with HMR
    if (process.env.NODE_ENV === "development") return;

    // Detect MiniPay WebView:
    //   a) MiniPay injects window.ethereum with isMiniPay = true
    //   b) Some builds also include "MiniPay" in the UA string
    const eth = (window as any).ethereum;
    const isMiniPay =
      eth?.isMiniPay === true ||
      /MiniPay/i.test(navigator.userAgent);

    if (isMiniPay) {
      // Running inside MiniPay — do nothing. The in-app browser manages
      // its own caching and install lifecycle independently.
      return;
    }

    // Register the service worker
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[SW] Registered, scope:", reg.scope);
      })
      .catch((err) => {
        // Non-fatal — PWA install is an enhancement, not a requirement
        console.warn("[SW] Registration failed:", err);
      });
  }, []);

  // Renders nothing — purely a side-effect component
  return null;
}
