import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecosystem Statistics",
  description: "Live on-chain query metrics, total fees collected, active user counts, and contract telemetry for AskPay on Celo.",
  openGraph: {
    title: "Ecosystem Statistics | AskPay",
    description: "Live on-chain query metrics, total fees collected, active user counts, and contract telemetry for AskPay on Celo.",
    url: "https://askpay.app/stats",
  },
  twitter: {
    title: "Ecosystem Statistics | AskPay",
    description: "Live on-chain query metrics and contract telemetry for AskPay on Celo.",
  },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
