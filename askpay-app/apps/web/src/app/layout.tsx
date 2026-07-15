import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';
import { WalletProvider } from "@/components/wallet-provider"
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/lib/theme-context';
import { NotificationProvider } from '@/lib/notification-context';
import { ToastContainer } from '@/components/toast';
import { OnboardingWrapper } from '@/components/onboarding-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: "AskPay — Pay-Per-Query AI on Celo",
    template: "%s | AskPay",
  },
  description:
    "Decentralized AI chat powered by Celo. Pay one micro-transaction per question — no subscriptions, no sign-ups, no data harvesting.",
  keywords: ["AskPay", "Celo", "MiniPay", "AI chat", "pay-per-query", "USDm", "Web3"],
  authors: [{ name: "AskPay" }],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1B2A" },
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png",    sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Hard favicon link — belt-and-suspenders over Next.js metadata injection */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('askpay_theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && systemDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <ThemeProvider>
            <NotificationProvider>
              <LanguageProvider>
                <WalletProvider>
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <SiteFooter />
                  <ToastContainer />
                  <OnboardingWrapper />
                </WalletProvider>
              </LanguageProvider>
            </NotificationProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

