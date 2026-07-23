import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how AskPay leverages Celo smart contracts and USDm stablecoins for frictionless pay-per-query AI interactions.",
  openGraph: {
    title: "How It Works | AskPay",
    description: "Learn how AskPay leverages Celo smart contracts and USDm stablecoins for frictionless pay-per-query AI interactions.",
    url: "https://askpay.app/how-it-works",
  },
  twitter: {
    title: "How It Works | AskPay",
    description: "Learn how AskPay leverages Celo smart contracts and USDm stablecoins for pay-per-query AI.",
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
