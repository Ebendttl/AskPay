import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AskPay team — bug reports, feature requests, partnerships, and community questions welcome.",
  openGraph: {
    title: "Contact | AskPay",
    description: "Get in touch with the AskPay team — bug reports, feature requests, partnerships, and community questions welcome.",
    url: "https://askpay.app/contact",
  },
  twitter: {
    title: "Contact | AskPay",
    description: "Get in touch with the AskPay team for bug reports, partnerships, or questions.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
