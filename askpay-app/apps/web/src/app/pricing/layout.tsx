import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent, pay-per-query pricing. Pay exactly 0.01 USDm per question on Celo — zero monthly fees, zero subscriptions.",
  openGraph: {
    title: "Pricing | AskPay",
    description: "Transparent, pay-per-query pricing. Pay exactly 0.01 USDm per question on Celo — zero monthly fees, zero subscriptions.",
    url: "https://askpay.app/pricing",
  },
  twitter: {
    title: "Pricing | AskPay",
    description: "Transparent pay-per-query AI pricing on Celo. Pay 0.01 USDm per question.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
