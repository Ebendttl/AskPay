import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Full version history for AskPay — new features, bug fixes, smart contract upgrades, and improvements.",
  openGraph: {
    title: "Changelog | AskPay",
    description: "Full version history for AskPay — new features, bug fixes, smart contract upgrades, and improvements.",
    url: "https://askpay.app/changelog",
  },
  twitter: {
    title: "Changelog | AskPay",
    description: "Full version history and release notes for AskPay.",
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
