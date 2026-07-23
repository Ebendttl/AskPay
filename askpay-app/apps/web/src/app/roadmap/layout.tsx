import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "See what's planned next for AskPay: upcoming features, blockchain integrations, and community-driven improvements.",
  openGraph: {
    title: "Roadmap | AskPay",
    description: "See what's planned next for AskPay: upcoming features, blockchain integrations, and community-driven improvements.",
    url: "https://askpay.app/roadmap",
  },
  twitter: {
    title: "Roadmap | AskPay",
    description: "See upcoming features and improvements planned for AskPay.",
  },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
