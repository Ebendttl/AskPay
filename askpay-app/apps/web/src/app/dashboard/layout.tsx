import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Usage Dashboard",
  description: "View your personal AskPay query history, USDm spending analytics, and 14-day usage trends on Celo.",
  openGraph: {
    title: "Personal Usage Dashboard | AskPay",
    description: "View your personal AskPay query history, USDm spending analytics, and 14-day usage trends on Celo.",
    url: "https://askpay.app/dashboard",
  },
  twitter: {
    title: "Personal Usage Dashboard | AskPay",
    description: "View your personal AskPay query history and USDm spending analytics on Celo.",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
