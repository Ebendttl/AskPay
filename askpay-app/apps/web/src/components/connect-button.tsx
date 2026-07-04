"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useMiniPay } from "@/hooks/useMiniPay";

/**
 * ConnectButton — renders the RainbowKit wallet connection button.
 * Hidden when inside MiniPay (which auto-connects its own wallet).
 */
export function ConnectButton() {
  const { isMiniPay, detected } = useMiniPay();

  // Don't render anything until detection has run (avoids a flash of the button
  // in MiniPay before the effect fires on mount).
  if (!detected) return null;

  // MiniPay handles connection itself — no button needed.
  if (isMiniPay) return null;

  return <RainbowKitConnectButton />;
}
