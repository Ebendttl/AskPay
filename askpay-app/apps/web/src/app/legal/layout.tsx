import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Terms & Privacy Policy",
  description: "Review AskPay's non-custodial service terms, privacy policy, AI disclaimers, and open-source smart contract governance.",
  openGraph: {
    title: "Legal Terms & Privacy Policy | AskPay",
    description: "Review AskPay's non-custodial service terms, privacy policy, AI disclaimers, and open-source smart contract governance.",
    url: "https://askpay.app/legal",
  },
  twitter: {
    title: "Legal Terms & Privacy Policy | AskPay",
    description: "Review AskPay's non-custodial terms, privacy policy, and AI disclaimers.",
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
