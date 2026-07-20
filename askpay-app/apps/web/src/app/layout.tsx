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
import { ReferralTracker } from '@/components/referral-tracker';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';

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
        {/* PWA manifest + theme colour */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0D1B2A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AskPay" />
        {/* Hard favicon link — belt-and-suspenders over Next.js metadata injection */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="talentapp:project_verification" content="de35b95d05e1c837f75ca7432529c3a590d22b713d28a1c4f518af611131a0d4e04538c0c821b668ccf3ce9620e9b16b62f362fd06b77bd4c4f663d2682aa756" />
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
                  <ReferralTracker />
                  <ServiceWorkerRegistration />
                </WalletProvider>
              </LanguageProvider>
            </NotificationProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

