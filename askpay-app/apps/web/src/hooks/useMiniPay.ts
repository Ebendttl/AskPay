/**
 * useMiniPay
 *
 * Detects whether the app is running inside MiniPay's in-app browser.
 * MiniPay injects `window.ethereum` and sets `isMiniPay = true` on it.
 *
 * Rules:
 *  - Always guard against `window.ethereum` being undefined (regular desktop browsers)
 *  - Always guard against SSR (typeof window === "undefined")
 *  - When `isMiniPay` is true:
 *      - Do NOT render a manual "Connect Wallet" button — MiniPay auto-connects
 *      - The user's Celo wallet address is already available via wagmi's `useAccount`
 *
 * References:
 *  - https://docs.celo.org/developer/minipay/overview
 *  - 02-minipay-integration-checklist.md in this repo
 */
"use client";

import { useEffect, useState } from "react";

export interface UseMiniPayReturn {
  /** True when the app is running inside the MiniPay in-app browser. */
  isMiniPay: boolean;
  /** True after the initial client-side detection has completed (avoids flash). */
  detected: boolean;
}

export function useMiniPay(): UseMiniPayReturn {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    // SSR guard — window doesn't exist during Next.js server render.
    if (typeof window === "undefined") {
      setDetected(true);
      return;
    }

    // Optional chaining: window.ethereum may be absent in regular desktop browsers.
    const miniPayDetected = Boolean(window.ethereum?.isMiniPay);
    setIsMiniPay(miniPayDetected);
    setDetected(true);
  }, []);

  return { isMiniPay, detected };
}
