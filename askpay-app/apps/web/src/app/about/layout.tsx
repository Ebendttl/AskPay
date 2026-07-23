import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Discover AskPay's mission to replace predatory SaaS subscriptions with non-custodial pay-per-query AI access on Celo.",
  openGraph: {
    title: "About | AskPay",
    description: "Discover AskPay's mission to replace predatory SaaS subscriptions with non-custodial pay-per-query AI access on Celo.",
    url: "https://askpay.app/about",
  },
  twitter: {
    title: "About | AskPay",
    description: "Discover AskPay's mission to replace subscriptions with pay-per-query AI on Celo.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
