import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credits & Acknowledgements",
  description: "Acknowledgements for the open-source libraries, protocols, and communities that make AskPay possible.",
  openGraph: {
    title: "Credits & Acknowledgements | AskPay",
    description: "Acknowledgements for the open-source libraries, protocols, and communities that make AskPay possible.",
    url: "https://askpay.app/credits",
  },
  twitter: {
    title: "Credits & Acknowledgements | AskPay",
    description: "Open-source acknowledgements for the tech powering AskPay.",
  },
};

export default function CreditsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
