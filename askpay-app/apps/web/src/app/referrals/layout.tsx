import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referral Program",
  description: "Share AskPay with friends and earn rewards when new wallets ask questions using your custom referral link.",
  openGraph: {
    title: "Referral Program | AskPay",
    description: "Share AskPay with friends and earn rewards when new wallets ask questions using your custom referral link.",
    url: "https://askpay.app/referrals",
  },
  twitter: {
    title: "Referral Program | AskPay",
    description: "Share AskPay with friends and earn rewards on Celo.",
  },
};

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
