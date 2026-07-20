"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      const stored = localStorage.getItem("askpay_referrer");
      if (stored !== ref.toLowerCase()) {
        localStorage.setItem("askpay_referrer", ref.toLowerCase());
        console.log("[ReferralTracker] Saved referrer address:", ref.toLowerCase());
      }
    }
  }, [searchParams]);

  return null;
}

export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
