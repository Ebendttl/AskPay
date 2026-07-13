"use client";

import { useAccount } from "wagmi";
import { OnboardingModal } from "@/components/onboarding-modal";

/**
 * OnboardingWrapper
 *
 * Thin client component that reads wagmi connection state and
 * forwards it as a plain prop to OnboardingModal. This keeps the
 * modal itself free of any wagmi/wallet concerns.
 *
 * Mounted once at the layout level so it's available on every page.
 */
export function OnboardingWrapper() {
  const { isConnected } = useAccount();
  return <OnboardingModal isConnected={isConnected} />;
}
