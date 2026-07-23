import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Questions",
  description: "Browse your complete question and answer history from AskPay, powered by on-chain payment verification on Celo.",
  openGraph: {
    title: "My Questions | AskPay",
    description: "Browse your complete question and answer history from AskPay, powered by on-chain payment verification on Celo.",
    url: "https://askpay.app/my-questions",
  },
  twitter: {
    title: "My Questions | AskPay",
    description: "Browse your AskPay question and answer history, verified on-chain on Celo.",
  },
};

export default function MyQuestionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
